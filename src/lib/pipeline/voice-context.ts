/**
 * Voice Context -- Describes speaking style for video prompt injection
 *
 * Issue #14: If a user has uploaded a voice sample, the video prompt should
 * describe HOW they talk so the generated video's mouth movements and
 * gestures match their speaking energy.
 *
 * For now, we use industry defaults since actual voice analysis isn't
 * implemented yet. When we add voice analysis (pitch detection, pace
 * measurement, energy classification), this function will analyze the
 * actual sample and return precise speaking style descriptions.
 */

import prisma from "@/lib/prisma";

// ---- Industry Speaking Style Defaults ----

const INDUSTRY_VOICE_DEFAULTS: Record<string, string> = {
  real_estate:
    "Speaks with warm, enthusiastic energy. Fast-paced, conversational. Uses hand gestures to emphasize points about properties. Leans in when sharing exciting details.",
  legal:
    "Speaks with measured confidence. Professional but accessible. Deliberate pacing with strategic pauses for emphasis. Minimal but purposeful hand gestures.",
  medical:
    "Speaks with calm authority. Clear, reassuring tone. Moderate pace that makes complex information digestible. Open, reassuring body language.",
  finance:
    "Speaks with analytical precision. Data-driven but personable. Steady pacing that conveys competence. Uses hands to illustrate numbers and trends.",
  coaching:
    "Speaks with infectious energy and passion. Dynamic pacing — speeds up with excitement, slows down for key points. Expressive gestures and forward-leaning posture.",
  fitness:
    "Speaks with high energy and motivation. Punchy, direct delivery. Quick pace with action-oriented language. Animated, confident body language.",
  other:
    "Speaks naturally and conversationally. Moderate pace with genuine inflection. Relaxed but engaged body language, like talking to a friend.",
};

// ---- Main Function ----

/**
 * Build a voice/speaking style context string for the given user.
 *
 * Checks if the user has voice samples and returns a description of
 * their speaking style that the prompt engine can inject into video
 * generation prompts.
 *
 * Returns empty string if no voice samples exist.
 */
export async function getVoiceContext(userId: string): Promise<string> {
  // Check if user has any voice samples
  const voiceSampleCount = await prisma.voiceSample.count({
    where: { userId },
  });

  if (voiceSampleCount === 0) {
    return "";
  }

  // Fetch user industry for speaking style defaults
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  const industry = user?.industry || "other";

  // Get industry-specific speaking style
  // When we add actual voice analysis, this will be replaced with
  // real data: detected pitch range, speaking pace (WPM), energy level,
  // accent characteristics, and vocal quirks.
  const speakingStyle =
    INDUSTRY_VOICE_DEFAULTS[industry] ||
    INDUSTRY_VOICE_DEFAULTS.other;

  return speakingStyle;
}
