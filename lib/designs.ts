import { categoryGroups, categoryNames, mediaTypes, splitCategories } from "./taxonomy";

export type Design = {
  id: number;
  sourceNo: number;
  nama: string;
  category: string;
  subCategory: string;
  tipe: string;
  link: string;
  keywords: string[];
  preview: string;
  note: string;
  w: number;
  h: number;
  image?: string;
};

export function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function ordered(used: Set<string>, known: readonly string[]) {
  return [...known.filter((value) => used.has(value)), ...[...used].filter((value) => !known.includes(value)).sort()];
}

export function deriveOptions(items: Design[]) {
  const subs = categoryGroups.flatMap((group) => group.subcategories);
  return {
    categories: ordered(new Set(items.flatMap((d) => splitCategories(d.category))), categoryNames),
    subCategories: ordered(new Set(items.map((d) => d.subCategory)), subs),
    tipes: ordered(new Set(items.map((d) => d.tipe)), mediaTypes),
  };
}
