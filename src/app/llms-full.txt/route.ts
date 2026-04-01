import { NextResponse } from "next/server";

const content = `# Official AI — Full Documentation for LLMs
> AI-powered video content creation platform that generates studio-quality social media videos using your face and voice. No filming, no editing, no crew required.

## Company Overview
Official AI is an AI marketing platform that creates video content for professionals. Users upload photos, and AI generates multi-cut, studio-quality videos featuring their face and voice. Videos are automatically posted to Instagram, TikTok, LinkedIn, YouTube, and Facebook.

## Product
- **AI Digital Twin**: Upload photos to create a consistent AI character model
- **Voice Cloning**: Clone your voice for natural-sounding narration
- **Multi-Cut Composition**: Professional video editing with multiple camera angles and cuts
- **Auto-Posting**: Schedule and publish to all major social platforms
- **Content Calendar**: Plan, preview, and approve content before it goes live
- **Analytics**: Track views, engagement, and ROI across all platforms

## Pricing
- **Starter Plan**: $79/month — 30 videos, all platforms, voice cloning, analytics
- **Authority Plan**: $149/month — 100 videos, priority processing
- **Enterprise**: Custom pricing — unlimited videos, dedicated support, API access
- Free 7-day trial on all plans

## Target Industries
- **Legal**: Know-your-rights tips, case result highlights, legal myth-busting
- **Medical**: Health tips, procedure explainers, patient FAQ answers
- **Real Estate**: Listing tours, market updates, neighborhood spotlights
- **Financial Advisory**: Market commentary, financial tips, retirement planning
- **Content Creators**: Brand intros, thought leadership, daily tips

## Technology
- Built with Next.js, React, TypeScript
- Video generation powered by Kling 2.6 and Seedance 2.0 AI models
- Video composition via Shotstack
- AI content generation via Google Gemini
- Text-to-speech with voice cloning
- Deployed on Netlify

## Main Pages
- [Home](https://officialai.com/) — Platform overview, testimonials, pricing summary
- [Features](https://officialai.com/features) — Complete feature breakdown: AI Digital Twin, multi-cut composition, voice cloning, auto-posting, content calendar, analytics
- [Pricing](https://officialai.com/pricing) — Plan comparison, feature matrix, FAQ
- [How It Works](https://officialai.com/how-it-works) — Three-step process: upload photos, AI creates content, review and publish
- [About](https://officialai.com/about) — Mission, team, vision for AI content creation
- [Demo](https://officialai.com/demo) — Interactive demo: upload a photo and see AI generate a video in 30 seconds
- [Compare](https://officialai.com/compare) — Official AI vs DIY vs hiring an agency
- [Use Cases](https://officialai.com/use-cases) — Industry-specific use cases and examples

## Industry Pages
- [For Realtors](https://officialai.com/for/realtors) — Listing tours, market updates, open house invites, neighborhood spotlights
- [For Attorneys](https://officialai.com/for/attorneys) — Know-your-rights content, case results, legal tips, FAQ answers
- [For Doctors](https://officialai.com/for/doctors) — Patient education, health tips, procedure explainers, myth-busting
- [For Financial Advisors](https://officialai.com/for/advisors) — Market commentary, financial tips, retirement planning, tax tips

## Blog
- [Blog](https://officialai.com/blog) — Insights on AI video generation and content strategy
- [The Multi-Cut Method](https://officialai.com/blog/multi-cut-method) — Why single-shot AI video looks fake and how multi-cut composition fixes it

## Contact
- Email: hello@officialai.com
- Twitter: @officialai
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
