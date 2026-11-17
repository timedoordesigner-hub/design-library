import { Suspense } from "react";
import { connection } from "next/server";
import { getStaticAds } from "@/lib/googleDrive";
import StaticAdsGallery from "@/components/StaticAdsGallery";

export const instant = false;

async function StaticAdsContent() {
  await connection();
  let ads;
  try {
    ads = await getStaticAds();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Drive could not be reached.";
    return (
      <div className="ads-error">
        <strong>Static Ads unavailable.</strong>
        <p>{message}</p>
      </div>
    );
  }
  return <StaticAdsGallery ads={ads} />;
}

export default function StaticAdsPage() {
  return (
    <main className="content-inner ads-page">
      <header className="ads-header">
        <p className="eyebrow">STATIC ADS</p>
        <h2>Image ads, ready to reuse.</h2>
        <p>Browse static ad creatives. Click one to preview, download, or open the source in Drive.</p>
      </header>
      <Suspense
        fallback={
          <div className="sa-masonry" role="status" aria-label="Loading static ads">
            {[4 / 5, 1, 3 / 4, 16 / 9, 1, 4 / 5, 3 / 4, 1].map((ratio, i) => (
              <div key={i} className="sa-skeleton" style={{ aspectRatio: ratio }} />
            ))}
          </div>
        }
      >
        <StaticAdsContent />
      </Suspense>
    </main>
  );
}
