/**
 * Pipeline: Event Log
 *
 * Structured event logging for every pipeline step. Each entry
 * records the step name, status, timing, and optional error/metadata.
 *
 * Storage strategy:
 *  - If the LifecycleEvent model exists in Prisma, events are
 *    persisted to the database for the admin panel.
 *  - Always logs to console as a fallback / supplement.
 *
 * The pipeline-log API endpoint (GET /api/admin/pipeline-log?videoId=X)
 * reads events back for debugging.
 */

import prisma from "@/lib/prisma";

// ---- Types ---------------------------------------------------------------

export interface PipelineEvent {
  step: string;
  status: "start" | "complete" | "fail" | "retry";
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface StoredPipelineEvent extends PipelineEvent {
  id: string;
  videoId: string;
  createdAt: Date;
}

// ---- Internal State ------------------------------------------------------

/** In-memory buffer for the current session (used as fallback if DB is unavailable) */
const memoryLog = new Map<string, PipelineEvent[]>();

// ---- Logging -------------------------------------------------------------

/**
 * Log a pipeline event for a video.
 *
 * Writes to:
 *  1. Console (always) -- structured JSON for log aggregation
 *  2. LifecycleEvent table (if available) -- for admin panel queries
 *  3. In-memory buffer -- for same-process timeline retrieval
 */
export async function logPipelineEvent(
  videoId: string,
  event: PipelineEvent
): Promise<void> {
  // 1. Console log (structured)
  const logEntry = {
    ts: new Date().toISOString(),
    videoId,
    ...event,
  };

  if (event.status === "fail") {
    console.error(`[pipeline-event] ${JSON.stringify(logEntry)}`);
  } else {
    console.log(`[pipeline-event] ${JSON.stringify(logEntry)}`);
  }

  // 2. In-memory buffer
  if (!memoryLog.has(videoId)) {
    memoryLog.set(videoId, []);
  }
  memoryLog.get(videoId)!.push({ ...event });

  // Cap memory buffer per video to prevent leaks in long-running processes
  const buffer = memoryLog.get(videoId)!;
  if (buffer.length > 200) {
    memoryLog.set(videoId, buffer.slice(-100));
  }

  // 3. Persist to LifecycleEvent table
  try {
    await prisma.lifecycleEvent.create({
      data: {
        userId: "system", // pipeline events are system-level, not user-initiated
        event: `pipeline:${event.step}:${event.status}`,
        metadata: JSON.stringify({
          videoId,
          duration: event.duration,
          error: event.error,
          ...(event.metadata || {}),
        }),
      },
    });
  } catch (dbErr: any) {
    // DB write failure is non-fatal -- the console log is our safety net
    // This can happen if LifecycleEvent schema changed or DB is down
    if (!dbErr?.message?.includes("does not exist")) {
      console.warn(
        `[pipeline-event] DB write failed for ${videoId}/${event.step}: ${dbErr?.message}`
      );
    }
  }
}

// ---- Timeline Retrieval --------------------------------------------------

/**
 * Retrieve the ordered event timeline for a video.
 *
 * Strategy: query LifecycleEvent table for all `pipeline:*` events
 * associated with the video. Falls back to the in-memory buffer
 * if the DB query fails.
 */
export async function getPipelineTimeline(
  videoId: string
): Promise<StoredPipelineEvent[]> {
  try {
    const dbEvents = await prisma.lifecycleEvent.findMany({
      where: {
        event: { startsWith: "pipeline:" },
        metadata: { contains: videoId },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return dbEvents.map((row) => {
      const meta = safeParseJson(row.metadata);
      // Parse event string: "pipeline:{step}:{status}"
      const parts = row.event.split(":");
      const step = parts[1] || "unknown";
      const status = (parts[2] || "complete") as PipelineEvent["status"];

      return {
        id: row.id,
        videoId,
        step,
        status,
        duration: meta.duration as number | undefined,
        error: meta.error as string | undefined,
        metadata: meta,
        createdAt: row.createdAt,
      };
    });
  } catch {
    // Fall back to in-memory buffer
    const buffer = memoryLog.get(videoId) || [];
    return buffer.map((evt, i) => ({
      id: `mem-${i}`,
      videoId,
      ...evt,
      createdAt: new Date(),
    }));
  }
}

// ---- Step Wrapper --------------------------------------------------------

/**
 * Convenience wrapper that logs start/complete/fail for a pipeline step.
 *
 * Usage:
 *   const result = await withEventLog(videoId, "expand", async () => {
 *     return handleExpand(videoId, userId);
 *   });
 */
export async function withEventLog<T>(
  videoId: string,
  step: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();

  await logPipelineEvent(videoId, {
    step,
    status: "start",
    metadata,
  });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    await logPipelineEvent(videoId, {
      step,
      status: "complete",
      duration,
      metadata,
    });

    return result;
  } catch (err: any) {
    const duration = Date.now() - startTime;

    await logPipelineEvent(videoId, {
      step,
      status: "fail",
      duration,
      error: err?.message || "Unknown error",
      metadata,
    });

    throw err;
  }
}

/**
 * Log a retry event for a specific step.
 */
export async function logRetry(
  videoId: string,
  step: string,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logPipelineEvent(videoId, {
    step,
    status: "retry",
    error: reason,
    metadata,
  });
}

// ---- Helpers -------------------------------------------------------------

function safeParseJson(str: string | null | undefined): Record<string, unknown> {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
