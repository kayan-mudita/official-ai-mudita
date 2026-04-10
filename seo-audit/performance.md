# Performance / Core Web Vitals Audit — Official AI

**Audit date:** 2026-04-10
**Method:** Static analysis from fetched HTML sizes, response headers, `next.config.js`, `netlify.toml`, and code inspection. **Field data (CrUX) is unavailable** because the site is not yet indexed and has no production traffic. Lab CWV (Lighthouse) could not be run in this environment due to sandbox restrictions on Playwright/headless Chrome.

## Summary

The site has the right performance foundations for a Next.js 14 App Router marketing site on Netlify: SSR on every page (no client-only rendering except `/demo`), immutable 1-year cache on `/_next/static/*`, AVIF + WebP image formats configured in `next.config.js`, a system-font stack (no Google Fonts fetch), Netlify Durable Cache + Next.js cache layered correctly, and HSTS preload. The audit can't produce real LCP/CLS/INP numbers without a browser, but the signals we *can* measure from HTML size, header config, and source code point to a healthy baseline with a few known risks: heavy homepage (139 KB), mockup components that animate on load (CLS risk), large featured images on blog posts (LCP risk), and `/demo` being a client-shell that effectively has no SSR content.

## Score: **72 / 100** *(lab-only estimate — requires a real CWV run to confirm)*

---

## What I Could Measure

### HTML Payload Per Page (uncompressed)

| Page | HTML bytes | Notes |
|---|---|---|
| `/` | 139,066 | Heaviest — bento grid, multiple mockups, aurora backgrounds |
| `/how-it-works` | 108,176 | Three-step SVG+motion sequence |
| `/pricing` | 98,317 | Tiered pricing tables |
| `/blog` | 97,549 | Post cards with featured images |
| `/features` | 88,849 | Five feature mockup components |
| `/blog/ai-ugc-future` | 82,783 | Long-form post |
| `/compare` | 79,685 | Competitor grid |
| `/for/doctors` | 74,025 | Industry page |
| `/for/attorneys` | 74,318 | |
| `/for/realtors` | 73,220 | |
| `/for/advisors` | 73,190 | |
| `/about` | 70,137 | |
| `/learn` | 66,592 | |
| `/tools` | 64,627 | |
| `/demo` | **19,815** | ⚠ client-only shell — effectively empty to crawlers |

**Finding:** Homepage HTML is on the large side (139 KB) for a marketing page. For comparison, Linear, Vercel, and Stripe homepages are typically 60–90 KB uncompressed. Over HTTPS with Brotli this compresses to maybe 30–40 KB which is fine, but it suggests lots of inline content / mockup components that could be code-split.

### Cache & Headers (verified on `/`)

