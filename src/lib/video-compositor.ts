/**
 * Video Compositor — Format-First Multi-Cut Pipeline
 *
 * CORE PRINCIPLE: A video is NEVER one AI generation call.
 * Every video is a sequence of CUTS — each cut is a separate generation
 * with its own prompt, camera angle, and purpose. Then we stitch.
 *
 * "My whole thesis with AI content is if you're trying to generate it
 *  all in one shot, it looks like crap. But if you splice it together,
 *  then it'll actually look good. It's like 8 AI videos of eight seconds,
 *  but you're only using three seconds from each."
 *
 * The FORMAT determines the cut pattern. A testimonial has different cuts
 * than a market update. The format is the blueprint.
 */

import { expandPrompt } from "./prompt-engine";
import { generateSceneBible, formatSceneBibleForPrompt } from "./pipeline/scene-bible";
import { enforceShotVariety } from "./pipeline/shot-variety";

// ─── Types ──────────────────────────────────────────────────────

export interface Cut {
  index: number;
  type: "hook" | "talking_head" | "broll" | "product_shot" | "reaction" | "cta" | "transition";
  duration: number;          // how long this cut appears in final video
  generateDuration: number;  // how long to generate (always longer, we trim)
  prompt: string;            // generation prompt for this specific cut
  camera: string;            // camera angle/style for this cut
  audio: string;             // what audio plays during this cut
  notes: string;             // editorial notes
}

export interface VideoFormat {
  id: string;
  name: string;
  description: string;
  totalDuration: number;
  cuts: Cut[];
}

export interface CompositionPlan {
  format: VideoFormat;
  startingFrameRequired: boolean;
  estimatedGenerations: number;  // total API calls needed
  estimatedTime: number;         // seconds to generate all cuts
}

// ─── Video Formats ──────────────────────────────────────────────

/**
 * Each format defines the CUT PATTERN for a type of video.
 * The prompts are templates — they get filled with user-specific
 * details by the prompt engine.
 *
 * Every cut generates MORE than we need (generateDuration > duration)
 * because we pick the best 2-3 seconds from a 5-8 second generation.
 */

