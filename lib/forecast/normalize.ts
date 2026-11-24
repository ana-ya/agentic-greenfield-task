import type { CurrentConditions, Forecast, ForecastDay } from "./types";

/**
 * Open-Meteo forecast JSON → domain model (FR-FORECAST-01, FR-FORECAST-06).
 * Returns an error instead of throwing, so the caller can show the calm failure Notice.
 * Daily cloud cover is the mean of the hourly values from 09:00 to 18:00 inclusive (FR-COMFORT-02).
 */

export type NormalizeResult = { ok: true; forecast: Forecast } | { ok: false; error: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_HOUR = /^(\d{4}-\d{2}-\d{2})T(\d{2}):\d{2}$/;
const DAYTIME_FROM = 9;
const DAYTIME_TO = 18;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === "object" && value !== null && !Array.isArray(value);
const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
const str = (value: unknown): string | null => (typeof value === "string" ? value : null);

/** Element `i` of `series[key]`; absent arrays and non-number values read as missing. */
function at(series: Json, key: string, i: number): unknown {
  const values = series[key];
  return Array.isArray(values) ? values[i] : undefined;
}

function daytimeCloudMeans(hourly: unknown): Map<string, number> {
  const sums = new Map<string, { total: number; count: number }>();
  if (!isObject(hourly) || !Array.isArray(hourly.time)) return new Map();
  hourly.time.forEach((time, i) => {
    const match = typeof time === "string" ? ISO_HOUR.exec(time) : null;
    const cloud = num(at(hourly, "cloud_cover", i));
    if (!match || cloud === null) return;
    const hour = Number(match[2]);
    if (hour < DAYTIME_FROM || hour > DAYTIME_TO) return;
    const entry = sums.get(match[1]) ?? { total: 0, count: 0 };
    sums.set(match[1], { total: entry.total + cloud, count: entry.count + 1 });
  });
  return new Map([...sums].map(([date, { total, count }]) => [date, total / count]));
}

function currentConditions(current: unknown): CurrentConditions | null {
  if (!isObject(current) || typeof current.time !== "string") return null;
  const isDay = num(current.is_day);
  return {
    time: current.time,
    temperature: num(current.temperature_2m),
    code: num(current.weather_code),
    isDay: isDay === null ? null : isDay === 1,
    cloud: num(current.cloud_cover),
  };
}

export function normalizeForecast(raw: unknown): NormalizeResult {
  if (!isObject(raw)) return { ok: false, error: "response is not an object" };
  if (raw.error === true) return { ok: false, error: `upstream error: ${str(raw.reason) ?? "unknown"}` };
  const { daily } = raw;
  if (!isObject(daily) || !Array.isArray(daily.time)) return { ok: false, error: "daily.time is missing" };
  if (daily.time.length < 7) return { ok: false, error: "fewer than 7 days" };
  if (!daily.time.every((date) => typeof date === "string" && ISO_DATE.test(date))) {
    return { ok: false, error: "daily.time is not YYYY-MM-DD" };
  }
  const timezone = str(raw.timezone);
  const utcOffsetSeconds = num(raw.utc_offset_seconds);
  if (timezone === null || utcOffsetSeconds === null) return { ok: false, error: "timezone is missing" };

  const clouds = daytimeCloudMeans(raw.hourly);
  const days: ForecastDay[] = (daily.time as string[]).map((date, i) => ({
    date,
    code: num(at(daily, "weather_code", i)),
    tempMax: num(at(daily, "temperature_2m_max", i)),
    tempMin: num(at(daily, "temperature_2m_min", i)),
    apparentMax: num(at(daily, "apparent_temperature_max", i)),
    precipProb: num(at(daily, "precipitation_probability_max", i)),
    windMax: num(at(daily, "wind_speed_10m_max", i)),
    uvMax: num(at(daily, "uv_index_max", i)),
    sunrise: str(at(daily, "sunrise", i)),
    sunset: str(at(daily, "sunset", i)),
    cloudMean: clouds.get(date) ?? null,
  }));

  return { ok: true, forecast: { timezone, utcOffsetSeconds, days, current: currentConditions(raw.current) } };
}
