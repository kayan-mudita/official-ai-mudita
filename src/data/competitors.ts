export interface CompetitorRow {
  label: string;
  competitor: string;
  official: string;
}

export interface CompetitorStat {
  value: string;
  label: string;
  caption?: string;
  accent?: "utility" | "special" | "mix";
}

export interface Competitor {
  slug: string;
  name: string;
  tagline: string;
  metaDescription: string;
  // Hero copy
  hookHeadline: string;
  hookSub: string;
  // Positioning
  whoItsFor: string;
  whereItFalls: string;
  // Differentiator pitch
  whyOfficial: string[];
  // Featured stats — Official AI's advantages, shown under hero
  featuredStats: CompetitorStat[];
  // Comparison rows
  rows: CompetitorRow[];
  // FAQs
  faqs: { q: string; a: string }[];
}

// Naming convention: slug is `vs-<competitor>` so URLs read /compare/vs-heygen
export const competitors: Competitor[] = [
  {
    slug: "vs-heygen",
    name: "HeyGen",
    tagline: "Studio-grade avatars vs. an end-to-end content engine",
    metaDescription:
      "Official AI vs HeyGen: pricing, features, and which AI video tool actually posts your content for you. See the full comparison.",
    hookHeadline: "HeyGen makes avatars. Official AI runs your content.",
    hookSub:
      "HeyGen is a powerful avatar generator. Official AI is the full pipeline — script, video, captions, and auto-posting in one workflow.",
    whoItsFor:
      "HeyGen is built for marketing teams who need polished avatar videos and have someone to write scripts, edit, and publish them.",
    whereItFalls:
      "If you're a solo professional, HeyGen leaves you doing all the work around the avatar — writing, captioning, scheduling, and posting across five platforms every week.",
    whyOfficial: [
      "AI writes your scripts in your voice — you just approve",
      "Auto-posts to LinkedIn, TikTok, Instagram, YouTube Shorts, and X",
      "Flat $79/mo replaces a $300+/mo HeyGen Creator plan plus your scheduling stack",
      "Built for personal brands, not enterprise marketing departments",
    ],
    featuredStats: [
      {
        value: "30",
        label: "Videos / month",
        caption: "vs 10 on HeyGen Creator",
        accent: "utility",
      },
      {
        value: "5 min",
        label: "Setup",
        caption: "vs 30+ min per video on HeyGen",
        accent: "mix",
      },
      {
        value: "$79",
        label: "Flat / month",
        caption: "Replaces $300+/mo HeyGen + scheduler",
        accent: "special",
      },
    ],
    rows: [
      { label: "Starting price", competitor: "$29/mo (limited)", official: "$79/mo" },
      { label: "Videos per month", competitor: "10 (Creator tier)", official: "30" },
      { label: "AI script writing", competitor: "Add-on", official: "Included" },
      { label: "Auto-posting to socials", competitor: "no", official: "yes" },
      { label: "Multi-platform scheduling", competitor: "no", official: "yes" },
      { label: "Built-in analytics", competitor: "Limited", official: "Real-time" },
      { label: "Setup time", competitor: "30+ min per video", official: "5 min once" },
      { label: "Made for solo professionals", competitor: "no", official: "yes" },
    ],
    faqs: [
      {
        q: "Is Official AI a HeyGen alternative?",
        a: "Yes — but it solves a different problem. HeyGen is best if you only need to generate avatar clips and your team handles everything else. Official AI replaces your script writer, video editor, and social scheduler in one flat-rate workflow.",
      },
      {
        q: "Can I use my own face like in HeyGen?",
        a: "Yes. Upload one photo and Official AI builds a personal avatar that looks and sounds like you, no studio session required.",
      },
    ],
  },
  {
    slug: "vs-synthesia",
    name: "Synthesia",
    tagline: "Enterprise training video vs. personal-brand content",
    metaDescription:
      "Official AI vs Synthesia: see which AI video platform fits a solo professional posting on social vs. an enterprise training team.",
    hookHeadline: "Synthesia trains employees. Official AI grows your audience.",
    hookSub:
      "Synthesia is built for L&D and enterprise comms. Official AI is built for the realtor, lawyer, advisor, or doctor who wants a daily presence on social media.",
    whoItsFor:
      "Synthesia is excellent for HR teams shipping training videos in 140+ languages.",
    whereItFalls:
      "It's overkill — and overpriced — if your goal is short-form social content. Synthesia's plans start around $30/mo for just 10 minutes of video and require manual download/upload to every platform.",
    whyOfficial: [
      "Optimized for vertical short-form, not corporate landscape training",
      "Includes social hooks, captions, and auto-posting",
      "$79 flat replaces $90+/mo Synthesia plus a separate scheduler",
      "5-minute setup vs. building a stock-avatar library",
    ],
    featuredStats: [
      {
        value: "30",
        label: "Videos / month",
        caption: "vs 10 minutes on Synthesia entry tier",
        accent: "utility",
      },
      {
        value: "9:16",
        label: "Vertical format",
        caption: "Built for short-form, not landscape training",
        accent: "mix",
      },
      {
        value: "1 photo",
        label: "Personal twin",
        caption: "Built from one selfie, no stock library",
        accent: "special",
      },
    ],
    rows: [
      { label: "Starting price", competitor: "$29/mo (10 min)", official: "$79/mo (30 videos)" },
      { label: "Format focus", competitor: "Landscape training", official: "Vertical short-form" },
      { label: "AI script writing", competitor: "Basic", official: "Trained on your voice" },
      { label: "Auto-posting", competitor: "no", official: "yes" },
      { label: "Personal avatar from one photo", competitor: "Premium tier only", official: "yes" },
      { label: "Built for solo creators", competitor: "no", official: "yes" },
      { label: "Real-time social analytics", competitor: "no", official: "yes" },
    ],
    faqs: [
      {
        q: "Can Synthesia post videos to my social accounts?",
        a: "No. Synthesia generates the video file — you still have to download it and post it manually on each platform. Official AI handles posting and scheduling.",
      },
      {
        q: "Is Official AI cheaper than Synthesia?",
        a: "For social-content use cases, yes. Synthesia's entry plan caps you at 10 minutes/month. Official AI gives you 30 finished, ready-to-post videos for $79.",
      },
    ],
  },
  {
    slug: "vs-captions",
    name: "Captions",
    tagline: "Editing app vs. full content workflow",
    metaDescription:
      "Official AI vs Captions: compare AI video editor pricing and features. See why solo professionals pick the all-in-one workflow.",
    hookHeadline: "Captions edits clips. Official AI makes them for you.",
    hookSub:
      "Captions is a great editor if you're already filming. Official AI is for the people who don't want to film at all.",
    whoItsFor:
      "Captions is built for creators who already shoot phone footage and want AI to clean it up — eye contact, captions, B-roll.",
    whereItFalls:
      "If your problem is 'I never have time to film,' an editor doesn't fix it. You need video that gets generated, captioned, and posted without you ever pressing record.",
    whyOfficial: [
      "No filming required — your AI twin records for you",
      "Scripts written in your voice from a single brand brief",
      "Auto-posts across five platforms",
      "Predictable flat $79/mo, not per-seat creator pricing",
    ],
    featuredStats: [
      {
        value: "0 min",
        label: "Filming time",
        caption: "Your AI twin records — never press play",
        accent: "utility",
      },
      {
        value: "Full",
        label: "Talking avatar",
        caption: "Not lip-sync only like Captions",
        accent: "mix",
      },
      {
        value: "5",
        label: "Platforms auto-posted",
        caption: "Captions stops at the export button",
        accent: "special",
      },
    ],
    rows: [
      { label: "Requires you to film", competitor: "yes", official: "no" },
      { label: "AI avatar of you", competitor: "Limited (lip-sync only)", official: "Full talking avatar" },
      { label: "AI script writing", competitor: "no", official: "yes" },
      { label: "Auto-posting", competitor: "no", official: "yes" },
      { label: "Best for", competitor: "Hobbyist creators", official: "Busy professionals" },
      { label: "Starting price", competitor: "$10–$30/mo", official: "$79/mo all-in" },
    ],
    faqs: [
      {
        q: "Can Captions generate a video without me filming?",
        a: "Captions has limited AI avatar features but is primarily an editor. Official AI is built avatar-first — you never need to record.",
      },
    ],
  },
  {
    slug: "vs-descript",
    name: "Descript",
    tagline: "Podcast & long-form editor vs. short-form content engine",
    metaDescription:
      "Official AI vs Descript: see which platform actually fits short-form social video for solo professionals.",
    hookHeadline: "Descript edits podcasts. Official AI ships short-form daily.",
    hookSub:
      "Descript is a powerhouse for editing existing audio and video. Official AI is built to generate brand-new short-form content every week — no source files needed.",
    whoItsFor:
      "Descript is excellent for podcasters and YouTubers who already have raw recordings to clean up.",
    whereItFalls:
      "If you don't have hours of raw recordings, Descript has nothing to edit. Official AI generates the video from scratch using your AI twin.",
    whyOfficial: [
      "Generates video from a topic, not a recording",
      "Optimized for vertical 30-60s short-form",
      "Auto-posting to LinkedIn, TikTok, IG, YT Shorts, X",
      "No editing skills required",
    ],
    featuredStats: [
      {
        value: "0 files",
        label: "Source needed",
        caption: "Generates net-new — no recordings to edit",
        accent: "utility",
      },
      {
        value: "9:16",
        label: "Short-form first",
        caption: "Built for vertical 30-60s, not long-form",
        accent: "mix",
      },
      {
        value: "None",
        label: "Editing skill",
        caption: "No timeline, no waveforms, no learning curve",
        accent: "special",
      },
    ],
    rows: [
      { label: "Generates net-new video", competitor: "no", official: "yes" },
      { label: "Personal AI avatar", competitor: "no", official: "yes" },
      { label: "Auto-posting", competitor: "no", official: "yes" },
      { label: "Best format", competitor: "Long-form podcasts", official: "Short-form social" },
      { label: "Editing skill required", competitor: "Moderate", official: "None" },
      { label: "Pricing", competitor: "$24+/mo", official: "$79/mo all-in" },
    ],
    faqs: [
      {
        q: "Can I use Descript and Official AI together?",
        a: "Absolutely. Many creators use Descript for long-form podcast editing and Official AI for short-form distribution.",
      },
    ],
  },
  {
    slug: "vs-hourone",
    name: "Hour One",
    tagline: "Stock-avatar studio vs. your personal AI twin",
    metaDescription:
      "Official AI vs Hour One: compare AI avatar quality, posting workflow, and pricing for solo professionals.",
    hookHeadline: "Hour One uses stock avatars. Official AI is you.",
    hookSub:
      "Hour One ships polished generic presenters. Official AI builds an avatar that is recognizably you — same face, same voice.",
    whoItsFor:
      "Hour One is built for businesses producing how-to and explainer videos at scale with library presenters.",
    whereItFalls:
      "If your audience is following you for you, a stock avatar is the wrong fit. Personal brands need a personal twin.",
    whyOfficial: [
      "Avatar built from your photos, not a stock library",
      "Voice cloned from a 60-second sample",
      "Auto-posting and scheduling included",
      "One flat plan, no enterprise quote needed",
    ],
    featuredStats: [
      {
        value: "Yours",
        label: "Avatar built from",
        caption: "Your photos — not a stock library presenter",
        accent: "utility",
      },
      {
        value: "60s",
        label: "Voice clone sample",
        caption: "Cloned and included on every plan",
        accent: "mix",
      },
      {
        value: "$79",
        label: "Flat / month",
        caption: "Transparent — no enterprise quote needed",
        accent: "special",
      },
    ],
    rows: [
      { label: "Personal avatar (your face)", competitor: "Limited", official: "yes" },
      { label: "Voice cloning", competitor: "Premium add-on", official: "Included" },
      { label: "Auto-posting", competitor: "no", official: "yes" },
      { label: "Pricing transparency", competitor: "Quote-based", official: "$79 flat" },
      { label: "Best for", competitor: "Enterprise explainers", official: "Personal brands" },
    ],
    faqs: [
      {
        q: "Does Hour One support voice cloning?",
        a: "Hour One offers voice cloning on higher tiers. Official AI includes it on every plan.",
      },
    ],
  },
  {
    slug: "vs-d-id",
    name: "D-ID",
    tagline: "Avatar API vs. ready-to-ship content",
    metaDescription:
      "Official AI vs D-ID: see which platform delivers finished social content vs. raw avatar API output.",
    hookHeadline: "D-ID gives you an API. Official AI gives you a posting calendar.",
    hookSub:
      "D-ID is a developer-first avatar engine. Official AI is what you get when someone wraps that engine into a finished workflow for non-technical professionals.",
    whoItsFor:
      "D-ID is great for developers embedding talking heads inside their own apps.",
    whereItFalls:
      "If you don't want to write code or manage prompts, D-ID is the wrong layer. You need scripts, captions, hooks, and scheduling — not raw avatar generation.",
    whyOfficial: [
      "No code, no prompt engineering — just approve and post",
      "End-to-end pipeline: script → video → caption → publish",
      "Built-in social scheduling on five platforms",
      "Designed for non-technical solo professionals",
    ],
    featuredStats: [
      {
        value: "0 lines",
        label: "Code required",
        caption: "No API, no prompt engineering, no devs",
        accent: "utility",
      },
      {
        value: "End-to-end",
        label: "Pipeline",
        caption: "Script → video → caption → publish",
        accent: "mix",
      },
      {
        value: "5",
        label: "Platforms scheduled",
        caption: "Built-in posting where D-ID stops at the API",
        accent: "special",
      },
    ],
    rows: [
      { label: "Requires technical setup", competitor: "yes", official: "no" },
      { label: "Script writing included", competitor: "no", official: "yes" },
      { label: "Captioning included", competitor: "no", official: "yes" },
      { label: "Auto-posting", competitor: "no", official: "yes" },
      { label: "Best for", competitor: "Developers", official: "Solo professionals" },
    ],
    faqs: [
      {
        q: "Is Official AI built on D-ID?",
        a: "No. Official AI runs its own avatar pipeline optimized for short-form social video.",
      },
    ],
  },
];

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
  return competitors.map((c) => c.slug);
}