const FORMATS: Record<string, (script: string) => VideoFormat> = {

  // ─── Talking Head (15s) ─────────────────────────────────
  // Hook → Main point → Supporting detail → CTA
  talking_head_15: (script) => ({
    id: "talking_head_15",
    name: "Talking Head (15s)",
    description: "Face-to-camera, single message, UGC style",
    totalDuration: 15,
    cuts: [
      {
        index: 0,
        type: "hook",
        duration: 3,
        generateDuration: 8,
        prompt: `HOOK CUT: Person opens with the most attention-grabbing line from the script. The first words out of their mouth should make the viewer stop scrolling. Content topic: ${script.substring(0, 100)}. iPhone selfie style. Raw UGC energy. The first 2 seconds must GRAB attention.`,
        camera: "iPhone front camera, handheld, slight wobble, face fills 60% of frame",
        audio: `Person says: ${script.substring(0, 50)}`,
        notes: "Use first 3 seconds only. This is the scroll-stopper.",
      },
      {
        index: 1,
        type: "talking_head",
        duration: 5,
        generateDuration: 8,
        prompt: `MAIN POINT CUT: Person speaking directly to camera, natural gestures, making their key point. Conversational energy — like FaceTiming a friend. Slight head movements, natural blinks, real skin texture. ${script}`,
        camera: "Same iPhone angle as hook, continuous feel, medium close-up",
        audio: `Person says: ${script.substring(50, 150)}`,
        notes: "Trim to best 5 seconds. Should feel like a natural continuation of the hook.",
      },
      {
        index: 2,
        type: "talking_head",
        duration: 4,
        generateDuration: 8,
        prompt: `SUPPORTING DETAIL CUT: Person elaborating on their point. Maybe leans back slightly, uses hand gesture to emphasize. Energy shifts from "telling you something" to "proving it." Natural, unrehearsed feel. ${script}`,
        camera: "Slight angle change — maybe person shifts position naturally",
        audio: `Person says: ${script.substring(150, 250)}`,
        notes: "Trim to best 4 seconds. The 'evidence' or 'proof' section.",
      },
      {
        index: 3,
        type: "cta",
        duration: 3,
        generateDuration: 8,
        prompt: `CTA CUT: Person delivers final line — a call to action or closing thought. Direct eye contact, small nod or half-smile. Ends naturally — maybe reaches toward phone to stop recording, or gives a casual wave. ${script}`,
        camera: "Return to original angle, direct eye contact",
        audio: `Person says: ${script.substring(Math.max(0, script.length - 80))}`,
        notes: "Trim to last 3 seconds. Must feel like a natural ending, not abrupt.",
      },
    ],
  }),

  // ─── Product/Testimonial (15s) ──────────────────────────
  // Hook → Show product → Experience → CTA
  testimonial_15: (script) => ({
    id: "testimonial_15",
    name: "Testimonial (15s)",
    description: "Product showcase with personal story",
    totalDuration: 15,
    cuts: [
      {
        index: 0,
        type: "hook",
        duration: 2,
        generateDuration: 5,
        prompt: `HOOK CUT: Person opens with the most attention-grabbing line from the script. The first words out of their mouth should make the viewer stop scrolling. Content topic: ${script.substring(0, 100)}. iPhone selfie style. Holding or near the product/service context, raw energy.`,
        camera: "iPhone front camera, close-up on face + product visible",
        audio: `Person says: ${script.substring(0, 50)}`,
        notes: "2 seconds max. Scroll-stopper.",
      },
      {
        index: 1,
        type: "talking_head",
        duration: 4,
        generateDuration: 8,
        prompt: `PROBLEM/BEFORE CUT: Person explains the problem they had or what they were looking for. Genuine frustration or curiosity in their expression. Natural hand gestures. ${script}`,
        camera: "Medium close-up, iPhone, slight handheld movement",
        audio: `Person says: ${script.substring(50, 150)}`,
        notes: "The 'before' state. Relatable problem.",
      },
      {
        index: 2,
        type: "broll",
        duration: 3,
        generateDuration: 5,
        prompt: `B-ROLL: Close-up of the product being used, or the service in action. Hands interacting with product naturally. Warm lighting, iPhone rear camera, macro-style close-up. Slow, intentional movement. ${script}`,
        camera: "iPhone rear camera, close-up/macro, steady handheld",
        audio: `Person says: ${script.substring(150, 250)}`,
        notes: "Product hero shot. Slow, satisfying, tactile.",
      },
      {
        index: 3,
        type: "reaction",
        duration: 3,
        generateDuration: 8,
        prompt: `RESULT CUT: Person showing the result or expressing satisfaction. Maybe tilts face, shows off result, or holds product up with genuine smile. The "after" state. ${script}`,
        camera: "iPhone front camera, slightly wider than hook",
        audio: `Person says: ${script.substring(250, 350)}`,
        notes: "The transformation moment.",
      },
      {
        index: 4,
        type: "cta",
        duration: 3,
        generateDuration: 5,
        prompt: `CTA: Person holds product to camera or gives final recommendation. Direct, genuine, not salesy. "Seriously, try it" energy. Natural ending — reaches to stop recording. ${script}`,
        camera: "iPhone front camera, product visible, direct eye contact",
        audio: `Person says: ${script.substring(Math.max(0, script.length - 80))}`,
        notes: "Close the loop. Not a hard sell.",
      },
    ],
  }),

  // ─── Market Update / Educational (30s) ──────────────────
  // Hook → Point 1 → B-roll → Point 2 → B-roll → CTA
  educational_30: (script) => ({
    id: "educational_30",
    name: "Educational / Market Update (30s)",
    description: "Informational content with b-roll cutaways",
    totalDuration: 30,
    cuts: [
      {
        index: 0,
        type: "hook",
        duration: 3,
        generateDuration: 8,
        prompt: `HOOK CUT: Person opens with the most attention-grabbing line from the script. The first words out of their mouth should make the viewer stop scrolling. Content topic: ${script.substring(0, 100)}. iPhone selfie style. In their natural environment (home office, car, kitchen). Leans in. Raw, urgent, immediate.`,
        camera: "iPhone front camera, propped on surface, eye-level",
        audio: `Person says: ${script.substring(0, 50)}`,
        notes: "3 seconds. Make them stay.",
      },
      {
        index: 1,
        type: "talking_head",
        duration: 5,
        generateDuration: 8,
        prompt: `POINT 1: Person delivers first key insight. Animated but natural — the kind of energy you have when telling a friend something interesting you learned. Hand gestures for emphasis. ${script}`,
        camera: "Same setup as hook, continuous feel",
        audio: `Person says: ${script.substring(50, 150)}`,
        notes: "First piece of value. Must be interesting standalone.",
      },
      {
        index: 2,
        type: "broll",
        duration: 3,
        generateDuration: 5,
        prompt: `B-ROLL CUTAWAY: Visual that supports point 1. Could be: scrolling through data on a laptop, a neighborhood street scene, a document on a desk, a phone screen showing relevant info. Warm, natural lighting. ${script}`,
        camera: "iPhone rear camera, smooth handheld, close-up detail shots",
        audio: `Person says: ${script.substring(150, 250)}`,
        notes: "Visual proof / context for point 1.",
      },
      {
        index: 3,
        type: "talking_head",
        duration: 5,
        generateDuration: 8,
        prompt: `POINT 2: Person delivers second insight, building on the first. Maybe stands up, walks to window, or shifts position. Energy builds slightly — this is the "and here's why it matters" beat. ${script}`,
        camera: "Slight angle change from new position, still iPhone",
        audio: `Person says: ${script.substring(250, 380)}`,
        notes: "Second piece of value. The 'so what' factor.",
      },
      {
        index: 4,
        type: "broll",
        duration: 3,
        generateDuration: 5,
        prompt: `B-ROLL CUTAWAY: Visual supporting point 2. Different angle/subject than first b-roll. Could be: walking through a space, typing on laptop, looking at phone, pointing at something off-screen. ${script}`,
        camera: "iPhone rear camera, different composition than first b-roll",
        audio: `Person says: ${script.substring(380, 480)}`,
        notes: "Visual variety. Don't repeat the first b-roll style.",
      },
      {
        index: 5,
        type: "talking_head",
        duration: 5,
        generateDuration: 8,
        prompt: `SYNTHESIS: Person ties both points together. The "big picture" moment. Calmer energy, more thoughtful. Maybe a knowing nod or a pause before the final thought. ${script}`,
        camera: "Return to original position/angle, grounding the viewer",
        audio: `Person says: ${script.substring(480, 600)}`,
        notes: "Connect the dots. Make them feel smart.",
      },
      {
        index: 6,
        type: "cta",
        duration: 3,
        generateDuration: 5,
        prompt: `CTA: Quick, natural close. "Follow for more" energy but without saying those words. Maybe a casual point at camera, a nod, or just reaches to stop recording mid-thought. ${script}`,
        camera: "Same as original setup, direct eye contact",
        audio: `Person says: ${script.substring(Math.max(0, script.length - 100), Math.max(0, script.length - 40))}`,
        notes: "Don't overdo it. Best CTAs feel accidental.",
      },
      {
        index: 7,
        type: "transition",
        duration: 3,
        generateDuration: 5,
        prompt: `END CARD / LOGO MOMENT: Clean, simple shot of the person's workspace or environment without them in frame. Natural light, settling moment. Or person walking away from camera. ${script}`,
        camera: "Static iPhone shot of environment, no person",
        audio: `Person says: ${script.substring(Math.max(0, script.length - 40))}`,
        notes: "Breathing room. Let the content land.",
      },
    ],
  }),

  // ─── Quick Tip / Reel (8s) ──────────────────────────────
  // Even an 8-second video is 3 cuts, not 1
  quick_tip_8: (script) => ({
    id: "quick_tip_8",
    name: "Quick Tip (8s)",
    description: "Rapid-fire single tip, 3 cuts",
    totalDuration: 8,
    cuts: [
      {
        index: 0,
        type: "hook",
        duration: 2,
        generateDuration: 5,
        prompt: `HOOK CUT: Person opens with the most attention-grabbing line from the script. The first words out of their mouth should make the viewer stop scrolling. Content topic: ${script.substring(0, 100)}. iPhone selfie style. Urgent "stop scrolling" energy. Close to camera, slightly wide-eyed.`,
        camera: "iPhone front camera, face fills frame, raw",
        audio: `Person says: ${script.substring(0, 50)}`,
        notes: "2 seconds. Interrupt the scroll.",
      },
      {
        index: 1,
        type: "talking_head",
        duration: 4,
        generateDuration: 8,
        prompt: `THE TIP: Person delivers the actual tip/insight in one breath. Fast but clear. Uses one definitive hand gesture. Eyes locked on camera. Energy: "I'm telling you this for free and you're welcome." ${script}`,
        camera: "Pull back slightly from hook, more of upper body visible",
        audio: `Person says: ${script.substring(50, 180)}`,
        notes: "The meat. One clear takeaway.",
      },
      {
        index: 2,
        type: "cta",
        duration: 2,
        generateDuration: 5,
        prompt: `CLOSE: Person raises eyebrows like "you're welcome", gives micro-nod, maybe mouths "trust me" or just smirks. Reaches to stop recording. ${script}`,
        camera: "Return to tight framing, direct eye contact",
        audio: `Person says: ${script.substring(Math.max(0, script.length - 50))}`,
        notes: "Land it. Confidence, not desperation.",
      },
    ],
  }),

  // ─── Property Tour (30s) ──────────────────────────────────
  // Hook → Exterior → Interior Showcase → CTA
  property_tour_30: (script) => ({
    id: "property_tour_30",
    name: "Property Tour (30s)",
    description: "4-cut property showcase with hook and CTA",
    totalDuration: 30,
    cuts: [
      {
        index: 0,
        type: "hook" as const,
        duration: 3,
        generateDuration: 8,
        prompt: `HOOK CUT: Person face-to-camera with excited energy. Opens with "Just listed:" followed by the property address. Warm, inviting tone — like you're about to show a friend something amazing. iPhone selfie style, standing in front of a property. ${script.substring(0, 150)}`,
        camera: "iPhone front camera, face fills 50% of frame, property exterior slightly visible behind",
        audio: `Person says: Just listed: ${script.substring(0, 80)}`,
        notes: "3 seconds. Hook with the address and excitement.",
      },
      {
        index: 1,
        type: "broll" as const,
        duration: 8,
        generateDuration: 12,
        prompt: `EXTERIOR CUT: Cinematic exterior shot of the property. Start with establishing wide shot, then slowly move closer. Beautiful curb appeal, landscaping, architectural details. Golden hour lighting if possible. The property looks its absolute best. ${script}`,
        camera: "iPhone rear camera, steady gimbal-style movement, wide establishing shot transitioning to medium",
        audio: "Voiceover describing the property exterior and location (added in post)",
        notes: "8 seconds. Sell the curb appeal. Make them want to see inside.",
      },
      {
        index: 2,
        type: "broll" as const,
        duration: 12,
        generateDuration: 16,
        prompt: `INTERIOR SHOWCASE CUT: Walk-through of key rooms — kitchen, living area, master bedroom/bath. Smooth camera movement through the home. Highlight the best features: countertops, appliances, natural light, open floor plan, views. Each room gets 3-4 seconds. Warm, inviting lighting. ${script}`,
        camera: "iPhone rear camera, smooth walking movement, wide angle, show depth and space of rooms",
        audio: "Voiceover highlighting key features of each room (added in post)",
        notes: "12 seconds. The showcase moment. Every room should look magazine-worthy.",
      },
      {
        index: 3,
        type: "cta" as const,
        duration: 7,
        generateDuration: 10,
        prompt: `CTA CUT: Person back to face-to-camera. Genuine excitement about the property. Delivers call to action: "Schedule your showing" or "DM me for details." Warm smile, confident nod. Professional but approachable. Ends naturally — maybe steps to the side to reveal the property one more time. ${script}`,
        camera: "iPhone front camera, medium close-up, direct eye contact, property visible in background",
        audio: `Person says: Schedule your showing today. ${script.substring(Math.max(0, script.length - 100))}`,
        notes: "7 seconds. Close with confidence and clear CTA.",
      },
    ],
  }),

  // ─── Testimonial (20s) ──────────────────────────────────
  // Optimized for reading customer reviews
  testimonial_20: (script) => ({
    id: "testimonial_20",
    name: "Testimonial (20s)",
    description: "Customer review turned into a video testimonial",
    totalDuration: 20,
    cuts: [
      {
        index: 0,
        type: "hook" as const,
        duration: 3,
        generateDuration: 8,
        prompt: `HOOK CUT: Person opens with the most compelling line from the review. Direct, genuine energy. "One of my clients just said..." or starts reading the review directly. iPhone selfie style, warm and authentic. ${script.substring(0, 120)}`,
        camera: "iPhone front camera, close-up, warm lighting, authentic UGC feel",
        audio: `Person says: ${script.substring(0, 60)}`,
        notes: "3 seconds. Lead with the strongest part of the testimonial.",
      },
      {
        index: 1,
        type: "talking_head" as const,
        duration: 8,
        generateDuration: 12,
        prompt: `TESTIMONIAL READ CUT: Person reading the customer review naturally — not robotic, but like they're sharing something they're proud of. Genuine emotion, occasional smile, natural gestures. Mix of looking at camera and glancing down slightly as if reading. ${script}`,
        camera: "iPhone front camera, medium close-up, slight handheld movement for authenticity",
        audio: `Person reads: ${script.substring(60, 250)}`,
        notes: "8 seconds. The heart of the testimonial. Authentic delivery is key.",
      },
      {
        index: 2,
        type: "reaction" as const,
        duration: 4,
        generateDuration: 8,
        prompt: `REACTION CUT: Person reacts to the review — genuine gratitude, maybe gets a bit emotional. "This is why I do what I do" energy. Natural, unscripted feel. Maybe puts hand on chest or gives a thankful nod. ${script}`,
        camera: "iPhone front camera, slightly wider than previous, captures upper body emotion",
        audio: "Personal response to the testimonial, grateful tone",
        notes: "4 seconds. Show genuine human reaction to the kind words.",
      },
      {
        index: 3,
        type: "cta" as const,
        duration: 5,
        generateDuration: 8,
        prompt: `CTA CUT: Person delivers a soft call to action. Not salesy — more like "If you want the same experience..." or "Ready to be our next success story?" Warm, inviting smile. Natural ending. ${script}`,
        camera: "iPhone front camera, return to close-up, direct eye contact",
        audio: `Person says: ${script.substring(Math.max(0, script.length - 80))}`,
        notes: "5 seconds. Soft CTA that ties back to the review's promise.",
      },
    ],
  }),

  // ─── Behind Scenes / Montage (20s) ──────────────────────────
  // Fast-paced visual montage style for trend videos
  behind_scenes_20: (script) => ({
    id: "behind_scenes_20",
    name: "Behind the Scenes (20s)",
    description: "Fast-paced visual montage with quick cuts",
    totalDuration: 20,
    cuts: [
      {
        index: 0,
        type: "hook" as const,
        duration: 2,
        generateDuration: 5,
        prompt: `HOOK CUT: Dynamic opening shot. Quick, attention-grabbing visual that sets the tone. Could be a dramatic reveal, a door opening, a curtain pull-back, or a fast zoom. High energy. ${script.substring(0, 100)}`,
        camera: "Dynamic camera movement, fast zoom or reveal, cinematic feel",
        audio: "Music hit on beat (added in post)",
        notes: "2 seconds. Visual hook synced to music beat.",
      },
      {
        index: 1,
        type: "broll" as const,
        duration: 6,
        generateDuration: 10,
        prompt: `MONTAGE SEQUENCE A: Series of quick, visually stunning shots. Beautiful interiors, exteriors, details. Each shot is 2-3 seconds. Camera moves smoothly between compositions. Cinematic color grading. ${script}`,
        camera: "iPhone rear camera, steady gimbal, varied angles and compositions",
        audio: "Music-driven pacing (added in post)",
        notes: "6 seconds. Fast cuts between beautiful shots. Visual eye candy.",
      },
      {
        index: 2,
        type: "broll" as const,
        duration: 6,
        generateDuration: 10,
        prompt: `MONTAGE SEQUENCE B: Continuation with different visual themes. Close-up details, textures, people interacting with spaces. Each shot perfectly composed. Varied framing: tight, wide, overhead. ${script}`,
        camera: "Mixed angles: overhead, close-up, wide, tracking shots",
        audio: "Music continues, building energy (added in post)",
        notes: "6 seconds. Complement sequence A with variety.",
      },
      {
        index: 3,
        type: "cta" as const,
        duration: 3,
        generateDuration: 5,
        prompt: `CLOSING SHOT: Strong final visual. Could be a person looking at camera, a dramatic wide shot, or a text overlay moment. The visual that sticks. Confident, memorable ending. ${script}`,
        camera: "Cinematic final frame, perfectly composed",
        audio: "Music resolves (added in post)",
        notes: "3 seconds. End on the strongest possible visual.",
      },
      {
        index: 4,
        type: "transition" as const,
        duration: 3,
        generateDuration: 5,
        prompt: `END CARD: Clean, branded moment. Simple background, logo or text space. Lets the content breathe. Professional end frame. ${script}`,
        camera: "Static, clean composition",
        audio: "Music fades out",
        notes: "3 seconds. Breathing room for branding.",
      },
    ],
  }),
};

