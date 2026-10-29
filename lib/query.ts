import type { Design } from "./designs";
import { splitCategories } from "./taxonomy";

export type SortKey = "no" | "nama" | "category" | "tipe";
export type View = "list" | "grid";

export type Query = {
  q: string;
  cat: string[];
  sub: string[];
  tipe: string[];
  sort: SortKey;
  dir: "asc" | "desc";
  view: View;
  id: number | null;
};

const SORTS: SortKey[] = ["no", "nama", "category", "tipe"];

export function parseQuery(sp: URLSearchParams): Query {
  const sort = sp.get("sort") as SortKey;
  const id = Number(sp.get("id"));
  return {
    q: sp.get("q") ?? "",
    cat: sp.getAll("cat"),
    sub: sp.getAll("sub"),
    tipe: sp.getAll("tipe"),
    sort: SORTS.includes(sort) ? sort : "no",
    dir: sp.get("dir") === "desc" ? "desc" : "asc",
    view: sp.get("view") === "grid" ? "grid" : "list",
    id: Number.isInteger(id) && id > 0 ? id : null,
  };
}

export function toParams(q: Query): URLSearchParams {
  const params = new URLSearchParams();
  if (q.q) params.set("q", q.q);
  q.cat.forEach((category) => params.append("cat", category));
  q.sub.forEach((sub) => params.append("sub", sub));
  q.tipe.forEach((type) => params.append("tipe", type));
  if (q.sort !== "no") params.set("sort", q.sort);
  if (q.dir !== "asc") params.set("dir", q.dir);
  if (q.view !== "list") params.set("view", q.view);
  if (q.id) params.set("id", String(q.id));
  return params;
}

export function isActive(q: Query): boolean {
  return !!(q.q || q.cat.length || q.sub.length || q.tipe.length || q.id || q.sort !== "no");
}

const haystack = (d: Design) =>
  [d.nama, d.category, d.subCategory, d.tipe, d.preview, d.note, ...d.keywords].join(" ").toLowerCase();

// Pisah keyword pakai koma atau spasi: "roadmap, courses" -> ["roadmap", "courses"].
const terms = (text: string) => text.toLowerCase().split(/[,\s]+/).filter(Boolean);

function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/** Kalau ada keyword yang tidak ditemukan (typo), kembalikan tulisan yang benar. Null jika tidak ada typo. */
export function correction(all: Design[], text: string): string | null {
  const hays = all.map(haystack);
  let vocab: string[] | null = null;
  let changed = false;
  const fixed = terms(text).map((term) => {
    if (hays.some((h) => h.includes(term))) return term;
    vocab ??= [...new Set(hays.flatMap((h) => h.split(/[^\p{L}\p{N}]+/u)))].filter((w) => w.length > 2);
    const max = term.length > 4 ? 2 : 1;
    let best = term;
    let bestDistance = max + 1;
    for (const word of vocab) {
      if (Math.abs(word.length - term.length) > max) continue;
      const d = distance(term, word);
      if (d < bestDistance) [best, bestDistance] = [word, d];
    }
    if (best !== term) changed = true;
    return best;
  });
  return changed ? fixed.join(", ") : null;
}

export function apply(all: Design[], q: Query): Design[] {
  const words = terms(correction(all, q.q) ?? q.q);
  const filtered = all.filter((design) => {
    if (q.cat.length && !splitCategories(design.category).some((c) => q.cat.includes(c))) return false;
    if (q.sub.length && !q.sub.includes(design.subCategory)) return false;
    if (q.tipe.length && !q.tipe.includes(design.tipe)) return false;
    return true;
  });
  // Show designs matching the most keywords (all keywords matched = top and only result).
  const scores = new Map(filtered.map((d) => [d, words.filter((w) => haystack(d).includes(w)).length]));
  const best = words.length ? Math.max(0, ...scores.values()) : 0;
  if (words.length) {
    if (!best) return [];
    filtered.splice(0, filtered.length, ...filtered.filter((d) => scores.get(d) === best));
  }
  const direction = q.dir === "desc" ? -1 : 1;
  return filtered.sort((a, b) => {
    if (q.sort === "no") return (a.sourceNo - b.sourceNo) * direction;
    return String(a[q.sort]).localeCompare(String(b[q.sort]), "id") * direction;
  });
}
