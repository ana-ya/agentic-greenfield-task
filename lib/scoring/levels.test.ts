import { describe, expect, it } from "vitest";
import { clampScore, comfortLevel } from "./levels";

describe("clampScore", () => {
  it.each([
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    [-5, 0],
    [150, 100],
    [49.5, 50],
  ])("clampScore(%s) is %s", (input, expected) => {
    expect(clampScore(input)).toBe(expected);
  });
});

describe("comfortLevel", () => {
  it.each([
    [39, "poor", "Некомфортно"],
    [40, "fair", "Терпимо"],
    [69, "fair", "Терпимо"],
    [70, "good", "Комфортно"],
  ] as const)("score %i is %s («%s»)", (score, level, word) => {
    expect(comfortLevel(score)).toMatchObject({ level, word });
  });
});