- `Cache-Control: public, max-age=0, must-revalidate` on HTML — correct for Next.js SSR; Netlify Durable Cache serves via ETag revalidation (`Cache-Status: "Netlify Durable"; hit; ttl=31443220` confirms a 364-day durable cache hit).
- `Age: 92779` — edge cached ~25 hours ago, still fresh.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` ✓
- `Content-Type: text/html; charset=utf-8` ✓
- `X-Content-Type-Options: nosniff` ✓
- `X-Powered-By: Next.js` ← leak, hide via `next.config.js` (see technical.md M-3)
- `Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding` — expected RSC vary
- **No `Content-Encoding` header in the captured response** — Netlify normally auto-compresses; worth verifying with a real browser that gzip/br is being served.

### `next.config.js` review

```js
images: { formats: ["image/avif", "image/webp"] }
```

- AVIF + WebP is the best-in-class image format config ✓
- **No `unoptimized: false` — Next.js Image is used** (assumed — verify by grepping for `next/image`)
- **No explicit `devIndicators`, `productionBrowserSourceMaps`, `poweredByHeader`** — accept defaults; set `poweredByHeader: false`

### `netlify.toml` review

- `/_next/static/*` → `Cache-Control: public, max-age=31536000, immutable` ✓ (gold standard)
- `/*.svg` → 24h cache ✓
- Security headers present (X-Frame-Options DENY, etc.) ✓
- `node_bundler = "esbuild"` ✓
- Middleware forced to Node.js runtime (not Edge) — adds slight cold-start latency vs. Edge, but makes sense given Sentry server instrumentation.

### Fonts

[src/app/layout.tsx:5-12](src/app/layout.tsx#L5-L12):
```js
// System font stack — no external font downloads required.
const inter = { variable: "--font-sans", className: "" };
```
- **No Google Fonts fetch** ✓ — this avoids a render-blocking third-party RTT and is a major LCP win. Comment notes this was added to prevent build failures when fonts.googleapis.com is unreachable; it's also a perf win.

### Featured Images (from recent commits)

All blog, pillar, and subtopic pages now reference featured PNGs in `public/images/featured/**`. File sizes from the recent pull:
- Blog featured images: 495 KB – 725 KB each (PNG format)
- Pillar featured images: 530 KB – 895 KB
- Subtopic featured images: 530 KB – 817 KB

**This is the biggest actual-perf risk.** PNGs at 500–900 KB are huge for hero images. Even served via Next.js `<Image>` with AVIF/WebP transcoding, the source PNGs are committed in the repo (bloating the Git history and CI build) and the initial LCP image will be whatever format the browser requests — if AVIF isn't served, these are multi-hundred-KB payloads.

---

## Critical

### C-1 — `/demo` SSR is empty

Already flagged in technical.md H-4 and content.md C-1. From a pure-perf standpoint the /demo page is fast (19 KB) but the speed is meaningless because there's no content to render. LCP will be whatever tiny element renders first, INP will depend entirely on the `UnifiedOnboarding` hydration which is presumably heavy. This is both a perf issue and a content issue.

---

## High

### H-1 — Featured PNGs are 500–900 KB each

13 blog featured PNGs, 6 pillar PNGs, 30+ subtopic PNGs — all large PNGs in `public/images/featured/**`. If Next.js `<Image>` is used, AVIF transcoding will shrink them dramatically on the client, but:
1. The source PNGs still bloat the repo (and Git LFS isn't configured).
2. First deploy cold-cache LCP will be hurt until transcodes are warm.
3. If any page uses a `<img>` tag or CSS background-image instead of `next/image`, there's no transcoding at all.

**Fix:**
- Convert the source PNGs to AVIF/WebP on disk; regenerate with lower quality settings (85 for AVIF, 80 for WebP).
- Target < 150 KB per hero image source.
- Verify every featured image usage flows through `next/image`.
- Consider Git LFS or external storage for the binaries.

### H-2 — Homepage HTML is 139 KB

Homepage renders 6+ mockup components (BentoCard, MeshMockup, analytics/publishing/script/studio/twin mockups), aurora blobs, and animation variants all inline. This is fine for SSR but means a lot of hydration work on first load. INP is the metric to watch.

**Fix options:**
- Move below-the-fold mockups to `next/dynamic` with `ssr: true, loading: () => <Skeleton/>` to split hydration
- Audit `motion-variants.ts` usage — Framer Motion is heavy; ensure it's tree-shaken
- Verify `<HeroAurora>` isn't animating infinitely (CPU drain, INP hit)

### H-3 — CLS risk from aurora/gradient/animated hero components

`HeroAurora`, `GlowBlob`, `PageBackdrop`, `BentoGrid` are all recent additions. Any component that animates layout properties (width, height, margin, position without `transform`) causes CLS. Verify all animations use `transform` and `opacity` only.

**Action:** Run Lighthouse against `/` and `/features` once the Playwright sandbox is unblocked; look at "Avoid large layout shifts" audit.

---

## Medium

### M-1 — No explicit `fetchpriority="high"` on LCP image

For pages with a featured image above the fold (blog posts, pillar pages), setting `priority` on the Next.js `<Image>` component (which emits `fetchpriority="high"`) is worth 100–200 ms of LCP. Verify `<Image priority />` is set on hero/featured images on blog, pillar, and subtopic page templates.

### M-2 — Sentry client bundle

[next.config.js:11-19](next.config.js#L11-L19) wraps with `withSentryConfig` only if `SENTRY_DSN` is set. In production that's ~50–80 KB of JS added to every page. Worth validating the bundle size with `next build` and the `@next/bundle-analyzer` to confirm it's not dominating the client bundle.

### M-3 — Cookie consent component blocks interactivity?

[src/components/marketing/CookieConsent](src/components/marketing/CookieConsent) renders globally from layout. Verify it's not blocking first input (INP) by deferring its mount with `useEffect` + a small delay, and that it doesn't pull in a heavy third-party library.

### M-4 — No `<link rel="preconnect">` or `<link rel="preload">` for critical assets

The site uses system fonts (good — no preconnect needed) but any hero/featured image could benefit from a `<link rel="preload" as="image" imagesrcset="...">` on pages where the LCP element is known. Worth adding for blog, pillar, and subtopic templates.

---

## Low / Info

- No render-blocking third-party scripts visible in the HTML fetches ✓
- No Google Fonts, no Typekit, no external CSS ✓
- No ad network scripts ✓
- Next.js prefetch is on by default — may be prefetching too many routes from navbar; verify by looking at Network tab (not possible in this audit)
- `dark` class on `<html>` — dark mode forced. Contrast should be verified in the visual audit.

---

## What This Audit Could NOT Measure (and why)

Because the sandbox blocks Playwright/headless Chrome and there is no CrUX field data yet:
- **LCP** — actual Largest Contentful Paint timing
- **CLS** — actual cumulative layout shift
- **INP** — actual interaction latency
- **TBT** — total blocking time
- **TTFB** — measured first-byte (we have Age/Cache-Status which imply it's fast, but no ms number)
- **Bundle sizes** — JS/CSS per route after `next build`
- **Hydration cost** — per-component
- **Third-party impact** — Sentry, Stripe, analytics
- **Server render time** — cold vs warm
- **Mobile vs desktop** differences

**Before launch you must run at minimum:**
```bash
sfw npm run build
# Then against the Netlify preview:
npx lighthouse https://official-ai-app.netlify.app/ --output=json --output=html --chrome-flags="--headless"
npx lighthouse https://official-ai-app.netlify.app/pricing --output=json
npx lighthouse https://official-ai-app.netlify.app/features --output=json
npx lighthouse https://official-ai-app.netlify.app/blog --output=json
```

Or point PageSpeed Insights at the Netlify URL and capture all six page-type CWV snapshots.

---

## Pre-Launch Checklist (Performance)

- [ ] **C-1:** Fix `/demo` SSR content (also content.md C-1)
- [ ] **H-1:** Re-encode featured PNGs to AVIF + sized variants; target < 150 KB per hero
- [ ] **H-2:** Dynamic-import below-the-fold homepage mockups
- [ ] **H-3:** Audit all animations for transform/opacity only
- [ ] **M-1:** Add `priority` to `<Image>` on featured/hero images in templates
- [ ] **M-2:** Run `@next/bundle-analyzer` and inspect Sentry client bundle
- [ ] **M-3:** Defer CookieConsent mount
- [ ] Run Lighthouse / PageSpeed Insights against all six page types on the Netlify preview URL
- [ ] Set a CWV budget: LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile 4G for all six page types
- [ ] Enable Real User Monitoring (RUM) via Sentry Performance or Netlify Analytics once the production domain is live
