import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, MessageSquare, MoreHorizontal, Pencil, Plus, Settings, Shield, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/lib/conversations";
import { useConversationStore } from "@/lib/use-store";
import { TobleLogo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar({ open, onClose, activeId }: { open: boolean; onClose: () => void; activeId?: string | undefined }) {
  const { store, ready, user, scope } = useConversationStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: convs = [], isLoading } = useQuery({
    queryKey: ["conversations", scope],
    queryFn: () => store.list(),
    enabled: ready,
  });
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [deleting, setDeleting] = useState<Conversation | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["conversations", scope] });

  const doRename = async () => {
    if (!renaming || !newTitle.trim()) return;
    try {
      await store.rename(renaming.id, newTitle);
      refresh();
      qc.invalidateQueries({ queryKey: ["conversation", scope, renaming.id] });
      setRenaming(null);
    } catch {
      toast.error("Couldn't rename the conversation. Please try again.");
    }
  };
  const doDelete = async () => {
    if (!deleting) return;
    try {
      await store.remove(deleting.id);
      refresh();
      toast.success("Conversation deleted");
      if (deleting.id === activeId) navigate({ to: "/" });
    } catch {
      toast.error("Couldn't delete the conversation. Please try again.");
    }
    setDeleting(null);
  };

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
          <Link to="/" onClick={onClose} aria-label="Toble home"><TobleLogo /></Link>
          <button className="grid size-11 place-items-center rounded-lg hover:bg-sidebar-accent md:hidden" onClick={onClose} aria-label="Close sidebar">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-3">
          <Link
            to="/"
            onClick={onClose}
            className="flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-background px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-composer"
          >
            <Plus className="size-4 text-primary" /> New chat
          </Link>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto px-3" aria-label="Recent conversations">
          <h2 className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent</h2>
          {isLoading || !ready ? (
            <div className="space-y-2 px-3" aria-label="Loading conversations">
              {[0, 1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-sidebar-accent" />)}
            </div>
          ) : convs.length === 0 ? (
            <p className="flex flex-col items-start gap-2 px-3 py-4 text-sm text-muted-foreground">
              <MessageSquare className="size-4" aria-hidden /> No conversations yet.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {convs.map((c) => (
                <li key={c.id} className={`group flex items-center rounded-lg ${c.id === activeId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"}`}>
                  <Link
                    to="/c/$id"
                    params={{ id: c.id }}
                    onClick={onClose}
                    aria-current={c.id === activeId ? "page" : undefined}
                    className="min-w-0 flex-1 truncate px-3 py-2 text-sm"
                  >
                    {c.title}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="mr-1 grid size-8 place-items-center rounded-md text-muted-foreground opacity-100 hover:text-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100"
                      aria-label={`Options for ${c.title}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => { setNewTitle(c.title); setRenaming(c); }}>
                        <Pencil className="size-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleting(c)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </nav>
        {ready && !user && (
          <div className="mx-3 mb-3 rounded-xl border border-sidebar-border bg-background p-3 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Guest mode.</strong> Chats are saved in this browser only and won't sync across devices.</p>
            <Link to="/auth" onClick={onClose} className="mt-2 inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <LogIn className="size-3.5" /> Sign in to save them
            </Link>
          </div>
        )}
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

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename conversation</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); doRename(); }}>
            <label htmlFor="rename-input" className="sr-only">Conversation title</label>
            <Input id="rename-input" value={newTitle} maxLength={80} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setRenaming(null)}>Cancel</Button>
              <Button type="submit" disabled={!newTitle.trim()}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>"{deleting?.title}" will be permanently deleted. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
