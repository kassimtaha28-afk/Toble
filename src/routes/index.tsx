import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Code2, Lightbulb, Menu, PenLine } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageList } from "@/components/toble/MessageList";
import { Composer } from "@/components/toble/Composer";
import { TobleMark } from "@/components/toble/Logo";
import { Sidebar } from "@/components/toble/Sidebar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toble — Your AI assistant" },
      { name: "description", content: "Toble helps you learn, write, code, brainstorm and solve problems." },
      { property: "og:title", content: "Toble — Your AI assistant" },
      { property: "og:description", content: "Learn, write, code and brainstorm with Toble." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const suggestions = [
  { icon: BookOpen, label: "Help me learn something new", prompt: "Teach me something interesting I probably don't know, in simple terms." },
  { icon: PenLine, label: "Write something for me", prompt: "Help me write a friendly, professional email." },
  { icon: Code2, label: "Help me code", prompt: "Explain how to debounce a function in TypeScript with an example." },
  { icon: Lightbulb, label: "Brainstorm ideas", prompt: "Brainstorm 10 creative weekend project ideas." },
];

function readableError(err?: Error) {
  if (!err) return undefined;
  try {
    const j = JSON.parse(err.message);
    if (j?.error) return String(j.error);
  } catch {}
  if (/fetch|network/i.test(err.message)) return "Couldn't reach Toble. Check your connection and try again.";
  return err.message || "Something went wrong. Please try again.";
}

function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, error, regenerate, setMessages, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "assistant" && !last.parts.some((p) => p.type === "text" && p.text));
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const send = (text = input) => {
    const t = text.trim();
    if (!t || busy) return;
    clearError();
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={() => { stop(); setMessages([]); clearError(); }} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-muted" aria-label="Open sidebar">
            <Menu className="size-5" />
          </button>
          <span className="font-display font-semibold">Toble</span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center animate-fade-up">
              <TobleMark className="size-14" />
              <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">What can Toble help you with?</h1>
              <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                {suggestions.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => send(prompt)}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-composer"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-4" /></span>
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              busy={busy}
              waiting={waiting}
              error={readableError(error)}
              onRegenerate={() => { clearError(); regenerate(); }}
              onRetry={() => { clearError(); regenerate(); }}
            />
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
          <Composer value={input} onChange={setInput} onSubmit={() => send()} busy={busy} onStop={stop} />
          <p className="mt-2 text-center text-xs text-muted-foreground">Toble can make mistakes. Check important information.</p>
        </div>
      </main>
    </div>
  );
}
