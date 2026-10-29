"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/panduan", "1", "Overview"],
  ["/panduan/priority", "2", "Priority & scope"],
  ["/panduan/request", "3", "Submit & track"],
  ["/panduan/help", "4", "FAQ & help"],
];

// Page-level tabs for the Request Guide. Each tab is its own route.
export function GuideTabs() {
  const pathname = usePathname();

  return (
    <nav className="guide-tabs" aria-label="Request Guide">
      {tabs.map(([href, number, label]) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            <span>{number}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
