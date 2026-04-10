# Schema Markup Audit — Official AI

**Audit date:** 2026-04-10
**Method:** JSON-LD extraction from 15 live-fetched HTML pages + codebase inspection of all schema sources
**Planned production:** https://www.theofficial.ai/

## Summary

JSON-LD coverage is **present on every page** — good baseline. Every page emits `SoftwareApplication + Organization + WebSite` globally from [layout.tsx](src/app/layout.tsx), with page-level additions for blog posts (`Article`), pillar/subtopic pages (`Article`), competitor compare pages (`FAQPage`), and `/for/*` industry pages (`Service`). The critical problems are: (1) every `url`, `@id`, `logo`, and `mainEntityOfPage` field uses the wrong domain `officialai.com`; (2) `SoftwareApplication` carries a fabricated `aggregateRating` of 4.9/200 which, if not backed by real reviews, violates Google's review-snippet guidelines; (3) `SoftwareApplication` is duplicated on every URL instead of living only on the homepage; (4) Pricing, Features, and Tools pages are missing page-specific schema (`Offer`/`Product`/`WebApplication`).

## Score: **64 / 100**

---

## Detection Matrix

| Page | Global (Layout) | Page-specific | Valid? |
|---|---|---|---|
| `/` | SoftwareApplication, Organization, WebSite | — | ⚠ wrong domain |
| `/pricing` | same | — | ⚠ missing Offer/Product |
| `/features` | same | — | ⚠ missing Product/SoftwareApplication feature list |
| `/features/[slug]` | same | — | ⚠ missing page schema |
| `/how-it-works` | same | — | ⚠ no HowTo allowed (deprecated) — use Article instead |
| `/about` | same | — | ⚠ missing AboutPage + Person entries |
| `/blog` | same | — | ⚠ missing Blog + ItemList |
| `/blog/[slug]` | same + **Article** + (implied BreadcrumbList from template) | ✓ structure / ⚠ wrong domain in `@id`, `image`, `mainEntityOfPage` |
| `/compare` | same | — | ⚠ missing WebPage with about comparison |
| `/compare/[slug]` | same + **FAQPage** | ⚠ FAQPage on commercial site (Info-only, not Google rich result) |
| `/for/advisors` | same + **Service** | ⚠ hardcoded `provider.url: "https://officialai.com"` |
| `/for/attorneys` | same + **Service** | ⚠ same |
| `/for/doctors` | same + **Service** | ⚠ same |
| `/for/realtors` | same + **Service** | ⚠ same |
| `/tools` | same | — | ⚠ missing ItemList of tools |
| `/tools/[tool]` | same | — | ⚠ missing WebApplication per calculator |
| `/learn` | same + BreadcrumbList | ✓ structure |
| `/[pillar]` | same + **Article** (from [PillarPageTemplate.tsx:85](src/components/pillar/PillarPageTemplate.tsx#L85)) | ⚠ wrong domain in `@id`, `image` |
| `/[pillar]/[subtopic]` | same + **Article** (from [SubTopicPageTemplate.tsx:65](src/components/pillar/SubTopicPageTemplate.tsx#L65)) | ⚠ wrong domain |

---

## Critical

### C-1 — Wrong domain on every schema `url`, `@id`, `logo`, `image`, `mainEntityOfPage`

Every JSON-LD block on the site references `https://officialai.com`. This affects `Organization.url`, `Organization.logo`, `WebSite.url`, `SoftwareApplication.url`, Article `mainEntityOfPage.@id`, Article `image`, `BreadcrumbList` item URLs, and `Service.provider.url` across all 4 industry pages.

**Source files** (full list in technical.md C-1):
- [src/app/layout.tsx:14](src/app/layout.tsx#L14)
- [src/components/blog/BlogPostTemplate.tsx:63](src/components/blog/BlogPostTemplate.tsx#L63)
- [src/components/pillar/PillarPageTemplate.tsx:67](src/components/pillar/PillarPageTemplate.tsx#L67)
- [src/components/pillar/SubTopicPageTemplate.tsx:58](src/components/pillar/SubTopicPageTemplate.tsx#L58)
- [src/components/marketing/Breadcrumbs.tsx:16](src/components/marketing/Breadcrumbs.tsx#L16)
- [src/app/for/advisors/page.tsx:16](src/app/for/advisors/page.tsx#L16), attorneys, doctors, realtors

**Fix:** single import from a shared `config/site.ts`.

### C-2 — Fabricated `aggregateRating` on `SoftwareApplication`

[src/app/layout.tsx:93-98](src/app/layout.tsx#L93-L98):
```json
"aggregateRating": { "ratingValue": "4.9", "ratingCount": "200", "bestRating": "5" }
```

If these are not real, site-collected, verifiable reviews, this violates Google's review-snippet policy and can trigger a manual action (or at least suppress any rich-result display). Because the schema is in `layout.tsx`, it emits on **every URL**, compounding the exposure.

**Fix options:**
1. Remove `aggregateRating` until you have real reviews (recommended for launch).
2. Pull from a third-party review source (G2, Capterra, Trustpilot) via their widget + schema.
3. Build an internal review collection mechanism and aggregate from there.

### C-3 — `SoftwareApplication` emitted on every URL

Because `softwareApplicationSchema` is injected globally in [layout.tsx:141-146](src/app/layout.tsx#L141-L146), it appears on `/pricing`, `/about`, `/blog`, `/compare`, `/learn`, and every subtopic page. Google's guidance is that a single canonical SoftwareApplication should describe the product once — on the homepage or `/features`. Duplicating it on every URL risks:
- Conflicting signals about which page is the app's "home"
- Inflated rich-result exposure for any `offers` and `aggregateRating` problems

**Fix:** move the `softwareApplicationSchema` inline injection from `layout.tsx` into `src/app/page.tsx` (homepage only). Keep `Organization` and `WebSite` globally.

---

## High

### H-1 — Pricing page has no `Product` / `Offer` schema

`/pricing` only inherits the global `SoftwareApplication` with a single `$79` offer. The actual pricing page covers the $79 Starter plan plus (per `PricingClient.tsx`) additional tiers and an Enterprise option. None of this is exposed as structured data.

**Fix:** add a page-specific `Product` with an `offers` array covering every tier. Template in [generated-schema.json](./generated-schema.json).

### H-2 — `/features` and `/features/[slug]` missing page-specific schema

Neither the index nor the five detail pages emit a `Product`/`SoftwareApplication`/`WebPage` with `featureList`. Feature pages are high-intent commercial pages — they should emit their own schema describing the feature, not just inherit globals.

### H-3 — `/about` has no `AboutPage` + `Person` entries

No founder, team, or mission schema. This is an E-E-A-T signal directly tied to AI search citations. Generate an `AboutPage` containing `mainEntity: Organization` plus a `Person` array for each founder/team member with `jobTitle`, `knowsAbout`, and `sameAs` social profiles.

### H-4 — `/tools/[tool]` calculators missing `WebApplication` schema

Each of the three free tools (speaking time calculator, video ROI calculator, hook generator) is a standalone mini-app. Each should emit a `WebApplication` with `applicationCategory: "BusinessApplication"`, `browserRequirements`, and `offers: { price: "0", priceCurrency: "USD" }` (free). This is a high-ROI schema opportunity for top-of-funnel tool pages.

---

## Medium

### M-1 — Commercial `FAQPage` on compare pages is Info-only, not a rich result

[src/app/compare/\[slug\]/CompetitorCompareClient.tsx:470](src/app/compare/[slug]/CompetitorCompareClient.tsx#L470) injects `FAQPage` on every competitor comparison. Since Aug 2023 Google restricts FAQ rich results to **government and healthcare authority sites**. The markup is harmless and does help LLM/AI citations (Perplexity, ChatGPT, AI Overviews) — so keep it, but document that it will **not** produce SERP FAQ rich results for this site type.

### M-2 — `/compare/[slug]` missing `Product` comparison markup

Competitor comparison pages ("Official AI vs HeyGen") are ideal for `Product` + `Brand` schema where the subject is Official AI and `mentions` lists the competitor. This helps AI search build the comparison entity graph. Not currently present.

### M-3 — `/blog` index missing `Blog` + `ItemList` schema

The blog listing page could emit a `Blog` type with an `ItemList` of `BlogPosting` entries for the 13 posts. Currently it only inherits globals.

### M-4 — `BreadcrumbList` emission is inconsistent

[src/components/marketing/Breadcrumbs.tsx](src/components/marketing/Breadcrumbs.tsx) emits BreadcrumbList JSON-LD only when the `<Breadcrumbs>` component is present on the page. Confirm it renders on every deep page (pillar, subtopic, blog post, compare detail, feature detail).

### M-5 — `publisher.logo` uses `og-image.png` on Article schemas

[BlogPostTemplate.tsx:77](src/components/blog/BlogPostTemplate.tsx#L77) sets the Article publisher logo to `${siteUrl}/og-image.png`. `og-image.png` is a 1200×630 social preview, not a logo (Google's Article schema wants a logo ≤ 600px wide, ideally PNG with transparent background). Add `/logo.png` and reference that instead.

---

## Deprecation & Policy Checks

- **HowTo:** not used. ✓ (Would be wrong — deprecated Sept 2023.)
- **SpecialAnnouncement:** not used. ✓ (Deprecated July 2025.)
- **Dataset, VehicleListing, LearningVideo, CourseInfo, EstimatedSalary, ClaimReview, Practice Problem:** none used. ✓
- **FAQPage:** present on commercial pages → flagged M-1 (Info priority, not Google rich result — keep for LLM citation benefit).
- **Book Actions:** not used. N/A.

---

## Pre-Launch Checklist (Schema)

- [ ] **C-1:** Swap hardcoded `officialai.com` → production domain via shared `siteUrl` constant.
- [ ] **C-2:** Remove fabricated `aggregateRating` (or back with real reviews).
- [ ] **C-3:** Move `SoftwareApplication` from `layout.tsx` to `src/app/page.tsx` (homepage only).
- [ ] **H-1:** Add `Product` with tiered `offers` to `/pricing`.
- [ ] **H-2:** Add `Product`/`SoftwareApplication` schema to `/features` and each `/features/[slug]`.
- [ ] **H-3:** Add `AboutPage` + `Person` array to `/about`.
- [ ] **H-4:** Add `WebApplication` schema to each `/tools/[tool]` calculator.
- [ ] **M-2:** Add `Product` + `mentions` for competitor to `/compare/[slug]`.
- [ ] **M-3:** Add `Blog` + `ItemList` to `/blog` index.
- [ ] **M-5:** Replace `og-image.png` with a proper `/logo.png` in all `publisher.logo` fields.
- [ ] Validate everything via the [Schema.org validator](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results) once the production domain is live.

Ready-to-use JSON-LD templates for C-3, H-1, H-2, H-3, H-4, M-2, M-3 are in `seo-audit/generated-schema.json`.
