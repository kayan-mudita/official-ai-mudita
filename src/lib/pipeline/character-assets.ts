/**
 * Character Assets -- Maps character sheet images to specific video cut types.
 *
 * Problem: Character sheet images are generated as composites (3x3 grid for poses,
 * 2x3 grid for 360) but never individually mapped to specific video cuts. A "hook"
 * cut needs a front-facing pose, a "talking_head" needs a 3/4 angle, and "broll"
 * needs a profile or environment shot.
 *
 * MVP approach: We cannot crop individual poses from the composite image server-side
 * without adding an image processing dependency. Instead, we:
 *   1. Use the composite URL for all cuts (preserving current behavior)
 *   2. Store a metadata mapping of which pose is at which grid position
 *   3. Return the composite URL annotated with the recommended grid position
 *   4. Future: crop individual poses and store separately
 *
 * The poses grid (3x3) layout:
 *   [0,0] Standing relaxed    [0,1] Sitting casual    [0,2] Mid-sentence gesturing
 *   [1,0] Arms crossed        [1,1] Candid side glance[1,2] Walking toward camera
 *   [2,0] Leaning on surface  [2,1] Holding phone     [2,2] Close-up headshot
 *
 * The 360 grid (2x3) layout:
 *   [0,0] Front view          [0,1] 3/4 Right         [0,2] Right Profile
 *   [1,0] Back view           [1,1] 3/4 Left          [1,2] Left Profile
 */

import prisma from "@/lib/prisma";
import { getStartingFrameUrl } from "@/lib/starting-frame";

// ---- Grid Position Metadata ----

export interface PoseGridPosition {
  row: number;
  col: number;
  label: string;
  suitableFor: string[]; // cut types this pose works well for
}

/**
 * Poses sheet (3x3 grid) -- maps each cell to its pose description
 * and the cut types it is best suited for.
 */
export const POSES_GRID: PoseGridPosition[] = [
  { row: 0, col: 0, label: "standing_relaxed",       suitableFor: ["hook", "cta"] },
  { row: 0, col: 1, label: "sitting_casual",          suitableFor: ["talking_head", "reaction"] },
  { row: 0, col: 2, label: "mid_sentence_gesturing",  suitableFor: ["talking_head"] },
  { row: 1, col: 0, label: "arms_crossed",            suitableFor: ["hook", "cta"] },
  { row: 1, col: 1, label: "candid_side_glance",      suitableFor: ["broll", "transition"] },
  { row: 1, col: 2, label: "walking_toward_camera",   suitableFor: ["hook", "transition"] },
  { row: 2, col: 0, label: "leaning_on_surface",      suitableFor: ["talking_head", "broll"] },
  { row: 2, col: 1, label: "holding_phone",           suitableFor: ["cta", "reaction"] },
  { row: 2, col: 2, label: "close_up_headshot",       suitableFor: ["hook", "cta", "talking_head"] },
];

/**
 * 360 sheet (2x3 grid) -- maps each cell to its angle.
 */
export const THREE_SIXTY_GRID: PoseGridPosition[] = [
  { row: 0, col: 0, label: "front",          suitableFor: ["hook", "cta", "talking_head"] },
  { row: 0, col: 1, label: "three_quarter_right", suitableFor: ["talking_head", "reaction"] },
  { row: 0, col: 2, label: "right_profile",  suitableFor: ["broll", "transition"] },
  { row: 1, col: 0, label: "back",           suitableFor: ["broll", "transition"] },
  { row: 1, col: 1, label: "three_quarter_left", suitableFor: ["talking_head", "reaction"] },
  { row: 1, col: 2, label: "left_profile",   suitableFor: ["broll", "transition"] },
];

// ---- Cut Type to Pose Mapping ----

/**
 * For each cut type, which grid position (by index in POSES_GRID) is preferred,
 * in priority order.
 */
