// Jalankan: npx tsx lib/query.test.ts
import assert from "node:assert/strict";
import type { Design } from "./designs";
import { apply, correction, parseQuery } from "./query";

const make = (id: number, nama: string, keywords: string[]): Design => ({
  id, sourceNo: id, nama, category: "Event", subCategory: "", tipe: "Poster",
  link: "", keywords, preview: "", note: "", w: 1, h: 1,
});
const all = [make(1, "A", ["roadmap", "courses"]), make(2, "B", ["roadmap"]), make(3, "C", ["webinar"])];
const run = (q: string) => apply(all, parseQuery(new URLSearchParams({ q }))).map((d) => d.id);

assert.deepEqual(run("roadmap, courses"), [1]); // semua keyword cocok -> hanya yang paling cocok
assert.deepEqual(run("roadmap webinar"), [1, 2, 3]); // masing-masing cocok 1 keyword
assert.deepEqual(run("roadmap, nothingxyz"), [1, 2]); // keyword tak dikenal diabaikan
assert.deepEqual(run("zzzzzz"), []); // tidak ada yang cocok
assert.equal(correction(all, "roadmpa"), "roadmap"); // typo -> tulisan benar
assert.deepEqual(run("roadmpa"), [1, 2]); // typo tetap dicarikan
assert.equal(correction(all, "roadmap, courses"), null); // tanpa typo
console.log("query.test OK");
