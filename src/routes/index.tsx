import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Code2, Lightbulb, PenLine } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
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
const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCredits(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      } else {
        setCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setCredits(data.credits);
    }
  };

 
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
    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center animate-fade-up">
          <TobleMark className="size-14" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">What can Toble help you with?</h1>
          <ul className="mt-10 grid w-full gap-3 sm:grid-cols-2">
            {suggestions.map(({ icon: Icon, label, prompt }) => (
              <li key={label}>
                <button
                  onClick={() => start(prompt)}
                  disabled={starting}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-composer focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground" aria-hidden><Icon className="size-4" /></span>
                  <span className="font-medium">{label}</span>
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
