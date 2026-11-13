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
    return <div className="ads-error" role="alert">Videos could not be loaded from Google Drive.</div>;
  }
  return <AdsGallery videos={videos} manage />;
}

export default function ManageAdsPage() {
  return <AdminOnly><main className="content-inner ads-page"><header className="ads-header"><h2>Manage Video Library</h2><p>Edit or hide videos without changing files in Google Drive.</p></header><Suspense fallback={<div className="ads-loading">Loading videos…</div>}><ManageAdsContent /></Suspense></main></AdminOnly>;
}
