import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/toble/AppShell";
import { ChatView } from "@/components/toble/ChatView";
import { useConversationStore } from "@/lib/use-store";

export const Route = createFileRoute("/c/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chat — Toble" },
      { name: "description", content: "A conversation with Toble." },
      { property: "og:title", content: "Chat — Toble" },
      { property: "og:description", content: "A conversation with Toble." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { id } = Route.useParams();
  const { store, ready, scope } = useConversationStore();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", scope, id],
    queryFn: () => store.get(id),
    enabled: ready,
    staleTime: Infinity,
    gcTime: 0,
  });

  return (
    <AppShell activeId={id}>
      {!ready || isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground" role="status">Loading conversation…</div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm" role="alert">
          <p>Couldn't load this conversation.</p>
          <button onClick={() => refetch()} className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted">Retry</button>
        </div>
      ) : !data ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center text-sm">
          <h1 className="text-xl font-semibold">Conversation not found</h1>
          <p className="text-muted-foreground">It may have been deleted, or it belongs to a different account or browser.</p>
          <Link to="/" className="font-medium text-primary hover:underline">Start a new chat</Link>
        </div>
      ) : (
        <ChatView key={id} id={id} initialMessages={data.messages} title={data.conversation.title} />
      )}
    </AppShell>
  );
}
