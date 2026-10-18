// Conversation storage: signed-in users use the database (protected by row-level
// security), guests use this browser's localStorage. Both share one interface.
import type { UIMessage } from "ai";
import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type Conversation = { id: string; title: string; updatedAt: string };

export interface ConversationStore {
  list(): Promise<Conversation[]>;
  get(id: string): Promise<{ conversation: Conversation; messages: UIMessage[] } | null>;
  create(): Promise<string>;
  saveMessages(id: string, messages: UIMessage[]): Promise<void>;
  rename(id: string, title: string): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<void>;
}

export const cleanTitle = (t: string) => t.replace(/\s+/g, " ").trim().slice(0, 80) || "New chat";

// ---------- Database store ----------
export function dbStore(userId: string): ConversationStore {
  const fail = (e: { message: string } | null) => {
    if (e) throw new Error(e.message);
  };
  return {
    async list() {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,title,updated_at")
        .order("updated_at", { ascending: false })
        .limit(200);
      fail(error);
      return (data ?? []).map((c) => ({ id: c.id, title: c.title, updatedAt: c.updated_at }));
    },
    async get(id) {
      const { data: c, error } = await supabase.from("conversations").select("id,title,updated_at").eq("id", id).maybeSingle();
      fail(error);
      if (!c) return null;
      const { data: rows, error: e2 } = await supabase
        .from("messages")
        .select("ui_id,role,parts")
        .eq("conversation_id", id)
        .order("position", { ascending: true });
      fail(e2);
      return {
        conversation: { id: c.id, title: c.title, updatedAt: c.updated_at },
        messages: (rows ?? []).map((r) => ({ id: r.ui_id, role: r.role as UIMessage["role"], parts: r.parts as UIMessage["parts"] })),
      };
    },
    async create() {
      const { data, error } = await supabase.from("conversations").insert({ user_id: userId }).select("id").single();
      fail(error);
      return data!.id;
    },
    async saveMessages(id, messages) {
      const rows = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m, i) => ({
          conversation_id: id,
          user_id: userId,
          ui_id: m.id,
          role: m.role,
          parts: m.parts.filter((p) => p.type === "text") as unknown as Json,
          position: i,
        }));
      if (rows.length) {
        const { error } = await supabase.from("messages").upsert(rows, { onConflict: "conversation_id,ui_id" });
        fail(error);
      }
      // Remove messages replaced by "regenerate".
      const keep = rows.map((r) => r.ui_id);
      let del = supabase.from("messages").delete().eq("conversation_id", id);
      if (keep.length) del = del.not("ui_id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
      const { error: e2 } = await del;
      fail(e2);
      const { error: e3 } = await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", id);
      fail(e3);
    },
    async rename(id, title) {
      const { error } = await supabase.from("conversations").update({ title: cleanTitle(title) }).eq("id", id);
      fail(error);
    },
    async remove(id) {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      fail(error);
    },
    async removeAll() {
      const { error } = await supabase.from("conversations").delete().eq("user_id", userId);
      fail(error);
    },
  };
}

// ---------- Guest (browser) store ----------
const KEY = "toble-guest-conversations";
type LocalConv = Conversation & { messages: UIMessage[] };
const read = (): LocalConv[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};
const write = (all: LocalConv[]) => localStorage.setItem(KEY, JSON.stringify(all));

export const localStore: ConversationStore = {
  async list() {
    return read()
      .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id) {
    const c = read().find((x) => x.id === id);
    return c ? { conversation: { id: c.id, title: c.title, updatedAt: c.updatedAt }, messages: c.messages } : null;
  },
  async create() {
    const id = crypto.randomUUID();
    write([...read(), { id, title: "New chat", updatedAt: new Date().toISOString(), messages: [] }]);
    return id;
  },
  async saveMessages(id, messages) {
    write(read().map((c) => (c.id === id ? { ...c, messages, updatedAt: new Date().toISOString() } : c)));
  },
  async rename(id, title) {
    write(read().map((c) => (c.id === id ? { ...c, title: cleanTitle(title) } : c)));
  },
  async remove(id) {
    write(read().filter((c) => c.id !== id));
  },
  async removeAll() {
    write([]);
  },
};