// ─── Public API ─────────────────────────────────────────────────

/**
 * Create a composition plan from a format ID and script.
 * The format determines the cut pattern.
 * The script gets distributed across cuts by the prompt engine.
 */
export function planComposition(
  formatId: string,
  script: string
): CompositionPlan {
  const formatFn = FORMATS[formatId] || FORMATS.talking_head_15;
  const format = formatFn(script);

  // Enforce shot variety: map each cut to its canonical camera framing
  // and break any consecutive-same-framing pairs with subtle modifiers.
  // This gives the viewer a new composition every 2-5 seconds.
  format.cuts = enforceShotVariety(format.cuts);

  return {
    format,
    startingFrameRequired: true, // always — consistency across cuts
    estimatedGenerations: format.cuts.length,
    estimatedTime: format.cuts.length * 30, // ~30s per generation
  };
}

/**
 * Expand every cut's prompt through the prompt engine.
 * Each cut gets its own fully-detailed production prompt
 * with character details, anti-glitch rules, etc.
 *
 * DATA FLOW GAP #3 FIX: Accepts an optional sceneContext parameter.
 * If provided externally, that scene bible is used as-is. Otherwise,
 * we generate one ONCE that establishes shared context (environment,
 * wardrobe, lighting, mood, color palette). Either way, the scene
 * bible is injected into EVERY cut's prompt expansion so Gemini
 * generates cut-specific action/camera prompts while keeping the
 * setting consistent across independent Gemini calls.
 */
