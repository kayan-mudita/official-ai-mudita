/**
 * Voice Engine — FAL-Consolidated TTS + Voice Cloning
 *
 * CONSOLIDATED ARCHITECTURE:
 *   TTS:    FAL MiniMax (primary) → ElevenLabs (fallback) → skip
 *   Clone:  ElevenLabs (only provider with instant voice clone)
 *
 * Everything routes through 2 API keys max: FAL_API_KEY + ELEVENLABS_API_KEY.
 * FAL handles TTS (same billing as video generation).
 * ElevenLabs handles voice cloning (the one thing FAL can't do).
 *
 * Removed providers (consolidated into FAL):
 *   - Fish Audio (separate billing, marginal quality difference)
 *   - MiniMax Direct (FAL already wraps MiniMax)
 *   - Pocket TTS (niche, adds complexity)
 *
 * TTS failure is always non-fatal — the pipeline continues without audio.
 */

import { withRetry } from "@/lib/pipeline/retry";

// ─── Types ──────────────────────────────────────────────────────

export interface TTSResult {
  audioUrl: string | null;
  duration: number;
  provider: string;
  error?: string;
}

export interface VoiceCloneResult {
  voiceId: string;
  provider: string;
  error?: string;
}

// ─── FAL MiniMax TTS (Primary) ─────────────────────────────────

async function falMiniMaxTTS(text: string): Promise<TTSResult> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) return { audioUrl: null, duration: 0, provider: "fal-minimax", error: "FAL_API_KEY not set" };

  try {
    const { result: data } = await withRetry(async () => {
      const response = await fetch("https://fal.run/fal-ai/minimax/speech-02-hd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`FAL MiniMax Speech ${response.status}: ${err.substring(0, 200)}`);
      }

      return response.json();
    }, { maxRetries: 2, baseDelay: 1000, name: "tts:fal-minimax" });

    const audioUrl = data.audio?.url;
    const durationMs = data.duration_ms || 0;

    if (audioUrl) {
      return { audioUrl, duration: Math.ceil(durationMs / 1000), provider: "fal-minimax" };
    }

    return { audioUrl: null, duration: 0, provider: "fal-minimax", error: "No audio URL in response" };
  } catch (err: any) {
    return { audioUrl: null, duration: 0, provider: "fal-minimax", error: err.message };
  }
}

// ─── ElevenLabs TTS (Fallback) ─────────────────────────────────

async function elevenLabsTTS(text: string, voiceId?: string): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { audioUrl: null, duration: 0, provider: "elevenlabs", error: "Not configured" };

  const vid = voiceId || "21m00Tcm4TlvDq8ikWAM";

  try {
    const { result: buffer } = await withRetry(async () => {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs ${response.status}`);
      }

      return response.arrayBuffer();
    }, { maxRetries: 2, baseDelay: 1000, name: "tts:elevenlabs" });

    const audioUrl = `data:audio/mpeg;base64,${Buffer.from(buffer).toString("base64")}`;
    return { audioUrl, duration: Math.ceil(text.split(/\s+/).length / 2.5), provider: "elevenlabs" };
  } catch (err: any) {
    return { audioUrl: null, duration: 0, provider: "elevenlabs", error: err.message };
  }
}

// ─── Voice Clone (ElevenLabs only) ─────────────────────────────

/**
 * Clone a voice from an audio sample.
 * ElevenLabs is the only provider with instant voice clone capability.
 */
export async function cloneVoice(audioUrl: string, name: string): Promise<VoiceCloneResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { voiceId: "", provider: "elevenlabs", error: "ELEVENLABS_API_KEY not configured" };

  try {
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return { voiceId: "", provider: "elevenlabs", error: "Failed to download sample" };
    const audioBuffer = await audioRes.arrayBuffer();

    const formData = new FormData();
    formData.append("name", name);
    const contentType = audioRes.headers.get("content-type") || "audio/mpeg";
    const ext = contentType.includes("webm") ? "webm" : contentType.includes("wav") ? "wav" : "mp3";
    formData.append("files", new Blob([audioBuffer], { type: contentType }), `voice_sample.${ext}`);

    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      return { voiceId: "", provider: "elevenlabs", error: `Clone failed ${response.status}` };
    }

    const data = await response.json();
    return { voiceId: data.voice_id, provider: "elevenlabs" };
  } catch (err: any) {
    return { voiceId: "", provider: "elevenlabs", error: err.message };
  }
}

// ─── Smart TTS Router ───────────────────────────────────────────

/**
 * Generate TTS using the best available provider.
 *
 * Consolidated chain (2 providers, 2 API keys):
 * 1. FAL MiniMax speech-02-hd (same billing as video — one FAL key)
 * 2. ElevenLabs (fallback, also used for voice cloning)
 * 3. Skip (pipeline continues without audio)
 */
export async function generateVoiceover(text: string, voiceId?: string): Promise<TTSResult> {
  // 1. FAL MiniMax (primary — same API key as video generation)
  if (process.env.FAL_API_KEY) {
    const result = await falMiniMaxTTS(text);
    if (result.audioUrl) return result;
    console.log(`[voice] FAL MiniMax failed: ${result.error}, trying ElevenLabs...`);
  }

  // 2. ElevenLabs (fallback — also handles voice cloning)
  if (process.env.ELEVENLABS_API_KEY) {
    const result = await elevenLabsTTS(text, voiceId);
    if (result.audioUrl) return result;
    console.log(`[voice] ElevenLabs failed: ${result.error}`);
  }

  return {
    audioUrl: null,
    duration: 0,
    provider: "none",
    error: "No TTS provider available. Set FAL_API_KEY (primary) or ELEVENLABS_API_KEY (fallback).",
  };
}
