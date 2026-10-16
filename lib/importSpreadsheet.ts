import { validUrl } from "./designs";
import type { ParsedMd } from "./importMd";

export const MAX_JSON_BYTES = 10 * 1024 * 1024;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

// Drive file URL / bare file ID -> thumbnail URL (needs "Anyone with the link: Viewer"). Other https URLs pass through.
export function driveThumb(value: string): string {
  const v = value.trim();
  if (!v) return "";
  const m = /(?:drive|docs)\.google\.com\/.*?(?:\/d\/|[?&]id=)([\w-]{10,})/.exec(v) ?? /^([\w-]{25,})$/.exec(v);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`;
  return validUrl(v) ? v : "";
}

function parseRow(raw: unknown, file: string): ParsedMd {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { file, errors: ["Baris harus berupa objek."], warnings };
  const r = raw as Record<string, unknown>;

  const no = str(r.sourceNo);
  const sourceNo = /^\d+$/.test(no) && Number(no) > 0 ? Number(no) : undefined;
  if (sourceNo === undefined) errors.push("sourceNo wajib berupa bilangan bulat positif.");
  const nama = str(r.nama);
  const category = str(r.category);
  const tipe = str(r.tipe);
  if (!nama) errors.push("nama wajib diisi.");
  if (!category) errors.push("category wajib diisi.");
  if (!tipe) errors.push("tipe wajib diisi.");
  const link = str(r.link);
  if (link && !validUrl(link)) errors.push("link harus diawali http:// atau https://.");
  if (errors.length) return { file, errors, warnings };

  const rawImage = str(r.image);
  const image = driveThumb(rawImage);
  if (rawImage && !image) warnings.push("image bukan URL valid, diabaikan.");

  const dim = (v: unknown) => { const s = str(v); return /^\d+$/.test(s) && Number(s) > 0 ? Number(s) : undefined; };
  const keywords = (Array.isArray(r.keywords) ? r.keywords.map(str) : str(r.keywords).split(",").map((k) => k.trim())).filter(Boolean);

  return {
    file,
    errors,
    warnings,
    fields: {
      sourceNo: sourceNo as number,
      nama,
      category,
      subCategory: str(r.subCategory) || "-",
      tipe,
      link,
      keywords,
      preview: str(r.preview),
      note: str(r.note),
      w: dim(r.w),
      h: dim(r.h),
      ...(image && { image }),
    },
  };
}

export function parseSpreadsheetJson(text: string, file: string): ParsedMd[] {
  let data: unknown;
  try { data = JSON.parse(text.replace(/^﻿/, "")); }
  catch { return [{ file, errors: ["JSON tidak valid."], warnings: [] }]; }
  if (!Array.isArray(data)) return [{ file, errors: ["JSON harus berupa array baris."], warnings: [] }];
  return data.map((row, i) => parseRow(row, `${file} #${i + 1}`));
}
