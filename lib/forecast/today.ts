import type { ForecastDay } from "./types";

/**
 * The place's current calendar date (FR-FORECAST-02, FR-COMFORT-06), worked out at render time.
 * A cached forecast can outlive the place's midnight, so its first day is not always "today".
 */
export function placeToday(nowMs: number, utcOffsetSeconds: number): string {
  return new Date(nowMs + utcOffsetSeconds * 1000).toISOString().slice(0, 10);
}

/**
 * The date the forecast should start from: `today` when the data covers it, otherwise the
 * first day of the data (fixtures with fixed dates, or a clock far off the data's range).
 */
export function firstShownDate(days: ForecastDay[], today: string): string {
  return days.some((day) => day.date === today) ? today : days[0].date;
}
