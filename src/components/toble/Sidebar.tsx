import { Link } from "@tanstack/react-router";
import { MessageSquare, Plus, Settings, Shield, X } from "lucide-react";
import { TobleLogo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar({ open, onClose, onNewChat }: { open: boolean; onClose: () => void; onNewChat: () => void }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm transition-opacity md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/" onClick={onClose}><TobleLogo /></Link>
          <button className="rounded-lg p-2 hover:bg-sidebar-accent md:hidden" onClick={onClose} aria-label="Close sidebar">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-3">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-background px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-composer"
          >
            <Plus className="size-4 text-primary" /> New chat
          </button>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto px-3" aria-label="Recent conversations">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent</p>
          <div className="flex flex-col items-start gap-2 rounded-xl px-3 py-4 text-sm text-muted-foreground">
            <MessageSquare className="size-4" />
            Your conversations will appear here once you sign in.
          </div>
        </nav>
        <div className="space-y-0.5 border-t border-sidebar-border p-3">
          <ThemeToggle />
          <Link to="/settings" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
            <Settings className="size-4" /> Settings
          </Link>
          <Link to="/privacy" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
            <Shield className="size-4" /> Privacy
          </Link>
        </div>
      </aside>
    </>
  );
}
