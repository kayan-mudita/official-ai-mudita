import { NextResponse } from "next/server";

const content = `# Official AI
> AI-powered video content creation platform. Your face, your voice, no filming required.

## Main Pages
- [Home](https://officialai.com/)
- [Features](https://officialai.com/features)
- [Pricing](https://officialai.com/pricing)
- [How It Works](https://officialai.com/how-it-works)
- [About](https://officialai.com/about)
- [Demo](https://officialai.com/demo)
- [Compare](https://officialai.com/compare)
- [Use Cases](https://officialai.com/use-cases)

## Industry Pages
- [For Realtors](https://officialai.com/for/realtors)
- [For Attorneys](https://officialai.com/for/attorneys)
- [For Doctors](https://officialai.com/for/doctors)
- [For Financial Advisors](https://officialai.com/for/advisors)

## Blog
- [Blog](https://officialai.com/blog)
- [The Multi-Cut Method](https://officialai.com/blog/multi-cut-method)
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
