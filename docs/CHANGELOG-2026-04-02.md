# Changelog — April 2, 2026

**Commit:** `59149ad` on `main`
**Author:** Kayan + Claude Code
**Scope:** Wire onboarding for commercial readiness

---

## Context

The March 26 product check-in with Dave and John identified that the onboarding funnel had two critical stubs blocking paid campaign launch:

1. **Voice clone** (`POST /api/onboarding/voice`) — returned a fake placeholder ID, didn't upload audio or call any cloning API
2. **Preview video** (`POST /api/onboarding/preview-video`) — returned `null`, never triggered the video pipeline

Additionally, industry/business info collection was removed from pre-paywall onboarding (to reduce friction) but never rebuilt as a post-payment step. And there was no way to measure onboarding drop-off.

This commit fixes all of those.

---

## What Changed (12 files, +809 / -159 lines)

### 1. Voice Clone — Now Real

**File:** `src/app/api/onboarding/voice/route.ts` (Modified)

**Before:** Accepted the audio FormData, validated file size, returned `voiceId: "voice_${user.id}_${Date.now()}"`. Four TODO comments. No storage, no cloning, no DB record.

**After:** Three-step process:
1. **Upload to Supabase Storage** — Reads audio blob into buffer, generates a UUID file key via `voiceKey()`, uploads to the `officialai-media` bucket under `voices/{userId}/{fileId}.webm`. Only runs if `isStorageConfigured()` returns true.
2. **Create VoiceSample DB record** — Saves `userId`, `filename`, `url`, and `isDefault: true` if this is the user's first voice sample.
3. **Clone via ElevenLabs** — Calls the existing `cloneVoice()` function from `src/lib/voice-engine.ts` (which was already fully implemented but never called from onboarding). Sends audio URL + user's first name as the voice label. On success, updates the VoiceSample record with `provider: "elevenlabs"` and `providerVoiceId` (the ElevenLabs voice ID). On failure, logs a warning and continues — **voice clone failure is non-fatal**.

**Returns:** `{ success: true, voiceId: <DB record ID>, providerVoiceId: <ElevenLabs ID or null> }`

**New imports:** `uploadFile`, `isStorageConfigured`, `voiceKey` from `@/lib/storage`; `cloneVoice` from `@/lib/voice-engine`; `prisma`; `uuid`.

---

### 2. Preview Video — Now Triggers Real Pipeline

**File:** `src/app/api/onboarding/preview-video/route.ts` (Modified)

**Before:** Accepted `characterSheetUrl` and `photoUrl`, returned `{ videoUrl: null, message: "Video generation pipeline not yet connected" }`.

**After:** Full pipeline execution:
1. **Resolves inputs** — Fetches user's `isPrimary` photo and `isDefault` voice sample from DB. Returns gracefully with `videoUrl: null` if no photo exists.
2. **Plans composition** — Uses the existing `planComposition("quick_tip_8", PREVIEW_SCRIPT)` to create a short-form video plan. The script is a hardcoded generic business intro (not industry-specific yet, since industry is collected post-payment).
3. **Creates video record** — Inserts a Video row with `title: "Onboarding Preview"`, `model: "kling_2.6"`, `contentType: "quick_tip_8"`, `status: "generating"`.
4. **Runs the pipeline** — Calls `runStep()` sequentially through the existing orchestrator:
   - `expand` — AI script breakdown into production prompts (Gemini)
   - `tts` — Text-to-speech via FAL MiniMax → MiniMax → ElevenLabs fallback chain
   - `cut` (index 0) — Submit video generation to Kling 2.6 via FAL
   - `poll` (index 0) — Poll Kling until complete (3s intervals, max 30 attempts = 90s)
   - `stitch` — Send to Shotstack for final mp4 assembly
   - `poll_stitch` — Poll Shotstack (3s intervals, max 60 attempts = 180s)
5. **Returns result** — Fetches the completed video's `videoUrl` from DB and returns it.

**Error handling:** If any pipeline step fails, the video is marked `status: "failed"` and the endpoint returns `{ videoUrl: null }`. The PaywallStep component already handles this gracefully (shows pricing without video).

**Timing:** This endpoint can take 60-120s to complete. The frontend calls it in the background (non-blocking) when the user moves from voice → paywall step. The paywall shows a spinner while it generates.

