import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MAX_MESSAGES = 60;
const MAX_CHARS = 8000;

const SYSTEM = `You are Toble, a warm, clear and capable AI assistant. You help people learn, write, brainstorm, solve problems, summarise text and write or understand code.
Be concise by default and expand when useful. Use Markdown: headings for long answers, lists, tables when comparing, and fenced code blocks with a language tag.
If you are unsure, say so rather than guessing. Never claim to browse the web, see files or images, or remember other conversations.`;

function jsonError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function handleChat(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return jsonError(500, "Toble's AI service isn't configured yet.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request.");
  }
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return jsonError(400, "Please type a message first.");
  if (messages.length > MAX_MESSAGES) return jsonError(400, "This conversation is too long. Please start a new chat.");

  const ui = messages as UIMessage[];
  for (const m of ui) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || !Array.isArray(m.parts)) return jsonError(400, "Invalid message.");
    const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    if (m.role === "user" && text.length > MAX_CHARS) return jsonError(400, `Messages can be at most ${MAX_CHARS} characters.`);
  }
  const last = ui[ui.length - 1];
  const lastText = last.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();
  if (last.role !== "user" || !lastText) return jsonError(400, "Please type a message first.");

  const model = process.env["TOBLE_MODEL"] || "openai/gpt-6-astra";
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(model),
    instructions: SYSTEM,
    messages: await convertToModelMessages(ui),
    abortSignal: request.signal,
    maxRetries: 1,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: ui,
      sendReasoning: false,
      onError: (err) => friendlyError(err),
    }),
    runIdFetch,
  );
}

function friendlyError(err: unknown): string {
  const status = (err as { statusCode?: number })?.statusCode;
  if (status === 429) return "Toble is getting a lot of requests right now. Please wait a moment and try again.";
  if (status === 402) return "Toble's AI credits have run out. The app owner needs to add credits.";
  if (status === 403) return "This request was blocked by the AI provider.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again.";
  console.error("chat error", err);
  return "Something went wrong while generating a reply. Please try again.";
}
