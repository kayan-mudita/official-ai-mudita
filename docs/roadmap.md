# Product Roadmap — Official AI x Mudita Studios

**Last Updated:** March 26, 2026
**Source:** Product Check-In meeting + action items

---

## Weekly Cadence

### Week of March 31 — Onboarding V2 + Stability

**Onboarding**
- [ ] Add webcam photo capture as primary option in onboarding Step 1
- [ ] Show character sheet immediately after photo upload/capture (wow moment)
- [ ] Add 1-click voice cloning step (microphone capture, 5-second target)
- [ ] Remove full video render from onboarding (replace with fast preview or static mockup)
- [ ] Wire paywall (Stripe) directly after preview step
- [ ] Set up funnel analytics — track drop-off at each onboarding step

**Platform Stability**
- [ ] End-to-end testing of video generation pipeline (multi-cut stitching)
- [ ] Verify PostBridge social posting flow (TikTok, Instagram, X, LinkedIn)
- [ ] Browser agent QA sweep across onboarding + dashboard
- [ ] Fix any broken flows on deployed Netlify version

**Collaboration**
- [ ] Share GitHub repo access with John
- [ ] Send deployed URL to Dave for review
- [ ] Send character-sheet / video pipeline diagram to John
- [ ] Send voice-cloning model shortlist to John
- [ ] Dave & John: consolidate feedback (voice notes preferred) on current build

---

### Week of April 7 — Onboarding Alignment + Outbound Prep

**Onboarding**
- [ ] Align on final onboarding flow based on Dave/John feedback
- [ ] A/B test: streamlined onboarding vs direct signup (measure conversion)
- [ ] Iterate on character sheet quality + approval UX
- [ ] Voice cloning model selection finalized

**Go-to-Market**
- [ ] Prepare SunSites outbound checklist:
  - ICP definitions (attorneys first, then realtors, doctors)
  - Lead lists (web scraping in progress)
  - X posts for next month
  - LinkedIn posts for next month
  - Email sequences (30-day drip)
- [ ] Send checklist to Dave for review — check/check/check approval
- [ ] Set up Lem List email campaigns
- [ ] Finalize industry landing page copy with Dave (attorneys priority)

**Analytics**
- [ ] Share initial drop-off data from onboarding tracking
- [ ] Set up retargeting for users who drop after email collection

---

### Week of April 14 — Pipeline Polish + Go-Live Decision

**Product**
- [ ] Multi-cut video stitching complete (5–8 clips per video)
- [ ] Captions auto-drafted for social posts
- [ ] Calendar scheduling → PostBridge auto-posting verified end-to-end
- [ ] Dashboard content library populated with real Official AI templates/formats

**Go-Live Decision**
- [ ] Review onboarding conversion data
- [ ] Decide: standalone deployment vs replacement of existing app
- [ ] Decide: paid campaign launch date (target: when onboarding drop-off is acceptable)
- [ ] Ensure email collection happens early enough to enable retargeting even on drop-off

---

### Week of April 21+ — Paid Campaigns + Iteration

**Launch**
- [ ] Turn on paid ad campaigns (attorneys ICP first)
- [ ] Monitor funnel metrics daily
- [ ] Iterate on creative, landing pages, onboarding based on data

**Post-Launch Enhancements**
- [ ] Sandbox/playground on marketing site (3–5 free generations, no signup)
- [ ] ROI calculator refinement (per-industry deal sizes)
- [ ] Notifications: "Congrats, you hit 500 followers" email triggers
- [ ] Analytics insights: best posting day, top-performing videos
- [ ] Explore real-time avatar onboarding guide (low-latency digital human)

---

## Key Decisions Made (March 26 Meeting)

| Decision | Detail |
|----------|--------|
| Onboarding must be faster | Remove video renders; show character sheet + voice clone instead |
| Paywall placement | After showing wow moments, before full dashboard access |
| Playground is separate | "Try before you buy" sandbox lives on marketing site, not in onboarding |
| Attorneys first ICP | Primary target for outbound + paid campaigns |
| PRDs in GitHub | All plans committed to repo history for traceability |
| Feedback format | Voice notes → transcribed → sent as product feedback |
| No paid campaigns until ready | Don't burn ad budget on a flow with 90% drop-off |
| PostBridge for social auth | White-labeled OAuth, single login, persistent tokens |

---

## Action Items (from meeting)

| Action | Owner | Status |
|--------|-------|--------|
| Share GitHub repo access with John | Kayan | Pending |
| Send deployed URL to Dave | Kayan | Pending |
| Send character-sheet/video pipeline diagram to John | Kayan | Pending |
| Send voice-cloning model shortlist to John | Kayan | Pending |
| Push PRD-style plans to GitHub | Kayan/John | This PR |
| Define week-by-week product roadmap | Kayan | This PR |
| Set up onboarding analytics tracking | Kayan | Pending |
| Share drop-off data with John & Dave | Kayan | Pending |
| Build V2 onboarding (photo capture, voice clone, character sheet, no video renders) | Kayan/Ben | In Progress |
| Prepare SunSites outbound checklist (ICPs, leads, posts, emails) | Kayan | Pending |
| Dave & John: consolidated feedback on current build | Dave/John | Pending |
