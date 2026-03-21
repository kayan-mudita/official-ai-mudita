/**
 * Voice Engine — MiniMax + ElevenLabs integration
 *
 * From the course: "MiniMax has the most realistic voices out of any tool right now."
 * Key insight: voice should sound "in the room", not studio-polished.
 *
 * Two modes:
 * 1. Text-to-Speech: Generate voiceover from script text
 * 2. Voice Clone: Clone user's voice from a 10-second sample
 */

// ─── Types ──────────────────────────────────────────────────────

export interface TTSResult {
  audioUrl: string | null;  // data URL or remote URL
  duration: number;          // seconds
  provider: string;
  error?: string;
}

export interface VoiceCloneResult {
  voiceId: string;
  provider: string;
  error?: string;
}

// ─── MiniMax TTS ────────────────────────────────────────────────

/**
 * Generate speech from text using MiniMax.
 * "The cadence. The natural flow. When you're doing B-rolls or you need
 *  an actor to keep talking, you need voices that sound like actual people."
 */
export async function miniMaxTTS(
  text: string,
  voiceId?: string
): Promise<TTSResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  const groupId = process.env.MINIMAX_GROUP_ID;

  if (!apiKey || !groupId) {
    return { audioUrl: null, duration: 0, provider: "minimax", error: "MINIMAX_API_KEY or MINIMAX_GROUP_ID not set" };
  }

  try {
    const response = await fetch(
      `https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "speech-02-hd",
          text,
          voice_setting: {
            voice_id: voiceId || "male-qn-qingse",
            speed: 1.0,
            vol: 1.0,
            pitch: 0,
          },
          audio_setting: {
            sample_rate: 32000,
            bitrate: 128000,
            format: "mp3",
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return { audioUrl: null, duration: 0, provider: "minimax", error: `MiniMax ${response.status}: ${err}` };
    }

    const data = await response.json();

    if (data.base_resp?.status_code !== 0) {
      return { audioUrl: null, duration: 0, provider: "minimax", error: data.base_resp?.status_msg || "MiniMax error" };
    }

    // MiniMax returns audio as hex-encoded data or a URL
    const audioData = data.data?.audio;
    if (audioData) {
      // Convert hex to base64
      const buffer = Buffer.from(audioData, "hex");
      const audioUrl = `data:audio/mp3;base64,${buffer.toString("base64")}`;
      const duration = Math.ceil(text.split(/\s+/).length / 2.5); // rough estimate
      return { audioUrl, duration, provider: "minimax" };
    }

    return { audioUrl: null, duration: 0, provider: "minimax", error: "No audio data returned" };
  } catch (err: any) {
    return { audioUrl: null, duration: 0, provider: "minimax", error: err.message };
  }
}

// ─── ElevenLabs TTS ─────────────────────────────────────────────

/**
 * Generate speech from text using ElevenLabs.
 * "The only way to get realistic ElevenLabs voices: create your own."
 * Only use for TTS — never speech-to-speech.
 */
export async function elevenLabsTTS(
  text: string,
  voiceId?: string
): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { audioUrl: null, duration: 0, provider: "elevenlabs", error: "ELEVENLABS_API_KEY not set" };
  }

  const vid = voiceId || "21m00Tcm4TlvDq8ikWAM"; // default Rachel voice

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${vid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return { audioUrl: null, duration: 0, provider: "elevenlabs", error: `ElevenLabs ${response.status}: ${err}` };
    }

    const buffer = await response.arrayBuffer();
    const audioUrl = `data:audio/mpeg;base64,${Buffer.from(buffer).toString("base64")}`;
    const duration = Math.ceil(text.split(/\s+/).length / 2.5);
    return { audioUrl, duration, provider: "elevenlabs" };
  } catch (err: any) {
    return { audioUrl: null, duration: 0, provider: "elevenlabs", error: err.message };
  }
}

// ─── Voice Clone ────────────────────────────────────────────────

/**
 * Clone a voice from an audio sample using ElevenLabs.
 * "Upload a 10 second audio clip. ElevenLabs recreates that voice."
 */
export async function cloneVoice(
  audioUrl: string,
  name: string
): Promise<VoiceCloneResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { voiceId: "", provider: "elevenlabs", error: "ELEVENLABS_API_KEY not set" };
  }

  try {
    // Download the audio sample
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      return { voiceId: "", provider: "elevenlabs", error: "Failed to download audio sample" };
    }
    const audioBuffer = await audioRes.arrayBuffer();

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("files", new Blob([audioBuffer], { type: "audio/mpeg" }), "voice_sample.mp3");

    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      return { voiceId: "", provider: "elevenlabs", error: `Clone failed ${response.status}: ${err}` };
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
 * Priority: MiniMax → ElevenLabs → skip (use video model's built-in audio)
 */
export async function generateVoiceover(
  text: string,
  voiceId?: string
): Promise<TTSResult> {
  // Try MiniMax first (best quality per course)
  if (process.env.MINIMAX_API_KEY) {
    const result = await miniMaxTTS(text, voiceId);
    if (result.audioUrl) return result;
  }

  // Fall back to ElevenLabs
  if (process.env.ELEVENLABS_API_KEY) {
    const result = await elevenLabsTTS(text, voiceId);
    if (result.audioUrl) return result;
  }

  // No TTS provider available
  return {
    audioUrl: null,
    duration: 0,
    provider: "none",
    error: "No TTS provider configured. Set MINIMAX_API_KEY or ELEVENLABS_API_KEY.",
  };
}
