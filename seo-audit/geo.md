# GEO / AI Search Audit — Official AI

**Audit date:** 2026-04-10
**Method:** Inspection of `/robots.txt`, `/llms.txt`, the `llms.txt` and `llms-full.txt` route handlers, page-level HTML for citability signals, and content data files.
**Planned production:** https://www.theofficial.ai/

## Summary

Official AI has done more GEO (Generative Engine Optimization) work than most pre-launch sites: both `/llms.txt` and a `/llms-full.txt` route are implemented, the blog/pillar/subtopic structure provides dense citable passages, and JSON-LD is present on every page. The critical gaps are: (1) **robots.txt does not explicitly allow AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, Applebot-Extended, Bingbot) — today's `User-agent: *` + `Allow: /` is permissive by default, but many organizations expect explicit allow-lines and some AI bots check for specific directives; (2) every llms.txt and llms-full.txt URL uses the wrong domain `officialai.com`; (3) there's no brand mention or entity graph yet (site isn't indexed), and no `sameAs` backbone pointing at verifiable third-party profiles; (4) the fabricated 4.9/200 aggregateRating will actively hurt LLM trust — Perplexity and ChatGPT both look at schema review data.

## Score: **61 / 100**

---

## AI Crawler Access Table

Crawled `/robots.txt`:

| Bot | Status | Notes |
|---|---|---|
| GPTBot (OpenAI — training) | Implicitly allowed via `*` | Add explicit allow |
| ChatGPT-User (user-triggered) | Implicitly allowed via `*` | Add explicit allow |
| OAI-SearchBot (OpenAI search index) | Implicitly allowed via `*` | Add explicit allow |
| ClaudeBot (Anthropic — training) | Implicitly allowed via `*` | Add explicit allow |
| Claude-Web (Anthropic — user-triggered) | Implicitly allowed via `*` | Add explicit allow |
| PerplexityBot | Implicitly allowed via `*` | Add explicit allow |
| Perplexity-User | Implicitly allowed via `*` | Add explicit allow |
| Google-Extended (Google AI / Gemini training) | Implicitly allowed via `*` | Add explicit allow |
| Applebot-Extended (Apple Intelligence) | Implicitly allowed via `*` | Add explicit allow |
| Bingbot | Implicitly allowed via `*` | ✓ |
| Amazonbot | Implicitly allowed via `*` | ✓ |
| Meta-ExternalAgent (Meta AI) | Implicitly allowed via `*` | Add explicit allow |

The `*` wildcard technically covers all of these, but: (a) many SEO/GEO tools flag sites that don't explicitly name AI bots as "unknown policy"; (b) some bots (notably GPTBot and Google-Extended) have been observed to pick up explicit directives more reliably; (c) explicit allow-lines make your intent obvious and give you a single place to flip later if you want to opt out of training while staying in search indexes.

**Recommended `robots.txt` additions:**

```
# AI search & training bots — explicitly allow
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Amazonbot
Allow: /
```

---

## llms.txt Status

- **`/llms.txt`** ✓ — exists at [src/app/llms.txt/route.ts](src/app/llms.txt/route.ts), 830 bytes, lists homepage, features, pricing, how-it-works, about, demo, compare, use-cases, industry pages, blog, multi-cut method post, email.
- **`/llms-full.txt`** ✓ — exists at [src/app/llms-full.txt/route.ts](src/app/llms-full.txt/route.ts), expanded version with descriptions per URL.
- **Critical issue:** every URL in both files references `https://officialai.com` (wrong domain). See technical.md C-1.
- **Minor issue:** `/llms.txt` is incomplete — it's missing the 12 other blog posts, all pillar pages, all subtopic pages, all compare-slug pages, all feature-slug pages, and all tool pages. `/llms-full.txt` is slightly more complete but also out of date.
- **Also:** `public/robots.txt` uses non-standard directives `LLMs-Txt:` and `LLMs-Full-Txt:` — these are not formal robots.txt standards, so most bots will ignore them, but they're harmless and a few GEO tools recognize them.

**Fix:**
1. Regenerate `/llms.txt` and `/llms-full.txt` dynamically from your data files (`blog-posts.ts`, `competitors.ts`, `features.ts`, `topic-libraries.ts`) so they always stay current.
2. Fix the hardcoded domain.
3. Add a one-line site description and brand voice at the top.

---

## Citability Assessment

For AI search engines (AI Overviews, ChatGPT web search, Perplexity, Bing Copilot) to cite a page, the content needs:
1. **Clear definitions** at the top ("X is a Y that does Z")
2. **Short, quotable passages** (≤ 60 words)
3. **Sourced statistics**
4. **Well-structured headings** (H2/H3 hierarchy)
5. **Tables and lists** for comparison content
6. **An answer before the argument** — direct answer first, supporting paragraphs second

### Per page type

| Page | Citability | Notes |
|---|---|---|
| `/` (homepage) | Low | Marketing page — lots of mockups and CTAs, little definition-style content. Low citation probability. Expected. |
| `/features` | Medium | Feature list is quotable. Add a one-line definition of each feature at the top of its section. |
| `/how-it-works` | Medium-High | Process content is naturally citable. Verify each step has a clear title + a one-paragraph answer. |
| `/about` | Low | No sourced facts to cite. E-E-A-T improves the brand entity but the page itself won't be cited. |
| `/blog/[slug]` | Medium-High | Long-form posts are the best citation targets. Add a 1-sentence TL;DR at the top of each post, plus sourced stats throughout. |
| `/compare/[slug]` | High | Competitor comparisons are one of the highest-citation page types in AI search. Feature tables are gold. The existing FAQPage schema helps here even though Google won't show rich results. |
| `/for/[industry]` | Medium | Industry pages have use-case lists — quotable. Add a 1-sentence definition of "what AI video looks like for [industry]" at the top. |
| `/[pillar]` | Medium | Pillar pages are supposed to be the citation hub. The generic `PlaceholderContent` fallback (see content.md C-2) hurts this badly. Fix by writing real pillar content with definition-first paragraphs. |
| `/[pillar]/[subtopic]` | Medium | Same as pillars — subtopic pages with real content are citable, placeholder ones are not. |
| `/tools/[tool]` | Medium | Calculator pages are citable if they explain the methodology. Add "How this works" and "What it calculates" sections. |

---

## Brand Mention Signals

The site is pre-launch, so by definition there are no live brand mentions yet. But the signals that *will* drive AI search citation once live should be set up now:

### Present
- Consistent brand name "Official AI" across every page ✓
- Organization schema on every page ✓
- Social links in Organization `sameAs` (Twitter, LinkedIn) ✓

### Missing
- **No third-party profile verification** — the `sameAs` Twitter and LinkedIn URLs use `officialai.com` slugs which may not even be owned. Verify @theofficialai handles are secured on Twitter, LinkedIn, YouTube, GitHub, Product Hunt, G2, Capterra, Crunchbase.
- **No press / mentions strip** on the homepage — once you have any coverage, feature "As seen in" logos.
- **No author pages** tying blog posts to human experts.
- **No Wikipedia/Wikidata entry** — once you've launched and have one credible press mention, create a Crunchbase entry at minimum; AI models use Crunchbase heavily for SaaS.
- **No Product Hunt launch** scheduled — Product Hunt is one of the highest-signal sources for AI models about new SaaS.

---

## Platform-Specific Optimization

### Google AI Overviews
- ✓ Structured data present
- ✗ Fabricated aggregateRating will be a negative signal
- ✗ Missing Product schema on pricing page
- ✗ No TL;DR answer at the top of blog posts
- ✗ Author signals weak
- **Priority:** Fix schema first, then add definition-first intros to content.

### ChatGPT Web Search + OAI-SearchBot
- ✓ llms.txt present
- ✗ llms.txt URLs wrong + incomplete
- ✗ Pillar/subtopic placeholder content is a negative signal (thin)
- **Priority:** Fix llms.txt, then replace placeholder content.

### Perplexity
- ✓ FAQPage schema helps despite not being a Google rich result
- ✗ Relies heavily on real-time fetch — site speed and CWV matter (see performance.md)
- ✗ Prefers cited statistics — the unsourced "1200% more shares" claim will be ignored or penalized
- **Priority:** Source every statistic on the site or remove it.

### Bing Copilot
- ✓ Bing uses schema + IndexNow aggressively
- ✗ No IndexNow key file detected
- ✗ Bing Webmaster Tools not yet registered (pre-launch — do it on launch day)
- **Priority:** Add IndexNow key file, register BWT on launch.

### Apple Intelligence (on-device summarization)
- ✓ Applebot-Extended implicitly allowed
- Low near-term impact; no specific action needed.

---

## Critical

### C-1 — llms.txt and llms-full.txt use wrong domain (repeats C-1 from technical)

All URLs in `/llms.txt` and `/llms-full.txt` point at `officialai.com`. Fix via the global domain swap.

### C-2 — Fabricated `aggregateRating` hurts AI search trust

[src/app/layout.tsx:93-98](src/app/layout.tsx#L93-L98) — 4.9/200 is emitted on every URL. AI search engines actively weight review schema. If these aren't real and verifiable, they become a trust penalty. Remove until backed by real review data.

### C-3 — Pillar/subtopic placeholder content is thin

Placeholder fallback content emits duplicate boilerplate on pillar/subtopic pages that lack a real content module. LLMs treat near-duplicate pages as low-value and will not cite them. Covered in content.md C-2.

---

## High

### H-1 — No explicit AI bot allow-lines in `robots.txt`

Add the block shown above. Low-effort, moderate-impact GEO signal.

### H-2 — Incomplete llms.txt files

Both files are manually maintained and out of sync with the actual sitemap. Refactor both routes to generate from `blog-posts.ts`, `competitors.ts`, `features.ts`, and `topic-libraries.ts`.

### H-3 — No definition-first intros on key content pages

Add a 1–3 sentence TL;DR at the top of every blog post, every pillar page, every subtopic page, and every industry page. Format: "What is X? X is Y that does Z. Here's what matters:". This is the single highest-ROI GEO edit.

### H-4 — No sourced statistics

Audit every claim on the site. Every number ("1200% more shares", "30 videos", "5x engagement") needs either a source link or a self-source ("based on Official AI customer data from X-Y period"). LLMs filter out unsourced claims.

---

## Medium

### M-1 — No author entity graph

Blog posts have `author: "Author Name"` but no linked Person entity, no author page, no author sameAs. Create `/authors/[slug]` pages for every named author with bio, social links, and post history. Then link from each post.

### M-2 — `sameAs` URLs may be unclaimed handles

Verify `twitter.com/officialai` and `linkedin.com/company/officialai` are owned (they use the wrong-domain brand handle). If not, claim `@theofficialai` on every platform before launch and update Organization schema.

### M-3 — No IndexNow key file

IndexNow lets Bing, Yandex, Seznam, Naver etc. index new/changed URLs instantly. Add a key file at `/[your-key].txt` and integrate with the build pipeline to ping the IndexNow API on content publishes.

### M-4 — No `knowsAbout` on Organization schema

Add a `knowsAbout` array to Organization schema with your topic entities: "AI video generation", "AI avatars", "Voice cloning", "Social media automation", "Content marketing for professional services".

---

## Low / Info

- Cookie consent present ✓ (doesn't block crawlers but verify it's not `display: none`-ing content)
- No reCAPTCHA or Cloudflare challenge on the live site ✓ (these block AI bots)
- No meta `noai`/`noimageai` — good for current GEO strategy of being cited

---

## Pre-Launch Checklist (GEO)

- [ ] **C-1:** Global domain swap (ties to technical.md C-1)
- [ ] **C-2:** Remove fabricated aggregateRating
- [ ] **C-3:** Replace pillar/subtopic placeholder content with real modules
- [ ] **H-1:** Add explicit AI bot allow-lines to `robots.txt`
- [ ] **H-2:** Dynamically generate `/llms.txt` and `/llms-full.txt` from data files
- [ ] **H-3:** Add TL;DR/definition intros to all blog posts, pillars, subtopics, and industry pages
- [ ] **H-4:** Source every statistic on the site
- [ ] **M-1:** Create author entity pages
- [ ] **M-2:** Verify `sameAs` social handles exist and are owned
- [ ] **M-3:** Add IndexNow key file and API integration
- [ ] **M-4:** Add `knowsAbout` to Organization schema
- [ ] Create Crunchbase, G2, Capterra, Product Hunt profiles on launch day
- [ ] Register in Bing Webmaster Tools (for Copilot), Search Console (for AI Overviews)
