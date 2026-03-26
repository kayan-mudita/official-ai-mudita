/**
 * Pipeline: Intelligent Model Routing
 *
 * Routes each video cut to the optimal AI model based on cut type.
 * Different models have different strengths:
 *  - Kling 2.6: Best at faces, close-ups, short duration, lip sync
 *  - Minimax Hailuo: Better at environments, motion, b-roll
 *  - Wan 2.1: Good character consistency, open-source fallback
 *
 * The routing table is stored in SystemConfig so admins can edit
 * it from the admin panel without code changes.
 *
 * Fallback chain: if the primary model fails, the caller can
 * request the next model in the chain via getNextFallback().
 */

import { getConfigJSON, setConfig } from "@/lib/system-config";
import prisma from "@/lib/prisma";

// ---- Types ---------------------------------------------------------------

export interface ModelRoutingTable {
  [cutType: string]: string;
}

export interface ModelFallbackEntry {
  primary: string;
  fallbacks: string[];
}

// ---- Default Routing Table -----------------------------------------------

/**
 * Default cut-type to model mapping.
 * Rationale for each assignment is documented inline.
 */
export const DEFAULT_ROUTING_TABLE: ModelRoutingTable = {
  // Hook cuts need face consistency and attention-grabbing close-ups
  hook: "kling_2.6",
  // Talking head cuts depend on face fidelity and natural movement
  talking_head: "kling_2.6",
  // B-roll cuts benefit from better environment rendering and motion
  broll: "minimax_hailuo",
  // CTA cuts are face + direct address, same needs as talking head
  cta: "kling_2.6",
  // Testimonial cuts are face-focused, emotional expression matters
  testimonial: "kling_2.6",
  // Product shots need good object rendering and slow motion
  product_shot: "minimax_hailuo",
  // Reaction cuts are face-focused with expressive movement
  reaction: "kling_2.6",
  // Transition/end cards are environment-focused
  transition: "minimax_hailuo",
};

/**
 * Fallback chain: when the primary model fails, try these in order.
 * kling -> minimax -> wan
 */
export const MODEL_FALLBACK_CHAIN: Record<string, string[]> = {
  "kling_2.6": ["minimax_hailuo", "wan_2.1"],
  "minimax_hailuo": ["kling_2.6", "wan_2.1"],
  "minimax_video": ["kling_2.6", "wan_2.1"],
  "wan_2.1": ["kling_2.6", "minimax_hailuo"],
  "ltx": ["kling_2.6", "minimax_hailuo"],
  "ltx_fast": ["ltx", "kling_2.6"],
};

// ---- Config Key ----------------------------------------------------------

const CONFIG_KEY = "pipeline_model_routing";
const CONFIG_LABEL = "Pipeline Model Routing Table";
const CONFIG_CATEGORY = "models";

// ---- Public API ----------------------------------------------------------

/**
 * Get the optimal model for a given cut type.
 *
 * Resolution order:
 *  1. Admin-configured routing table (from SystemConfig)
 *  2. Default routing table
 *  3. The provided defaultModel (caller's fallback)
 *
 * @param cutType - The cut type from the composition plan (e.g., "hook", "broll")
 * @param defaultModel - Fallback model if no routing is configured for this type
 */
export async function getModelForCut(
  cutType: string,
  defaultModel: string
): Promise<string> {
  try {
    const table = await getRoutingTable();
    const model = table[cutType];

    if (model) {
      return model;
    }

    // Normalize cut type: some formats use underscores, some don't
    const normalized = cutType.toLowerCase().replace(/[-\s]/g, "_");
    if (table[normalized]) {
      return table[normalized];
    }
  } catch (err: any) {
    console.warn(
      `[model-router] Failed to load routing table, using default: ${err?.message}`
    );
  }

  return defaultModel;
}

/**
 * Get the next fallback model after a failure.
 *
 * @param failedModel - The model that just failed
 * @param attempt - 0-based attempt number (0 = first fallback)
 * @returns The next model to try, or null if no more fallbacks
 */
export function getNextFallback(
  failedModel: string,
  attempt: number = 0
): string | null {
  const chain = MODEL_FALLBACK_CHAIN[failedModel];
  if (!chain || attempt >= chain.length) {
    return null;
  }
  return chain[attempt];
}

/**
 * Get the full fallback chain for a model, including the primary.
 * Useful for UI display of the retry strategy.
 */
export function getFallbackChain(model: string): string[] {
  return [model, ...(MODEL_FALLBACK_CHAIN[model] || [])];
}

// ---- Routing Table Management --------------------------------------------

/**
 * Load the routing table from SystemConfig, falling back to defaults.
 */
export async function getRoutingTable(): Promise<ModelRoutingTable> {
  const stored = await getConfigJSON<ModelRoutingTable | null>(
    CONFIG_KEY,
    null
  );

  if (stored && typeof stored === "object" && Object.keys(stored).length > 0) {
    // Merge with defaults so new cut types are always covered
    return { ...DEFAULT_ROUTING_TABLE, ...stored };
  }

  return { ...DEFAULT_ROUTING_TABLE };
}

/**
 * Save a custom routing table to SystemConfig.
 * This creates the config row if it doesn't exist, or updates it.
 */
export async function setRoutingTable(
  table: ModelRoutingTable
): Promise<void> {
  const value = JSON.stringify(table);

  try {
    await setConfig(CONFIG_KEY, value);
  } catch {
    // setConfig uses update -- if the row doesn't exist yet, create it
    try {
      await prisma.systemConfig.create({
        data: {
          key: CONFIG_KEY,
          value,
          label: CONFIG_LABEL,
          category: CONFIG_CATEGORY,
        },
      });
    } catch (createErr: any) {
      // If it's a unique constraint violation, the row was just created by another process
      if (!createErr?.message?.includes("Unique constraint")) {
        throw createErr;
      }
      // Retry the update
      await setConfig(CONFIG_KEY, value);
    }
  }
}

/**
 * Reset the routing table to defaults.
 */
export async function resetRoutingTable(): Promise<void> {
  await setRoutingTable(DEFAULT_ROUTING_TABLE);
}
