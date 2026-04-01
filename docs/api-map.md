# Official AI — Complete API & Pipeline Map

> Every API route, external service call, data shape, fallback chain, and format definition in the video generation system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Route Reference](#api-route-reference)
3. [Video Generation Pipeline](#video-generation-pipeline)
4. [External Service Integration](#external-service-integration)
5. [Video Formats & Cut Patterns](#video-formats--cut-patterns)
6. [TTS Provider Fallback Chain](#tts-provider-fallback-chain)
7. [Video Model Fallback Chain](#video-model-fallback-chain)
8. [Shotstack Stitching](#shotstack-stitching)
9. [Character Sheet & Starting Frame](#character-sheet--starting-frame)
10. [Data Shapes & Interfaces](#data-shapes--interfaces)
11. [Environment Variables](#environment-variables)
12. [Status & Progress Tracking](#status--progress-tracking)

---

## Architecture Overview

```
Client (Next.js)
  │
  ├── POST /api/generate          ← Fast return: creates Video record, returns immediately
  │     └── planComposition()     ← Maps format → cut templates
  │
  ├── POST /api/generate/process  ← Step executor (called per pipeline step)
  │     └── orchestrator.runStep()
  │           ├── expand          ← Gemini script expansion
  │           ├── tts             ← Per-cut audio (3-provider fallback)
  │           ├── anchor          ← Starting frame resolution
  │           ├── submit_all_cuts ← Parallel FAL video submission
  │           ├── poll_all_cuts   ← Parallel FAL polling
  │           ├── stitch          ← Shotstack render submission
  │           └── poll_stitch     ← Shotstack polling → final video
  │
  ├── POST /api/generate/advance  ← Webhook-triggered step progression
  │     └── Idempotent: examines state, executes next step
  │
  └── GET /api/generate/status    ← Progress polling with % calculation
```

**Design Constraints:**
- Serverless-safe (Netlify 26s function timeout) — all heavy work is async
- Webhook + polling fallback — FAL webhooks drive progression; client polling is failsafe
- Audio-driven composition — TTS duration determines cut trim values
- Per-cut audio alignment — each cut gets its own audio segment on Shotstack timeline
- Idempotent state machine — multiple advance calls produce same result

---

## API Route Reference

### Video Generation

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/generate` | Create video record, plan composition, return immediately |
| POST | `/api/generate/process` | Execute a single pipeline step `{ videoId, step, cutIndex? }` |
| POST | `/api/generate/advance` | Webhook/polling step progression (idempotent) |
| GET | `/api/generate/status` | Progress polling `?videoId=xxx` → `{ video, progress, error }` |
| POST | `/api/generate/batch` | Batch create 3/5/7 videos from industry templates |

### Content & Media

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/videos` | List videos (filters out individual cuts) |
| POST | `/api/upload` | Multipart upload for photo/voice/video |
| POST | `/api/photos` | Create photo record `{ filename, url, isPrimary }` |
| GET | `/api/photos` | List user's photos |

### Onboarding

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/onboarding/voice` | Upload voice sample for cloning |
| POST | `/api/onboarding/preview-video` | Trigger preview video generation |
| POST | `/api/onboarding/complete` | Mark onboarding finished |

### Publishing & Social

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/publish` | Publish video via PostBridge `{ videoId, platforms, scheduledAt, caption }` |
| GET | `/api/social/accounts` | List connected social accounts (tokens excluded) |

### Auth & Billing

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/stripe/checkout` | Create Stripe checkout session `{ plan }` |
| POST | `/api/stripe/webhook` | Stripe webhook handler |
| GET | `/api/usage` | Plan usage metrics `{ videosUsed, videosLimit, canGenerate }` |
| POST | `/api/events` | Analytics event tracking `{ event, metadata? }` |

### FAL Webhook

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/webhooks/fal` | FAL.ai job completion callback (no auth) |

---

## Video Generation Pipeline

### Step 1: `expand` — Script Expansion

**File:** `src/lib/pipeline/expand.ts`
**External Call:** Gemini API via `src/lib/content-planner.ts`

```
Input:  Video record with raw script/prompt
Output: Expanded script + per-cut prompts stored in sourceReview.cuts[]
```

- Single unified API call to Gemini merges prompt expansion and per-cut planning
- Each cut gets: `prompt` (scene description), `script` (dialogue/narration), `targetDuration`
- Stores results in `video.sourceReview.cuts[]`

### Step 2: `tts` — Text-to-Speech Generation

**File:** `src/lib/pipeline/tts.ts`
**External Calls:** FAL MiniMax → MiniMax Standalone → ElevenLabs (fallback chain)

```
Input:  Per-cut scripts from expand step
Output: Per-cut audio URLs + durations stored in sourceReview.cuts[].audio
```

- Iterates each cut, generates TTS for its script text
- Audio duration determines cut trim values (audio-driven composition)
- TTS failure is **non-fatal** — pipeline continues without audio for that cut
- See [TTS Provider Fallback Chain](#tts-provider-fallback-chain) for details

### Step 3: `anchor` — Starting Frame Resolution

**File:** `src/lib/pipeline/anchor.ts`
**External Call:** Gemini image generation API

```
Input:  User's photos + character sheet
Output: Starting frame URL stored for character consistency
```

- Resolves or generates a starting frame (reference image) for the video
- Uses `getOrGenerateStartingFrame()` from `src/lib/starting-frame.ts`
- Starting frame ensures character consistency across all cuts
- Critical for lip-sync and testimonial formats

### Step 4: `submit_all_cuts` — Parallel Video Submission

**File:** `src/lib/pipeline/cut-submit-all.ts`
**External Call:** FAL.ai video generation API

```
Input:  Per-cut prompts + audio URLs + starting frame
Output: FAL job IDs stored in sourceReview.cutJobs{}
```

- Submits ALL cuts in parallel to FAL.ai
- Model selected per cut via `model-router.ts` routing table
- Each submission includes: prompt, reference image, audio URL, duration target
- Returns immediately with job IDs — actual generation is async on FAL servers

### Step 5: `poll_all_cuts` — Parallel Job Polling

**File:** `src/lib/pipeline/cut-poll-all.ts`
**External Call:** FAL.ai status polling

```
Input:  FAL job IDs from submit step
Output: Video URLs for completed cuts, or retry signal
```

- Uses `Promise.allSettled()` for parallel polling
- Reduces sequential 3–6 minute processing to 60–120 seconds
- Webhook callbacks from FAL also trigger progression
- Returns `nextStep: "poll_all_cuts"` with `retryAfter: 5s` if still processing
- When all cuts complete → advances to stitch

### Step 6: `stitch` — Video Composition

**File:** `src/lib/pipeline/stitch-submit.ts`
**External Call:** Shotstack Cloud Video Editing API

```
Input:  All cut video URLs + per-cut audio URLs
Output: Shotstack render job ID stored in sourceReview.stitchJobId
```

- Constructs Shotstack timeline via `buildTimeline()` in `video-stitcher.ts`
- Video clips on track 0 with cross-dissolve transitions
- Per-cut audio clips on track 1, aligned to each video cut's timeline position
- Output: mp4, 9:16 aspect ratio, 30fps, high quality
- See [Shotstack Stitching](#shotstack-stitching) for full details

### Step 7: `poll_stitch` — Final Video Delivery

**File:** `src/lib/pipeline/stitch-poll.ts`
**External Call:** Shotstack status polling + Supabase Storage upload

```
Input:  Shotstack job ID
Output: Final video URL in Supabase Storage, video status → "review"
```

- Polls Shotstack render job status
- On completion: downloads video, uploads to Supabase Storage as permanent URL
- Updates video record: `videoUrl`, `thumbnailUrl`, `status: "review"`
- **Fallback:** If stitch fails, uses first completed cut as final video
- Storage path: `videos/{userId}/{videoId}.mp4`

---

## External Service Integration

### FAL.ai — Video Generation

**Base URL:** `https://fal.run/fal-ai/{model}`
**Auth:** `Authorization: Key {FAL_API_KEY}`
**Env:** `FAL_API_KEY`

**Models (from `src/lib/generate.ts` model registry):**

| Model ID | FAL Endpoint | Use Case |
|----------|-------------|----------|
| `kling-2.6` | `fal-ai/kling-video/v2.5/standard` | Primary video gen |
| `minimax-hailuo` | `fal-ai/minimax-video/video-01-live` | Fallback video gen |
| `wan-2.1` | `fal-ai/wan-video/v2.1/1080p` | Second fallback |
| `minimax-speech` | `fal-ai/minimax/speech-02-hd` | Primary TTS |

**Webhook:** FAL sends POST to `/api/webhooks/fal` on job completion (no auth required).

### Shotstack — Video Stitching

**Base URL:** `https://api.shotstack.io/edit/{env}/render`
**Auth:** `x-api-key: {SHOTSTACK_API_KEY}`
**Env:** `SHOTSTACK_API_KEY`, `SHOTSTACK_ENV` (stage=sandbox, v1=production)

- Resolution: sd / hd / 1080
- Retry: 2 retries, 2s exponential backoff
- Polling: 3s → 5s → 8s → 10s progressive backoff (max 5 min)
- Status values: queued → processing → rendering → finalizing → completed/done/failed

### Google Gemini — Script & Image Generation

**Base URL:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
**Auth:** `?key={GOOGLE_AI_STUDIO_KEY}`
**Env:** `GOOGLE_AI_STUDIO_KEY`

**Models used:**
- Script expansion: Gemini Flash (via content-planner)
- Image generation: nano-banana-pro-preview, gemini-2.5-flash-image, gemini-3-pro-image-preview, gemini-3.1-flash-image-preview
- Generation config: `responseModalities: ["image", "text"]`, `temperature: 0.6`

### MiniMax — TTS (Standalone)

**Base URL:** `https://api.minimax.chat/v1/t2a_v2?GroupId={groupId}`
**Auth:** `Authorization: Bearer {MINIMAX_API_KEY}`
**Config:** model: speech-02-hd, sample_rate: 32000, bitrate: 128000, format: mp3, speed: 1.0, pitch: 0

### ElevenLabs — TTS (Third Fallback)

**Base URL:** `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}`
**Auth:** `xi-api-key: {ELEVENLABS_API_KEY}`
**Config:** model: eleven_multilingual_v2, stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true
**Default voice:** `21m00Tcm4TlvDq8ikWAM`

### PostBridge — Social Publishing

**Base URL:** PostBridge API
**Auth:** `POST_BRIDGE_API_KEY`
**Flow:** Upload video → Create post with caption → Store schedule record

### Supabase — Storage & Database

**Auth:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Database:** `DATABASE_URL`, `DIRECT_URL` (PostgreSQL)
**Storage buckets:**
- `photos/` — User photos
- `starting-frames/{userId}/` — Character starting frames
- `videos/{userId}/{videoId}.mp4` — Final rendered videos
- `voice-samples/` — Voice clone audio

---

## Video Formats & Cut Patterns

**File:** `src/lib/video-compositor.ts`

Seven defined formats, each with a cut pattern (sequence of scenes with target durations):

### talking_head_15 (15s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | hook | 3s |
| 2 | main | 8s |
| 3 | cta | 4s |

### testimonial_15 (15s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | hook | 3s |
| 2 | testimonial | 8s |
| 3 | cta | 4s |

### testimonial_20 (20s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | hook | 4s |
| 2 | testimonial_a | 6s |
| 3 | testimonial_b | 6s |
| 4 | cta | 4s |

### educational_30 (30s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | hook | 4s |
| 2 | point_1 | 7s |
| 3 | point_2 | 7s |
| 4 | point_3 | 7s |
| 5 | cta | 5s |

### quick_tip_8 (8s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | hook | 2s |
| 2 | tip | 4s |
| 3 | cta | 2s |

### property_tour_30 (30s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | intro | 4s |
| 2 | exterior | 6s |
| 3 | interior_1 | 6s |
| 4 | interior_2 | 6s |
| 5 | feature | 5s |
| 6 | cta | 3s |

### behind_scenes_20 (20s)
| Cut | Type | Duration |
|-----|------|----------|
| 1 | hook | 3s |
| 2 | scene_1 | 6s |
| 3 | scene_2 | 6s |
| 4 | reveal | 5s |

---

## TTS Provider Fallback Chain

**File:** `src/lib/voice-engine.ts`

```
Priority Order (each gets 2 retries with exponential backoff):

1. FAL MiniMax (speech-02-hd)
   └── URL: https://fal.run/fal-ai/minimax/speech-02-hd
   └── Auth: FAL_API_KEY
   └── On failure → try next

2. MiniMax Standalone (speech-02-hd)
   └── URL: https://api.minimax.chat/v1/t2a_v2?GroupId={groupId}
   └── Auth: MINIMAX_API_KEY
   └── Config: sample_rate 32000, bitrate 128000, mp3
   └── On failure → try next

3. ElevenLabs (eleven_multilingual_v2)
   └── URL: https://api.elevenlabs.io/v1/text-to-speech/{voiceId}
   └── Auth: ELEVENLABS_API_KEY
   └── Config: stability 0.5, similarity 0.75, style 0.3
   └── Default voice: 21m00Tcm4TlvDq8ikWAM
   └── On failure → skip audio

4. Skip (non-fatal)
   └── Pipeline continues without audio for this cut
```

**Audio duration estimation:** `text.split(/\s+/).length / 2.5` (words per second)

---

## Video Model Fallback Chain

**File:** `src/lib/pipeline/model-router.ts`

```
Cut Type → Primary Model → Fallback Chain:

talking_head  → Kling 2.6 → MiniMax Hailuo → WAN 2.1
testimonial   → Kling 2.6 → MiniMax Hailuo → WAN 2.1
educational   → Kling 2.6 → MiniMax Hailuo → WAN 2.1
hook          → Kling 2.6 → MiniMax Hailuo → WAN 2.1
cta           → Kling 2.6 → MiniMax Hailuo → WAN 2.1
property_tour → MiniMax Hailuo → WAN 2.1 → Kling 2.6
behind_scenes → MiniMax Hailuo → WAN 2.1 → Kling 2.6
```

**FAL Model Registry (`src/lib/generate.ts`):**

| Internal ID | FAL Endpoint | Resolution | Notes |
|-------------|-------------|------------|-------|
| kling-2.6 | fal-ai/kling-video/v2.5/standard | 1080p | Best for people |
| minimax-hailuo | fal-ai/minimax-video/video-01-live | 1080p | Best for scenes |
| wan-2.1 | fal-ai/wan-video/v2.1/1080p | 1080p | General fallback |

---

## Shotstack Stitching

**File:** `src/lib/video-stitcher.ts`

### Timeline Construction (`buildTimeline()`)

```
Track 0 (Video):
┌──────────┬──────────┬──────────┬──────────┐
│  Cut 1   │  Cut 2   │  Cut 3   │  Cut 4   │  ← Video clips
│  hook    │  main    │  point   │  cta     │
│  3s      │  7s      │  7s      │  5s      │
└──────────┴──────────┴──────────┴──────────┘
      ↕ fade    ↕ fade    ↕ fade

Track 1 (Audio):
┌──────────┬──────────┬──────────┬──────────┐
│ Audio 1  │ Audio 2  │ Audio 3  │ Audio 4  │  ← Per-cut audio
│ aligned  │ aligned  │ aligned  │ aligned  │
│ to cut 1 │ to cut 2 │ to cut 3 │ to cut 4 │
└──────────┴──────────┴──────────┴──────────┘
```

**Key Design:** Per-cut audio alignment — each audio segment starts exactly when its video cut starts. Duration = `Math.min(audioDurationMs/1000, cutTrimTo)` to prevent audio bleeding into next cut.

### Shotstack API Payload Shape

```json
{
  "timeline": {
    "background": "#000000",
    "tracks": [
      {
        "clips": [
          {
            "asset": { "type": "video", "src": "https://...", "trim": 3.0 },
            "start": 0,
            "length": 3.0,
            "transition": { "in": "fade", "out": "fade" }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": { "type": "audio", "src": "https://..." },
            "start": 0,
            "length": 3.0
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd",
    "aspectRatio": "9:16",
    "fps": 30,
    "quality": "high"
  }
}
```

### Status Flow

```
queued → processing → rendering → finalizing → completed/done
                                              → failed (→ fallback to first cut)
```

---

## Character Sheet & Starting Frame

### Character Sheet Generation

**File:** `src/lib/character-sheet.ts`

Generates pose sheets and 360° character turnarounds from user photo:
- Input: User photo (base64)
- Output: Multi-pose character reference sheet
- Model: Gemini image generation (same MODEL_MAP as starting frame)
- Storage: Supabase `character-sheets/{userId}/`

### Starting Frame Generation

**File:** `src/lib/starting-frame.ts`

Creates a reference image for character consistency across all video cuts:

```
Identification: SF_FILENAME_PREFIX = "sf--"

MODEL_MAP:
  nano_banana     → "nano-banana-pro-preview"
  gemini_image    → "gemini-2.5-flash-image"
  gemini_3_image  → "gemini-3-pro-image-preview"
  gemini_3_1_image → "gemini-3.1-flash-image-preview"
```

**Prompt engineering:**
- Camera: iPhone 15 Pro Max 24mm f/1.78
- Framing: medium close-up, chest-up
- Lighting: natural window light
- Scene: industry-specific backgrounds
- Prohibitions: no staged/sterile appearance, requires real texture and imperfections

**Functions:**
- `getStartingFrameUrl(userId)` — Check existing
- `getOrGenerateStartingFrame(userId)` — Check or create
- `generateStartingFrame(userId, sceneDescription?)` — Force create

**Storage:** `starting-frames/{userId}/sf-{timestamp}.{ext}`

---

## Data Shapes & Interfaces

### Video Record (Prisma)

```prisma
model Video {
  id             String    @id @default(cuid())
  userId         String
  title          String?
  description    String?
  script         String?
  model          String?
  contentType    String?     // format: talking_head_15, testimonial_20, etc.
  photoId        String?
  voiceId        String?
  status         String      // generating | review | approved | published | failed
  videoUrl       String?
  thumbnailUrl   String?
  duration       Float?
  sourceReview   Json?       // Pipeline metadata (see below)
  createdAt      DateTime
  updatedAt      DateTime
  publishedAt    DateTime?
}
```

### sourceReview Pipeline Metadata

```typescript
interface SourceReview {
  pipelineStep: string;          // Current step name
  pipelineCut: number;           // Progress counter for parallel cuts
  cuts: Array<{
    type: string;                // hook, main, cta, etc.
    prompt: string;              // Scene description from expand
    script: string;              // Dialogue/narration text
    targetDuration: number;      // Seconds
    audio?: {
      url: string;              // TTS audio URL
      duration: number;         // Actual audio duration (ms)
      provider: string;         // fal-minimax | minimax | elevenlabs
    };
    videoUrl?: string;          // Completed cut video URL
    status?: string;            // pending | submitted | completed | failed
  }>;
  cutJobs: Record<string, {     // Keyed by cut index
    jobId: string;              // FAL job ID
    resultUrl?: string;         // Completed video URL
  }>;
  cutThumbnailUrl?: string;     // Frame grab from first cut
  stitchJobId?: string;         // Shotstack render job ID
  error?: string;               // Error message on failure
}
```

### StepResult (Pipeline)

```typescript
interface StepResult {
  status: "ok" | "polling" | "error";
  nextStep?: string;            // Next pipeline step to execute
  nextCutIndex?: number;        // For per-cut processing
  retryAfter?: number;          // Seconds to wait before retry
  data?: Record<string, any>;   // Step-specific output
  error?: string;               // Error message
}
```

### TTSResult

```typescript
interface TTSResult {
  audioUrl: string;
  duration: number;             // milliseconds
  provider: "fal-minimax" | "minimax" | "elevenlabs";
  error?: string;
}
```

### StitchOptions

```typescript
interface StitchOptions {
  cuts: StitchCut[];
  audio?: PerCutAudioEntry[];
  resolution?: "sd" | "hd" | "1080";
  aspectRatio?: string;         // default "9:16"
  format?: "mp4" | "webm";
}

interface StitchCut {
  videoUrl: string;
  trimTo: number;               // seconds
  startFrom?: number;           // offset seconds
}

interface PerCutAudioEntry {
  url: string;
  durationMs: number;
}
```

---

## Environment Variables

### Required

| Variable | Service | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Supabase PostgreSQL | Connection pooling URL |
| `DIRECT_URL` | Supabase PostgreSQL | Direct connection (migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public anon key |
| `GOOGLE_AI_STUDIO_KEY` | Gemini API | Script expansion + image gen |
| `FAL_API_KEY` | FAL.ai | Video generation + TTS |
| `SHOTSTACK_API_KEY` | Shotstack | Video stitching |
| `SHOTSTACK_ENV` | Shotstack | `stage` (sandbox) or `v1` (production) |

### TTS Providers (Fallback)

| Variable | Service | Notes |
|----------|---------|-------|
| `MINIMAX_API_KEY` | MiniMax | Standalone TTS (2nd fallback) |
| `MINIMAX_GROUP_ID` | MiniMax | Required for standalone API |
| `ELEVENLABS_API_KEY` | ElevenLabs | 3rd TTS fallback |

### Social Publishing

| Variable | Service | Notes |
|----------|---------|-------|
| `POST_BRIDGE_API_KEY` | PostBridge | Social distribution |
| `INSTAGRAM_CLIENT_ID` | Instagram | OAuth |
| `INSTAGRAM_CLIENT_SECRET` | Instagram | OAuth |
| `YOUTUBE_CLIENT_ID` | YouTube | OAuth |
| `YOUTUBE_CLIENT_SECRET` | YouTube | OAuth |
| `TIKTOK_CLIENT_ID` | TikTok | OAuth |
| `TIKTOK_CLIENT_SECRET` | TikTok | OAuth |
| `LINKEDIN_CLIENT_ID` | LinkedIn | OAuth |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn | OAuth |
| `FACEBOOK_CLIENT_ID` | Facebook | OAuth |
| `FACEBOOK_CLIENT_SECRET` | Facebook | OAuth |

### Billing

| Variable | Service | Notes |
|----------|---------|-------|
| `STRIPE_SECRET_KEY` | Stripe | Server-side billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Client-side |

---

## Status & Progress Tracking

### Video Status Lifecycle

```
draft → generating → review → approved → published
                   → failed (auto after 10min timeout)
```

### Progress Calculation (GET /api/generate/status)

| Step | Percent |
|------|---------|
| queued | 0% |
| expand | 5% |
| tts | 15% |
| anchor | 20% |
| submit_all_cuts | 25% |
| poll_all_cuts | 25–85% (scaled by current cut / total cuts) |
| stitch | 90% |
| store | 95% |
| done | 100% |

**Auto-timeout:** `GENERATION_TIMEOUT_MS = 300,000ms` (5 minutes). Videos in "generating" status longer than this are automatically marked "failed".

### Rate Limiting

- `/api/generate`: 10 requests per user-id key
- Usage enforcement: plan-based video quota (`enforceUsageLimit()`)
- Error code: `USAGE_LIMIT_EXCEEDED` with usage breakdown

### Upload Limits

| Type | Max Size | Accepted MIME |
|------|----------|---------------|
| photo | 10MB | image/* |
| voice | 50MB | audio/* |
| video | 500MB | video/* |

---

## File Reference

### Pipeline Core
- `src/lib/pipeline/orchestrator.ts` — Step router / state machine
- `src/lib/pipeline/expand.ts` — Gemini script expansion
- `src/lib/pipeline/tts.ts` — Per-cut TTS generation
- `src/lib/pipeline/anchor.ts` — Starting frame resolution
- `src/lib/pipeline/cut-submit-all.ts` — Parallel FAL submission
- `src/lib/pipeline/cut-poll-all.ts` — Parallel FAL polling
- `src/lib/pipeline/stitch-submit.ts` — Shotstack submission
- `src/lib/pipeline/stitch-poll.ts` — Shotstack polling + persistence
- `src/lib/pipeline/model-router.ts` — Cut type → model routing
- `src/lib/pipeline/scene-bible.ts` — Environment generation via Gemini

### Service Clients
- `src/lib/generate.ts` — FAL model registry (8 models)
- `src/lib/video-stitcher.ts` — Shotstack API client
- `src/lib/voice-engine.ts` — TTS with 3-provider fallback
- `src/lib/video-compositor.ts` — 7 format definitions
- `src/lib/character-sheet.ts` — Pose + 360° sheet generation
- `src/lib/starting-frame.ts` — Anchor image generation
- `src/lib/content-planner.ts` — Gemini script planning

### API Routes
- `src/app/api/generate/route.ts` — Video creation
- `src/app/api/generate/process/route.ts` — Pipeline step executor
- `src/app/api/generate/advance/route.ts` — Step progression
- `src/app/api/generate/status/route.ts` — Progress polling
- `src/app/api/generate/batch/route.ts` — Batch creation
- `src/app/api/webhooks/fal/route.ts` — FAL webhook handler
- `src/app/api/upload/route.ts` — File upload
- `src/app/api/publish/route.ts` — Social publishing
- `src/app/api/stripe/checkout/route.ts` — Billing
- `src/app/api/stripe/webhook/route.ts` — Stripe webhooks
