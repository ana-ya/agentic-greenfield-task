import { describe, expect, it } from "vitest";
import { strings } from "../i18n";
import { comfortScore, type ComfortInput } from "./comfort";
import { comfortLevel } from "./levels";

const day = (t: number | null, p: number | null, w: number | null, c: number | null, uv: number | null): ComfortInput => ({
  apparentMax: t,
  precipProb: p,
  windMax: w,
  cloudMean: c,
  uvMax: uv,
});

// PRD Appendix A reference cases: the acceptance tests for FR-COMFORT-07 and FR-COMFORT-09.
const REFERENCE = [
  ["Ідеальний травневий день", day(21, 5, 8, 30, 5), 94, "good", "ideal"],
  ["Тепло, мінлива хмарність", day(25, 10, 12, 50, 6), 82, "good", "ideal"],
  ["Хмарно й тихо", day(20, 10, 8, 100, 3), 84, "good", "ideal"],
  ["Прохолодно й сухо", day(12, 10, 10, 60, 2), 73, "good", "cold"],
  ["Вітряно, але сухо", day(19, 10, 40, 40, 4), 65, "fair", "windStrong"],
  ["Листопад, похмуро", day(5, 20, 14, 90, 1), 47, "fair", "coldStrong"],
  ["Зимовий сонячний день", day(-3, 0, 10, 10, 1), 54, "fair", "coldStrong"],
  ["Літня спека", day(33, 5, 10, 10, 9), 48, "fair", "heatStrong"],
  ["Дощовий день", day(16, 90, 20, 100, 2), 26, "poor", "rainStrong"],
  ["Злива з вітром", day(14, 100, 45, 100, 1), 0, "poor", "rainStrong"],
] as const;

describe("comfortScore — Appendix A reference cases", () => {
  it.each(REFERENCE)("%s → %i (%s, %s)", (_name, input, score, band, key) => {
    const result = comfortScore(input);
    expect(result).toEqual({ value: score, key, rationale: strings.comfort.rationale[key] });
    expect(comfortLevel(score).level).toBe(band);
  });

  it("Немає даних → no score, never 100", () => {
    expect(comfortScore(day(null, null, null, null, null))).toEqual({
      value: null,
      key: "none",
      rationale: "Немає даних для оцінки.",
    });
  });
});

describe("comfortScore — missing inputs", () => {
  it("scores a day with only UV missing, UV adding no penalty", () => {
    expect(comfortScore(day(21, 5, 8, 30, null)).value).toBe(94);
  });

  it("treats an empty object as all inputs missing", () => {
    expect(comfortScore({}).value).toBeNull();
  });
});