**New imports:** `prisma`, `planComposition`, `runStep`, `generateVoiceover`.

---

### 3. Post-Checkout Industry Collection

**File:** `src/app/dashboard/welcome/page.tsx` (New)

**Why:** Industry picker was removed from pre-paywall onboarding (per March 17 architecture call — reduce friction before payment). But it was never rebuilt post-payment. The user's industry is hardcoded to "business" during onboarding and was never updated.

**What it is:** A clean full-screen page at `/dashboard/welcome` that shows after Stripe checkout:
- Heading: "Welcome to Official AI" with celebratory emoji
- **Industry selector**: 9 options in a 3-column grid (Real Estate, Legal, Finance, Healthcare, Creator, SaaS, Consulting, E-Commerce, Other). Each is a button with emoji + label.
- **Company name input**: Optional text field.
- **Continue button**: Calls `PATCH /api/user/profile` with `{ industry, company }`, then `POST /api/onboarding/complete`, then redirects to `/dashboard`.
- **Skip option**: Goes directly to dashboard.
- Tracks `onboarding_industry_selected` or `onboarding_industry_skipped` events.

**Design:** Matches the existing onboarding dark theme (`bg-[#060610]`), uses the same gradient buttons and Framer Motion animations as the rest of the flow.

---

### 4. User Profile API

**File:** `src/app/api/user/profile/route.ts` (New)

Simple `PATCH` endpoint that accepts `{ industry?, company? }` and updates the User record. Used by the welcome page.

---

### 5. Stripe Checkout Routing Fix

**File:** `src/app/api/stripe/checkout/route.ts` (Modified)

**Before:**
```
successUrl: /dashboard/settings?tab=plan&checkout=success
cancelUrl:  /dashboard/settings?tab=plan&checkout=cancelled
```

**After:**
```
successUrl: /dashboard/welcome?checkout=success
cancelUrl:  /auth/onboarding?checkout=cancelled
```

Now after payment, users land on the industry collection page instead of jumping straight to dashboard settings.

