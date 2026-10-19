export function TobleMark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-xl bg-brand text-primary-foreground ${className}`} aria-hidden>
    <span className="font-bold text-lg">T</span>    </span>
  );
}

export function TobleLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <TobleMark />
      <span className="font-display text-lg font-semibold tracking-tight">Toble</span>
    </span>
  );
}
