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
        <p className="text-base font-medium">Khusus admin.</p>
        <p className="mt-1 text-[13px] text-muted">Viewer hanya bisa melihat dan mencari file design.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/" className="primary-button">Kembali ke pencarian</Link>
          <Link href="/login" className="control-button inline-flex items-center">Masuk sebagai admin</Link>
        </div>
      </div>
    </div>
  );
}
