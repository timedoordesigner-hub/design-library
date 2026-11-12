import { getAdVideos } from "@/lib/googleDrive";

export async function GET() {
  try {
    return Response.json({ videos: await getAdVideos() });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Google Drive could not be reached.";
    return Response.json({ message }, { status: 500 });
  }
}
