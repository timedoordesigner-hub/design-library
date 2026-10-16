import { Suspense } from "react";
import { Gallery } from "@/components/Gallery";

export default function ThumbnailPage() {
  return (
    <Suspense fallback={<main className="content-inner py-8"><div className="skeleton h-72 w-full" /></main>}>
      <Gallery />
    </Suspense>
  );
}
