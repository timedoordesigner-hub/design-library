import { Suspense } from "react";
import { connection } from "next/server";
import { AdminOnly } from "@/components/AdminOnly";
import AdsGallery from "@/components/AdsGallery";
import { getAdVideos } from "@/lib/googleDrive";

export const instant = false;

async function ManageAdsContent() {
  await connection();
  let videos;
  try {
    videos = await getAdVideos();
  } catch {
    return <div className="ads-error" role="alert">Video tidak dapat dimuat dari Google Drive.</div>;
  }
  return <AdsGallery videos={videos} manage />;
}

export default function ManageAdsPage() {
  return <AdminOnly><main className="content-inner ads-page"><header className="ads-header"><h2>Manage Ads</h2><p>Edit atau sembunyikan video tanpa mengubah file Google Drive.</p></header><Suspense fallback={<div className="ads-loading">Memuat video…</div>}><ManageAdsContent /></Suspense></main></AdminOnly>;
}
