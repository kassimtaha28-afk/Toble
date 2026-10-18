import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Code2, Lightbulb, Menu, PenLine } from "lucide-react";
import { useState } from "react";
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

type Msg = { id: string; role: "user" | "assistant"; text: string };

function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const send = (text = input) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t }]);
    setInput("");
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={() => setMessages([])} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-muted" aria-label="Open sidebar">
            <Menu className="size-5" />
          </button>
          <span className="font-display font-semibold">Toble</span>
        </header>

        <div className="flex-1 overflow-y-auto">
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
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8" role="log" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className="flex justify-end animate-fade-up">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-bubble-user px-4 py-2.5 text-[15px] text-bubble-user-foreground">{m.text}</div>
                </div>
              ))}
              <div className="flex gap-3 animate-fade-up">
                <TobleMark className="size-7 shrink-0" />
                <p className="rounded-2xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
                  Toble's AI isn't connected yet — real answers arrive in the next stage.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
          <Composer value={input} onChange={setInput} onSubmit={() => send()} />
          <p className="mt-2 text-center text-xs text-muted-foreground">Toble can make mistakes. Check important information.</p>
        </div>
      </main>
    </div>
  );
}
