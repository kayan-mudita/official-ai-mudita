# Content Quality / E-E-A-T Audit — Official AI

**Audit date:** 2026-04-10
**Method:** Read the HTML source of 15 key pages + the content data files for blog posts, pillars, subtopics, and competitors.
**Business context:** SaaS targeting YMYL-adjacent professional services — financial advisors, attorneys, doctors, realtors. The content talks *to* these professionals, not *about* their domain expertise, which is the correct framing for E-E-A-T purposes.

## Summary

Content is well-written, commercially-focused, and structurally clean. Every page has a real H1, a meta description in the 140–170 character range, a clear value proposition above the fold, and the pillar/subtopic architecture covers 6 content clusters × 5 subtopics = 30 deep-dive pages that form a strong topical authority map. The weaknesses are: (1) **no visible E-E-A-T signals** — no author bios, no founder/team photos or credentials on `/about`, no byline dates on blog posts beyond the template's `date` field; (2) **pillar and subtopic pages fall back to a generic `PlaceholderContent` block** when the content registry doesn't define a dedicated module, which creates thin, boilerplate copy on multiple pages; (3) `/demo` is a client-only shell with ~19 KB of HTML and effectively no server-rendered content, which is invisible to crawlers and AI citation engines; (4) industry pages (`/for/*`) talk to the professional audience well but lack disclaimer/compliance copy that YMYL-adjacent pages typically need.

## Score: **67 / 100**

---

## E-E-A-T Assessment by Page Type

### Homepage, Pricing, Features, How-It-Works, About
- **Experience:** Weak. The site talks about what AI can do but doesn't demonstrate lived experience — no case studies, no "we built this because" founder story, no customer logos visible in the audited HTML.
- **Expertise:** Medium. Pricing and Features copy is specific enough to sound credible, but no named experts, no technical deep-dives beyond the blog.
- **Authoritativeness:** Weak. No press mentions, no third-party validation, no "as seen in" strip, no author pages.
- **Trust:** Medium. Clear HTTPS, privacy policy likely in footer (not audited), cookie consent component present, mailto links visible. But the fabricated `aggregateRating` of 4.9/200 in JSON-LD (see schema.md C-2) is a trust liability.

### Blog (13 posts)
- **Experience + Expertise:** Medium-strong. Topics are on-point (multi-cut method, UGC future, financial advisor video, lawyer video marketing). Posts have a category, author name, read time, and date — good.
- **Authoritativeness:** Weak. The "author" is typically a single brand persona. No linked author pages, no author bios visible, no credentials. For YMYL-adjacent topics (lawyer/doctor/advisor video marketing), this matters.
- **Trust:** Medium. Blog posts have `Article` schema with `author: Person`. Good. But the `publisher.logo` is the OG image, not a real logo — minor signal mismatch.