const CUT_TYPE_POSE_PREFERENCES: Record<string, number[]> = {
  hook:          [0, 3, 8, 5],   // standing, arms crossed, headshot, walking
  cta:           [0, 8, 7, 3],   // standing, headshot, holding phone, arms crossed
  talking_head:  [2, 1, 8, 6],   // mid-sentence, sitting, headshot, leaning
  broll:         [4, 6, 5],      // side glance, leaning, walking
  product_shot:  [7, 6, 1],      // holding phone, leaning, sitting
  reaction:      [1, 7, 2],      // sitting, holding phone, mid-sentence
  transition:    [4, 5, 6],      // side glance, walking, leaning
};

// ---- Result Type ----

export interface CharacterAssetResult {
  /** The image URL to use for this cut */
  url: string;
  /** Source: "360_sheet" | "poses_sheet" | "starting_frame" | "primary_photo" | "fallback_photo" */
  source: string;
  /** If from a composite, which grid position is recommended */
  gridPosition?: { row: number; col: number; label: string };
  /** The character sheet ID, if one was used */
  characterSheetId?: string;
}

// ---- Public API ----

/**
 * Get the BEST reference image for video generation.
 *
 * This is the primary function the video generation pipeline calls
 * to resolve the reference image passed to FAL (Kling, Minimax, etc.).
 * Character sheet composites give the video model MULTIPLE angles/poses
 * to reference in a single image, producing far better character
 * consistency than a single selfie.
 *
 * Priority order:
 *   a. Completed 360 character sheet compositeUrl -- best quality reference
 *      (shows the person from 6 angles, giving the video model the richest
 *      understanding of the person's appearance from any direction)
 *   b. Completed poses character sheet compositeUrl -- second best
 *      (shows 9 different poses, strong identity reference)
 *   c. Starting frame (if exists) -- single high-quality generated image
 *   d. User's primary uploaded photo (fallback)
 *
 * @param userId  - The user ID
 * @param cutType - Optional cut type for logging context
 * @returns       - The image URL, or null if no reference image exists
 */
export async function getBestReferenceImage(
  userId: string,
  cutType?: string
): Promise<string | null> {
  const context = cutType ? ` (cut: ${cutType})` : "";

  // a. 360 character sheet -- best quality (multi-angle reference)
  const threeSixtySheet = await prisma.characterSheet.findFirst({
    where: { userId, type: "3d_360", status: "complete" },
    orderBy: { createdAt: "desc" },
    select: { compositeUrl: true, id: true },
  });

  if (threeSixtySheet?.compositeUrl) {
    console.log(
      `[character-assets] Selected 360 sheet (${threeSixtySheet.id}) for user ${userId}${context} -- ` +
      `multi-angle composite provides richest reference for video model`
    );
    return threeSixtySheet.compositeUrl;
  }

  // b. Poses character sheet -- second best (multi-pose reference)
  const posesSheet = await prisma.characterSheet.findFirst({
    where: { userId, type: "poses", status: "complete" },
    orderBy: { createdAt: "desc" },
    select: { compositeUrl: true, id: true },
  });

  if (posesSheet?.compositeUrl) {
    console.log(
      `[character-assets] Selected poses sheet (${posesSheet.id}) for user ${userId}${context} -- ` +
      `9-pose composite (no 360 sheet available)`
    );
    return posesSheet.compositeUrl;
  }

  // c. Starting frame -- single high-quality generated image
  const startingFrame = await getStartingFrameUrl(userId);
  if (startingFrame) {
    console.log(
      `[character-assets] Selected starting frame for user ${userId}${context} -- ` +
      `no character sheets available`
    );
    return startingFrame;
  }

  // d. User's primary photo -- raw selfie fallback
  const primaryPhoto = await prisma.photo.findFirst({
    where: { userId, isPrimary: true },
    select: { url: true },
  });

  if (primaryPhoto?.url) {
    console.log(
      `[character-assets] Falling back to primary photo for user ${userId}${context} -- ` +
      `no character sheets or starting frame available`
    );
    return primaryPhoto.url;
  }

  // Last resort: any photo
  const anyPhoto = await prisma.photo.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { url: true },
  });

  if (anyPhoto?.url) {
    console.log(
      `[character-assets] Falling back to any available photo for user ${userId}${context} -- ` +
      `no primary photo, character sheets, or starting frame`
    );
    return anyPhoto.url;
  }

  console.error(
    `[character-assets] No reference image found for user ${userId}${context} -- ` +
    `video generation will have no character reference`
  );
  return null;
}

