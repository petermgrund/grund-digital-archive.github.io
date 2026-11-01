// Checks how 404.html reads the list of issued codes, and that every code in
// codes.txt is well formed. Run: node tests/codelist.test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../404.html", import.meta.url), "utf8");
const block = html.slice(html.indexOf("// BEGIN codelist"), html.indexOf("// END codelist"));
const parseCodeList = new Function(block + "\nreturn parseCodeList;")();

let total = 0;
let failed = 0;
function check(name, body) {
  total += 1;
  try {
    body();
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}\n  ${error.message}`);
  }
}

check("one code per line", () => {
  assert.deepEqual([...parseCodeList("XFETYZ\nPHKN3D\n")], ["XFETYZ", "PHKN3D"]);
});
check("comments and blank lines are ignored", () => {
  assert.deepEqual([...parseCodeList("# the list\n\nXFETYZ # first\n\n# PHKN3D\n")], ["XFETYZ"]);
});
check("case, spaces, hyphens and Windows line endings are ignored", () => {
  assert.deepEqual([...parseCodeList(" xfe-tyz \r\nPHK N3D\r\nAT7–HY7")], ["XFETYZ", "PHKN3D", "AT7HY7"]);
});
check("an empty list gives an empty set", () => {
  assert.equal(parseCodeList("# nothing yet\n").size, 0);
  assert.equal(parseCodeList("").size, 0);
  assert.equal(parseCodeList(undefined).size, 0);
});
check("every code in codes.txt is a GDA code", () => {
  const codes = parseCodeList(readFileSync(new URL("../codes.txt", import.meta.url), "utf8"));
  const bad = [...codes].filter((code) => !/^[A-HJKMNP-Z2-9]{6}$/.test(code));
  assert.deepEqual(bad, [], `not GDA codes: ${bad.join(", ")}`);
});

console.log(`${total - failed}/${total} passed`);
process.exit(failed ? 1 : 0);
