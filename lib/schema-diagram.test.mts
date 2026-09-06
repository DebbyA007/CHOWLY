import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The regression this guards: the entity relationship diagram in the README went three
// schema changes out of date without a single check going red, because nothing in
// typecheck, lint or the test run reads a diagram. Four migrations shipped over a picture
// that no longer showed the model.
//
// It does not assert that every field appears. The diagram is a drawing and it leaves out
// what a reader does not need, such as a restaurant's phone number. It asserts the two
// things a stale diagram always gets wrong: an entity that is missing entirely, and a
// field or enum value that was added by one of the deltas, which are exactly the parts of
// the model the document is about.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = readFileSync(join(root, "prisma", "schema.prisma"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
const diagram = readme.match(/```mermaid\n([\s\S]*?)```/)?.[1] ?? "";

test("the README carries a mermaid entity diagram", () => {
  assert.ok(diagram.includes("erDiagram"), "no erDiagram block found in README.md");
});

test("every model in the schema is an entity in the diagram", () => {
  const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]!);
  assert.ok(models.length >= 12, `expected the model's twelve entities, found ${models.length}`);
  const missing = models.filter((name) => !new RegExp(`^\\s*${name}\\s*\\{`, "m").test(diagram));
  assert.deepEqual(missing, [], `entities missing from the diagram: ${missing.join(", ")}`);
});

test("every enum value in the schema appears in the diagram", () => {
  const missing: string[] = [];
  for (const block of schema.matchAll(/^enum (\w+) \{([\s\S]*?)^\}/gm)) {
    for (const line of block[2]!.split("\n")) {
      const value = line.split("//")[0]!.trim();
      if (!value) continue;
      if (!diagram.includes(value)) missing.push(`${block[1]}.${value}`);
    }
  }
  assert.deepEqual(missing, [], `enum values missing from the diagram: ${missing.join(", ")}`);
});

// The deltas are the departures from the coursework model, and they are what the
// submission document is about. A diagram that does not show them is the one that was
// shipped, and this is the assertion that would have caught it.
test("every field a DELTA comment introduces appears in the diagram", () => {
  const fields = new Set<string>();
  const lines = schema.split("\n");
  let armed = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("//")) {
      if (/DELTA \d+/.test(line)) armed = true;
      continue;
    }
    if (line === "" || line.startsWith("@@") || line.startsWith("}")) {
      armed = false;
      continue;
    }
    if (!armed) continue;
    // A relation field is a navigation property, not a column. The diagram carries the
    // foreign key it is built on, waiterId rather than waiter, so those are skipped.
    if (line.includes("@relation") || /\[\]\s*$/.test(line)) continue;
    const name = line.split(/\s+/)[0]!;
    if (/^[a-z]\w*$/.test(name)) fields.add(name);
  }
  assert.ok(fields.size >= 12, `expected the delta fields, found ${fields.size}`);
  const missing = [...fields].filter((f) => !new RegExp(`\\b${f}\\b`).test(diagram));
  assert.deepEqual(missing, [], `fields added by a delta but missing from the diagram: ${missing.join(", ")}`);
});