/**
 * Select the RIGHT character asset for a specific video cut type.
 *
 * Resolution order:
 *   1. Poses character sheet (if exists and complete) -- picks the best pose for the cut type
 *   2. 360 character sheet (if exists and complete) -- picks the best angle for the cut type
 *   3. User's primary photo (fallback)
 *
 * @param userId  - The user ID
 * @param cutType - The cut type: "hook", "talking_head", "broll", "cta", etc.
 * @returns       - The image URL and metadata about the selection
 */
export async function getCharacterAssetForCut(
  userId: string,
  cutType: string
): Promise<CharacterAssetResult> {
  // Try poses sheet first (most useful for video generation)
  const posesSheet = await prisma.characterSheet.findFirst({
    where: { userId, type: "poses", status: "complete" },
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  if (posesSheet?.compositeUrl) {
    const gridPosition = selectBestPose(cutType, "poses");
    return {
      url: posesSheet.compositeUrl,
      source: "poses_sheet",
      gridPosition,
      characterSheetId: posesSheet.id,
    };
  }

  // Try 360 sheet
  const threeSixtySheet = await prisma.characterSheet.findFirst({
    where: { userId, type: "3d_360", status: "complete" },
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  if (threeSixtySheet?.compositeUrl) {
    const gridPosition = selectBestPose(cutType, "360");
    return {
      url: threeSixtySheet.compositeUrl,
      source: "360_sheet",
      gridPosition,
      characterSheetId: threeSixtySheet.id,
    };
  }

  // Fallback: user's primary photo
  const primaryPhoto = await prisma.photo.findFirst({
    where: { userId, isPrimary: true },
  });

  if (primaryPhoto?.url) {
    return {
      url: primaryPhoto.url,
      source: "primary_photo",
    };
  }

  // Last resort: any photo the user has uploaded
  const anyPhoto = await prisma.photo.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return {
    url: anyPhoto?.url || "",
    source: anyPhoto ? "fallback_photo" : "none",
  };
}

/**
 * Select the best grid position for a given cut type.
 */
function selectBestPose(
  cutType: string,
  sheetType: "poses" | "360"
): { row: number; col: number; label: string } {
  if (sheetType === "poses") {
    const preferences = CUT_TYPE_POSE_PREFERENCES[cutType];
    if (preferences && preferences.length > 0) {
      const idx = preferences[0];
      const pos = POSES_GRID[idx];
      if (pos) return { row: pos.row, col: pos.col, label: pos.label };
    }
    // Default to close-up headshot (position 8) for unknown cut types
    return { row: 2, col: 2, label: "close_up_headshot" };
  }

  // 360 sheet
  const grid = THREE_SIXTY_GRID;
  const match = grid.find((g) => g.suitableFor.includes(cutType));
  if (match) return { row: match.row, col: match.col, label: match.label };

  // Default to front view
  return { row: 0, col: 0, label: "front" };
}

/**
 * Build the grid metadata for a poses sheet.
 * Called after generating the composite to store the mapping in the DB.
 */
export function buildPosesGridMetadata(): Record<string, { row: number; col: number; label: string; suitableFor: string[] }> {
  const metadata: Record<string, { row: number; col: number; label: string; suitableFor: string[] }> = {};
  for (const pos of POSES_GRID) {
    metadata[`${pos.row}_${pos.col}`] = {
      row: pos.row,
      col: pos.col,
      label: pos.label,
      suitableFor: pos.suitableFor,
    };
  }
  return metadata;
}

/**
 * Build the grid metadata for a 360 sheet.
 */
export function buildThreeSixtyGridMetadata(): Record<string, { row: number; col: number; label: string; suitableFor: string[] }> {
  const metadata: Record<string, { row: number; col: number; label: string; suitableFor: string[] }> = {};
  for (const pos of THREE_SIXTY_GRID) {
    metadata[`${pos.row}_${pos.col}`] = {
      row: pos.row,
      col: pos.col,
      label: pos.label,
      suitableFor: pos.suitableFor,
    };
  }
  return metadata;
}
