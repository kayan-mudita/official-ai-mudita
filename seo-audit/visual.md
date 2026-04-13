# Visual / Mobile Audit — Official AI

**Audit date:** 2026-04-10
**Status:** ⚠ **BLOCKED — requires manual run**

## Why this audit is incomplete

The visual audit requires Playwright (headless Chromium) to capture desktop + mobile screenshots and measure above-the-fold, tap targets, contrast, and layout issues. The Playwright subagent was blocked by sandbox restrictions on both Bash and Write tools, and the main session does not have a working Playwright install to fall back on.

**This is the one category where a live browser is required** — there's no HTML-only substitute for actually rendering the page.

## What you should do instead

Run either of the following locally with sandbox bypass:

### Option A — Lighthouse + Playwright (recommended)

```bash
# From repo root
sfw npm i -D playwright @playwright/test
npx playwright install chromium

# Capture screenshots
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const pages = [
    '/', '/pricing', '/features', '/how-it-works', '/about',
    '/blog', '/blog/ai-ugc-future', '/compare', '/compare/vs-heygen',
    '/for/advisors', '/for/attorneys', '/for/doctors', '/for/realtors',
    '/tools', '/tools/video-roi-calculator', '/demo', '/learn'
  ];
  for (const p of pages) {
    for (const viewport of [{w:1920,h:1080,name:'desktop'},{w:390,h:844,name:'mobile'}]) {
      const ctx = await browser.newContext({ viewport: { width: viewport.w, height: viewport.h } });
      const page = await ctx.newPage();
      await page.goto('https://official-ai-app.netlify.app' + p, { waitUntil: 'networkidle' });
      const name = p.replace(/\//g,'_') || '_index';
      await page.screenshot({ path: 'seo-audit/screenshots/' + viewport.name + name + '.png', fullPage: false });
      await ctx.close();
    }
  }
  await browser.close();
})();
"
```

### Option B — Quick manual check

Open these in desktop Chrome and in Chrome DevTools → Device Toolbar → iPhone 14 Pro:

1. `/` — above-the-fold content, hero headline + CTA, aurora performance
2. `/pricing` — tier cards on mobile (do they stack or overflow?)
3. `/features` — bento grid on mobile
4. `/blog/ai-ugc-future` — featured image + body readability
5. `/for/advisors` — industry hero + CTA
6. `/how-it-works` — three-step sequence on mobile
7. `/compare/vs-heygen` — comparison table on mobile (biggest risk of overflow)
8. `/tools/video-roi-calculator` — calculator usability on mobile
9. `/demo` — the client-only onboarding flow (known to have empty SSR — see content.md C-1)

## Known visual risks (from code inspection, unverified)

Based on reading the source without running the browser, these are worth checking specifically:

1. **Contrast over gradient backgrounds.** The site is dark-mode first (`<html class="dark">`) with heavy gradient/aurora backgrounds. Text placed directly over `HeroAurora` or `GlowBlob` components can drop below WCAG AA 4.5:1 contrast when the aurora color shifts. Test with Chrome DevTools Accessibility panel.

2. **Mockup components on mobile.** `AnalyticsMockup`, `PublishingMockup`, `ScriptMockup`, `StudioMockup`, `TwinMockup` all simulate a dashboard UI with fixed-width internal elements. On 375px viewports these can overflow horizontally unless wrapped in `overflow-x-hidden` or scaled with `transform: scale()`.

3. **BentoGrid responsive breakpoints.** Verify `BentoGrid` / `BentoCard` collapse to a single column under `md:` breakpoint.

4. **Pricing page tier cards.** Pricing tables are notorious for horizontal scroll on mobile. Verify.

5. **Compare pages tables.** `/compare/[slug]` likely has a feature-comparison table. Tables must scroll horizontally in their own container, not push the whole page wide.

6. **Tap target size.** Verify all buttons, nav items, and CTAs are ≥ 44×44 CSS pixels on mobile. The new `Navbar` component may have tight tap targets.

7. **Animated hero elements.** `HeroAurora` and `GlowBlob` animate continuously. On low-end devices this can cause INP spikes and drain battery. Verify the animations respect `prefers-reduced-motion`.

8. **Dark mode forced.** `<html class="dark">` forces dark mode regardless of system preference. For branding this is fine, but verify users who have OS-level dark mode disabled still get a readable experience.

9. **`/demo` visible content.** Because `/demo` is a client-only shell (19 KB HTML), the visible rendering depends entirely on client JS mounting. During slow-3G simulation, users may see a blank backdrop for a full second or more before `UnifiedOnboarding` mounts. Add a server-rendered skeleton.

10. **Cookie consent banner placement.** Verify the cookie consent doesn't cover the CTA on mobile landing pages.

## Pre-Launch Checklist (Visual)

- [ ] Run Playwright screenshot capture (Option A above) and save to `seo-audit/screenshots/`
- [ ] Review each desktop + mobile screenshot for overflow, clipping, contrast
- [ ] Verify all CTAs are visible above the fold on mobile (390×844)
- [ ] Test with Chrome DevTools accessibility panel for WCAG AA contrast
- [ ] Run Lighthouse mobile audit on all six page types
- [ ] Test with `prefers-reduced-motion: reduce` that animations disable correctly
- [ ] Verify tap target sizes on all interactive elements ≥ 44×44 CSS px
- [ ] Test cookie consent dismissal on mobile doesn't break layout
- [ ] Check `/demo` loading experience on throttled 3G