export async function expandCutPrompts(
  plan: CompositionPlan,
  userId: string,
  model: string,
  industry?: string,
  sceneContext?: string
): Promise<CompositionPlan> {
  // Step 1: Use provided scene context, or generate a scene bible ONCE for all cuts
  let resolvedSceneContext = sceneContext;
  if (!resolvedSceneContext) {
    const userRequest = plan.format.cuts.map((c) => c.prompt).join(" ");
    const sceneBible = await generateSceneBible(
      userRequest,
      userId,
      industry || "other",
      plan.format.id
    );
    resolvedSceneContext = formatSceneBibleForPrompt(sceneBible);
  }

  // Step 2: Expand each cut with the shared scene context injected.
  // The sceneContext is prepended as "SCENE BIBLE (mandatory for all cuts): ..."
  // so that even with independent Gemini calls, all cuts share the same
  // environment/wardrobe/lighting constraints.
  const expandedCuts = await Promise.all(
    plan.format.cuts.map(async (cut) => {
      try {
        const scenePreamble = resolvedSceneContext
          ? `SCENE BIBLE (mandatory for all cuts): ${resolvedSceneContext}\n\n`
          : "";

        const expanded = await expandPrompt({
          userRequest: `${scenePreamble}${cut.prompt}\n\nCAMERA FOR THIS CUT: ${cut.camera}\nAUDIO FOR THIS CUT: ${cut.audio}\nEDITORIAL NOTE: ${cut.notes}`,
          model,
          userId,
          industry,
          duration: cut.generateDuration,
          sceneContext: resolvedSceneContext,
        });
        return { ...cut, prompt: expanded.expandedPrompt };
      } catch {
        return cut;
      }
    })
  );

  return {
    ...plan,
    format: { ...plan.format, cuts: expandedCuts },
  };
}

