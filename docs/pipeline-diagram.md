# Official AI — Pipeline Architecture

_Last updated: March 31, 2026_

---

## Onboarding Flow (V2)

```mermaid
flowchart TD
    A([User visits /auth/onboarding]) --> B[Step 1: Photo Capture]
    B --> B1{Camera or Upload?}
    B1 -- Camera --> B2[MediaDevices.getUserMedia\nWebcam stream + canvas snap]
    B1 -- Upload --> B3[File input\nimage/*, max 10MB]
    B2 --> BQ[analyzePhotoQuality\nmin 300x300px, min 50KB]
    B3 --> BQ
    BQ -- Fail --> B4[Show quality warning\nretake / try again]
    B4 --> B1
    BQ -- Pass --> BP[POST /api/upload\nPOST /api/photos]
    BP --> BE[Track: onboarding_photo_captured]
    BE --> C[Step 2: AI Twin - Character Sheet]

    C --> C1[POST /api/character-sheet\npayload: photoUrls + industry]
    C1 --> C2[Gemini Flash\nGenerates 3x3 pose grid\n+ 2x3 360 sheet in parallel]
    C2 -- ~4-10s --> C3[Cinematic reveal\nConfetti burst + spring animation]
    C3 --> C4[User selects a pose]
    C4 --> CE[Track: onboarding_character_selected]
    CE --> V[Step 3: Voice Clone]

    V --> V1{Record or Skip?}
    V1 -- Record --> V2[MediaRecorder API\nAnalyserNode waveform\n5s minimum recording]
    V2 --> V3[Preview playback\nRe-record or Confirm]
    V3 -- Re-record --> V2
    V3 -- Confirm --> V4[POST /api/onboarding/voice\nFormData: audio blob]
    V4 --> VE[Track: onboarding_voice_cloned]
    V1 -- Skip --> VS[Track: onboarding_voice_skipped]
    VE --> D
    VS --> D

    D[Step 4: Paywall - Go Live]
    D --> BG[Background: POST /api/onboarding/preview-video\nTrigger video generation pipeline]
    BG --> VP{Video ready?}
    VP -- Yes --> VPL[Video preview plays in paywall]
    VP -- No --> VPN[Spinner: Rendering your first video...]
    VP -- Pipeline stub --> VPF[Green dot: Your AI twin is ready]

    D --> DE[Track: onboarding_paywall_viewed]
    D --> D1{User action}
    D1 -- Start free trial --> DT[Track: onboarding_trial_started\nPOST /api/stripe/checkout]
    DT --> DS[Stripe Checkout]
    DS -- Success --> DF[POST /api/onboarding/complete\n--> /dashboard]
    D1 -- Skip --> DSK[Track: onboarding_skipped\nPOST /api/onboarding/complete\n--> /dashboard]
```

---

## Video Generation Pipeline — State Machine

```mermaid
stateDiagram-v2
    [*] --> draft: POST /api/generate
    draft --> generating: Pipeline starts

    state generating {
        [*] --> expand
        expand --> tts: Script expanded via Gemini
        tts --> anchor: Per-cut audio generated
        anchor --> submit_all_cuts: Starting frame resolved
        submit_all_cuts --> poll_all_cuts: FAL jobs submitted
        poll_all_cuts --> poll_all_cuts: Still processing (retry 5s)
        poll_all_cuts --> stitch: All cuts complete
        stitch --> poll_stitch: Shotstack job submitted
        poll_stitch --> poll_stitch: Still rendering (retry 5s)
        poll_stitch --> [*]: Video delivered to Supabase
    }

    generating --> review: Pipeline complete
    generating --> failed: Step error
    generating --> failed: Timeout 5min (GENERATION_TIMEOUT_MS)
    generating --> failed: Stitch failed → fallback to first cut

    review --> approved: User approves
    review --> generating: User requests re-gen
    approved --> published: POST /api/publish → PostBridge
    failed --> generating: User retries

    published --> [*]
```

---

## Pipeline Step-by-Step (7 Steps)

The pipeline is split into two HTTP calls to work around serverless timeouts:
- **POST /api/generate** — Fast (< 500ms): creates DB record, returns video ID
- **POST /api/generate/process** — Called repeatedly by the frontend, one step at a time

