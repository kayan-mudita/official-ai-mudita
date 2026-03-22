import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { generateVideo, pollJobUntilDone } from "@/lib/generate";
import { generateRequestSchema } from "@/lib/validations";
import { validateBody } from "@/lib/validate";
import { generateLimiter, RateLimitError } from "@/lib/rate-limit";
import { planComposition, expandCutPrompts } from "@/lib/video-compositor";
import { generateStartingFrame } from "@/lib/starting-frame";
import { stitchCuts, isShotstackConfigured, StitchCut } from "@/lib/video-stitcher";
import { downloadAndStore, videoKey } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    try {
      await generateLimiter.check(10, user.id);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return NextResponse.json(
          { error: "Too many requests. Try again later." },
          { status: 429, headers: { "Retry-After": String(err.retryAfter) } }
        );
      }
    }

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = validateBody(generateRequestSchema, body);
    if (validation.error) {
      return NextResponse.json({ error: validation.error, fieldErrors: validation.fieldErrors }, { status: 400 });
    }

    const { videoId, model, script, format, photoId, voiceId } = validation.data;
    const selectedModel = model || "kling_2.6";
    const selectedFormat = format || "talking_head_15";

    // Get or create video record
    let video;
    if (videoId) {
      video = await prisma.video.findFirst({ where: { id: videoId, userId: user.id } });
      if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Get photo and voice
    const photo = photoId
      ? await prisma.photo.findFirst({ where: { id: photoId, userId: user.id } })
      : await prisma.photo.findFirst({ where: { userId: user.id, isPrimary: true } });

    const voice = voiceId
      ? await prisma.voiceSample.findFirst({ where: { id: voiceId, userId: user.id } })
      : await prisma.voiceSample.findFirst({ where: { userId: user.id, isDefault: true } });

    // ─── FORMAT-FIRST COMPOSITION PLAN ──────────────────────
    //
    // Step 1: Plan the cuts based on format
    // Step 2: Expand each cut's prompt through the prompt engine
    // Step 3: Generate each cut separately (same starting frame)
    // Step 4: Store results for stitching

    const rawScript = script || video?.script || "";

    // Step 1: Plan
    const plan = planComposition(selectedFormat, rawScript);

    // Step 2: Expand each cut's prompt with full production details
    const expandedPlan = await expandCutPrompts(plan, user.id, selectedModel, user.industry);

    // Step 2.5: Generate or retrieve starting frame for character consistency
    let startingFrameUrl = photo?.url || "";
    if (photo?.url) {
      try {
        // Check for existing starting frame first
        const existingSF = await prisma.photo.findFirst({
          where: { userId: user.id, filename: { startsWith: "starting-frame-" } },
          orderBy: { createdAt: "desc" },
        });
        if (existingSF?.url) {
          startingFrameUrl = existingSF.url;
        } else {
          const sf = await generateStartingFrame(user.id, rawScript);
          if (sf.status === "complete" && sf.imageUrl) {
            startingFrameUrl = sf.imageUrl;
          }
        }
      } catch (err) {
        console.error("[generate] Starting frame failed, using raw photo:", err);
      }
    }

    // Create/update video record with the composition plan
    if (!video) {
      video = await prisma.video.create({
        data: {
          userId: user.id,
          title: rawScript.length > 100 ? rawScript.substring(0, 97) + "..." : rawScript || "New Video",
          description: `Format: ${expandedPlan.format.name} | ${expandedPlan.format.cuts.length} cuts`,
          script: rawScript,
          model: selectedModel,
          contentType: selectedFormat,
          photoId: photo?.id,
          voiceId: voice?.id,
          status: "generating",
        },
      });
    } else {
      await prisma.video.update({
        where: { id: video.id },
        data: {
          status: "generating",
          model: selectedModel,
          contentType: selectedFormat,
          description: `Format: ${expandedPlan.format.name} | ${expandedPlan.format.cuts.length} cuts`,
        },
      });
    }

    // Step 3: Generate each cut
    // For now, generate the FIRST cut (the hook) synchronously
    // and queue the rest in background. The hook is what the user
    // sees immediately as a preview.
    const hookCut = expandedPlan.format.cuts[0];
    const hookResult = await generateVideo({
      model: selectedModel,
      photoUrl: startingFrameUrl,
      voiceUrl: voice?.url || "",
      script: hookCut.prompt,
      userId: user.id,
      industry: user.industry,
      usePromptEngine: false, // already expanded
      duration: hookCut.generateDuration,
    });

    // Update video with hook result + save the expanded prompt
    const allExpandedPrompts = expandedPlan.format.cuts.map((c, i) =>
      `═══ CUT ${i + 1}: ${c.type.toUpperCase()} (${c.duration}s from ${c.generateDuration}s generated) ═══\n${c.prompt}`
    ).join("\n\n");

    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: {
        status: hookResult.status === "completed" ? "review" : "generating",
        videoUrl: hookResult.videoUrl || null,
        thumbnailUrl: hookResult.thumbnailUrl || null,
        script: allExpandedPrompts.substring(0, 5000), // store expanded prompts
        duration: expandedPlan.format.totalDuration,
      },
    });

    // Fire-and-forget: poll hook completion + generate remaining cuts
    if (hookResult.status === "processing" && hookResult.jobId) {
      pollJobUntilDone(video.id, hookResult.jobId, selectedModel).catch((err) =>
        console.error(`[generate] Hook poll failed for ${video!.id}:`, err)
      );
    }

    // Background: generate remaining cuts (cuts 1..N) then stitch everything
    const remainingCuts = expandedPlan.format.cuts.slice(1);
    if (remainingCuts.length > 0) {
      generateRemainingCuts(
        video.id, user.id, selectedModel, startingFrameUrl, voice?.url || "",
        hookResult.videoUrl || null, hookCut.duration,
        remainingCuts, user.industry
      ).catch((err) =>
        console.error(`[generate] Remaining cuts failed for ${video!.id}:`, err)
      );
    }

    return NextResponse.json({
      video: updatedVideo,
      composition: {
        format: expandedPlan.format.name,
        totalCuts: expandedPlan.format.cuts.length,
        totalDuration: expandedPlan.format.totalDuration,
        hooksGenerated: 1,
        remainingCuts: remainingCuts.length,
        hookStatus: hookResult.status,
        promptExpanded: true,
      },
    });
  } catch (error) {
    console.error("[POST /api/generate] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Background Cut Generation + Stitching ──────────────────────

async function generateRemainingCuts(
  parentVideoId: string,
  userId: string,
  model: string,
  photoUrl: string,
  voiceUrl: string,
  hookVideoUrl: string | null,
  hookDuration: number,
  cuts: any[],
  industry?: string
): Promise<void> {
  // Collect all cut video URLs (hook is already done)
  const completedCuts: StitchCut[] = [];

  if (hookVideoUrl) {
    completedCuts.push({
      videoUrl: hookVideoUrl,
      trimTo: hookDuration,
    });
  }

  // Generate each remaining cut sequentially
  for (const cut of cuts) {
    try {
      const result = await generateVideo({
        model,
        photoUrl,
        voiceUrl,
        script: cut.prompt,
        userId,
        industry,
        usePromptEngine: false,
        duration: cut.generateDuration,
      });

      let cutVideoUrl = result.videoUrl;

      // If processing, poll until done then read URL from DB
      if (result.status === "processing" && result.jobId) {
        await pollJobUntilDone(parentVideoId, result.jobId, model);
        const updated = await prisma.video.findUnique({ where: { id: parentVideoId } });
        if (updated?.videoUrl) {
          cutVideoUrl = updated.videoUrl;
        }
      }

      if (cutVideoUrl) {
        completedCuts.push({
          videoUrl: cutVideoUrl,
          trimTo: cut.duration,
        });
      }

      console.log(`[generate] Cut ${cut.index} (${cut.type}) done for ${parentVideoId}`);
    } catch (err) {
      console.error(`[generate] Cut ${cut.index} failed for ${parentVideoId}:`, err);
    }
  }

  // ─── STITCH ALL CUTS ──────────────────────────────────────
  if (completedCuts.length > 1 && isShotstackConfigured()) {
    try {
      console.log(`[generate] Stitching ${completedCuts.length} cuts for ${parentVideoId}...`);

      const finalUrl = await stitchCuts({
        cuts: completedCuts,
        audioUrl: voiceUrl || undefined,
        aspectRatio: "9:16",
      });

      // Download stitched video and store permanently in Supabase
      const storedUrl = await downloadAndStore(
        finalUrl,
        videoKey(userId, parentVideoId, "mp4"),
        "video/mp4"
      );

      // Update the parent video with the final stitched URL
      await prisma.video.update({
        where: { id: parentVideoId },
        data: {
          videoUrl: storedUrl,
          status: "review",
        },
      });

      console.log(`[generate] Final stitched video stored for ${parentVideoId}`);
    } catch (err) {
      console.error(`[generate] Stitching failed for ${parentVideoId}:`, err);
      // Fall back to hook-only video
      await prisma.video.update({
        where: { id: parentVideoId },
        data: { status: "review" },
      });
    }
  } else if (completedCuts.length === 1) {
    // Only hook generated — store it permanently
    try {
      const storedUrl = await downloadAndStore(
        completedCuts[0].videoUrl,
        videoKey(userId, parentVideoId, "mp4"),
        "video/mp4"
      );
      await prisma.video.update({
        where: { id: parentVideoId },
        data: { videoUrl: storedUrl, status: "review" },
      });
    } catch {
      await prisma.video.update({
        where: { id: parentVideoId },
        data: { status: "review" },
      });
    }
  }
}
