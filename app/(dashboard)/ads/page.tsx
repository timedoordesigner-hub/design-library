import { Suspense } from "react";
import { connection } from "next/server";
import { getAdVideos } from "@/lib/googleDrive";
import AdsGallery from "@/components/AdsGallery";

export const instant = false;

async function AdsContent() {
  await connection();

  let result;
  try {
    result = await getAdVideos();
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error
        ? ` (${error.cause.message})`
        : "";
    const message = (error instanceof Error ? error.message : "") + cause;
    const apiDisabled =
      message.includes("SERVICE_DISABLED") ||
      message.includes("Google Drive API has not been used");
    return (
      <div className="ads-error">
        <strong>Video Ads belum tersedia.</strong>
        {apiDisabled ? (
          <p>
            Aktifkan Google Drive API di Google Cloud Console, tunggu beberapa
            menit, lalu refresh halaman.
          </p>
        ) : (
          <p>{message || "Google Drive tidak bisa diakses."}</p>
        )}
      </div>
    );
  }

  return <AdsGallery videos={result} />;
}

export default function AdsPage() {
  return (
    <main className="content-inner ads-page">
      <header className="ads-header">
        <div>
          <p className="eyebrow">VIDEO ADS</p>
          <h2>Find the right video, fast.</h2>
          <p>
            Browse reusable ads for every branch, or find videos made for a
            specific location.
          </p>
        </div>
      </header>
      <Suspense fallback={<div className="ads-loading">Loading videos…</div>}>
        <AdsContent />
      </Suspense>
    </main>
  );
}
