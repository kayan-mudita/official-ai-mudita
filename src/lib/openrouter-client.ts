/**
 * Claude SDK client routed through OpenRouter.
 *
 * Uses the Anthropic SDK with baseURL pointed at OpenRouter,
 * giving us access to Claude models via OpenRouter billing.
 *
 * The agentic loop: send messages with tool definitions →
 * Claude responds with tool_use → we execute → send results back →
 * Claude synthesizes final answer.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "anthropic/claude-sonnet-4-20250514";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  _client = new Anthropic({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });

  return _client;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

type ToolHandler = (input: Record<string, unknown>) => Promise<string>;

/**
 * Run an agentic loop: Claude gets tools, calls them, we execute,
 * repeat until Claude produces a final text response.
 *
 * @param systemPrompt - The system prompt for Claude
 * @param userPrompt - The user message
 * @param tools - Tool definitions (MCP-style)
 * @param handlers - Map of tool name → async handler function
 * @param maxTurns - Safety limit on tool-use rounds (default 10)
 */
export async function runAgent(
  systemPrompt: string,
  userPrompt: string,
  tools: ToolDefinition[],
  handlers: Record<string, ToolHandler>,
  maxTurns = 10
): Promise<string> {
  const client = getClient();

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];

  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      tools: tools as Anthropic.Tool[],
      messages,
    });

    // If Claude is done (no more tool calls), extract text
    if (response.stop_reason === "end_turn" || !response.content.some((b) => b.type === "tool_use")) {
      const textBlocks = response.content.filter((b) => b.type === "text");
      return textBlocks.map((b) => (b as Anthropic.TextBlock).text).join("\n");
    }

    // Claude wants to use tools — execute them
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];

    // Add assistant message with tool calls
    messages.push({ role: "assistant", content: response.content });

    // Execute each tool call and collect results
    const toolResults: ToolResult[] = [];
    for (const toolUse of toolUseBlocks) {
      const handler = handlers[toolUse.name];
      let result: string;

      if (handler) {
        try {
          result = await handler(toolUse.input as Record<string, unknown>);
        } catch (e: any) {
          result = JSON.stringify({ error: e.message || "Tool execution failed" });
        }
      } else {
        result = JSON.stringify({ error: `Unknown tool: ${toolUse.name}` });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result,
      });
    }

    // Send tool results back
    messages.push({ role: "user", content: toolResults as any });
  }

  throw new Error("Agent exceeded max turns without producing a final response");
}

export { getClient, MODEL };