```mermaid
flowchart TD
    START([POST /api/generate]) --> GEN1[Validate auth + plan limits\nRate limit: 10 req/user]
    GEN1 --> GEN2[planComposition\nFormat lookup --> cut list]
    GEN2 --> GEN3[prisma.video.create\nstatus: generating]
    GEN3 --> GEN4([Return: videoId + composition plan])

    GEN4 --> FE[Frontend calls\nPOST /api/generate/process\nstep by step]

    FE --> S1

    subgraph PIPELINE [Pipeline Steps]
        S1["EXPAND\nGemini Flash via content-planner\nScript --> per-cut prompts + scene descriptions"]
        S1 --> S2["TTS\nFAL MiniMax --> MiniMax Standalone --> ElevenLabs\nPer-cut audio + duration\nNon-fatal: skips on failure"]
        S2 --> S3["ANCHOR\nGemini image generation\nStarting frame for character consistency\niPhone 15 Pro Max prompt engineering"]
        S3 --> S4["SUBMIT ALL CUTS\nFAL API (Kling 2.6 / MiniMax Hailuo / WAN 2.1)\nAll cuts submitted in parallel\nModel selected per cut type via model-router"]
        S4 --> S5["POLL ALL CUTS\nPromise.allSettled() parallel polling\n60-120s vs 3-6min sequential\nWebhook + client polling fallback"]
        S5 -- Still pending --> S5
        S5 -- All done --> S6["STITCH\nShotstack Cloud Video Editing\nTrack 0: video clips with cross-dissolve\nTrack 1: per-cut audio aligned to timeline\n9:16, 30fps, mp4"]
        S6 --> S7["POLL STITCH\nShotstack polling: 3s --> 5s --> 8s --> 10s\nOn complete: download to Supabase Storage\nFallback: use first cut if stitch fails"]
        S7 -- Still pending --> S7
        S7 -- Done --> DONE
    end

    DONE[prisma.video.update\nstatus: review\nvideoUrl + thumbnailUrl saved]
    DONE --> END([Video available in Content Library])
```

---

## External API Call Map

```mermaid
flowchart LR
    subgraph APP [Official AI - Next.js]
        O[Orchestrator] --> EX[expand.ts]
        O --> TT[tts.ts]
        O --> AN[anchor.ts]
        O --> CS[cut-submit-all.ts]
        O --> CP[cut-poll-all.ts]
        O --> SS[stitch-submit.ts]
        O --> SP[stitch-poll.ts]
    end

    subgraph GEMINI [Google Gemini]
        G1[gemini-flash\nScript expansion]
        G2[gemini-3-pro-image\nStarting frame gen]
        G3[nano-banana-pro\nCharacter sheets]
    end

    subgraph FAL [FAL.ai]
        F1[kling-video/v2.5\nPrimary video]
        F2[minimax-video/v01-live\nFallback video]
        F3[wan-video/v2.1\n2nd fallback]
        F4[minimax/speech-02-hd\nPrimary TTS]
    end

    subgraph MM [MiniMax Standalone]
        M1[t2a_v2\n2nd TTS fallback]
    end

    subgraph EL [ElevenLabs]
        E1[text-to-speech\n3rd TTS fallback]
    end

    subgraph SHOT [Shotstack]
        SH1[/edit/render\nVideo stitching]
    end

    subgraph SB [Supabase]
        SB1[Storage\nphotos / videos / frames]
        SB2[PostgreSQL\nPrisma ORM]
    end

    EX --> G1
    AN --> G2
    AN --> G3
    TT --> F4
    TT -.-> M1
    TT -.-> E1
    CS --> F1
    CS -.-> F2
    CS -.-> F3
    CP --> F1
    SS --> SH1
    SP --> SH1
    SP --> SB1
    O --> SB2
```

---

## Video Formats — Cut Patterns

```mermaid
gantt
    title Video Format Cut Patterns
    dateFormat s
    axisFormat %S s

    section talking_head_15
    hook (3s)           :0, 3s
    main (8s)           :3, 11s
    cta (4s)            :11, 15s

    section testimonial_15
    hook (3s)           :0, 3s
    testimonial (8s)    :3, 11s
    cta (4s)            :11, 15s

    section testimonial_20
    hook (4s)           :0, 4s
    testimonial_a (6s)  :4, 10s
    testimonial_b (6s)  :10, 16s
    cta (4s)            :16, 20s

    section educational_30
    hook (4s)           :0, 4s
    point_1 (7s)        :4, 11s
    point_2 (7s)        :11, 18s
    point_3 (7s)        :18, 25s
    cta (5s)            :25, 30s

    section quick_tip_8
    hook (2s)           :0, 2s
    tip (4s)            :2, 6s
    cta (2s)            :6, 8s

    section property_tour_30
    intro (4s)          :0, 4s
    exterior (6s)       :4, 10s
    interior_1 (6s)     :10, 16s
    interior_2 (6s)     :16, 22s
    feature (5s)        :22, 27s
    cta (3s)            :27, 30s

    section behind_scenes_20
    hook (3s)           :0, 3s
    scene_1 (6s)        :3, 9s
    scene_2 (6s)        :9, 15s
    reveal (5s)         :15, 20s
```

---

