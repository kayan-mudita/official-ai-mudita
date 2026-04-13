# SEO Audit — Official AI

**Site audited:** https://official-ai-app.netlify.app/ (Netlify dev)
**Planned production:** https://www.theofficial.ai/
**Audit date:** 2026-04-10
**Auditor:** claude-seo v1.8.2
**Repo branch:** `seo-audit` (off `main` at commit `6bde2d0`)
**Business type:** SaaS — AI video creation for professional services (advisors, attorneys, doctors, realtors)

## TL;DR

The site is a well-built Next.js 14 App Router marketing site with solid technical foundations (SSR, HSTS, AVIF/WebP images, durable cache, system fonts, strong sitemap coverage, JSON-LD on every page). But it cannot launch as-is.

**One systemic issue dominates the report:** the production domain is hardcoded as `https://officialai.com` across **21 source files** — not the current Netlify URL, not the planned `https://www.theofficial.ai/`, a third domain entirely. That wrong URL is embedded in canonical tags on every page, every OG URL and image, every JSON-LD `url`/`@id`/`logo`, the sitemap, `robots.txt`, and both llms.txt variants. Fix it first; it unblocks almost everything else.

After the domain fix, the top remaining work is: (1) remove the fabricated `aggregateRating` of 4.9/200 that violates Google review policy; (2) add real content to pillar/subtopic pages that currently fall back to generic placeholder text; (3) give `/demo` real server-rendered content; (4) add the five missing `features/[slug]` URLs to the sitemap; (5) add YMYL compliance disclaimers to the three regulated-profession industry pages.

## SEO Health Score

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 62 | 13.6 |
| Content Quality (E-E-A-T) | 23% | 67 | 15.4 |
| On-Page SEO | 20% | 72 | 14.4 |
| Schema / Structured Data | 10% | 64 | 6.4 |
| Performance (CWV, lab-only) | 10% | 72 | 7.2 |
| AI Search Readiness (GEO) | 10% | 61 | 6.1 |
| Images | 5% | 60 | 3.0 |
| **Overall** | **100%** | — | **66.1 / 100** |

**Interpretation:** A 66 is "needs work" on the launch-readiness axis. But the number is heavily dragged by one root cause — the wrong production domain. Fixing C-1 alone lifts most categories by 5–10 points each. Post-fix, projected score is in the **low-80s** with no other changes; in the **high-80s to low-90s** after all Critical + High items are addressed.

**Visual audit was not completed** due to Playwright sandbox restrictions. See `visual.md` for the manual runbook. Score above assumes no catastrophic visual failures; adjust once manual check is done.

## Reports Index

- [technical.md](technical.md) — Technical SEO (9 categories)
- [content.md](content.md) — Content quality and E-E-A-T
- [schema.md](schema.md) — JSON-LD detection, validation, generation
- [sitemap.md](sitemap.md) — Sitemap analysis
- [performance.md](performance.md) — Core Web Vitals (lab-only)
- [geo.md](geo.md) — AI search / GEO readiness
- [visual.md](visual.md) — Visual / mobile (BLOCKED — manual runbook inside)
- [generated-schema.json](generated-schema.json) — Ready-to-use JSON-LD templates
- [raw/](raw/) — Fetched HTML, headers, robots.txt, sitemap.xml, llms.txt

## Prioritized Action Plan

### 🔴 Critical — Must fix before launch (blocking)

