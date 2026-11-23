import { strings } from "./strings";

/** Port of `WeatherExplorer.comfortLevel` from docs/design-system/components/bundle.js. */

export type ComfortLevelName = "good" | "fair" | "poor";

export interface ComfortLevel {
  min: number;
  level: ComfortLevelName;
  word: string;
}

/** Ordered best → worst. Thresholds: 70–100 good, 40–69 fair, 0–39 poor. */
export const COMFORT_LEVELS: readonly ComfortLevel[] = [
  { min: 70, level: "good", word: strings.comfort.good },
  { min: 40, level: "fair", word: strings.comfort.fair },
  { min: 0, level: "poor", word: strings.comfort.poor },
];

/** Round and clamp to 0–100. Non-finite input becomes 0. Never throws. */
export function clampScore(score: number): number {
  const n = Math.round(Number(score));
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

/** Map a 0–100 comfort score to its level and Ukrainian word. */
export function comfortLevel(score: number): ComfortLevel {
  const s = clampScore(score);
  return COMFORT_LEVELS.find((l) => s >= l.min) ?? COMFORT_LEVELS[COMFORT_LEVELS.length - 1];
}
