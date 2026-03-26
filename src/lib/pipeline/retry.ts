/**
 * Retry Logic -- Exponential backoff for every external API call.
 *
 * Problem: External APIs (FAL, Gemini, MiniMax, Shotstack, Supabase) can fail
 * transiently. A single failure currently kills the entire pipeline. Users see
 * "failed" when a simple retry would have succeeded.
 *
 * Solution: Wrap every external call in `withRetry()` which retries with
 * exponential backoff (1s, 2s, 4s, ...) and logs each attempt. A model
 * fallback chain handles persistent failures by trying alternative models.
 *
 * Usage:
 *   const result = await withRetry(
 *     () => fetchFromFal(payload),
 *     { maxRetries: 2, baseDelay: 1000, name: "fal-submit" }
 *   );
 */

// ---- Types ----

export interface RetryOptions {
  /** Maximum number of retry attempts (not counting the initial attempt) */
  maxRetries: number;
  /** Base delay in ms -- doubles on each retry (1000 = 1s, 2s, 4s, ...) */
  baseDelay: number;
  /** Human-readable label for log messages */
  name: string;
  /** Optional: callback on each retry (for tracking/metrics) */
  onRetry?: (attempt: number, error: Error) => void;
  /** Optional: predicate to decide if an error is retryable (default: all errors) */
  isRetryable?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalTimeMs: number;
}

// ---- Model Fallback ----

/**
 * Model fallback chain for video generation.
 * If the primary model fails for a cut, try the next model in the chain.
 *
 * kling_2.6 -> minimax_hailuo -> wan_2.1
 */
export const MODEL_FALLBACK_CHAIN: string[] = [
  "kling_2.6",
  "minimax_hailuo",
  "wan_2.1",
];

/**
 * Get the next fallback model after the given model.
 * Returns null if there are no more fallbacks.
 */
export function getNextFallbackModel(currentModel: string): string | null {
  const idx = MODEL_FALLBACK_CHAIN.indexOf(currentModel);
  if (idx === -1) {
    // Unknown model -- start from the beginning of the chain
    return MODEL_FALLBACK_CHAIN[0] || null;
  }
  if (idx >= MODEL_FALLBACK_CHAIN.length - 1) {
    // Already at the end of the chain
    return null;
  }
  return MODEL_FALLBACK_CHAIN[idx + 1];
}

// ---- Retry Metadata ----

/**
 * Tracks retry statistics for a pipeline run.
 * Stored in pipeline metadata so we can monitor reliability.
 */
export interface RetryStats {
  /** Total retry attempts across all operations */
  totalRetries: number;
  /** Per-operation retry counts */
  operations: Record<string, { attempts: number; succeeded: boolean; finalError?: string }>;
  /** Model fallbacks used during this pipeline run */
  modelFallbacks: { from: string; to: string; reason: string }[];
}

/**
 * Create an empty retry stats tracker.
 */
export function createRetryStats(): RetryStats {
  return {
    totalRetries: 0,
    operations: {},
    modelFallbacks: [],
  };
}

/**
 * Record a retry operation result into the stats tracker.
 */
export function recordRetryResult(
  stats: RetryStats,
  name: string,
  attempts: number,
  succeeded: boolean,
  finalError?: string
): void {
  const retries = attempts - 1; // first attempt is not a "retry"
  stats.totalRetries += Math.max(0, retries);
  stats.operations[name] = { attempts, succeeded, finalError };
}

/**
 * Record a model fallback into the stats tracker.
 */
export function recordModelFallback(
  stats: RetryStats,
  from: string,
  to: string,
  reason: string
): void {
  stats.modelFallbacks.push({ from, to, reason });
}

