"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin, ready } = useAuth();
  if (!ready) return <div className="content-inner pt-7"><div className="skeleton h-40" /></div>;
  if (isAdmin) return <>{children}</>;
  return (
    <div className="content-inner pb-16 pt-7">
      <div className="empty-state px-6 py-20 text-center">
        <p className="text-base font-medium">Admin only.</p>
        <p className="mt-1 text-[13px] text-muted">Viewers can only view and search design files.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/" className="primary-button">Back to search</Link>
          <Link href="/login" className="control-button inline-flex items-center">Sign in as admin</Link>
        </div>
      </div>
    </div>
  );
}
