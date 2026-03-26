/**
 * Pipeline: Shot Variety Enforcement
 *
 * Real UGC content varies camera framing cut-to-cut: close-up for
 * the hook, medium for talking heads, wide for context, etc. Without
 * enforcement, AI generation tends to default to similar framing
 * across every cut, making the video feel static and uncanny.
 *
 * This module maps each cut type to a canonical camera description
 * and ensures consecutive cuts never share the same framing. When
 * two adjacent cuts resolve to the same shot type, the second one
 * gets a subtle camera adjustment so the viewer's eye always gets
 * a new composition every 2-5 seconds — like real edited content.
 */

import type { Cut } from "../video-compositor";

// ─── Canonical Shot Types ────────────────────────────────────────

export const SHOT_TYPES: Record<string, string> = {
  hook: "extreme close-up, face fills 80% of frame, eyes at top third",
  talking_head:
    "medium close-up, head and shoulders visible, slight left offset",
  broll: "medium-wide, environment visible, person at 40% frame width",
  cta: "medium shot, natural framing like a FaceTime call, warm energy",
  testimonial:
    "medium close-up, slightly off-center, interview framing",
  transition: "wide establishing shot, environment dominant",
  product_shot:
    "macro close-up, product fills frame, shallow depth of field",
  reaction:
    "medium close-up, face centered, room for expression, slight low angle",
};

// ─── Variety Modifiers ───────────────────────────────────────────
// Applied to the second of two consecutive cuts with the same framing.

const VARIETY_MODIFIERS: string[] = [
  "slight dolly in",
  "camera shifts right",
  "slightly tighter framing",
  "subtle push-in on face",
  "camera drifts left of center",
  "slightly wider framing with more headroom",
  "gentle tilt-up revealing ceiling/sky",
  "offset composition, subject at right third",
];

// ─── Core Logic ──────────────────────────────────────────────────

/**
 * Resolve the canonical shot-type string for a given cut type.
 * Falls back to the talking_head framing if the type is unknown.
 */
function resolveShotType(cutType: string): string {
  return SHOT_TYPES[cutType] ?? SHOT_TYPES.talking_head;
}

/**
 * Deterministically pick a variety modifier based on the cut index.
 * This avoids randomness so the same composition plan always produces
 * the same output (important for retries and debugging).
 */
function pickModifier(cutIndex: number): string {
  return VARIETY_MODIFIERS[cutIndex % VARIETY_MODIFIERS.length];
}

/**
 * Enforce shot variety across an array of cuts.
 *
 * 1. Each cut's `camera` field is set to the canonical framing for
 *    its type (hook, talking_head, broll, etc.).
 * 2. If two consecutive cuts would have the same canonical framing,
 *    the second cut's camera gets a modifier appended to break the
 *    visual repetition.
 *
 * Returns a new array — the input is not mutated.
 */
export function enforceShotVariety(cuts: Cut[]): Cut[] {
  if (cuts.length === 0) return [];

  const result: Cut[] = [];
  let prevCanonical: string | null = null;

  for (let i = 0; i < cuts.length; i++) {
    const cut = cuts[i];
    const canonical = resolveShotType(cut.type);

    let camera: string;

    if (canonical === prevCanonical) {
      // Consecutive match — add a variety modifier
      const modifier = pickModifier(i);
      camera = `${canonical}, ${modifier}`;
    } else {
      camera = canonical;
    }

    result.push({ ...cut, camera });
    prevCanonical = canonical;
  }

  return result;
}
