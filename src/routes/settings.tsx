import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/toble/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useConversationStore } from "@/lib/use-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Toble" },
      { name: "description", content: "Manage your Toble appearance, profile and conversations." },
      { property: "og:title", content: "Settings — Toble" },
      { property: "og:description", content: "Manage your Toble appearance, profile and conversations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { dark, toggle } = useTheme();
  const { store, user, ready, scope } = useConversationStore();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("display_name").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [name, setName] = useState("");
  useEffect(() => setName(profile?.display_name ?? ""), [profile]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: name.trim().slice(0, 80) || null, updated_at: new Date().toISOString() });
    if (error) return toast.error("Couldn't save your name.");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile saved");
  };

  const deleteAll = async () => {
    try {
      await store.removeAll();
      qc.invalidateQueries({ queryKey: ["conversations", scope] });
      toast.success("All conversations deleted");
    } catch {
      toast.error("Couldn't delete conversations. Please try again.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to chat
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5" aria-labelledby="appearance-h">
        <h2 id="appearance-h" className="font-semibold">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <Label htmlFor="dark-switch" className="font-normal text-muted-foreground">Dark mode</Label>
          <Switch id="dark-switch" checked={dark} onCheckedChange={toggle} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5" aria-labelledby="account-h">
        <h2 id="account-h" className="font-semibold">Account</h2>
        {!ready ? null : user ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">Signed in as <span className="text-foreground">{user.email}</span></p>
            <form onSubmit={saveName} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="display-name">Display name</Label>
                <Input id="display-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
              </div>
              <Button type="submit">Save</Button>
            </form>
            <Button variant="outline" className="mt-4" onClick={signOut}>Sign out</Button>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            You're using Toble as a guest. Your chats are stored in this browser only.{" "}
            <Link to="/auth" className="font-medium text-primary hover:underline">Sign in or create an account</Link> to save them to your account.
          </p>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-destructive/30 bg-card p-5" aria-labelledby="data-h">
        <h2 id="data-h" className="font-semibold">Conversations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permanently delete every conversation {user ? "in your account" : "stored in this browser"}.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">Delete all conversations</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all conversations?</AlertDialogTitle>
              <AlertDialogDescription>This permanently deletes all of your conversations. This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete all</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        AI responses can sometimes be inaccurate. <Link to="/privacy" className="underline">Privacy policy</Link>
      </p>
    </main>
  );
}
