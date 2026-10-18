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
  const limited = await checkRateLimit(request, "chat");
  if (limited) return limited;

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
  const last = ui[ui.length - 1]!;
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

export async function handleTitle(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return jsonError(500, "AI service isn't configured.");
  const limited = await checkRateLimit(request, "title");
  if (limited) return limited;
  let text = "";
  try {
    text = String(((await request.json()) as { text?: unknown })?.text ?? "").slice(0, 2000).trim();
  } catch {}
  if (!text) return jsonError(400, "Missing text.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: createLovableAiGatewayRunIdFetch().fetch,
  });
  try {
    const result = streamText({
      model: provider.responses(process.env["TOBLE_TITLE_MODEL"] || "openai/chat-latest"),
      instructions: "Write a short title (2-6 words) for a chat that starts with the user's message below. Reply with the title only, no quotes or trailing punctuation.",
      messages: [{ role: "user", content: text }],
      abortSignal: request.signal,
      maxRetries: 1,
      providerOptions: { openai: { store: false } },
    });
    const title = (await result.text).replace(/^["'\s]+|["'.\s]+$/g, "").slice(0, 80);
    return Response.json({ title: title || "New chat" });
  } catch (err) {
    return jsonError(502, friendlyError(err));
  }
}

const LIMITS = { chat: { user: 60, guest: 15 }, title: { user: 60, guest: 15 } } as const;

async function checkRateLimit(request: Request, kind: keyof typeof LIMITS): Promise<Response | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let subject: string;
  let limit: number;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { data } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } };
  if (token && !data.user) return jsonError(401, "Your session has expired. Please sign in again.");
  if (data.user) {
    subject = `${kind}:user:${data.user.id}`;
    limit = LIMITS[kind].user;
  } else {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    subject = `${kind}:guest:${Array.from(new Uint8Array(digest)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
    limit = LIMITS[kind].guest;
  }
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("subject", subject)
    .gte("created_at", since);
  if (error) {
    console.error("rate limit check failed", error);
    return jsonError(503, "Toble is temporarily unavailable. Please try again shortly.");
  }
  if ((count ?? 0) >= limit) {
    return Response.json(
      { error: data.user ? "You've reached the hourly message limit. Please try again a little later." : "Guest message limit reached for this hour. Sign in for a higher limit." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }
  await supabaseAdmin.from("usage_events").insert({ subject });
  return null;
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
