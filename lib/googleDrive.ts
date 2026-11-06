import "server-only";

const ROOT_ID = process.env.GOOGLE_DRIVE_ADS_FOLDER_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  videoMediaMetadata?: { durationMillis?: string; width?: number; height?: number };
};

type DriveListResponse = { files?: DriveFile[]; nextPageToken?: string };

export type AdVideo = {
  id: string;
  name: string;
  folder: string;
  branch: string;
  category: "general" | "branch";
  url: string;
  thumbnail: string;
  duration: number;
  width?: number;
  height?: number;
};

let tokenCache: { value: string; expiresAt: number } | undefined;
let dataCache: { value: AdVideo[]; expiresAt: number } | undefined;

function base64Url(value: ArrayBuffer | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64Bytes(value: string) {
  const normalized = value.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function accessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) throw new Error("Google Drive is not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.");

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({ iss: SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/drive.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const key = await crypto.subtle.importKey("pkcs8", base64Bytes(PRIVATE_KEY), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claim}.${base64Url(signature)}` }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google token request failed (${response.status}): ${detail}`);
  }
  const data = await response.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("Google token response did not include an access token.");
  tokenCache = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

async function listChildren(token: string, parent: string) {
  const files: DriveFile[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      q: `'${parent}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,webViewLink,thumbnailLink,videoMediaMetadata)",
      pageSize: "1000",
      orderBy: "name_natural",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Google Drive request failed (${response.status}): ${detail}`);
    }
    const data = await response.json() as DriveListResponse;
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return files;
}

function duration(value?: string) {
  return value ? Math.round(Number(value) / 1000) : 0;
}

function branchRoot(name: string) {
  return /\b(branch|overseas)\s+ads?\b/i.test(name);
}

async function loadVideos(token: string) {
  if (!ROOT_ID) throw new Error("Google Drive is not configured. Add GOOGLE_DRIVE_ADS_FOLDER_ID.");
  const videos: AdVideo[] = [];
  const queue = [{ id: ROOT_ID, path: [] as string[] }];
  let processed = 0;

  while (queue.length && processed < 10_000) {
    const current = queue.shift()!;
    const children = await listChildren(token, current.id);
    for (const file of children) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        queue.push({ id: file.id, path: [...current.path, file.name] });
        continue;
      }
      if (!file.mimeType.startsWith("video/")) continue;
      const root = current.path.findIndex(branchRoot);
      const isBranch = root >= 0;
      const branch = isBranch ? current.path[root + 1] ?? current.path[root] : "";
      videos.push({
        id: file.id,
        name: file.name,
        folder: current.path.at(-1) ?? "General",
        branch,
        category: isBranch ? "branch" : "general",
        url: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`,
        thumbnail: file.thumbnailLink ?? `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
        duration: duration(file.videoMediaMetadata?.durationMillis),
        width: file.videoMediaMetadata?.width,
        height: file.videoMediaMetadata?.height,
      });
      processed += 1;
    }
  }
  return videos;
}

export async function getAdVideos() {
  if (dataCache && dataCache.expiresAt > Date.now()) return dataCache.value;
  const videos = await loadVideos(await accessToken());
  dataCache = { value: videos, expiresAt: Date.now() + 5 * 60_000 };
  return videos;
}
