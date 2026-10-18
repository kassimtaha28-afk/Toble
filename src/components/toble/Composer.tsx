import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";

export function Composer({
  value, onChange, onSubmit, busy = false, onStop,
}: { value: string; onChange: (v: string) => void; onSubmit: () => void; busy?: boolean; onStop?: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);
  useEffect(() => ref.current?.focus(), []);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (value.trim() && !busy) onSubmit();
    }
  };
  const canSend = value.trim().length > 0 && !busy;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canSend) onSubmit(); }}
      className="flex items-end gap-2 rounded-3xl border border-input bg-card p-2 pl-5 shadow-composer transition-colors focus-within:border-primary/50"
    >
      <label htmlFor="toble-input" className="sr-only">Message Toble</label>
      <textarea
        id="toble-input"
        ref={ref}
        rows={1}
        value={value}
        maxLength={8000}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        placeholder="Message Toble…"
        className="max-h-56 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
      />
      {busy && onStop ? (
        <button type="button" onClick={onStop} aria-label="Stop generating" className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105">
          <Square className="size-3.5 fill-current" />
        </button>
      ) : (
        <button type="submit" disabled={!canSend} aria-label="Send message" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground transition-all hover:scale-105 disabled:scale-100 disabled:opacity-35">
          <ArrowUp className="size-5" />
        </button>
      )}
    </form>
  );
}
