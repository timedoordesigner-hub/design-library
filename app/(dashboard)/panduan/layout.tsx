import type { ReactNode } from "react";
import { GuideTabs } from "@/components/GuideTabs";

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <main className="content-inner guide-page pb-16 pt-7">
      <GuideTabs />
      {children}
    </main>
  );
}