### Learn pillars + subtopics (36 pages)
- **Critical problem:** [src/app/\[pillarSlug\]/page.tsx:29-70](src/app/[pillarSlug]/page.tsx#L29-L70) and [src/app/\[pillarSlug\]/\[subTopicSlug\]/page.tsx:36-66](src/app/[pillarSlug]/[subTopicSlug]/page.tsx#L36-L66) both define a `PlaceholderContent` fallback that ships identical boilerplate any time a pillar/subtopic doesn't have a dedicated content module in the registry. This creates thin content on any uncovered page. Verify how many of the 36 pillar+subtopic pages actually have dedicated content vs. falling back to placeholder text.
- **Experience signal:** Placeholder content contains a "1200% more shares" stat with no source — unsourced claims hurt citability for AI Overviews and LLM citations (which prefer sourced stats).

### `/for/*` industry pages (advisors, attorneys, doctors, realtors)
- **Experience:** Medium. The copy is specific to each industry ("listing tours", "know-your-rights content", "patient education videos", "market commentary") which shows the team understands the use cases.
- **Expertise:** Weak. No named industry experts, no "built with input from X lawyers" kind of signal.
- **Authoritativeness:** Weak. No testimonials from named professionals in each industry.
- **Trust:** **Missing YMYL disclaimers.** This is the biggest E-E-A-T gap. Pages aimed at doctors/lawyers/advisors need:
  - A disclaimer that Official AI is a content creation tool, not medical/legal/financial advice
  - A note that users are responsible for their own professional compliance (HIPAA for doctors, bar rules for attorneys, SEC/FINRA rules for advisors)
  - Ideally a one-line mention that users should have compliance review on generated scripts before posting
  - This isn't optional — regulators and search engines both look for these signals on content aimed at regulated professions.

### Compare pages
- `/compare` index: 79 KB of HTML, decent length, value-prop driven.
- `/compare/[slug]`: competitor comparison pages. FAQPage schema present (Info flag, see schema.md M-1). Content should include at least one sourced stat per competitor and a feature-by-feature table.

### Tools (3 free calculators)
- Speaking time calculator, video ROI calculator, hook generator.
- Free-tool strategy is strong for top-of-funnel SEO, but content around the calculators is likely thin (calculator + sparse explanation). Verify each tool page has ≥600 words of explanation, use cases, methodology, and examples.

---

## Critical

### C-1 — `/demo` has no server-rendered content

HTML fetched for `/demo` is 19 KB vs. 70–140 KB on every other marketing page. The page is a pure `"use client"` shell mounting `<UnifiedOnboarding demoMode />`. Crawlers and LLMs see essentially nothing. For a page sitting at `priority: 0.8` in the sitemap, this is a wasted slot.

**Fix:** Add a server-component wrapper with ≥400 words of copy explaining: what the demo does, what input the user provides, what result they get, how long it takes, and who it's for. Put the interactive client component below the fold.

### C-2 — Pillar/subtopic fallback `PlaceholderContent` ships thin boilerplate

Any of the 36 pillar+subtopic pages that don't have a dedicated content module render identical generic copy (see the fallback functions in the pillar/subtopic page files linked above). This is programmatic-thin-content at scale: 36 pages with near-duplicate bodies fail both Google quality guidelines and the repo's own quality gate (WARN at 30+).

**Fix:**
1. Audit `src/content/` and `src/content/sub-topics/` (not verified in this audit) to count how many subtopics have real modules.
2. For every pillar/subtopic without a real module, either: write dedicated content OR remove the page from `topic-libraries.ts` and the sitemap.
3. Never ship the placeholder fallback to production.

### C-3 — Missing YMYL compliance disclaimers on `/for/*` pages

Pages aimed at doctors, lawyers, and financial advisors (three of the four industries) are YMYL-adjacent and need explicit compliance disclaimers. Absence hurts E-E-A-T, trust, and opens up regulatory/legal risk independent of SEO.

**Fix:** Add a compliance block to each `/for/*` page covering HIPAA (doctors), bar rules (attorneys), SEC/FINRA (advisors). One paragraph + a link to a new `/compliance` or `/trust` page.

---

## High

### H-1 — `/about` has no author/team signals

The about page inherits globals only, no Person schema, no team photos or bios visible in the fetched HTML. For a SaaS built on "your face, your voice" trust, the founders' own faces should be on this page.

**Fix:** Add a "Team" section with real photos, names, titles, and brief bios. Tie to schema.md H-3 (AboutPage + Person schema).

### H-2 — Blog posts lack author bio blocks

Each post has an `author` field in metadata but no inline bio block at the bottom of the post. Add a byline component with photo, name, role, and 1–2 sentences.

### H-3 — Unsourced statistics in placeholder content

`PillarPage`'s placeholder claims "Video content generates 1200% more shares than text and images combined" without a source. Unsourced stats hurt AI search citability (LLMs prefer sourced claims). Either remove or cite (e.g., WordStream study, HubSpot research, include the year).

### H-4 — Meta descriptions are strong but some are under-length

Most descriptions are in the 140–170 char sweet spot. Verify the shorter ones (`/compare`, `/tools`) are ≥130 characters to maximize SERP snippet real estate.

---

## Medium

### M-1 — No breadcrumbs visible on some deep pages

Verify that `/learn`, pillars, subtopics, blog posts, compare detail, and feature detail all render the `<Breadcrumbs>` component. Without breadcrumbs, the `BreadcrumbList` schema isn't emitted and users lose navigation context.

### M-2 — Categories on blog need canonical taxonomy

Blog has `category` per post (`AI Video`, etc.) but no `/blog/category/[slug]` landing pages. Either build them or remove category as a visible facet to avoid implying navigation that doesn't exist.

### M-3 — Tool pages need methodology explainer

Each `/tools/[tool]` calculator should explain how the underlying formula works, what assumptions it makes, and who it's for. This turns a utility page into a citable resource for AI Overviews.

### M-4 — No glossary or "what is" pages

AI search heavily rewards definition pages. Consider adding 5–10 glossary entries: "What is an AI twin?", "What is voice cloning?", "What is multi-cut video?", "What is AI UGC?" — each 300–500 words with a clear one-paragraph definition at the top.

---

## Low / Info

- **H1 count:** Every fetched page has exactly one H1 ✓
- **Title length:** 30–70 chars across the board ✓
- **Description length:** 130–170 chars (mostly) ✓
- **Reading grade (estimated):** Business casual, ~grade 9–11 — appropriate for the professional audience ✓
- **Brand consistency:** "Official AI" used consistently ✓
- **Keyword stuffing:** Not observed ✓

---

## Pre-Launch Checklist (Content)

- [ ] **C-1:** Server-render ≥400 words of explanatory copy on `/demo`
- [ ] **C-2:** Audit pillar/subtopic content registry; either write real modules or remove placeholder-only pages
- [ ] **C-3:** Add YMYL compliance disclaimers to `/for/attorneys`, `/for/doctors`, `/for/advisors`
- [ ] **H-1:** Add real team section with photos, bios, credentials to `/about`
- [ ] **H-2:** Add author bio blocks to every blog post
- [ ] **H-3:** Source or remove unsourced statistics
- [ ] **M-1:** Verify breadcrumbs render on every deep page
- [ ] **M-3:** Add methodology explainer to each tool page
- [ ] **M-4:** Publish 5–10 glossary/"what is" pages as a separate content tier
- [ ] Add real customer logos / testimonials strip on homepage
- [ ] Add third-party review validation (G2, Capterra, Trustpilot) before claiming any ratings
