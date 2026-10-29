"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type Role = "viewer" | "admin";
type AuthValue = {
  role: Role;
  isAdmin: boolean;
  ready: boolean;
  signIn: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

// Role comes from app_metadata (server/SQL only). UI mirrors it; RLS enforces access.
const roleOf = (session: Session | null): Role => (session?.user.app_metadata?.role === "admin" ? "admin" : "viewer");

const AuthContext = createContext<AuthValue>({ role: "viewer", isAdmin: false, ready: false, signIn: async () => "Not ready yet.", signOut: async () => undefined });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const client = supabase();
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
    }).catch(() => {
      if (active) setSession(null);
    }).finally(() => {
      if (active) setReady(true);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (password: string) => {
    if (!supabaseConfigured) return "Supabase is not configured (.env.local).";
    if (!ADMIN_EMAIL) return "NEXT_PUBLIC_ADMIN_EMAIL is not set in .env.local.";
    const { data, error } = await supabase().auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    if (error) return error.status === 400 ? "Wrong password." : "Sign in failed. Please try again.";
    if (roleOf(data.session) !== "admin") {
      await supabase().auth.signOut();
      return "This account is not an admin.";
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    if (supabaseConfigured) await supabase().auth.signOut();
  }, []);

  const role = roleOf(session);
  const value = useMemo(() => ({ role, isAdmin: role === "admin", ready, signIn, signOut }), [ready, role, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