// ---- Core Retry Function ----

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry and exponential backoff.
 *
 * @param fn      - The async function to execute
 * @param options - Retry configuration
 * @returns       - The result of the function
 * @throws        - The last error if all retries are exhausted
 *
 * Backoff schedule (with baseDelay=1000):
 *   Attempt 0: immediate
 *   Attempt 1: 1000ms wait
 *   Attempt 2: 2000ms wait
 *   Attempt 3: 4000ms wait
 *   ...
 *
 * Jitter: +/- 20% to avoid thundering herd on shared APIs.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<RetryResult<T>> {
  const { maxRetries, baseDelay, name, onRetry, isRetryable } = options;
  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Wait before retry (not before the first attempt)
    if (attempt > 0) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      // Add jitter: +/- 20%
      const jitter = delay * 0.2 * (Math.random() * 2 - 1);
      const actualDelay = Math.max(100, Math.round(delay + jitter));

      console.log(
        `[retry] ${name}: attempt ${attempt + 1}/${maxRetries + 1} ` +
        `after ${actualDelay}ms delay (error: ${lastError?.message?.substring(0, 100)})`
      );

      if (onRetry && lastError) {
        onRetry(attempt, lastError);
      }

      await sleep(actualDelay);
    }

    try {
      const result = await fn();
      const totalTimeMs = Date.now() - startTime;

      if (attempt > 0) {
        console.log(
          `[retry] ${name}: succeeded on attempt ${attempt + 1} ` +
          `(${totalTimeMs}ms total)`
        );
      }

      return { result, attempts: attempt + 1, totalTimeMs };
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Check if error is retryable
      if (isRetryable && !isRetryable(lastError)) {
        console.log(
          `[retry] ${name}: non-retryable error on attempt ${attempt + 1}: ` +
          `${lastError.message.substring(0, 200)}`
        );
        throw lastError;
      }

      if (attempt === maxRetries) {
        console.error(
          `[retry] ${name}: all ${maxRetries + 1} attempts failed. ` +
          `Last error: ${lastError.message.substring(0, 200)}. ` +
          `Total time: ${Date.now() - startTime}ms`
        );
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error(`${name}: all ${maxRetries + 1} attempts failed`);
}

// ---- Convenience Wrappers ----

/**
 * Retry wrapper pre-configured for Gemini API calls.
 * 3 retries, 1s base delay.
 */
export function withGeminiRetry<T>(fn: () => Promise<T>, label: string): Promise<RetryResult<T>> {
  return withRetry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    name: `gemini:${label}`,
    isRetryable: (err) => {
      // Don't retry on 400 Bad Request (prompt issues)
      if (err.message.includes("400")) return false;
      // Don't retry on 403 Forbidden (quota/auth issues)
      if (err.message.includes("403")) return false;
      return true;
    },
  });
}

/**
 * Retry wrapper pre-configured for FAL API submissions.
 * 2 retries, 1s base delay.
 */
export function withFalRetry<T>(fn: () => Promise<T>, label: string): Promise<RetryResult<T>> {
  return withRetry(fn, {
    maxRetries: 2,
    baseDelay: 1000,
    name: `fal:${label}`,
  });
}

/**
 * Retry wrapper pre-configured for MiniMax TTS calls.
 * 2 retries, 1s base delay. Non-fatal: returns null instead of throwing.
 */
export async function withTTSRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<RetryResult<T> | null> {
  try {
    return await withRetry(fn, {
      maxRetries: 2,
      baseDelay: 1000,
      name: `tts:${label}`,
    });
  } catch (err) {
    console.error(`[retry] tts:${label}: all attempts failed, skipping audio:`, (err as Error).message);
    return null;
  }
}

/**
 * Retry wrapper pre-configured for Shotstack API calls.
 * 2 retries, 2s base delay.
 */
export function withShotstackRetry<T>(fn: () => Promise<T>, label: string): Promise<RetryResult<T>> {
  return withRetry(fn, {
    maxRetries: 2,
    baseDelay: 2000,
    name: `shotstack:${label}`,
  });
}

/**
 * Retry wrapper pre-configured for Supabase Storage uploads.
 * 3 retries, 1s base delay.
 */
export function withStorageRetry<T>(fn: () => Promise<T>, label: string): Promise<RetryResult<T>> {
  return withRetry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    name: `storage:${label}`,
  });
}
