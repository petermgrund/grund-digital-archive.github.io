// Checks how 404.html reads a code from the address. Run: node tests/classify.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../404.html", import.meta.url), "utf8");
const block = html.slice(html.indexOf("// BEGIN classify"), html.indexOf("// END classify"));
const classify = new Function(block + "\nreturn classify;")();

const cases = [
  ["/XFETYZ", { kind: "object", value: "XFETYZ", file: null, part: null }],
  ["/xfetyz/", { kind: "object", value: "XFETYZ", file: null, part: null }],
  ["/xfe-tyz", { kind: "object", value: "XFETYZ", file: null, part: null }],
  ["/XFE%E2%80%93TYZ", { kind: "object", value: "XFETYZ", file: null, part: null }],
  ["/GDA%20XFETYZ", { kind: "object", value: "XFETYZ", file: null, part: null }],
  ["/https%3A%2F%2Fw3id.org%2Fgda%2FXFETYZ", { kind: "object", value: "XFETYZ", file: null, part: null }],
  ["/B36Z55", { kind: "object", value: "B36Z55", file: null, part: null }],
  ["/XFETYZ.pdf", { kind: "object", value: "XFETYZ", file: "XFETYZ.pdf", part: null }],
  ["/XFETYZ_v01.jpg", { kind: "object", value: "XFETYZ", file: "XFETYZ_v01.jpg", part: "the back (verso)" }],
  ["/PHKN3D_a01.jpg", { kind: "object", value: "PHKN3D", file: "PHKN3D_a01.jpg", part: "an AI-edited version" }],
  ["/AT7HY7_p07.jpg", { kind: "object", value: "AT7HY7", file: "AT7HY7_p07.jpg", part: "a page of an album or scrapbook" }],
  ["/PHKN3D_o.tif", { kind: "object", value: "PHKN3D", file: "PHKN3D_o.tif", part: "the untouched original" }],
  ["/a000277", { kind: "scan", value: "a000277" }],
  ["/A-000277", { kind: "scan", value: "a000277" }],
  ["/a000277.tif", { kind: "scan", value: "a000277" }],
  ["/B2.C3.F1", { kind: "location", value: "B2.C3.F1" }],
  ["/b2.c3", { kind: "location", value: "B2.C3" }],
  ["/S1", { kind: "location", value: "S1" }],
  ["/JYMZ", { kind: "retired", value: "JYMZ" }],
  ["/jgs", { kind: "retired", value: "JGS" }],
  ["/JGS/B01", { kind: "retired", value: "JGS/B01" }],
  ["/JGS-B01", { kind: "retired", value: "JGS-B01" }],
  ["/PHKI3D", { kind: "misread", value: "PHKI3D" }],
  ["/PHK0N3", { kind: "misread", value: "PHK0N3" }],
  ["/", { kind: "empty" }],
  ["/GDA", { kind: "unknown", value: "GDA" }],
  ["/foo/bar", { kind: "unknown", value: "foo/bar" }],
  ["/%3Cscript%3E", { kind: "unknown", value: "<script>" }],
  ["/%E0%A4%A", { kind: "unknown", value: "%E0%A4%A" }],
];

let failed = 0;
for (const [path, expected] of cases) {
  try {
    assert.deepEqual(classify(path), expected);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${path}\n  expected ${JSON.stringify(expected)}\n  got      ${JSON.stringify(classify(path))}`);
  }
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