| # | Action | Files | Impact |
|---|---|---|---|
| C-1 | **Global domain swap.** Create `src/lib/site-config.ts` exporting `siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.theofficial.ai"`. Replace all 21 `officialai.com` occurrences in: `layout.tsx`, `sitemap.ts`, `BlogPostTemplate.tsx`, `PillarPageTemplate.tsx`, `SubTopicPageTemplate.tsx`, `Breadcrumbs.tsx`, `for/advisors/page.tsx`, `for/attorneys/page.tsx`, `for/doctors/page.tsx`, `for/realtors/page.tsx`, `llms.txt/route.ts`, `llms-full.txt/route.ts`, `v/[id]/page.tsx`, `api/referral/route.ts`, `api/team/invite/route.ts`, `public/robots.txt`, and the four `mailto:hello@officialai.com` instances. Update `hello@officialai.com` → `hello@theofficial.ai` in Organization schema + Footer. | 21 files | Fixes canonical, OG, all schemas, sitemap, robots.txt, llms.txt in one swap |
| C-2 | **Remove fabricated `aggregateRating`** from `softwareApplicationSchema` in `src/app/layout.tsx:93-98`. Either delete entirely or replace with real data sourced from G2/Capterra/Trustpilot once live. | `layout.tsx` | Removes Google review-policy violation risk |
| C-3 | **Add `features/[slug]` loop to sitemap.** Import `features` from `src/data/features.ts`; push 5 URLs into the sitemap routes array. | `sitemap.ts` | Gets 5 high-commercial-intent pages indexed |
| C-4 | **Give `/demo` real SSR content.** Convert to a server-component wrapper that exports `metadata` (with `alternates: { canonical: "/demo" }`) + ≥400 words of explanatory copy, then mounts `<UnifiedOnboarding demoMode />` below the fold. | `src/app/demo/page.tsx` | Fixes missing canonical + crawler-visible content |
| C-5 | **Replace pillar/subtopic `PlaceholderContent` fallback.** Audit which of the 36 pillar+subtopic pages actually have modules in `src/content/`; either write real modules or remove the route from `topic-libraries.ts` and the sitemap. Never ship placeholder fallback. | `[pillarSlug]/page.tsx`, `[pillarSlug]/[subTopicSlug]/page.tsx`, `src/content/`, `sitemap.ts` | Fixes thin-content risk at 36-page scale |
| C-6 | **Move `SoftwareApplication` schema from layout to homepage only.** Keep `Organization` and `WebSite` global. | `layout.tsx`, `src/app/page.tsx` | Fixes duplicated product schema on every URL |
| C-7 | **Add YMYL compliance disclaimers** to `/for/attorneys`, `/for/doctors`, `/for/advisors`. One paragraph + link to `/compliance` or `/trust`. | 3 files | Regulatory + E-E-A-T risk mitigation |

### 🟠 High — Fix within the first week post-launch (or pre-launch if you have time)

| # | Action | Files | Impact |
|---|---|---|---|
| H-1 | Replace `new Date().toISOString()` `lastModified` in sitemap with real per-page dates from data files | `sitemap.ts`, `blog-posts.ts`, `competitors.ts`, `features.ts` | Restores freshness signal |
| H-2 | Add explicit AI bot allow-lines to `robots.txt` (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, Applebot-Extended, Meta-ExternalAgent) | `robots.txt` | GEO / AI search signal |
| H-3 | Add page-specific schema: `Product` on `/pricing`, `SoftwareApplication`/`Product` on `/features/[slug]`, `AboutPage` + `Person` on `/about`, `WebApplication` on each `/tools/[tool]`, `Product` + `mentions` on `/compare/[slug]`, `Blog` + `ItemList` on `/blog`. Templates in `generated-schema.json`. | Multiple | Rich results + AI citation |
| H-4 | Add TL;DR / definition-first intro to every blog post, pillar page, subtopic page, and industry page. 1–3 sentences answering "what is X" at the very top. | Content files | Highest-ROI GEO edit |
| H-5 | Source or remove every unsourced statistic on the site (starting with "1200% more shares" in pillar placeholder). | Content files | AI citation trust |
| H-6 | Add author bio blocks to every blog post + create `/authors/[slug]` entity pages | Blog templates, new route | E-E-A-T + author entity graph |
| H-7 | Add real team section with photos, bios, and credentials to `/about` | `about/page.tsx`, `AboutClient.tsx` | E-E-A-T trust |
| H-8 | Re-encode featured PNGs to AVIF + size variants; target <150 KB per hero image | `public/images/featured/**` | LCP improvement |
| H-9 | Dynamic-import below-the-fold homepage mockup components | `src/app/page.tsx` or `HomeClient.tsx` | Hydration cost |
| H-10 | Add `priority` to `<Image>` on featured/hero images in blog, pillar, subtopic templates | Templates | LCP |
| H-11 | Regenerate `/llms.txt` and `/llms-full.txt` dynamically from data files so they stay in sync with sitemap | Both route handlers | GEO |
| H-12 | Verify `sameAs` social handles exist and are owned at the new `@theofficialai` name; claim on Twitter, LinkedIn, YouTube, Product Hunt, G2, Capterra | external | Brand entity graph |

