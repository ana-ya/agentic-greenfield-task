import { cacheLife } from "next/cache";
import { fixturesEnabled } from "@/lib/forecast/fixtures-enabled";
import { normalizeForecast } from "@/lib/forecast/normalize";
import type { Forecast } from "@/lib/forecast/types";
import { toSuggestions, type Suggestion } from "@/lib/geocode/results";
import { fixtureForecast, fixtureSearch } from "./fixtures";

/**
 * Server-only access to Open-Meteo (TC-DATA-01, design D-3). Keyless (NFR-COST-01).
 * Results are cached per argument: `lat`/`lon` arrive rounded to 2 decimals, so the cache key is
 * the rounded place (NFR-API-01). Failures throw and are not cached, so the next request retries.
 */

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const SEARCH_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_TIMEOUT_MS = 8000; // FR-FORECAST-06
const SEARCH_TIMEOUT_MS = 5000; // FR-SEARCH-08

const DAILY = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "uv_index_max",
  "sunrise",
  "sunset",
];

async function getJson(url: URL, timeoutMs: number): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
  return response.json();
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  let raw: unknown;
  if (fixturesEnabled(process.env)) {
    raw = fixtureForecast(lat, lon);
  } else {
    const url = new URL(FORECAST_URL);
    url.search = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone: "auto",
      forecast_days: "8",
      daily: DAILY.join(","),
      hourly: "temperature_2m,cloud_cover",
      current: "temperature_2m,weather_code,is_day,cloud_cover",
    }).toString();
    raw = await getJson(url, FORECAST_TIMEOUT_MS);
  }

  const result = normalizeForecast(raw);
  if (!result.ok) throw new Error(`Unexpected forecast data: ${result.error}`);
  return result.forecast;
}

export async function searchPlaces(query: string): Promise<Suggestion[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 172800 });

  if (fixturesEnabled(process.env)) return toSuggestions(await fixtureSearch(query));

  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({ name: query, count: "8", language: "uk", format: "json" }).toString();
  return toSuggestions(await getJson(url, SEARCH_TIMEOUT_MS));
}
