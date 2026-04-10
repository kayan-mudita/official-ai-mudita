# Technical SEO Audit — Official AI

**Audit date:** 2026-04-10
**Staging:** https://official-ai-app.netlify.app/ (Netlify, Next.js 14+ App Router)
**Planned production:** https://www.theofficial.ai/
**Method:** Live HTTP fetch of 15 key pages + full codebase inspection

## Summary

The Next.js application is structurally sound: it is server-rendered, produces HTTP 200 on every fetched page, sets good security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), caches static assets correctly, uses AVIF/WebP images, and has a dedicated `/robots.txt` with sensible Disallow rules. The **defining issue is a wrong hardcoded production domain** — `https://officialai.com` — which appears in 21 source files, including `metadataBase`, every canonical tag, every OG URL, every JSON-LD `url`/`@id`, the sitemap, `robots.txt`, and both llms.txt variants. This is neither the current Netlify dev URL nor the planned `https://www.theofficial.ai/`. Fixing it is the single highest-impact pre-launch action.

## Score: **62 / 100**

The site loses points mainly on one systemic issue (wrong domain). Everything else is fixable with surgical changes.

---

## Critical

### C-1 — Wrong production domain hardcoded in 21 source files

The constant `https://officialai.com` is used throughout the codebase as the canonical site URL. It is not the Netlify dev URL and it is not the planned production URL (`https://www.theofficial.ai/`). Because Next.js resolves every page-level `alternates.canonical` and relative OG URL against `metadataBase` (from [src/app/layout.tsx:14](src/app/layout.tsx#L14)), every single canonical and OG URL on the site currently points at a phantom third domain.

**Verified on every fetched page:** homepage, pricing, features, how-it-works, about, blog, blog/ai-ugc-future, compare, for/advisors, for/attorneys, for/doctors, for/realtors, tools, learn.

Every page shows `<link rel="canonical" href="https://officialai.com/...">` and `<meta property="og:url" content="https://officialai.com">`.

**All hardcoded locations (SEO-critical):**
- [src/app/layout.tsx:14](src/app/layout.tsx#L14) — `siteUrl` (powers `metadataBase`, OG, JSON-LD)
- [src/app/layout.tsx:108](src/app/layout.tsx#L108), [src/app/layout.tsx:115](src/app/layout.tsx#L115) — Organization `email: "hello@officialai.com"`
- [src/app/sitemap.ts:5](src/app/sitemap.ts#L5) — every sitemap URL
- [src/components/blog/BlogPostTemplate.tsx:63](src/components/blog/BlogPostTemplate.tsx#L63) — Article JSON-LD
- [src/components/pillar/PillarPageTemplate.tsx:67](src/components/pillar/PillarPageTemplate.tsx#L67) — Pillar Article JSON-LD
- [src/components/pillar/SubTopicPageTemplate.tsx:58](src/components/pillar/SubTopicPageTemplate.tsx#L58) — Subtopic Article JSON-LD
- [src/components/marketing/Breadcrumbs.tsx:16](src/components/marketing/Breadcrumbs.tsx#L16) — BreadcrumbList JSON-LD
- [src/app/for/advisors/page.tsx:16](src/app/for/advisors/page.tsx#L16), attorneys, doctors, realtors — Service JSON-LD
- [src/app/llms.txt/route.ts](src/app/llms.txt/route.ts) — ~14 URLs
- [src/app/llms-full.txt/route.ts](src/app/llms-full.txt/route.ts) — ~20 URLs
- [public/robots.txt:15](public/robots.txt#L15), [18](public/robots.txt#L18), [19](public/robots.txt#L19) — Sitemap + LLMs-Txt directives
- [src/app/v/\[id\]/page.tsx:44](src/app/v/[id]/page.tsx#L44) — fallback `siteUrl` for video share pages
- [src/app/api/referral/route.ts:44](src/app/api/referral/route.ts#L44) — referral link template
- [src/app/api/team/invite/route.ts:34](src/app/api/team/invite/route.ts#L34) — team invite link template

**Fix:** introduce a single exported constant (ideally driven by `process.env.NEXT_PUBLIC_SITE_URL` with a launch-safe default of `https://www.theofficial.ai`) and replace every usage.

### C-2 — `/demo` page has no canonical tag

`<link rel="canonical">` is **absent** from the fetched HTML for `/demo`. Root cause: [src/app/demo/page.tsx](src/app/demo/page.tsx) is a `"use client"` component that exports no `metadata`. Because it's client-only it never gets page-level metadata and `metadataBase` alone does not emit a canonical. Pre-launch this is a hard indexing-quality issue.

**Fix:** split into a server-component wrapper that exports `metadata` (with `alternates: { canonical: "/demo" }`) and renders the existing client component.

### C-3 — `features/[slug]` product pages exist but are missing from `sitemap.xml`

Five feature detail pages are statically generated via `generateStaticParams()` in [src/app/features/\[slug\]/page.tsx](src/app/features/[slug]/page.tsx) (`ai-video-studio`, `ai-twin-voice`, `script-engine`, `auto-posting`, `analytics`) but none appear in [src/app/sitemap.ts](src/app/sitemap.ts). These are high-commercial-intent product pages. Add a dynamic loop driven by the `features` data.

---

## High

### H-1 — `metadataBase` resolves to wrong domain

Because [src/app/layout.tsx:35](src/app/layout.tsx#L35) sets `metadataBase: new URL(siteUrl)` with the wrong siteUrl, every page that uses relative OG image paths (`/og-image.png`) will build them against `officialai.com`. Fixed automatically by C-1.

### H-2 — Global schemas baked into layout on every page

The homepage, pricing, features, how-it-works, about, compare, tools, learn, and every `/for/*` page emits the **same** `SoftwareApplication + Organization + WebSite` triad with identical content. This is fine at the Organization / WebSite level but the `SoftwareApplication` schema duplicated on every URL is not a rich-result win — it's only helpful on one canonical page (homepage or `/features`). Move `SoftwareApplication` out of `layout.tsx` and into homepage only; keep Organization + WebSite in layout.

### H-3 — Sitemap pages stale-stamp to request time

Every entry in [src/app/sitemap.ts:8](src/app/sitemap.ts#L8) uses `new Date().toISOString()` as `lastModified`. The entire sitemap reports freshness at the moment of each render, so Google discounts the signal entirely. Use real per-page publish/update timestamps or hardcoded ISO dates per page group.

### H-4 — `/demo` page serves only 19 KB

Content-Length of `/demo` is 19 KB vs. 70–140 KB for other marketing pages. Because it's a pure `"use client"` shell that mounts `<UnifiedOnboarding demoMode />`, the server-rendered HTML has no meaningful content — crawlers see nearly nothing. Pair the canonical fix (C-2) with substantive server-rendered copy explaining what the demo does, who it's for, and what the result looks like. Otherwise the demo page is functionally invisible to crawlers and AI search.

---

## Medium

### M-1 — `priority` and `changeFrequency` on every sitemap entry

Google has publicly stated it ignores both fields. They add payload with zero ranking benefit. Strip them from [src/app/sitemap.ts](src/app/sitemap.ts).

### M-2 — `SoftwareApplication` schema has `priceValidUntil` 2027-12-31 and a static `aggregateRating` of 4.9 / 200

[src/app/layout.tsx:90-98](src/app/layout.tsx#L90-L98) hardcodes `ratingValue: "4.9"` / `ratingCount: "200"`. If this rating is not backed by real, site-collected reviews, it violates Google's review-snippet guidelines and can trigger a manual action post-launch. Either remove `aggregateRating` until you have real review data, or replace with actual aggregated reviews from a collection mechanism (Stamped, Trustpilot, G2, Capterra).

### M-3 — `X-Powered-By: Next.js` header leaked

Netlify returns `X-Powered-By: Next.js`. Not a ranking issue but a minor fingerprinting leak; hide via Next.js config (`poweredByHeader: false`) in [next.config.js](next.config.js).

### M-4 — Global `FAQPage` schema on `/compare/[slug]`

[src/app/compare/\[slug\]/CompetitorCompareClient.tsx:470](src/app/compare/[slug]/CompetitorCompareClient.tsx#L470) injects `FAQPage`. Since Aug 2023, Google restricts FAQ rich results to government and healthcare authority sites. For a commercial SaaS the markup is harmless (AI/LLM citation benefit remains) but will **not** produce rich results. Flag as Info — keep for LLM citability, don't expect Google SERP features.

### M-5 — Sitemap references pillar pages at root URL, not under `/learn`

Sitemap lists `/ai-video-creation`, `/video-marketing-professionals`, `/social-media-video-strategy`, `/ai-video-real-estate`, `/ai-video-professional-services`, `/ai-content-at-scale` as top-level paths (matching the recent [src/app/\[pillarSlug\]/page.tsx](src/app/[pillarSlug]/page.tsx) move from `/learn/[pillar]`). These URLs collide with the dynamic `[pillarSlug]` segment with `dynamicParams = false`, which is correct, but means any future top-level route (e.g. `/login`) must not conflict with a pillar slug. Document this constraint.

### M-6 — `Cache-Control: public, max-age=0, must-revalidate` on HTML

Every HTML page uses zero max-age. This is correct for a Next.js SSR app using Netlify Durable cache (which revalidates via ETag), but if you move to Vercel or another host without Durable Cache, you'll lose the cache layer. Acceptable on Netlify, worth re-evaluating post-launch.

### M-7 — `next.config.js` does not set `trailingSlash`

Next.js default is no trailing slash. All fetched URLs work without a trailing slash, but neither `/pricing` nor `/pricing/` is a redirect. If both resolve to 200, set `trailingSlash: false` explicitly and verify one form 308s to the other (the user's memory says "No redirects pre-launch" — so just document this and handle post-launch).

---

## Low / Info

- **HTTPS + HSTS preload** present (`max-age=31536000; includeSubDomains; preload`) ✓
- **X-Content-Type-Options: nosniff** ✓
- **Viewport meta correctly set** on every page ✓
- **`dark` class on `<html>`** — every page is dark-mode by default. Fine for branding; just verify contrast in the Visual audit.
- **Sentry is wired up** via `next.config.js` — DSN-gated. Good.
- **Netlify-specific:** `@netlify/plugin-nextjs` handles ISR/serverless; `/_next/static/*` has immutable 1-year cache ✓. Middleware forced to Node.js runtime (not Edge) — makes sense for Sentry compat.
- **No IndexNow implementation** detected. Low priority pre-launch; add post-launch for Bing/Yandex instant indexing.
- **No `X-Robots-Tag: noindex` on production HTML** — checked; site is indexable as designed (except for `/dashboard/*`, `/api/*`, `/auth/onboarding`, `/v/*` via robots.txt Disallow).

---

## Pre-Launch Checklist (Technical)

- [ ] **C-1:** Replace all 21 `officialai.com` occurrences with a single `siteUrl` pulled from `NEXT_PUBLIC_SITE_URL` (default `https://www.theofficial.ai`). See the file list above.
- [ ] **C-2:** Add a server-component metadata wrapper to `/demo` so it emits a canonical.
- [ ] **C-3:** Add `features/[slug]` dynamic loop to `sitemap.ts`.
- [ ] **H-1:** Verified automatically when C-1 is applied.
- [ ] **H-2:** Move `SoftwareApplication` JSON-LD from `layout.tsx` to `src/app/page.tsx` only.
- [ ] **H-3:** Replace `new Date().toISOString()` with real per-page dates or per-group constants.
- [ ] **H-4:** Add ≥400 words of server-rendered copy to `/demo`.
- [ ] **M-1:** Strip `priority` and `changeFrequency` from sitemap entries.
- [ ] **M-2:** Remove or real-data-back `aggregateRating` in `softwareApplicationSchema`.
- [ ] **M-3:** Add `poweredByHeader: false` to `next.config.js`.
- [ ] **M-4:** Leave `FAQPage` but document it's LLM-only, not Google rich result.
- [ ] Register `https://www.theofficial.ai/` in Google Search Console and Bing Webmaster Tools on launch day.
- [ ] Submit sitemap from the production domain.
- [ ] Configure 301 from apex `theofficial.ai` → `www.theofficial.ai` (or vice versa), plus from `officialai.com` if that domain has been secured.