## Shotstack Timeline Construction

```mermaid
flowchart TD
    IN([Cut videos + Per-cut audio]) --> BT[buildTimeline]

    BT --> T0["Track 0: Video Clips\nEach cut = 1 clip\ntrim = targetDuration\ntransition: cross-dissolve fade"]

    BT --> T1["Track 1: Audio Clips\nEach cut = 1 audio segment\nstart = cumulative video offset\nlength = min(audioDuration, cutTrim)"]

    T0 --> TL[Shotstack Timeline JSON]
    T1 --> TL

    TL --> OUT["Output Config\nformat: mp4\nresolution: hd\naspectRatio: 9:16\nfps: 30\nquality: high"]

    OUT --> SUB[POST /edit/{env}/render]
    SUB --> POLL[Poll: 3s --> 5s --> 8s --> 10s]
    POLL -- completed --> DL[Download to Supabase Storage]
    POLL -- failed --> FB[Fallback: use first cut as final video]
    DL --> FINAL([Final video URL + thumbnail])
```

---

## TTS Fallback Chain

```mermaid
flowchart TD
    START([Generate TTS for cut]) --> P1{FAL MiniMax\nspeech-02-hd}
    P1 -- Success --> DONE([Audio URL + duration])
    P1 -- Fail x2 --> P2{MiniMax Standalone\nspeech-02-hd}
    P2 -- Success --> DONE
    P2 -- Fail x2 --> P3{ElevenLabs\neleven_multilingual_v2}
    P3 -- Success --> DONE
    P3 -- Fail x2 --> SKIP([Skip audio\nPipeline continues without audio])
```

---

## Video Model Routing

```mermaid
flowchart TD
    CUT([Cut type?]) --> PP{People-focused?}
    PP -- "talking_head / testimonial\nhook / cta / educational" --> K[Kling 2.6\nfal-ai/kling-video/v2.5]
    PP -- "property_tour\nbehind_scenes" --> M[MiniMax Hailuo\nfal-ai/minimax-video/v01-live]

    K -- Fail --> M
    M -- Fail --> W[WAN 2.1\nfal-ai/wan-video/v2.1]
    W -- Fail --> ERR([Cut marked failed])

    K -- Success --> OK([Video URL])
    M -- Success --> OK
    W -- Success --> OK
```

---

## Onboarding Funnel Events

Tracked via `POST /api/events` -> stored in `LifecycleEvent` table:

| Event | Step | Fires When |
|-------|------|-----------|
| `onboarding_step_photo` | 1 | Photo step mounts |
| `onboarding_photo_captured` | 1 | Photo uploaded successfully |
| `onboarding_step_character` | 2 | Character step mounts |
| `onboarding_character_selected` | 2 | User selects a pose |
| `onboarding_step_voice` | 3 | Voice step mounts |
| `onboarding_voice_cloned` | 3 | Voice sample uploaded |
| `onboarding_voice_skipped` | 3 | User skips voice |
| `onboarding_step_paywall` | 4 | Paywall step mounts |
| `onboarding_paywall_viewed` | 4 | Paywall component mounts |
| `onboarding_trial_started` | 4 | User clicks Start free trial |
| `onboarding_skipped` | 4 | User clicks Skip for now |

Drop-off rate = users who reach each event / users who started onboarding.

---

## API Surface Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Create video record + composition plan |
| `/api/generate/process` | POST | Run one pipeline step `{videoId, step, cutIndex?}` |
| `/api/generate/status` | GET | Current video status + step + progress % |
| `/api/generate/advance` | POST | Webhook/polling step progression (idempotent) |
| `/api/generate/batch` | POST | Queue multiple videos from industry templates |
| `/api/generate/retry` | POST | Retry from last failed step |
| `/api/character-sheet` | POST | Generate character sheet (pose grid + 360) |
| `/api/character-sheet` | GET | Get all character sheets for user |
| `/api/photos` | GET/POST | List / upload photos |
| `/api/photos/[id]` | DELETE | Delete a photo |
| `/api/upload` | POST | Multipart upload (photo/voice/video) |
| `/api/onboarding/voice` | POST | Upload voice sample for cloning |
| `/api/onboarding/preview-video` | POST | Trigger preview video in paywall |
| `/api/onboarding/complete` | POST | Mark onboarding finished |
| `/api/publish` | POST | Publish video via PostBridge |
| `/api/social/accounts` | GET | List connected social accounts |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/usage` | GET | Plan usage metrics |
| `/api/events` | POST | Track lifecycle events |
| `/api/webhooks/fal` | POST | FAL.ai job completion callback |
| `/api/admin/reset-stuck` | GET/POST | Count / reset stuck generating videos |
| `/api/admin/pipeline-log` | GET | Pipeline event timeline for a video |
