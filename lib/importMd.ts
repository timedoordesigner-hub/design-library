import { categoryGroups, categoryNames, mediaTypes } from "./taxonomy";
import { validUrl, type Design } from "./designs";

export const MAX_FILE_BYTES = 256 * 1024;
export const MAX_FILES = 500;

export const TEMPLATE = `---
sourceNo: 272
nama: Design Roadmap Courses
category: Courses
subCategory: Design
tipe: Website
link: https://www.figma.com/design/abc
keywords: [roadmap, courses, all courses]
preview: Design Roadmap Courses.png
w: 16
h: 9
---
Design notes here.
`;

export type ImportFields = Omit<Design, "id" | "image" | "w" | "h"> & { w?: number; h?: number; image?: string };
export type ParsedMd = { file: string; fields?: ImportFields; errors: string[]; warnings: string[] };
export type PlanStatus = "new" | "update" | "skip" | "error";
export type PlanRow = { file: string; status: PlanStatus; messages: string[]; fields?: ImportFields; design?: Design };

const KNOWN = ["sourceNo", "nama", "category", "subCategory", "tipe", "link", "keywords", "preview", "w", "h", "note"];
const unquote = (v: string) => (/^(["']).*\1$/.test(v) && v.length > 1 ? v.slice(1, -1) : v);
const positiveInt = (v: string) => (/^\d+$/.test(v) && Number(v) > 0 ? Number(v) : undefined);

// ponytail: YAML subset (flat key: value, keywords as [a, b] or a, b). Nested/multiline YAML -> add a real parser.
export function parseDesignMd(text: string, file: string): ParsedMd {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fail = (message: string): ParsedMd => ({ file, errors: [...errors, message], warnings });

  const lines = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") return fail("Front matter not found (the first line must be ---).");
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (end < 0) return fail("Front matter closing marker --- not found.");

  const raw: Record<string, string> = {};
  lines.slice(1, end).forEach((line, i) => {
    if (!line.trim() || line.trimStart().startsWith("#")) return;
    const colon = line.indexOf(":");
    if (colon < 1) return void errors.push(`Line ${i + 2}: format must be "key: value".`);
    const key = line.slice(0, colon).trim();
    if (key in raw) return void errors.push(`Line ${i + 2}: duplicate key "${key}".`);
    raw[key] = unquote(line.slice(colon + 1).trim());
    if (key === "id" || key === "image") warnings.push(`"${key}" is ignored.`);
    else if (!KNOWN.includes(key)) warnings.push(`Unknown key "${key}", ignored.`);
  });

  const sourceNo = positiveInt(raw.sourceNo ?? "");
  if (sourceNo === undefined) errors.push("sourceNo must be a positive whole number.");
  (["nama", "category", "subCategory", "tipe"] as const).forEach((key) => {
    if (!raw[key]) errors.push(`${key} is required.`);
  });
  if (raw.link && !validUrl(raw.link)) errors.push("link must start with http:// or https://.");
  const dims: Record<"w" | "h", number | undefined> = { w: undefined, h: undefined };
  (["w", "h"] as const).forEach((key) => {
    if (!raw[key]) return;
    dims[key] = positiveInt(raw[key]);
    if (dims[key] === undefined) errors.push(`${key} must be a positive whole number.`);
  });
  if (errors.length) return { file, errors, warnings };

  const subs: string[] = categoryGroups.flatMap((g) => [...g.subcategories]);
  if (!(categoryNames as string[]).includes(raw.category)) warnings.push(`Category "${raw.category}" is not in the list.`);
  if (!subs.includes(raw.subCategory)) warnings.push(`Sub category "${raw.subCategory}" is not in the list.`);
  if (!(mediaTypes as readonly string[]).includes(raw.tipe)) warnings.push(`Media type "${raw.tipe}" is not in the list.`);

  const kw = (raw.keywords ?? "").replace(/^\[|\]$/g, "");
  return {
    file,
    errors,
    warnings,
    fields: {
      sourceNo: sourceNo as number,
      nama: raw.nama,
      category: raw.category,
      subCategory: raw.subCategory,
      tipe: raw.tipe,
      link: raw.link ?? "",
      keywords: kw.split(",").map((k) => unquote(k.trim())).filter(Boolean),
      preview: raw.preview ?? "",
      note: lines.slice(end + 1).join("\n").trim() || raw.note || "",
      w: dims.w,
      h: dims.h,
    },
  };
}

// Pure planner: used for the review table and re-run at commit time against the current library.
export function planImport(parsed: ParsedMd[], existing: Design[], overwrite: boolean): PlanRow[] {
  const bySource = new Map(existing.map((d) => [d.sourceNo, d]));
  const seen = new Set<number>();
  let nextId = existing.reduce((max, d) => Math.max(max, d.id), 0) + 1;

  return parsed.map((row): PlanRow => {
    const { file, fields } = row;
    const messages = [...row.errors, ...row.warnings];
    if (!fields || row.errors.length) return { file, status: "error", messages, fields };
    if (seen.has(fields.sourceNo)) return { file, status: "error", messages: [`Duplicate No. ${fields.sourceNo} in this batch (first file used).`, ...messages], fields };
    seen.add(fields.sourceNo);

    const old = bySource.get(fields.sourceNo);
    if (old && !overwrite) return { file, status: "skip", messages: ["Already in the library, skipped.", ...messages], fields };
    const { w, h, image, ...rest } = fields;
    if (old) {
      return { file, status: "update", messages, fields, design: { ...old, ...rest, preview: fields.preview || old.preview, image: image || old.image, w: w ?? old.w, h: h ?? old.h } };
    }
    return { file, status: "new", messages, fields, design: { ...rest, ...(image && { image }), id: nextId++, w: w ?? 16, h: h ?? 9 } };
  });
}
