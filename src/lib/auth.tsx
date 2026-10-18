import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; session: Session | null; ready: boolean };
const AuthContext = createContext<AuthState>({ user: null, session: null, ready: false });

export function AuthProvider({ children, onChange }: { children: ReactNode; onChange?: () => void }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, ready: false });
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ user: session?.user ?? null, session, ready: true });
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") onChange?.();
    });
    supabase.auth.getSession().then(({ data: { session } }) =>
      setState({ user: session?.user ?? null, session, ready: true }),
    );
    return () => data.subscription.unsubscribe();
  }, [onChange]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
