export function TobleMark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-xl bg-brand text-primary-foreground ${className}`} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none">
        <path d="M5 6.5h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M12 6.5v8.5a3 3 0 0 0 3 3h1.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="19" cy="18" r="1.6" fill="currentColor" />
      </svg>
    </span>
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
