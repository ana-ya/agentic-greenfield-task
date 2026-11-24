import { describe, expect, it } from "vitest";
import honolulu from "./__fixtures__/forecast-honolulu.json";
import lviv from "./__fixtures__/forecast-lviv.json";
import noData from "./__fixtures__/forecast-no-data-saturday.json";
import rainy from "./__fixtures__/forecast-rainy.json";
import sunday from "./__fixtures__/forecast-sunday-today.json";
import { normalizeForecast } from "./normalize";
import type { Forecast } from "./types";

function ok(raw: unknown): Forecast {
  const result = normalizeForecast(raw);
  if (!result.ok) throw new Error(result.error);
  return result.forecast;
}

describe("normalizeForecast — fixtures", () => {
  it.each([
    ["Львів", lviv],
    ["rainy week", rainy],
    ["no-data Saturday", noData],
    ["Sunday today", sunday],
    ["Honolulu", honolulu],
  ])("normalises %s into 8 place-local days", (_name, raw) => {
    const forecast = ok(raw);
    expect(forecast.days).toHaveLength(8);
    expect(forecast.days[0].date).toBe(raw.daily.time[0]);
  });

  it("maps daily values and the place's time zone", () => {
    const forecast = ok(lviv);
    expect(forecast.timezone).toBe("Europe/Kyiv");
    expect(forecast.days[3]).toMatchObject({
      date: "2026-11-28",
      code: 0,
      tempMax: 12.6,
      tempMin: 4.5,
      precipProb: 5,
      windMax: 8.4,
      sunrise: "2026-11-28T07:42",
    });
  });

  it("averages cloud cover over 09:00–18:00 only", () => {
    const raw = structuredClone(lviv);
    raw.hourly.cloud_cover = raw.hourly.time.map((time: string) => (Number(time.slice(11, 13)) < 9 ? 0 : 100));
    raw.hourly.cloud_cover[raw.hourly.time.indexOf("2026-11-25T09:00")] = 50;
    // 09:00 = 50, 10:00–18:00 = 100 (9 hours) → (50 + 900) / 10 = 95; night hours (0) are ignored.
    expect(ok(raw).days[0].cloudMean).toBe(95);
  });

  it("keeps the place's dates for a place far west of the visitor", () => {
    const forecast = ok(honolulu);
    expect(forecast.timezone).toBe("Pacific/Honolulu");
    expect(forecast.utcOffsetSeconds).toBe(-36000);
    expect(forecast.days[0].date).toBe("2026-11-24");
  });

  it("reads nulls as missing, and a day without any hourly cloud as no cloud mean", () => {
    const saturday = ok(noData).days[3];
    expect(saturday).toMatchObject({ apparentMax: null, precipProb: null, windMax: null, uvMax: null, cloudMean: null });
  });

  it("reads the current conditions", () => {
    expect(ok(lviv).current).toMatchObject({ isDay: true, code: 3 });
  });
});

describe("normalizeForecast — malformed input (FR-FORECAST-06)", () => {
  type MutableRaw = { daily: { time?: string[]; [series: string]: unknown }; timezone?: string };
  const without = (mutate: (raw: MutableRaw) => void) => {
    const raw = structuredClone(lviv) as unknown as MutableRaw;
    mutate(raw);
    return normalizeForecast(raw);
  };

  it.each([
    ["not an object", () => normalizeForecast("nope")],
    ["missing daily.time", () => without((raw) => delete raw.daily.time)],
    ["dates with a time part", () => without((raw) => (raw.daily.time![0] = "2026-11-25T00:00"))],
    ["fewer than 7 days", () => without((raw) => (raw.daily.time = raw.daily.time!.slice(0, 6)))],
    ["missing time zone", () => without((raw) => delete raw.timezone)],
    ["an upstream error body", () => normalizeForecast({ error: true, reason: "Latitude must be in range" })],
  ])("rejects %s", (_case, run) => {
    expect(run().ok).toBe(false);
  });

  it("treats an absent daily series as all missing", () => {
    const result = without((raw) => delete raw.daily.uv_index_max);
    expect(result.ok && result.forecast.days.every((day) => day.uvMax === null)).toBe(true);
  });
});