/**
 * Get all available format IDs and their descriptions.
 */
export function getAvailableFormats(): { id: string; name: string; description: string; totalDuration: number; cutCount: number }[] {
  return Object.entries(FORMATS).map(([id, fn]) => {
    const format = fn("");
    return {
      id,
      name: format.name,
      description: format.description,
      totalDuration: format.totalDuration,
      cutCount: format.cuts.length,
    };
  });
}

/**
 * Build FFmpeg command to stitch downloaded cut files into one video.
 * Each cut is trimmed to its `duration` from the generated `generateDuration`.
 */
export function buildStitchCommand(
  cutFiles: { path: string; trimTo: number }[],
  outputPath: string
): string {
  if (cutFiles.length === 1) {
    const c = cutFiles[0];
    return `ffmpeg -i "${c.path}" -t ${c.trimTo} -c copy "${outputPath}"`;
  }

  // Complex filter: trim each input then concat
  const inputs = cutFiles.map((c) => `-i "${c.path}"`).join(" ");
  const filters = cutFiles.map((c, i) => `[${i}:v]trim=0:${c.trimTo},setpts=PTS-STARTPTS[v${i}];[${i}:a]atrim=0:${c.trimTo},asetpts=PTS-STARTPTS[a${i}]`).join(";");
  const concatV = cutFiles.map((_, i) => `[v${i}]`).join("");
  const concatA = cutFiles.map((_, i) => `[a${i}]`).join("");

  return `ffmpeg ${inputs} -filter_complex "${filters};${concatV}concat=n=${cutFiles.length}:v=1:a=0[outv];${concatA}concat=n=${cutFiles.length}:v=0:a=1[outa]" -map "[outv]" -map "[outa]" "${outputPath}"`;
}
