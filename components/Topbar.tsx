"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseQuery, toParams } from "@/lib/query";
import { useAuth } from "./AuthProvider";

type Props = { onMenu?: () => void };

export function Topbar({ onMenu }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = parseQuery(new URLSearchParams(searchParams.toString()));
  const searchRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();
  const title = pathname === "/tambah" ? "Add File" : pathname.startsWith("/panduan") ? "Request Guide" : pathname === "/thumbnail" ? "Design Library" : pathname === "/library" ? "Manage Library" : pathname.startsWith("/edit/") ? "Edit File" : "Search";

  const updateSearch = (value: string) => {
    const next = { ...query, q: value };
    const qs = toParams(next).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA" && searchRef.current) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenu} aria-label="Open menu">☰</button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        {pathname === "/library" && isAdmin && (
          <label className="topbar-search" htmlFor="topbar-search">
            <span aria-hidden="true">⌕</span>
            <input id="topbar-search" ref={searchRef} value={query.q} onChange={(e) => updateSearch(e.target.value)} placeholder="Search designs…" autoComplete="off" />
            <kbd className="mono">/</kbd>
          </label>
        )}
        <Link href="/login" className="topbar-account"><span className="avatar" aria-hidden="true">{isAdmin ? "AD" : "VW"}</span><span className="account-label">{isAdmin ? "Admin" : "Viewer"}</span></Link>
      </div>
    </header>
  );
}
