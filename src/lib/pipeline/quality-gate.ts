/**
 * Pipeline: Quality Gate
 *
 * Post-generation quality check for each video cut. Downloads
 * the first frame / file metadata and scores the output to
 * decide whether the cut is good enough to stitch or needs
 * a retry with a different random seed.
 *
 * Scoring (10-point scale):
 *   3 pts — file exists and is fetchable
 *   2 pts — file > 10 KB (not a stub/error response)
 *   3 pts — file > 100 KB (real video content)
 *   2 pts — proper dimensions (width and height > 0)
 *
 * Retry threshold: score < 5 (file exists but too small or corrupt)
 */

// ---- Types ---------------------------------------------------------------

export interface QualityResult {
  passed: boolean;
  score: number;
  issues: string[];
  fileSize?: number;
  width?: number;
  height?: number;
}

// ---- Constants -----------------------------------------------------------

const RETRY_THRESHOLD = 5;
const FETCH_TIMEOUT_MS = 15_000;

// ---- Quality Check -------------------------------------------------------

/**
 * Check the quality of a generated video cut by examining the file.
 *
 * Strategy:
 *  1. HEAD request to check existence and Content-Length.
 *  2. If Content-Length is missing, do a partial GET (first 64KB)
 *     to measure actual size.
 *  3. Score based on file existence, size, and (if detectable) dimensions.
 *
 * This is intentionally lightweight -- it runs after every cut poll
 * and must complete in < 5 seconds to stay within the frontend's
 * polling cadence.
 */
export async function checkVideoQuality(
  videoUrl: string
): Promise<QualityResult> {
  const issues: string[] = [];
  let score = 0;
  let fileSize: number | undefined;
  let width: number | undefined;
  let height: number | undefined;

  // Guard: skip non-HTTP URLs (demo:// or data:// stubs)
  if (!videoUrl || !videoUrl.startsWith("http")) {
    return {
      passed: false,
      score: 0,
      issues: ["Video URL is not a valid HTTP(S) URL"],
    };
  }

  try {
    // Step 1: HEAD request for quick metadata
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const headRes = await fetch(videoUrl, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!headRes.ok) {
        issues.push(`HTTP ${headRes.status} when fetching video`);
        return { passed: false, score: 0, issues };
      }

      // File exists -- 3 points
      score += 3;

      // Check Content-Length from header
      const contentLength = headRes.headers.get("content-length");
      if (contentLength) {
        fileSize = parseInt(contentLength, 10);
      }
    } catch (headErr: any) {
      clearTimeout(timeout);

      // HEAD might not be supported; try a range GET instead
      if (headErr?.name === "AbortError") {
        issues.push("Timeout fetching video metadata");
        return { passed: false, score: 0, issues };
      }

      // Fall through to try GET
    }

    // Step 2: If we don't have file size yet, do a partial GET
    if (fileSize === undefined) {
      try {
        const rangeController = new AbortController();
        const rangeTimeout = setTimeout(
          () => rangeController.abort(),
          FETCH_TIMEOUT_MS
        );

        const rangeRes = await fetch(videoUrl, {
          method: "GET",
          headers: { Range: "bytes=0-65535" },
          signal: rangeController.signal,
        });

        clearTimeout(rangeTimeout);

        if (rangeRes.ok || rangeRes.status === 206) {
          // File exists (if we didn't already score it)
          if (score === 0) score += 3;

          const contentRange = rangeRes.headers.get("content-range");
          if (contentRange) {
            // Format: "bytes 0-65535/totalSize"
            const match = contentRange.match(/\/(\d+)/);
            if (match) {
              fileSize = parseInt(match[1], 10);
            }
          }

          if (fileSize === undefined) {
            // Use the partial body length as a lower bound
            const body = await rangeRes.arrayBuffer();
            fileSize = body.byteLength;

            // Try to detect video dimensions from MP4 header
            const dimensions = extractDimensionsFromMp4Header(
              new Uint8Array(body)
            );
            if (dimensions) {
              width = dimensions.width;
              height = dimensions.height;
            }
          }
        } else {
          issues.push(`HTTP ${rangeRes.status} on range request`);
        }
      } catch {
        // Non-fatal: we just won't have precise file size
        issues.push("Could not determine file size via range request");
      }
    }

    // Step 3: Score based on file size
    if (fileSize !== undefined) {
      if (fileSize > 10 * 1024) {
        score += 2; // > 10KB
      } else {
        issues.push(`File size too small: ${fileSize} bytes (expected >10KB)`);
      }

      if (fileSize > 100 * 1024) {
        score += 3; // > 100KB
      } else if (fileSize <= 10 * 1024) {
        issues.push(
          `File size critically small: ${fileSize} bytes (expected >100KB for real video)`
        );
      } else {
        issues.push(
          `File size below ideal: ${(fileSize / 1024).toFixed(1)}KB (expected >100KB)`
        );
      }
    } else {
      issues.push("Could not determine file size");
    }

    // Step 4: Score based on dimensions
    if (width && width > 0 && height && height > 0) {
      score += 2;
    } else {
      // Dimensions are hard to extract without full decode, so give
      // benefit of the doubt if the file is large enough
      if (fileSize && fileSize > 500 * 1024) {
        score += 2; // Large enough file likely has proper dimensions
      } else {
        issues.push("Could not verify video dimensions");
      }
    }
  } catch (err: any) {
    issues.push(`Quality check error: ${err?.message || "unknown"}`);
    return { passed: false, score: 0, issues };
  }

  const passed = score >= RETRY_THRESHOLD;

  return { passed, score, issues, fileSize, width, height };
}