### 🟡 Medium — Fix within the first month

| # | Action |
|---|---|
| M-1 | Strip `priority` and `changeFrequency` from all sitemap entries (Google ignores both) |
| M-2 | Add `poweredByHeader: false` to `next.config.js` |
| M-3 | Replace OG image with dedicated `/logo.png` in all `publisher.logo` schema fields |
| M-4 | Add `knowsAbout` array to Organization schema |
| M-5 | Add IndexNow key file + build-pipeline integration for Bing instant indexing |
| M-6 | Build `/authors/[slug]` entity pages |
| M-7 | Publish 5–10 "what is X" glossary pages as a separate content tier |
| M-8 | Audit `<Breadcrumbs>` rendering on every deep page type |
| M-9 | Run `@next/bundle-analyzer` and review Sentry client bundle impact |
| M-10 | Defer CookieConsent mount to avoid INP impact |
| M-11 | Register domain in Google Search Console + Bing Webmaster Tools on launch day |
| M-12 | Configure 301 redirects from `officialai.com` (if owned) and apex `theofficial.ai` → `www.theofficial.ai` |
| M-13 | Add methodology explainer section to each `/tools/[tool]` calculator |
| M-14 | Verify `/auth/login`, `/auth/signup` are not `noindex` before leaving them in sitemap |
| M-15 | Verify `/go` renders substantive content (doesn't redirect) |

### ⚪ Low / Info — Backlog

| # | Action |
|---|---|
| L-1 | Add custom 404 page with search + popular links |
| L-2 | Add Open Graph image generation per page (e.g. `@vercel/og`) so every blog post gets a unique social preview |
| L-3 | Set up RUM via Sentry Performance or Netlify Analytics for real CWV field data |
| L-4 | Build third-party review integration (G2 widget / Trustpilot) before claiming any rating |
| L-5 | Document top-level pillar-slug constraint (`[pillarSlug]` collides with any new top-level route) in repo README |
| L-6 | Consider Git LFS or external storage for featured image PNGs (current PNGs bloat Git history) |
| L-7 | Create Crunchbase, Product Hunt, G2, Capterra profiles on launch day |

## What this audit did NOT cover

Because the audit ran in the current sandbox:
- **Real browser CWV measurements** (LCP, CLS, INP in ms) — needs Playwright/Lighthouse, see `performance.md`
- **Visual screenshots and mobile rendering check** — needs Playwright, see `visual.md` for manual runbook
- **Crawl beyond 15 fetched pages** — the 30 subtopic pages and 6 pillar pages were inspected via source only
- **Backlink profile** — site is pre-launch, no backlinks yet
- **Keyword ranking** — site is pre-launch, not indexed yet
- **Google Search Console data** — site not yet registered
- **Real user analytics** — no production traffic
- **Content originality / plagiarism check** — not in scope

Do these once the production domain is live.

## Next Steps (suggested order)

1. **Review this report** — especially the 7 Critical items
2. **Land one cleanup commit** on the `seo-audit` branch addressing all 7 Criticals (mostly mechanical — the domain swap is the biggest piece but it's a straight find-replace to a shared constant)
3. **Re-fetch the site** and spot-check that canonicals, OG URLs, schema `url`/`@id`, sitemap, robots.txt, and llms.txt all now reference `https://www.theofficial.ai/`
4. **Run Playwright locally** for the visual audit using the runbook in `visual.md`
5. **Run Lighthouse** for real CWV numbers using the commands in `performance.md`
6. **Merge to `main`**, then address the 12 High items before launch day
7. **Launch day:** register GSC + Bing Webmaster Tools, submit sitemap, claim `@theofficialai` on every social platform, create Crunchbase/Product Hunt/G2 profiles
