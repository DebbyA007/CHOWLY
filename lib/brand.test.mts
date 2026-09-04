import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MARK_DOT, MARK_OCHRE, MARK_PATH, MARK_STROKE, MARK_VIEWBOX } from "./brand.ts";

// The in-app mark must be the file's geometry, never a redrawing.
test("the mark in the app is the mark in public/brand/mark.svg", () => {
  const svg = readFileSync(new URL("../public/brand/mark.svg", import.meta.url), "utf8");
  assert.ok(svg.includes(`viewBox="${MARK_VIEWBOX}"`), "viewBox");
  assert.ok(svg.includes(`d="${MARK_PATH}"`), "arc path");
  assert.ok(svg.includes(`stroke-width="${MARK_STROKE}"`), "stroke width");
  assert.ok(svg.includes(`cx="${MARK_DOT.cx}" cy="${MARK_DOT.cy}" r="${MARK_DOT.r}"`), "dot");
  assert.ok(svg.includes(`stroke="${MARK_OCHRE}"`) && svg.includes(`fill="${MARK_OCHRE}"`), "ochre");
});

test("the app icon carries the same mark", () => {
  const svg = readFileSync(new URL("../public/icon.svg", import.meta.url), "utf8");
  assert.ok(svg.includes(`d="${MARK_PATH}"`) && svg.includes(`cx="${MARK_DOT.cx}" cy="${MARK_DOT.cy}" r="${MARK_DOT.r}"`));
});
