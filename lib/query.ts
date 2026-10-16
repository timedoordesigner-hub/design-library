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

export function apply(all: Design[], q: Query): Design[] {
  const needle = q.q.trim().toLowerCase();
  const filtered = all.filter((design) => {
    if (q.cat.length && !splitCategories(design.category).some((c) => q.cat.includes(c))) return false;
    if (q.sub.length && !q.sub.includes(design.subCategory)) return false;
    if (q.tipe.length && !q.tipe.includes(design.tipe)) return false;
    if (!needle) return true;
    return [design.nama, design.category, design.subCategory, design.tipe, design.preview, design.note, ...design.keywords]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const direction = q.dir === "desc" ? -1 : 1;
  return filtered.sort((a, b) => {
    if (q.sort === "no") return (a.sourceNo - b.sourceNo) * direction;
    return String(a[q.sort]).localeCompare(String(b[q.sort]), "id") * direction;
  });
}
