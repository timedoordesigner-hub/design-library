import { Suspense } from "react";
import { AdminOnly } from "@/components/AdminOnly";
import { Library } from "@/components/Library";

export default function LibraryPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<main className="content-inner py-8"><div className="skeleton h-16 w-full" /></main>}>
        <Library />
      </Suspense>
    </AdminOnly>
  );
}
