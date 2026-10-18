import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children, activeId }: { children: ReactNode; activeId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a href="#toble-input" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">
        Skip to message box
      </a>
      <Sidebar open={open} onClose={() => setOpen(false)} activeId={activeId} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-1.5 md:hidden">
          <button onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-lg hover:bg-muted" aria-label="Open sidebar">
            <Menu className="size-5" />
          </button>
          <span className="font-display font-semibold">Toble</span>
        </header>
        {children}
      </main>
    </div>
  );
}
