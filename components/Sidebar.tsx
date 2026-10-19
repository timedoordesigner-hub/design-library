"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { ExternalIcon, GridIcon, InfoIcon, LibraryIcon, LoginIcon, PlusIcon, UploadIcon } from "./Icons";

const logo = "/timedoor-logo.png";

const navItems = [{ label: "Cari design", href: "/", icon: "library", tone: "green", admin: false }, { label: "Design Library", href: "/thumbnail", icon: "grid", tone: "blue", admin: false }, { label: "Library", href: "/library", icon: "library", tone: "green", admin: true }, { label: "Tambah file", href: "/tambah", icon: "plus", tone: "blue", admin: true }, { label: "Import data", href: "/impor", icon: "upload", tone: "orange", admin: true }];
const icons = { library: <LibraryIcon />, grid: <GridIcon />, plus: <PlusIcon />, upload: <UploadIcon /> };

type Props = { open?: boolean; onClose?: () => void };

export function Sidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const { isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div className={`sidebar-scrim ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Navigasi utama">
        <div className="sidebar-brand">
          <Image className="sidebar-logo" src={logo} alt="Timedoor Academy" width={2000} height={520} priority />
        </div>
        <p className="sidebar-label">Workspace</p>
        <nav className="sidebar-nav">
          {navItems.filter((item) => isAdmin || !item.admin).map((item) => {
            const active = item.href === "/" ? pathname === "/" : item.href === "/library" ? pathname === "/library" || pathname.startsWith("/edit/") : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} onClick={onClose}><span className={`nav-icon nav-icon-${item.tone}`} aria-hidden="true">{icons[item.icon as keyof typeof icons]}</span>{item.label}</Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="mb-5 flex items-center gap-1">
            <a href="https://requestwave.vercel.app" target="_blank" rel="noreferrer" className="nav-item min-w-0 flex-1" onClick={onClose}><span className="nav-icon nav-icon-blue" aria-hidden="true"><ExternalIcon /></span>Request wave<span className="ml-auto" aria-hidden="true">↗</span></a>
            <span className="info-tip info-tip-right" tabIndex={0} role="button" aria-label="Apa itu Request wave?">
              <InfoIcon />
              <span className="info-tip-popup" role="tooltip">Request Wave: web untuk melihat berapa request yang masuk </span>
            </span>
          </div>
          <p className="sidebar-label">Account</p>
          {isAdmin ? (
            <button type="button" className="nav-item login-nav w-full text-left" onClick={() => { void signOut(); onClose?.(); }}><span className="nav-icon nav-icon-orange" aria-hidden="true"><LoginIcon /></span>Keluar</button>
          ) : (
            <Link href="/login" className="nav-item login-nav" onClick={onClose}><span className="nav-icon nav-icon-orange" aria-hidden="true"><LoginIcon /></span>Login</Link>
          )}
          <p className="sidebar-version">Design Library · v0.1</p>
        </div>
      </aside>
    </>
  );
}
