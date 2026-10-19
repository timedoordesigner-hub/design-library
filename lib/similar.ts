import type { Design } from "./designs";
import { splitCategories } from "./taxonomy";

const parts = (value: string) => value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
const shared = (a: string[], b: string[]) => a.filter((v) => b.includes(v)).length;

// Skor: 3 per category sama, 2 per tipe sama, 1 per keyword sama. Skor 0 dibuang.
export function similarTo(design: Design, all: Design[], limit = 6): Design[] {
  const cat = splitCategories(design.category).map((c) => c.toLowerCase());
  const tipe = parts(design.tipe);
  const kw = design.keywords.map((k) => k.toLowerCase());
  return all
    .filter((d) => d.id !== design.id)
    .map((d) => ({
      d,
      score: 3 * shared(cat, splitCategories(d.category).map((c) => c.toLowerCase())) + 2 * shared(tipe, parts(d.tipe)) + shared(kw, d.keywords.map((k) => k.toLowerCase())),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.d.sourceNo - b.d.sourceNo)
    .slice(0, limit)
    .map((x) => x.d);
}
