import { describe, expect, it } from "vitest";
import { strings } from "../i18n";
import { comfortScore, type ComfortInput } from "./comfort";

// Property-style checks without extra dependencies: a seeded generator over awkward inputs.
const SPECIAL = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, null, undefined, -0, -50, 0, 500];

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

function generate(count: number): ComfortInput[] {
  const random = seeded(42);
  const value = () => (random() < 0.25 ? SPECIAL[Math.floor(random() * SPECIAL.length)] : random() * 160 - 40);
  return Array.from({ length: count }, () => ({
    apparentMax: value(),
    precipProb: value(),
    windMax: value(),
    cloudMean: value(),
    uvMax: value(),
  }));
}

const INPUTS = generate(2000);

describe("comfortScore properties", () => {
  it("is total: never throws, and returns a whole 0–100 score or no-data", () => {
    for (const input of INPUTS) {
      const result = comfortScore(input);
      if (result.value === null) {
        expect(result.key).toBe("none");
      } else {
        expect(Number.isInteger(result.value)).toBe(true);
        expect(result.value).toBeGreaterThanOrEqual(0);
        expect(result.value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("is monotonic in rain: a rainier day never scores higher", () => {
    for (const input of INPUTS.slice(0, 500)) {
      let previous = Number.POSITIVE_INFINITY;
      for (let precipProb = 0; precipProb <= 100; precipProb += 5) {
        const { value } = comfortScore({ ...input, precipProb });
        expect(value).not.toBeNull();
        expect(value!).toBeLessThanOrEqual(previous);
        previous = value!;
      }
    }
  });

  it("only produces rationales from the Appendix A table", () => {
    const allowed = new Set<string>(Object.values(strings.comfort.rationale));
    for (const input of INPUTS) {
      expect(allowed.has(comfortScore(input).rationale)).toBe(true);
    }
  });

  it("every possible rationale is one sentence of at most 80 characters, without «!»", () => {
    for (const text of Object.values(strings.comfort.rationale)) {
      expect(text.length).toBeLessThanOrEqual(80);
      expect(text).toMatch(/^[^.!?]+\.$/);
    }
  });
});
