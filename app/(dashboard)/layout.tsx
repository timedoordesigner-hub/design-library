import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { LoginGate } from "@/components/LoginGate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <LoginGate><AppShell>{children}</AppShell></LoginGate>;
}
