import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { AdminOnly } from "@/components/AdminOnly";
import ManageStaticAds from "@/components/ManageStaticAds";
import { getStaticAds } from "@/lib/googleDrive";

export const instant = false;

async function Content() {
  await connection();
  let ads;
  try {
    ads = await getStaticAds();
  } catch {
    return <div className="ads-error" role="alert">Static ads could not be loaded from Google Drive.</div>;
  }
  return <ManageStaticAds ads={ads} />;
}

export default function ManageStaticAdsPage() {
  return (
    <AdminOnly>
      <main className="content-inner ads-page">
        <header className="ads-header">
          <Link href="/manage" className="manage-back">← Manage</Link>
          <h2>Manage Static Ads</h2>
          <p>Edit titles, descriptions, and Figma links without changing files in Google Drive.</p>
        </header>
        <Suspense fallback={<div className="ads-loading">Loading static ads…</div>}>
          <Content />
        </Suspense>
      </main>
    </AdminOnly>
  );
}