// ---- Retry Decision ------------------------------------------------------

/**
 * Returns true if the quality score is below the retry threshold.
 * Callers should check their remaining retry budget before acting.
 */
export function shouldRetry(result: QualityResult): boolean {
  return result.score < RETRY_THRESHOLD;
}

/**
 * Generate a varied seed for retry attempts. Uses the cut index
 * and attempt number to produce a deterministic but different seed
 * each time, which changes the AI model's random initialization.
 */
export function getRetrySeed(cutIndex: number, attempt: number): number {
  // Simple hash: mix cut index and attempt to get varied seeds
  return ((cutIndex + 1) * 7919 + attempt * 104729) % 2147483647;
}

// ---- MP4 Header Parsing (best-effort) ------------------------------------

/**
 * Attempt to extract width/height from an MP4/MOV header.
 * This is a best-effort heuristic: it searches for the 'tkhd'
 * (track header) box and reads the width/height fields.
 *
 * Returns null if the header can't be parsed (not MP4, truncated, etc.)
 */
function extractDimensionsFromMp4Header(
  data: Uint8Array
): { width: number; height: number } | null {
  // Search for 'tkhd' box signature
  const tkhd = findBox(data, [0x74, 0x6b, 0x68, 0x64]); // "tkhd"
  if (!tkhd || tkhd.length < 84) return null;

  try {
    // tkhd version 0: width at offset 76, height at offset 80 (fixed-point 16.16)
    const version = tkhd[0];
    const widthOffset = version === 0 ? 76 : 88;
    const heightOffset = version === 0 ? 80 : 92;

    if (tkhd.length < heightOffset + 4) return null;

    const width =
      (tkhd[widthOffset] << 8) | tkhd[widthOffset + 1];
    const height =
      (tkhd[heightOffset] << 8) | tkhd[heightOffset + 1];

    if (width > 0 && height > 0 && width < 10000 && height < 10000) {
      return { width, height };
    }
  } catch {
    // Parsing failed -- non-fatal
  }

  return null;
}

function findBox(data: Uint8Array, signature: number[]): Uint8Array | null {
  for (let i = 0; i < data.length - signature.length - 4; i++) {
    let match = true;
    // Box type is at offset 4 from box start (first 4 bytes are size)
    for (let j = 0; j < signature.length; j++) {
      if (data[i + 4 + j] !== signature[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      // Read box size (big-endian 32-bit at offset i)
      const size =
        (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
      const boxStart = i + 8; // skip size (4) + type (4)
      const boxEnd = size > 0 ? Math.min(i + size, data.length) : data.length;
      return data.slice(boxStart, boxEnd);
    }
  }
  return null;
}
