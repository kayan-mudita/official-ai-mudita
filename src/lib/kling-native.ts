/**
 * Kling Native API — Motion Control Enhancement
 *
 * Direct integration with Kling's native API (not FAL).
 * Motion Control takes a lower-quality video (from LTX/Sora/etc)
 * and re-generates it with Kling quality, using the original
 * video as a motion reference and a high-quality starting frame
 * for visual quality.
 *
 * API: https://api.klingai.com
 * Auth: API key + secret
 */

// ─── Types ────────────────────────────────────────────────────────

export interface KlingMotionParams {
  /** High-quality starting frame (Nano Banana / character sheet crop) */
  imageUrl: string;
  /** Source video to extract motion from */
  videoUrl: string;
  /** Optional text prompt for additional guidance */
  prompt?: string;
  /** Duration: "5" or "10" only */
  duration?: string;
}

export interface KlingMotionResult {
  taskId: string;
  status: "submitted" | "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}

// ─── Config ───────────────────────────────────────────────────────

function getConfig() {
  const apiKey = process.env.KLING_API_KEY;
  const apiSecret = process.env.KLING_API_SECRET;
  if (!apiKey) return null;
  return { apiKey, apiSecret: apiSecret || "", baseUrl: "https://api.klingai.com" };
}

export function isKlingConfigured(): boolean {
  return !!process.env.KLING_API_KEY;
}

// ─── Auth Token ───────────────────────────────────────────────────

async function getAuthToken(): Promise<string> {
  const config = getConfig();
  if (!config) throw new Error("KLING_API_KEY not configured");

  // Kling uses JWT auth — generate a token from API key + secret
  // For simplicity, if they provide a direct API key, use it as bearer
  return config.apiKey;
}

// ─── Submit Motion Control ────────────────────────────────────────

export async function submitMotionControl(
  params: KlingMotionParams
): Promise<KlingMotionResult> {
  const config = getConfig();
  if (!config) return { taskId: "", status: "failed", error: "KLING_API_KEY not configured" };

  const token = await getAuthToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${config.baseUrl}/v1/videos/image2video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model_name: "kling-v2-6",
        image: params.imageUrl,
        mode: "std", // standard quality — professional makes it look cartoonish
        duration: params.duration || "5",
        aspect_ratio: "9:16",
        ...(params.prompt ? { prompt: params.prompt } : {}),
        // Motion control specific: reference video for motion extraction
        video_reference: {
          url: params.videoUrl,
          mode: "motion_control",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { taskId: "", status: "failed", error: `Kling ${res.status}: ${err.substring(0, 200)}` };
    }

    const data = await res.json();
    const taskId = data.data?.task_id || data.task_id || "";

    if (!taskId) {
      return { taskId: "", status: "failed", error: "No task_id returned" };
    }

    return { taskId, status: "submitted" };
  } catch (e: any) {
    if (e.name === "AbortError") {
      return { taskId: "", status: "failed", error: "Request timed out" };
    }
    return { taskId: "", status: "failed", error: e.message };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Poll Motion Control ──────────────────────────────────────────

export async function pollMotionControl(
  taskId: string
): Promise<KlingMotionResult> {
  const config = getConfig();
  if (!config) return { taskId, status: "failed", error: "Not configured" };

  const token = await getAuthToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${config.baseUrl}/v1/videos/image2video/${taskId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      return { taskId, status: "failed", error: `Poll failed: ${res.status}` };
    }

    const data = await res.json();
    const status = data.data?.task_status || data.task_status;

    if (status === "succeed" || status === "completed") {
      const videoUrl =
        data.data?.task_result?.videos?.[0]?.url ||
        data.data?.video_url ||
        data.video_url;

      return { taskId, status: "completed", videoUrl };
    }

    if (status === "failed" || status === "error") {
      return {
        taskId,
        status: "failed",
        error: data.data?.task_status_msg || "Generation failed",
      };
    }

    return { taskId, status: "processing" };
  } catch (e: any) {
    return { taskId, status: "failed", error: e.message };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── End-to-End Enhancement ───────────────────────────────────────

/**
 * Full motion control enhancement: submit + poll until done.
 * Takes a source video + high-quality frame → returns enhanced video URL.
 */
export async function enhanceWithMotionControl(
  params: KlingMotionParams,
  maxPollAttempts = 60,
  pollIntervalMs = 5000
): Promise<{ videoUrl: string | null; error?: string }> {
  const submitResult = await submitMotionControl(params);

  if (submitResult.status === "failed") {
    return { videoUrl: null, error: submitResult.error };
  }

  // Poll until complete
  for (let i = 0; i < maxPollAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    const status = await pollMotionControl(submitResult.taskId);

    if (status.status === "completed" && status.videoUrl) {
      return { videoUrl: status.videoUrl };
    }

    if (status.status === "failed") {
      return { videoUrl: null, error: status.error };
    }
  }

  return { videoUrl: null, error: "Timed out waiting for Kling Motion Control" };
}
