// Run: npx tsx lib/importMd.test.ts
import assert from "node:assert/strict";
import type { Design } from "./designs";
import { parseDesignMd, planImport, TEMPLATE } from "./importMd";

const ok = parseDesignMd(TEMPLATE, "a.md");
assert.deepEqual(ok.errors, []);
assert.equal(ok.fields?.sourceNo, 272);
assert.deepEqual(ok.fields?.keywords, ["roadmap", "courses", "all courses"]);
assert.equal(ok.fields?.note, "Design notes here.");

const crlf = parseDesignMd("﻿" + TEMPLATE.replace(/\n/g, "\r\n").replace("[roadmap, courses, all courses]", "a, b"), "b.md");
assert.deepEqual(crlf.errors, []);
assert.deepEqual(crlf.fields?.keywords, ["a", "b"]);
assert.equal(ok.fields?.link, "https://www.figma.com/design/abc");

assert.match(parseDesignMd("nama: x", "c.md").errors[0], /Front matter/);
assert.match(parseDesignMd("---\nnama: x\n", "c.md").errors[0], /closing/);
assert.ok(parseDesignMd("---\nnama: x\n---", "d.md").errors.length >= 4);
assert.ok(parseDesignMd(TEMPLATE.replace("https://", "ftp://"), "e.md").errors.some((e) => e.includes("link")));
assert.ok(parseDesignMd(TEMPLATE.replace("w: 16", "w: 1.5"), "f.md").errors.some((e) => e.startsWith("w ")));
const warn = parseDesignMd(TEMPLATE.replace("---\nDesign notes", "id: 9\nfoo: 1\ncategory: Lain\n---\nDesign notes"), "g.md");
assert.ok(warn.errors.some((e) => e.includes("duplicate")));
const warn2 = parseDesignMd(TEMPLATE.replace("w: 16", "id: 9\nfoo: 1").replace("category: Courses", "category: Lain"), "g.md");
assert.deepEqual(warn2.errors, []);
assert.equal(warn2.warnings.length, 3);

const old: Design = { id: 5, sourceNo: 272, nama: "Lama", category: "Courses", subCategory: "Design", tipe: "Website", link: "", keywords: [], preview: "old.png", note: "", w: 4, h: 5, image: "data:x" };
const dup = parseDesignMd(TEMPLATE.replace("272", "300"), "h.md");
const batch = [ok, parseDesignMd(TEMPLATE, "i.md"), dup, parseDesignMd("bad", "j.md")];

const skip = planImport(batch, [old], false);
assert.deepEqual(skip.map((r) => r.status), ["skip", "error", "new", "error"]);
assert.equal(skip[2].design?.id, 6);

const over = planImport([parseDesignMd(TEMPLATE.replace("w: 16\nh: 9\n", ""), "k.md")], [old], true);
assert.equal(over[0].status, "update");
assert.equal(over[0].design?.id, 5);
assert.equal(over[0].design?.image, "data:x");
assert.equal(over[0].design?.w, 4);
assert.equal(over[0].design?.nama, "Design Roadmap Courses");

console.log("importMd ok");
