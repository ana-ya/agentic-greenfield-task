import { describe, expect, it } from "vitest";
import { en } from "./en";
import { uk } from "./uk";

// Copy rules (BC-BRAND-01, DESIGN.md "Hard rules → Copy"): no exclamation marks, no emoji.
// The country flag in search suggestions is computed at runtime, not stored here.
const EMOJI = /\p{Emoji_Presentation}|\p{Regional_Indicator}/u;
const SAMPLE_ARGS: unknown[][] = [["Львів"], [42], [86, "Комфортно"], [3, 3], [null]];

/** Every rendered value: plain strings, plus string functions called with sample arguments. */
function renderedValues(node: unknown, path = ""): Array<[string, string]> {
  if (typeof node === "string") return [[path, node]];
  if (typeof node === "function") {
    const fn = node as (...args: unknown[]) => unknown;
    const rendered = SAMPLE_ARGS.filter((args) => args.length === fn.length).flatMap((args) => {
      try {
        return [[`${path}(${args.join(", ")})`, String(fn(...args))] as [string, string]];
      } catch {
        return []; // argument types don't fit this function; another sample will
      }
    });
    if (rendered.length === 0) throw new Error(`no sample arguments render ${path}`);
    return rendered;
  }
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([key, value]) => renderedValues(value, path ? `${path}.${key}` : key));
  }
  return [];
}

describe.each([
  ["uk", uk],
  ["en", en],
])("%s strings", (_locale, dictionary) => {
  const values = renderedValues(dictionary);

  it("has values to check", () => {
    expect(values.length).toBeGreaterThan(50);
  });

  it.each(values)("%s has no exclamation mark", (_path, text) => {
    expect(text).not.toContain("!");
  });

  it.each(values)("%s has no emoji", (_path, text) => {
    expect(text).not.toMatch(EMOJI);
  });
});

describe("comfort rationales (FR-COMFORT-03)", () => {
  it.each(Object.entries(uk.comfort.rationale))("%s is one sentence of at most 80 characters", (_key, text) => {
    expect(text.length).toBeLessThanOrEqual(80);
    expect(text.endsWith(".")).toBe(true);
    expect(text.slice(0, -1)).not.toMatch(/[.!?]/);
  });
});
