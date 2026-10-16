"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export const ENTERED_KEY = "dl-entered";

// ponytail: gate sisi klien per-tab (sessionStorage), bukan keamanan; RLS tetap yang menegakkan. Upgrade: middleware + cookie.
export function enter() {
  try { sessionStorage.setItem(ENTERED_KEY, "1"); } catch {}
}

const subscribe = () => () => {};
const readEntered = () => { try { return sessionStorage.getItem(ENTERED_KEY) === "1"; } catch { return false; } };

export function LoginGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAdmin, ready } = useAuth();
  const entered = useSyncExternalStore(subscribe, readEntered, () => false);
  const ok = ready && (isAdmin || entered);

  useEffect(() => {
    if (ready && !ok) router.replace("/login");
  }, [ready, ok, router]);

  return ok ? <>{children}</> : null;
}
