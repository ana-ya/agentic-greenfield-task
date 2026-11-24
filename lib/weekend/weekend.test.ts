import { describe, expect, it } from "vitest";
import lviv from "../forecast/__fixtures__/forecast-lviv.json";
import noData from "../forecast/__fixtures__/forecast-no-data-saturday.json";
import sundayToday from "../forecast/__fixtures__/forecast-sunday-today.json";
import { normalizeForecast } from "../forecast/normalize";
import type { ForecastDay } from "../forecast/types";
import { strings } from "../i18n";
import { upcomingWeekend, weekendSummary } from ".";

const days = (raw: unknown): ForecastDay[] => {
  const result = normalizeForecast(raw);
  if (!result.ok) throw new Error(result.error);
  return result.forecast.days;
};

describe("upcomingWeekend (FR-COMFORT-06)", () => {
  it.each([
    ["Monday", "2026-11-23", "2026-11-28"],
    ["Wednesday", "2026-11-25", "2026-11-28"],
    ["Friday", "2026-11-27", "2026-11-28"],
    ["Saturday", "2026-11-28", "2026-11-28"],
    ["Sunday → next weekend", "2026-11-29", "2026-12-05"],
    ["across a month end", "2026-12-30", "2027-01-02"],
  ])("%s %s → Saturday %s", (_name, today, saturday) => {
    const weekend = upcomingWeekend(today);
    expect(weekend.saturday).toBe(saturday);
    expect(weekend.sunday).toBe(new Date(Date.parse(`${saturday}T00:00:00Z`) + 86400000).toISOString().slice(0, 10));
  });

  it("uses the place's date, not the visitor's: still Saturday at the place", () => {
    // The caller passes the first forecast day, which is the place's today.
    expect(upcomingWeekend("2026-11-28")).toEqual({ saturday: "2026-11-28", sunday: "2026-11-29" });
  });

  it("keeps next weekend within the 8 fetched days on a Sunday", () => {
    const forecastDays = days(sundayToday);
    const weekend = upcomingWeekend(forecastDays[0].date);
    expect(forecastDays.map((d) => d.date)).toEqual(expect.arrayContaining([weekend.saturday, weekend.sunday]));
  });
});

// A day whose comfort score is exactly `score`: rain takes up to 60 penalty points (0.6 × P),
// wind takes the rest (1 point per km/h above 15, up to 25), so scores from 15 to 100 are reachable.
function dayScoring(date: string, score: number, tempMax = 12, tempMin = 4): ForecastDay {
  const penalty = 100 - score;
  const rain = Math.min(60, penalty);
  return {
    date,
    code: 0,
    tempMax,
    tempMin,
    apparentMax: 18,
    precipProb: rain / 0.6,
    windMax: 15 + (penalty - rain),
    uvMax: 0,
    sunrise: null,
    sunset: null,
    cloudMean: 0,
  };
}

const WEEKEND = { saturday: "2026-11-28", sunday: "2026-11-29" };

describe("weekendSummary (FR-COMFORT-05/08)", () => {
  it("averages the two days half-up and takes the lower day's rationale", () => {
    const summary = weekendSummary([dayScoring("2026-11-28", 84, 13, 5), dayScoring("2026-11-29", 72, 12, 6)], WEEKEND);
    expect(summary).toMatchObject({ kind: "scored", score: 78, band: "good", hi: 13, lo: 5 });
    if (summary.kind === "scored") expect(summary.rationale).toBe(summary.sunday.comfort.rationale);
  });

  it.each([
    [70, 69, 70, "good"],
    [55, 55, 55, "fair"],
    [31, 31, 31, "poor"],
  ])("Saturday %i + Sunday %i → %i (%s)", (sat, sun, score, band) => {
    const summary = weekendSummary([dayScoring("2026-11-28", sat), dayScoring("2026-11-29", sun)], WEEKEND);
    expect(summary).toMatchObject({ kind: "scored", score, band });
  });

  it("maps bands to the verdict titles", () => {
    expect(strings.weekend.verdict.good("Львів")).toBe("Львів — варто їхати");
    expect(strings.weekend.verdict.fair("Ужгород")).toBe("Ужгород — можна їхати, але з планом Б");
    expect(strings.weekend.verdict.poor("Чернівці")).toBe("Чернівці — краще перенести");
  });

  it("is unavailable when a weekend day has no score (FR-COMFORT-09)", () => {
    const forecastDays = days(noData);
    expect(weekendSummary(forecastDays, upcomingWeekend(forecastDays[0].date))).toEqual({
      kind: "unavailable",
      weekend: WEEKEND,
    });
  });

  it("is unavailable when the weekend isn't in the fetched days", () => {
    expect(weekendSummary([dayScoring("2026-11-28", 80)], WEEKEND).kind).toBe("unavailable");
  });

  it("scores the Lviv fixture's weekend", () => {
    const forecastDays = days(lviv);
    const summary = weekendSummary(forecastDays, upcomingWeekend(forecastDays[0].date));
    expect(summary).toMatchObject({ kind: "scored", weekend: WEEKEND });
  });
});
