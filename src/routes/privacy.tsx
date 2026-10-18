import { createFileRoute, Link } from "@tanstack/react-router";
import { TobleLogo } from "@/components/toble/Logo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Toble" },
      { name: "description", content: "How Toble handles your data." },
      { property: "og:title", content: "Privacy Policy — Toble" },
      { property: "og:description", content: "How Toble handles your data." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/"><TobleLogo /></Link>
      <h1 className="mt-10 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 rounded-xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
        Placeholder — this policy must be completed and reviewed before public launch.
      </p>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p><strong className="text-foreground">What we collect.</strong> [Describe account data, conversation content and usage data.]</p>
        <p><strong className="text-foreground">How it's used.</strong> [Describe how messages are sent to the AI provider to generate responses.]</p>
        <p><strong className="text-foreground">Your choices.</strong> [Describe how users can delete conversations and their account.]</p>
        <p><strong className="text-foreground">Contact.</strong> [Add a contact email.]</p>
      </div>
    </div>
  );
}
