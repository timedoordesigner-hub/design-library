// Run: npx tsx lib/importSpreadsheet.test.ts
import assert from "node:assert/strict";
import { driveThumb, parseSpreadsheetJson } from "./importSpreadsheet";
import { planImport } from "./importMd";

const id = "1AbCdEfGhIjKlMnOpQrStUvWxYz012345";
const thumb = `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
assert.equal(driveThumb(`https://drive.google.com/file/d/${id}/view?usp=sharing`), thumb);
assert.equal(driveThumb(`https://drive.google.com/open?id=${id}`), thumb);
assert.equal(driveThumb(id), thumb);
assert.equal(driveThumb("https://example.com/a.png"), "https://example.com/a.png");
assert.equal(driveThumb("bukan url"), "");

const row = { sourceNo: 42, nama: "Banner", category: "Marketing, Branch", tipe: "Exterior, Banner", link: "https://www.figma.com/x", keywords: "banner, free trial", image: `https://drive.google.com/file/d/${id}/view` };
const [ok, noImg, bad, dupe] = parseSpreadsheetJson(JSON.stringify([row, { ...row, sourceNo: 43, image: "" }, { sourceNo: 0 }, row]), "a.json");
assert.deepEqual(ok.errors, []);
assert.equal(ok.fields?.category, "Marketing, Branch");
assert.equal(ok.fields?.subCategory, "-");
assert.deepEqual(ok.fields?.keywords, ["banner", "free trial"]);
assert.equal(ok.fields?.image, thumb);
assert.ok(!("image" in (noImg.fields ?? {})));
assert.ok(bad.errors.length >= 4);

const plan = planImport([ok, noImg, bad, dupe], [], false);
assert.deepEqual(plan.map((p) => p.status), ["new", "new", "error", "error"]);
assert.equal(plan[0].design?.image, thumb);
assert.equal(plan[1].design?.image, undefined);

assert.match(parseSpreadsheetJson("{", "b.json")[0].errors[0], /JSON/);
assert.match(parseSpreadsheetJson("{}", "b.json")[0].errors[0], /array/);

console.log("importSpreadsheet ok");
