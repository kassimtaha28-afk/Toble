import { useMemo } from "react";
import { useAuth } from "./auth";
import { dbStore, localStore } from "./conversations";

export function useConversationStore() {
  const { user, ready } = useAuth();
  const store = useMemo(() => (user ? dbStore(user.id) : localStore), [user]);
  return { store, ready, user, scope: user ? `user:${user.id}` : "guest" };
}
