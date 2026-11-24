import type { ForecastDay } from "../forecast/types";
import { comfortScore, type ComfortResult } from "../scoring/comfort";
import { comfortLevel, type ComfortLevelName } from "../scoring/levels";

/**
 * The weekend answer (FR-COMFORT-05/06/08/09). Dates are the place's calendar dates ("YYYY-MM-DD").
 */

export interface Weekend {
  saturday: string;
  sunday: string;
}

const dayOfWeek = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday–Saturday → this week's Saturday + Sunday; Sunday → next week's (FR-COMFORT-06). */
export function upcomingWeekend(placeToday: string): Weekend {
  const weekday = dayOfWeek(placeToday); // 0 = Sunday … 6 = Saturday
  const toSaturday = weekday === 0 ? 6 : 6 - weekday;
  const saturday = addDays(placeToday, toSaturday);
  return { saturday, sunday: addDays(saturday, 1) };
}

export interface WeekendDay {
  day: ForecastDay;
  comfort: ComfortResult;
}

export type WeekendSummary =
  | {
      kind: "scored";
      weekend: Weekend;
      saturday: WeekendDay;
      sunday: WeekendDay;
      score: number;
      band: ComfortLevelName;
      /** The lower-scoring day's rationale (Saturday on a tie). */
      rationale: string;
      hi: number | null;
      lo: number | null;
    }
  /** Either day has no score, or isn't in the fetched days (FR-COMFORT-09). */
  | { kind: "unavailable"; weekend: Weekend };

const roundHalfUp = (value: number) => Math.floor(Number((value + 0.5).toPrecision(12)));

function extreme(values: Array<number | null>, pick: (...v: number[]) => number): number | null {
  const known = values.filter((v): v is number => v !== null);
  return known.length ? pick(...known) : null;
}

export function weekendSummary(days: ForecastDay[], weekend: Weekend): WeekendSummary {
  const find = (date: string) => days.find((day) => day.date === date);
  const sat = find(weekend.saturday);
  const sun = find(weekend.sunday);
  if (!sat || !sun) return { kind: "unavailable", weekend };

  const saturday = { day: sat, comfort: comfortScore(sat) };
  const sunday = { day: sun, comfort: comfortScore(sun) };
  if (saturday.comfort.value === null || sunday.comfort.value === null) return { kind: "unavailable", weekend };

  const score = roundHalfUp((saturday.comfort.value + sunday.comfort.value) / 2);
  const lower = sunday.comfort.value < saturday.comfort.value ? sunday : saturday;
  return {
    kind: "scored",
    weekend,
    saturday,
    sunday,
    score,
    band: comfortLevel(score).level,
    rationale: lower.comfort.rationale,
    hi: extreme([sat.tempMax, sun.tempMax], Math.max),
    lo: extreme([sat.tempMin, sun.tempMin], Math.min),
  };
}
