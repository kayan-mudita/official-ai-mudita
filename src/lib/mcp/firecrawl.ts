/**
 * Firecrawl MCP Tool — Web scraping and extraction
 *
 * Provides Claude with the ability to scrape any URL and
 * extract structured data. Used to analyze the user's website,
 * competitor sites, and social profiles.
 */

import type { ToolDefinition } from "../openrouter-client";

// ─── Tool Definitions ─────────────────────────────────────────

export const firecrawlTools: ToolDefinition[] = [
  {
    name: "firecrawl_scrape",
    description:
      "Scrape a web page and extract its content as clean markdown or structured data. Use this to analyze a business website (services, positioning, team bios, testimonials), read a competitor's about page, or extract content from any URL.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to scrape",
        },
        extractSchema: {
          type: "object",
          description:
            "Optional JSON schema for structured extraction. Keys are field names, values are descriptions of what to extract. Example: { 'services': 'list of services offered', 'targetAudience': 'who they serve' }",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "firecrawl_map",
    description:
      "Get the sitemap/page listing of a website. Returns all discoverable URLs on the domain. Use this before scraping to find the most relevant pages (about, services, team, testimonials).",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The website URL to map (e.g. https://example.com)",
        },
        limit: {
          type: "number",
          description: "Max pages to return (1-50). Default: 20",
        },
      },
      required: ["url"],
    },
  },
];

// ─── Tool Execution Handlers ──────────────────────────────────

async function firecrawlFetch(
  endpoint: string,
  body: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`https://api.firecrawl.dev/v1/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return JSON.stringify({ error: `Firecrawl ${res.status}: ${err}` });
    }

    const data = await res.json();

    // For scrape: return markdown content (trimmed to save tokens)
    if (data.data?.markdown) {
      const markdown = data.data.markdown.slice(0, 3000);
      const extract = data.data.extract || null;
      return JSON.stringify({
        url: data.data.metadata?.url || body.url,
        title: data.data.metadata?.title || "",
        description: data.data.metadata?.description || "",
        markdown,
        extract,
      });
    }

    // For map: return URL list
    if (data.links) {
      return JSON.stringify({
        links: data.links.slice(0, 50),
        totalLinks: data.links.length,
      });
    }

    return JSON.stringify(data);
  } catch (e: any) {
    if (e.name === "AbortError") {
      return JSON.stringify({ error: "Firecrawl request timed out" });
    }
    return JSON.stringify({ error: e.message });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const firecrawlHandlers: Record<
  string,
  (input: Record<string, unknown>) => Promise<string>
> = {
  firecrawl_scrape: async (input) => {
    const body: Record<string, unknown> = {
      url: input.url,
      formats: ["markdown"],
    };

    if (input.extractSchema) {
      body.formats = ["markdown", "extract"];
      body.extract = { schema: input.extractSchema };
    }

    return firecrawlFetch("scrape", body);
  },

  firecrawl_map: async (input) => {
    return firecrawlFetch("map", {
      url: input.url,
      limit: Math.min(Number(input.limit) || 20, 50),
    });
  },
};
