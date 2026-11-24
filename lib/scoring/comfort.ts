import { strings } from "../i18n";

/**
 * Comfort model, PRD Appendix A (FR-COMFORT-01/02/03/07/09).
 * score = clamp(0, 100, roundHalfUp(100 − Σ penalties)); one rationale sentence from the largest penalty.
 * Pure and total: any input — numbers, NaN, ±Infinity, null, undefined — returns a result, never throws.
 */

/** The five daily inputs (FR-COMFORT-02). Missing or non-finite values add no penalty. */
export interface ComfortInput {
  /** Apparent temperature max, °C. */
  apparentMax?: number | null;
  /** Precipitation probability max, %. */
  precipProb?: number | null;
  /** Wind speed max, km/h. */
  windMax?: number | null;
  /** Mean cloud cover 09:00–18:00 place time, %. */
  cloudMean?: number | null;
  /** UV index max. */
  uvMax?: number | null;
}

export type RationaleKey = keyof typeof strings.comfort.rationale;

export type ComfortResult =
  | { value: number; key: Exclude<RationaleKey, "none">; rationale: string }
  | { value: null; key: "none"; rationale: string };

type Factor = "cold" | "heat" | "rain" | "wind" | "cloud" | "uv";

/** Table order doubles as the tie-break order. */
const FACTORS: readonly Factor[] = ["cold", "heat", "rain", "wind", "cloud", "uv"];
const STRONG: Partial<Record<Factor, Exclude<RationaleKey, "none">>> = {
  cold: "coldStrong",
  heat: "heatStrong",
  rain: "rainStrong",
  wind: "windStrong",
};
const IDEAL_BELOW = 20;
const STRONG_FROM = 20;

const known = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Half-up rounding without float noise (69.5 → 70, 46.5 → 47). */
const roundHalfUp = (value: number) => Math.floor(Number((value + 0.5).toPrecision(12)));

function penalties(input: ComfortInput): Record<Factor, number> {
  const t = input.apparentMax;
  const p = known(input.precipProb) ? clamp(input.precipProb, 0, 100) : null;
  const w = known(input.windMax) ? Math.max(0, input.windMax) : null;
  const c = known(input.cloudMean) ? clamp(input.cloudMean, 0, 100) : null;
  const u = known(input.uvMax) ? Math.max(0, input.uvMax) : null;
  return {
    cold: known(t) && t < 18 ? Math.min(45, 2.5 * (18 - t)) : 0,
    heat: known(t) && t > 24 ? Math.min(45, 4 * (t - 24)) : 0,
    rain: p === null ? 0 : Math.min(60, 0.6 * p),
    wind: w !== null && w > 15 ? Math.min(25, w - 15) : 0,
    cloud: c === null ? 0 : Math.min(10, 0.1 * c),
    uv: u !== null && u > 5 ? Math.min(15, 3 * (u - 5)) : 0,
  };
}

/** Score one day (FR-COMFORT-01). */
export function comfortScore(input: ComfortInput): ComfortResult {
  const values = [input.apparentMax, input.precipProb, input.windMax, input.cloudMean, input.uvMax];
  if (!values.some(known)) {
    return { value: null, key: "none", rationale: strings.comfort.rationale.none };
  }

  const penalty = penalties(input);
  const total = FACTORS.reduce((sum, factor) => sum + penalty[factor], 0);
  const value = clamp(roundHalfUp(100 - total), 0, 100);

  let key: Exclude<RationaleKey, "none"> = "ideal";
  if (total >= IDEAL_BELOW) {
    // reduce keeps the first factor on ties, which follows the Appendix A table order.
    const top = FACTORS.reduce((best, factor) => (penalty[factor] > penalty[best] ? factor : best));
    key = penalty[top] >= STRONG_FROM ? (STRONG[top] ?? top) : top;
  }
  return { value, key, rationale: strings.comfort.rationale[key] };
}
