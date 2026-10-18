import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TobleLogo } from "@/components/toble/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Toble" },
      { name: "description", content: "Sign in or create a Toble account to save your conversations." },
      { property: "og:title", content: "Sign in — Toble" },
      { property: "og:description", content: "Sign in or create a Toble account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() || undefined } },
        });
        if (error) throw error;
        setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNotice("If an account exists for that email, we've sent a link to reset your password.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError("Google sign-in failed. Please try again.");
  };

  const heading = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-block" aria-label="Back to Toble"><TobleLogo /></Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "forgot" ? "Enter your email and we'll send you a reset link." : "Save your conversations and pick up on any device."}
        </p>

        {mode !== "forgot" && (
          <>
            <Button type="button" variant="outline" className="mt-6 h-11 w-full" onClick={google}>
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="currentColor" d="M21.8 10.2H12v3.9h5.6c-.5 2.5-2.7 4.1-5.6 4.1a6.2 6.2 0 1 1 4-10.9l2.8-2.8A10 10 0 1 0 12 22c5.5 0 9.9-4 9.9-10 0-.6 0-1.2-.1-1.8Z" /></svg>
              Continue with Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          </>
        )}

        <form onSubmit={submit} className={`space-y-4 ${mode === "forgot" ? "mt-6" : ""}`} noValidate={false}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
                )}
              </div>
              <Input
                id="password" type="password" required minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password} onChange={(e) => setPassword(e.target.value)} className="h-11"
                aria-describedby={mode === "signup" ? "pw-hint" : undefined}
              />
              {mode === "signup" && <p id="pw-hint" className="text-xs text-muted-foreground">At least 8 characters.</p>}
            </div>
          )}
          {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">{notice}</p>}
          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>New to Toble? <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">Sign in</button></>
          )}
        </p>
        <p className="mt-3 text-center text-sm"><Link to="/" className="text-muted-foreground hover:text-foreground">Continue as guest</Link></p>
      </div>
    </main>
  );
}
