// Run: npx tsx lib/similar.test.ts
import assert from "node:assert/strict";
import type { Design } from "./designs";
import { similarTo } from "./similar";

const d = (id: number, category: string, tipe: string, keywords: string[]): Design =>
  ({ id, sourceNo: id, nama: `n${id}`, category, subCategory: "-", tipe, link: "", keywords, preview: "", note: "", w: 1, h: 1 });

const a = d(1, "Marketing, Branch", "Banner", ["promo"]);
const all = [a, d(2, "Marketing", "Banner", []), d(3, "Courses", "Poster", ["promo"]), d(4, "Courses", "Poster", []), d(5, "Branch", "Banner", ["promo"])];

assert.deepEqual(similarTo(a, all).map((x) => x.id), [5, 2, 3]); // 5: 3+2+1, 2: 3+2, 3: 1; 4 skor 0
assert.equal(similarTo(a, all, 1).length, 1);
assert.ok(similarTo(a, all).every((x) => x.id !== a.id));

console.log("similar ok");
