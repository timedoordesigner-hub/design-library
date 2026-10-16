"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export const ENTERED_KEY = "dl-entered";

// ponytail: gate sisi klien per-tab (sessionStorage), bukan keamanan; RLS tetap yang menegakkan. Upgrade: middleware + cookie.
export function enter() {
  try { sessionStorage.setItem(ENTERED_KEY, "1"); } catch {}
}

export function LoginGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAdmin, ready } = useAuth();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let entered = false;
    try { entered = sessionStorage.getItem(ENTERED_KEY) === "1"; } catch {}
    if (isAdmin || entered) setOk(true);
    else router.replace("/login");
  }, [ready, isAdmin, router]);

  return ok ? <>{children}</> : null;
}
