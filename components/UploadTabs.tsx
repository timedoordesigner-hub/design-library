"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon, UploadIcon } from "./Icons";

const tabs = [
  { href: "/tambah", label: "Add file", text: "Upload one design", icon: <PlusIcon /> },
  { href: "/impor", label: "Import JSON", text: "Add many from Google Sheets", icon: <UploadIcon /> },
];

export function UploadTabs() {
  const pathname = usePathname();
  return (
    <div className="content-inner pt-7">
      <nav className="upload-tabs" aria-label="Upload options">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <span aria-hidden="true">{tab.icon}</span>
              <strong>{tab.label}</strong>
              <small>{tab.text}</small>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
