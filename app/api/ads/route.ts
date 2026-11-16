import type { NextRequest } from "next/server";
import { getAdVideos } from "@/lib/googleDrive";

// ?category=general|branch loads only that half of Drive; omitted loads all.
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  try {
    return Response.json(
      {
        videos: await getAdVideos(
          category === "general" || category === "branch" ? category : undefined,
        ),
      },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Google Drive could not be reached.";
    return Response.json({ message }, { status: 500 });
  }
}
