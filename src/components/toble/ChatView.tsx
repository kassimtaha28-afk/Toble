import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { authHeaders } from "@/lib/api-headers";
import { useConversationStore } from "@/lib/use-store";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

export const pendingKey = (id: string) => `toble-pending:${id}`;

export function readableError(err?: Error) {
  if (!err) return undefined;
  try {
    const j = JSON.parse(err.message);
    if (j?.error) return String(j.error);
  } catch {}
  if (/failed to fetch|network/i.test(err.message)) return "Couldn't reach Toble. Check your connection and try again.";
  return err.message || "Something went wrong. Please try again.";
}

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

export function ChatView({ id, initialMessages, title }: { id: string; initialMessages: UIMessage[]; title: string }) {
  const { store, scope } = useConversationStore();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", headers: authHeaders }), []);
  const { messages, sendMessage, status, stop, error, regenerate, clearError } = useChat({ id, messages: initialMessages, transport });
  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "assistant" && !textOf(last));
  const scrollRef = useRef<HTMLDivElement>(null);
  const titled = useRef(title !== "New chat");

  // Send a prompt handed over from the new-chat page (once, StrictMode-safe).
  useEffect(() => {
    const t = setTimeout(() => {
      const pending = sessionStorage.getItem(pendingKey(id));
      if (pending) {
        sessionStorage.removeItem(pendingKey(id));
        sendMessage({ text: pending });
      }
    }, 0);
    return () => clearTimeout(t);
  }, [id, sendMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Persist when a turn finishes (or fails), then title new chats.
  const prevStatus = useRef(status);
  useEffect(() => {
    const was = prevStatus.current;
    prevStatus.current = status;
    if (!(was === "streaming" || was === "submitted") || busy || messages.length === 0) return;
    (async () => {
      try {
        await store.saveMessages(id, messages);
        if (!titled.current && messages.some((m) => m.role === "assistant" && textOf(m))) {
          titled.current = true;
          const first = messages.find((m) => m.role === "user");
          const res = await fetch("/api/title", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await authHeaders()) },
            body: JSON.stringify({ text: first ? textOf(first) : "" }),
          });
          if (res.ok) {
            const { title: t } = (await res.json()) as { title: string };
            await store.rename(id, t);
          }
        }
      } catch (e) {
        console.error("Failed to save conversation", e);
      } finally {
        qc.invalidateQueries({ queryKey: ["conversations", scope] });
      }
    })();
  }, [status, busy, messages, id, store, qc, scope]);

  const send = () => {
    const t = input.trim();
    if (!t || busy) return;
    clearError();
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          busy={busy}
          waiting={waiting}
          error={readableError(error)}
          onRegenerate={() => { clearError(); regenerate(); }}
          onRetry={() => { clearError(); regenerate(); }}
        />
      </div>
      <ComposerArea value={input} onChange={setInput} onSubmit={send} busy={busy} onStop={stop} />
    </>
  );
}

export function ComposerArea(props: { value: string; onChange: (v: string) => void; onSubmit: () => void; busy?: boolean; onStop?: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
      <Composer {...props} />
      <p className="mt-2 text-center text-xs text-muted-foreground">Toble can make mistakes. Check important information.</p>
    </div>
  );
}
