# Sitemap Audit — Official AI

**Audit date:** 2026-04-10
**Sitemap fetched:** https://official-ai-app.netlify.app/sitemap.xml (HTTP 200, 13.8 KB, 76 URLs)
**Source:** [src/app/sitemap.ts](src/app/sitemap.ts) (Next.js dynamic sitemap)
**Planned production:** https://www.theofficial.ai/

## Summary

The sitemap is structurally valid, well under the 50,000-URL limit, and covers every major page tree: homepage, marketing core, industry pages, blog, learn pillars + subtopics, tools, compare, auth (public-facing), and the `/go` landing. Three issues require pre-launch action: (1) every URL uses the wrong production domain (`officialai.com` — see technical.md C-1); (2) five `features/[slug]` product pages are entirely absent; (3) `lastModified` is always the live request timestamp, which defeats the signal. `priority` and `changeFrequency` should be stripped since Google ignores both. The four `/for/*` industry pages pass the quality gate at 4 << 30, so no thin-content risk.

## Score: **70 / 100**

---

## Sitemap Stats

| Group | URLs |
|---|---|
| Homepage | 1 |
| Core marketing (pricing, features, how-it-works, about, compare, use-cases, demo) | 7 |
| Industry pages `/for/[industry]` | 4 |
| Blog index + 13 posts | 14 |
| Learn index `/learn` | 1 |
| Pillar pages (6 at root, e.g. `/ai-video-creation`) | 6 |
| Subtopic pages (6 pillars × 5 subtopics) | 30 |
| Tools index + 3 calculators | 4 |
| Compare index + 6 competitor pages | 7 |
| `/go` landing | 1 |
| Auth public (`/auth/login`, `/auth/signup`) | 2 |
| **Total** | **77** |

Live sitemap reports 76 entries. The one-URL discrepancy is because `/compare` appears once in the hand-written marketing block and the loop doesn't duplicate it. Fine.

---

## Critical

### C-1 — Wrong domain on every URL

`siteUrl` in [src/app/sitemap.ts:5](src/app/sitemap.ts#L5) is `https://officialai.com`. Fixed by the global domain swap (see technical.md C-1).

### C-2 — `features/[slug]` pages missing from sitemap

Five feature detail pages are statically generated in [src/app/features/\[slug\]/page.tsx](src/app/features/[slug]/page.tsx) via `generateStaticParams()` but none appear in `sitemap.ts`:
- `/features/ai-video-studio`
- `/features/ai-twin-voice`
- `/features/script-engine`
- `/features/auto-posting`
- `/features/analytics`

These are core commercial pages. Add a loop:

```ts
// src/app/sitemap.ts — add at top:
import { features } from "@/data/features";

// Inside the function, after the core marketing block:
for (const f of features) {
  routes.push({
    url: `${siteUrl}/features/${f.slug}`,
    lastModified: "2026-04-10",
  });
}
```

---

## High

### H-1 — `lastModified` is always the request timestamp

Line 8: `const now = new Date().toISOString();` is used for every entry. Google will treat the whole sitemap as perpetually fresh and discount it.

**Fix:** either hardcode ISO dates per page group, or store `updatedAt` in the data files (blog posts, competitors, features, pillars) and use those.

### H-2 — `robots.txt` `Sitemap:` directive uses wrong domain

[public/robots.txt:15](public/robots.txt#L15): `Sitemap: https://officialai.com/sitemap.xml`. Lines 18-19 also reference the wrong domain for `LLMs-Txt` and `LLMs-Full-Txt`.

---

## Medium

### M-1 — `priority` and `changeFrequency` on every entry

Google's crawler has publicly stated it ignores both fields. Strip them from every entry to reduce payload.

### M-2 — `/auth/login` and `/auth/signup` in sitemap without noindex check

Both are listed. Verify neither page carries a `noindex` meta tag — submitting a noindexed URL is a consistency error and wastes crawl budget.

### M-3 — `/go` depth unknown

`/go` is in the sitemap at priority 0.6 but wasn't fetched by this audit. Confirm it renders substantive content and doesn't HTTP-redirect. If it redirects, either remove from sitemap or point at the final destination.

### M-4 — Pillar URLs now at root collide with any future top-level route

The sitemap reflects the recent move from `/learn/[pillarSlug]` to `/[pillarSlug]`. Pillars like `/ai-video-creation`, `/video-marketing-professionals` etc. live at the root. With `dynamicParams = false` in [src/app/\[pillarSlug\]/page.tsx:13](src/app/[pillarSlug]/page.tsx#L13), unknown slugs 404 correctly. But any future top-level route (e.g. `/affiliate`, `/changelog`) must not clash with a pillar slug. Document this constraint in the repo README.

---

## Low / Info

- All four `/for/[industry]` pages — 4 total, well below the 30-page WARN threshold and the 50-page HARD STOP. Pass.
- `/auth/onboarding`, `/auth/forgot-password`, `/auth/reset-password`, `/dashboard/**`, `/api/**`, `/v/[id]` correctly excluded and disallowed in robots.txt.
- `use-cases` is in the sitemap and has a valid page file — good.
- No duplicate URLs detected.
- Sitemap is UTF-8, valid XML, single urlset, no sitemap index (none needed at 77 URLs).

---

## Pre-Launch Checklist (Sitemap)

- [ ] Fix wrong domain via global `siteUrl` swap (ties to technical.md C-1)
- [ ] Add `features/[slug]` loop (5 URLs)
- [ ] Replace `new Date().toISOString()` with real per-page dates
- [ ] Strip `priority` and `changeFrequency` from all entries
- [ ] Update `public/robots.txt` `Sitemap:`, `LLMs-Txt:`, `LLMs-Full-Txt:` lines
- [ ] Verify `/auth/login` and `/auth/signup` are not `noindex`
- [ ] Verify `/go` renders content (doesn't redirect)
- [ ] Submit sitemap to Google Search Console + Bing Webmaster Tools after launch
- [ ] Confirm Netlify does not override `public/robots.txt`
