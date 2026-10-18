import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/toble/ThemeToggle";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Toble" },
      { name: "description", content: "Manage your Toble appearance and account." },
      { property: "og:title", content: "Settings — Toble" },
      { property: "og:description", content: "Manage your Toble appearance and account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { dark, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to chat
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">Settings</h1>
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Dark mode</span>
          <button
            role="switch"
            aria-checked={dark}
            onClick={toggle}
            className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-primary" : "bg-input"}`}
          >
            <span className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </section>
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">Profile and account controls will be available once sign-in is added.</p>
      </section>
    </div>
  );
}
