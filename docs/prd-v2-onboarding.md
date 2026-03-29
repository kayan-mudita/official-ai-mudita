# PRD: V2 Onboarding Flow

**Date:** March 26, 2026
**Source:** Product Check-In — Official AI x Mudita Studios
**Status:** In Progress
**Owner:** Kayan Mishra (Mudita Studios), John Pletka (Official AI)

---

## Context

The current onboarding flow collects industry, photos, generates a character sheet, and renders a full video before prompting signup. While feature-rich, the video generation steps introduce 60–90 second waits that cause significant drop-off for time-constrained professionals (attorneys, doctors, realtors). Both teams agreed the onboarding must be streamlined to hit paywall faster while preserving "wow moments" at every step.

## Goals

1. **Maximize conversion** — minimize time-to-paywall, reduce drop-off at each step
2. **Deliver wow moments early** — show the user their AI twin before asking for money
3. **Collect voice + photos quickly** — 1-click voice cloning, live photo capture option
4. **Measure everything** — analytics at each funnel step to identify and fix drop-off

## Non-Goals

- Full sandbox/playground (separate initiative, see below)
- Real-time avatar onboarding guide (nice-to-have, post-launch)
- Enterprise / team onboarding

---

## Proposed Onboarding Flow

### Step 1: Photo Capture
- **Primary CTA:** "Take a photo now" (webcam capture, reduces friction — users stall searching for photos)
- **Secondary CTA:** "Upload a photo" (file picker fallback)
- Single photo is sufficient to proceed
- Collect minimal info: name, email (no password yet)

### Step 2: Character Sheet Reveal (Wow Moment #1)
- Generate character sheet from uploaded/captured photo via NanoBanana
- Show multi-pose composite (professional headshot, full body, side profiles)
- User confirms: "Does this look like you?"
- Option to upload additional photos to improve the model
- **Key insight from meeting:** This step generated genuine excitement. Ben's character sheet was described as "the best picture he's ever taken."

### Step 3: Voice Cloning (Wow Moment #2)
- Single-button microphone capture (5-second target with new models)
- Show audio playback for confirmation
- Evaluate: ElevenLabs, Sora 2 (5-number + 1-word cloning), and 2 other shortlisted models
- Voice is cloned in background while user proceeds

### Step 4: Preview Video (Wow Moment #3)
- Generate a short preview clip using their photo + cloned voice
- Use pre-rendered or fast-path generation (avoid 60–90s Veo/Kling waits in onboarding)
- Auto-play cinematic reveal: "This is you"

### Step 5: Paywall
- Show pricing: $79/mo (or current test price)
- Credit card collection via Stripe
- Free trial option if applicable
- User has already seen: their character sheet, heard their cloned voice, watched their AI twin video

### Step 6: Post-Payment Onboarding
- Industry selection (drives template routing)
- Business info (company, target audience)
- Social account connections (PostBridge white-labeled OAuth)
- Redirect to dashboard

---

## What We're Removing from Onboarding

| Removed | Reason | New Home |
|---------|--------|----------|
| Extended video rendering (60–90s waits) | Drop-off killer for busy professionals | Dashboard generation |
| Multiple video previews | Too slow for onboarding | Sandbox/playground |
| Detailed script editing | Belongs in creation flow | Dashboard > Generate |
| Industry-specific script generation | Can happen post-payment | Dashboard templates |

---

## Sandbox / Playground (Separate Initiative)

Per meeting discussion, the interactive "try before you buy" experience should live outside the onboarding funnel:

- Accessible from marketing pages without signup
- Limited generations (3–5 free) without email
- Photo-to-character-sheet generation
- Voice cloning preview
- Static social media post mockup (fast, no video render)
- Drives users back into the onboarding funnel for full video

---

## Analytics Requirements

Track conversion rate at each step transition:

1. Landing page → Step 1 (photo capture)
2. Step 1 → Step 2 (character sheet)
3. Step 2 → Step 3 (voice cloning)
4. Step 3 → Step 4 (preview video)
5. Step 4 → Step 5 (paywall)
6. Step 5 → Step 6 (payment completed)
7. Step 6 → Dashboard (onboarding complete)

Additional tracking:
- Time spent on each step
- Photo method used (capture vs upload)
- Character sheet approval rate (confirmed vs re-uploaded)
- Voice recording completion rate
- Signup ref parameter for cohort analysis (already implemented)

---

## Technical Notes

### Video Generation Pipeline
- Current pipeline supports: Sora 2 (first cuts), Kling 0.1, Veo 3, Seedance 2.0
- 4 video models + 2 photo models + 3 voice models wired into backend switch panel
- Character sheets generated via NanoBanana (FAL)
- 360-degree character views inferred from single reference image
- Multi-cut stitching for longer-form videos (4–8 clips)

### Social Posting
- PostBridge API handles white-labeled OAuth across TikTok, Instagram, X, LinkedIn
- Single API call for multi-platform posting
- Secondary MCP-based analytics connector being evaluated for metrics retrieval
- Authentication expiry is a known challenge — PostBridge mitigates with persistent tokens

### Voice Cloning Models Under Evaluation
- ElevenLabs (current — claims 2-min cloning, testing 30s)
- Sora 2 voice (5 numbers + 1 word — going away)
- Two additional models TBD (targeting 5-second cloning)

---

## Open Questions

1. **Pricing:** $79 / $59 / $49 / $100 / $50 — final price TBD based on conversion data
2. **Free trial length:** Charge today vs charge in 2 weeks?
3. **Go-live strategy:** Standalone deployment vs replacement of existing Official AI app?
4. **Live avatar in onboarding:** Feasibility of real-time lip-synced digital human as onboarding guide (server cost concerns — Soul Machines needed 1/3 of a high-end server per session)
5. **Photo capture UX:** What happens if user has no camera? Graceful fallback to upload-only
