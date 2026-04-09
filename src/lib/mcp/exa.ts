/**
 * Exa MCP Tool — Semantic web search
 *
 * Provides Claude with a neural search tool that finds
 * relevant web content using meaning, not just keywords.
 * Used for competitor analysis, trend discovery, and
 * industry research.
 */

import type { ToolDefinition } from "../openrouter-client";

// ─── Tool Definitions ─────────────────────────────────────────

export const exaTools: ToolDefinition[] = [
  {
    name: "exa_search",
    description:
      "Search the web using neural/semantic search. Returns relevant web pages with content snippets. Use this to find competitors, industry trends, trending content topics, and market research. More powerful than keyword search — understands meaning and context.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Natural language search query. Be specific and descriptive for best results. Example: 'real estate agents using AI video content on Instagram 2026'",
        },
        numResults: {
          type: "number",
          description: "Number of results to return (1-10). Default: 5",
        },
        type: {
          type: "string",
          enum: ["neural", "keyword", "auto"],
          description:
            "Search type. 'neural' for semantic search, 'keyword' for exact match, 'auto' to let Exa decide. Default: neural",
        },
        category: {
          type: "string",
          enum: [
            "company",
            "research paper",
            "news",
            "blog post",
            "github",
            "tweet",
            "personal site",
            "linkedin profile",
          ],
          description: "Optional category filter to narrow results",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "exa_find_similar",
    description:
      "Find web pages similar to a given URL. Use this to find competitors of a specific business, or content similar to a given article/post.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to find similar pages for",
        },
        numResults: {
          type: "number",
          description: "Number of results (1-10). Default: 5",
        },
      },
      required: ["url"],
    },
  },
];

// ─── Tool Execution Handlers ──────────────────────────────────

async function exaFetch(
  endpoint: string,
  body: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "EXA_API_KEY not configured" });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`https://api.exa.ai/${endpoint}`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return JSON.stringify({ error: `Exa ${res.status}: ${err}` });
    }

    const data = await res.json();

    // Slim down the response to save tokens
    const results = (data.results || []).map(
      (r: { title: string; url: string; text?: string; publishedDate?: string }) => ({
        title: r.title,
        url: r.url,
        snippet: r.text?.slice(0, 500) || "",
        date: r.publishedDate || null,
      })
    );

    return JSON.stringify({ results, totalResults: results.length });
  } catch (e: any) {
    if (e.name === "AbortError") {
      return JSON.stringify({ error: "Exa search timed out" });
    }
    return JSON.stringify({ error: e.message });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const exaHandlers: Record<string, (input: Record<string, unknown>) => Promise<string>> = {
  exa_search: async (input) => {
    return exaFetch("search", {
      query: input.query,
      type: input.type || "neural",
      numResults: Math.min(Number(input.numResults) || 5, 10),
      contents: { text: { maxCharacters: 500 } },
      ...(input.category ? { category: input.category } : {}),
    });
  },

  exa_find_similar: async (input) => {
    return exaFetch("findSimilar", {
      url: input.url,
      numResults: Math.min(Number(input.numResults) || 5, 10),
      contents: { text: { maxCharacters: 500 } },
    });
  },
};
