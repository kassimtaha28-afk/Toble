import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { BookOpen, Code2, Lightbulb, PenLine, Sparkles, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/toble/AppShell";
import { ComposerArea, pendingKey } from "@/components/toble/ChatView";
import { TobleMark } from "@/components/toble/Logo";
import { useConversationStore } from "@/lib/use-store";

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

function Index() {
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const { store, ready } = useConversationStore();
  const navigate = useNavigate();

  const start = async (text = input) => {
    const t = text.trim();
    if (!t || starting || !ready) return;
    setStarting(true);
    try {
      const id = await store.create();
      sessionStorage.setItem(pendingKey(id), t);
      navigate({ to: "/c/$id", params: { id } });
    } catch {
      toast.error("Couldn't start a new chat. Please try again.");
      setStarting(false);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto bg-[#12131C] text-white selection:bg-[#7C3AED]/30">
        {/* Navigation / Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <TobleMark className="size-8 text-[#7C3AED]" />
            <span className="font-bold text-lg tracking-wide text-white">Toble</span>
          </div>

          <Link
            to="/subscription"
            className="flex items-center gap-2 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 px-3.5 py-1.5 text-xs font-semibold text-purple-200 transition-all hover:bg-[#7C3AED] hover:text-white hover:shadow-lg hover:shadow-[#7C3AED]/25"
          >
            <CreditCard className="size-3.5" />
            <span>Subscriptions</span>
          </Link>
        </header>

        {/* Hero & Prompt Cards Area */}
        <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center animate-fade-up">
          {/* Logo with Purple Glow Effect */}
          <div className="relative mb-6">
            <div className="absolute -inset-2 rounded-full bg-[#7C3AED] opacity-40 blur-xl animate-pulse" />
            <div className="relative grid size-16 place-items-center rounded-2xl border border-[#7C3AED]/40 bg-[#12131C]/80 shadow-2xl backdrop-blur-sm">
              <TobleMark className="size-10 text-[#7C3AED]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-md mb-4">
            <Sparkles className="size-3 text-[#7C3AED]" />
            <span>Powered by AI</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What can <span className="bg-gradient-to-r from-purple-400 via-[#7C3AED] to-indigo-400 bg-clip-text text-transparent">Toble</span> help you with?
          </h1>

          {/* Cards Grid */}
          <ul className="mt-10 grid w-full gap-3 sm:grid-cols-2">
            {suggestions.map(({ icon: Icon, label, prompt }) => (
              <li key={label}>
                <button
                  onClick={() => start(prompt)}
                  disabled={starting}
                  className="group flex w-full items-center gap-3.5 rounded-2xl border border-white/10 bg-[#1A1B26] p-4 text-left text-sm text-slate-200 transition-all hover:-translate-y-0.5 hover:border-[#7C3AED]/60 hover:bg-[#202130] hover:shadow-lg hover:shadow-[#7C3AED]/10 focus-visible:outline-2 focus-visible:outline-[#7C3AED] disabled:opacity-60"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED] transition-colors group-hover:bg-[#7C3AED] group-hover:text-white" aria-hidden>
                    <Icon className="size-4" />
                  </span>
                  <span className="font-medium group-hover:text-white">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ComposerArea value={input} onChange={setInput} onSubmit={() => start()} busy={starting} />
    </AppShell>
  );
}