If they cancel checkout, they return to the onboarding flow (not a settings page they haven't been to yet).

---

### 6. PaywallStep Routing Fix

**File:** `src/components/onboarding/PaywallStep.tsx` (Modified)

Three exit paths from the paywall, all updated:

| Path | Before | After |
|------|--------|-------|
| **Stripe configured, checkout succeeds** | Stripe redirect → `/dashboard/settings` | Stripe redirect → `/dashboard/welcome` |
| **Stripe not configured (dev mode)** | Called `/api/onboarding/complete` → `/dashboard` | → `/dashboard/welcome` |
| **User clicks "Skip for now"** | Called `/api/onboarding/complete` → `/dashboard` | → `/dashboard/welcome` |

The `onboarding/complete` call (which sets `user.onboarded = true`) now happens in the welcome page instead, so industry data is collected before the user is marked as fully onboarded.

---

### 7. Database Schema Change

**File:** `prisma/schema.prisma` (Modified)

Added two nullable fields to `VoiceSample`:

```prisma
provider        String?  // "elevenlabs" | "minimax" | "fal"
providerVoiceId String?  // Voice ID from the cloning provider
```

**Migration:** `prisma/migrations/20260402122446_add_voice_provider_fields/migration.sql`

```sql
ALTER TABLE "VoiceSample" DROP COLUMN IF EXISTS "voiceCloneId";
ALTER TABLE "VoiceSample" ADD COLUMN IF NOT EXISTS "providerVoiceId" TEXT;
```

Note: The `provider` column already existed in the DB (from a previous migration). The `voiceCloneId` column was renamed to `providerVoiceId` for consistency with the code. Migration has been applied to the Supabase production database.

---

### 8. Events Allowlist Expanded

**File:** `src/app/api/events/route.ts` (Modified)

The onboarding page fires `trackEvent()` at each step transition, but most event names weren't in the allowlist and were being rejected with 400 errors. Added:

```
onboarding_step_photo        — user enters photo step
onboarding_step_character    — user enters character sheet step
onboarding_step_voice        — user enters voice step
onboarding_step_paywall      — user enters paywall step
onboarding_voice_cloned      — voice clone completed
onboarding_voice_skipped     — user clicked "skip voice"
onboarding_industry_selected — industry chosen on welcome page
onboarding_industry_skipped  — user skipped industry selection
```

These are all stored in the `LifecycleEvent` table with `userId` and timestamp.

---

### 9. Onboarding Funnel Analytics

**File:** `src/app/api/analytics/funnel/route.ts` (New)

`GET /api/analytics/funnel` — Returns:
- `totalSignups`: Total user count
- `funnel[]`: Array of `{ event, label, step, uniqueUsers, conversionFromSignup% }` for each onboarding step
- `recentEvents`: Count of funnel events in last 30 days

Counts unique users per step by grouping `LifecycleEvent` records by `userId` for each event name.

**File:** `src/app/dashboard/admin/funnel/page.tsx` (New)

Visual funnel dashboard at `/dashboard/admin/funnel`:
- **Summary cards**: Total signups, trial conversions, overall conversion rate
- **Bar chart funnel**: Horizontal bars for each step, width proportional to users, color-coded (purple = healthy >50%, orange = warning 20-50%, red = danger <20%)
- **Drop-off indicators**: Between each bar, shows "- X% dropped (N users)"
- **All events table**: Raw event names with user counts and % of signups

---

### 10. State Diagram Docs

**File:** `docs/state-diagram.html` (Modified)

Updated the onboarding swim lane to match V2 flow:
- Removed: Industry Selection step, Starting Frame as visible step, Format Selection step
- Added: Voice Clone (Step 3) with MediaRecorder details, Paywall with video preview (Step 4)
- Updated header: "4 steps: Photo → AI Twin (Character Sheet) → Your Voice → Go Live (Paywall + Video Preview)"

---

## Complete User Flow After This Commit

```
1. /auth/onboarding (step: photo)
   └─ Webcam capture (primary) or file upload (secondary)
   └─ Upload to Supabase → Photo record (isPrimary: true)
   └─ trackEvent("onboarding_photo_captured")

2. /auth/onboarding (step: character)
   └─ POST /api/character-sheet → Gemini Nano Banana Pro
   └─ 9-pose grid revealed with confetti burst (60 particles)
   └─ User taps to select → trackEvent("onboarding_character_selected")
   └─ Background: POST /api/starting-frame (non-blocking)

3. /auth/onboarding (step: voice)
   └─ MediaRecorder + AnalyserNode waveform, 4 rotating scripts
   └─ POST /api/onboarding/voice → Supabase upload → ElevenLabs clone
   └─ Or: "Skip for now" → trackEvent("onboarding_voice_skipped")
   └─ Both paths trigger generatePreviewVideo() in background

4. /auth/onboarding (step: paywall)
   └─ Video player (spinner while generating, play button when ready)
   └─ Pricing: $79/mo, 7-day free trial, 30 videos/month
   └─ "Start free trial" → POST /api/stripe/checkout → Stripe
   └─ "Skip for now" → /dashboard/welcome
   └─ trackEvent("onboarding_paywall_viewed")

5. Stripe Checkout (external)
   └─ Success → /dashboard/welcome?checkout=success
   └─ Cancel → /auth/onboarding?checkout=cancelled

6. /dashboard/welcome
   └─ Industry selector (9 options) + optional company name
   └─ PATCH /api/user/profile → updates industry + company
   └─ POST /api/onboarding/complete → sets user.onboarded = true
   └─ → /dashboard

7. /dashboard (fully onboarded)
```

---

## What Still Needs Work (Not in This Commit)

- **Voice model finalization**: ElevenLabs is wired but the shortlist of 3 models hasn't been evaluated. 5-second clone target not yet validated.
- **Auto-publish cron**: Schedule model exists but no background job fires at `scheduledAt` time.
- **Social analytics ingestion**: Can post out via PostBridge but can't pull engagement data back in.
- **Pricing lock**: $79/$149 in code, but Dave/Kayan haven't finalized.
- **Free trial vs hard paywall**: Currently 7-day trial. Decision pending.
- **Multi-model video selector**: Hardcoded to Kling 2.6. Sora 2 and Kling 01 discussed but not wired.
- **Browser agent QA**: No automated test suite yet.
