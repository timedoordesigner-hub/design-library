"use client";

import { Suspense, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DesignsProvider } from "./DesignsProvider";
import { ToastProvider } from "./Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <DesignsProvider>
      <ToastProvider>
        <div className="app-shell">
          <Suspense fallback={null}>
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
          </Suspense>
          <div className="app-main">
            <Suspense fallback={<header className="topbar" />}>
              <Topbar onMenu={() => setMenuOpen(true)} />
            </Suspense>
            <Suspense fallback={<div className="app-content" />}>
              <div className="app-content">{children}</div>
            </Suspense>
          </div>
        </div>
      </ToastProvider>
    </DesignsProvider>
  );
}
