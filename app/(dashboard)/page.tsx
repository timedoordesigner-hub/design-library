import { Suspense } from "react";
import { HomeSwitch } from "@/components/HomeSwitch";

function LibraryFallback() {
  return (
    <main className="content-inner py-8">
      <div className="skeleton h-5 w-24" />
      <div className="skeleton mt-8 h-16 w-full" />
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={<LibraryFallback />}><HomeSwitch /></Suspense>;
}




