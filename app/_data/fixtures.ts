import honolulu from "@/lib/forecast/__fixtures__/forecast-honolulu.json";
import lviv from "@/lib/forecast/__fixtures__/forecast-lviv.json";
import noData from "@/lib/forecast/__fixtures__/forecast-no-data-saturday.json";
import rainy from "@/lib/forecast/__fixtures__/forecast-rainy.json";
import sunday from "@/lib/forecast/__fixtures__/forecast-sunday-today.json";

/**
 * Fixture mode data (design D-9, `WEATHER_FIXTURES=1 npm run dev`). Development only.
 *
 * Forecast by place: Ужгород → rainy week; Київ → Saturday without data; Одеса → Sunday "today";
 * Honolulu → UTC−10; «Нульовий острів» (0, 0) → forced failure; anything else → Львів's week.
 * Search: prefix match on the places below; queries of exactly 3 characters answer after 1.2 s
 * (to exercise out-of-order answers); "fail…" → forced failure.
 */

const PLACES = [
  { name: "Львів", admin1: "Львівська область", country: "Україна", country_code: "UA", latitude: 49.83826, longitude: 24.02324 },
  { name: "Львове", admin1: "Херсонська область", country: "Україна", country_code: "UA", latitude: 46.71298, longitude: 32.93425 },
  { name: "Ужгород", admin1: "Закарпатська область", country: "Україна", country_code: "UA", latitude: 48.6208, longitude: 22.2879 },
  { name: "Київ", admin1: "Київ", country: "Україна", country_code: "UA", latitude: 50.4501, longitude: 30.5234 },
  { name: "Одеса", admin1: "Одеська область", country: "Україна", country_code: "UA", latitude: 46.4825, longitude: 30.7233 },
  { name: "Краків", admin1: "Малопольське воєводство", country: "Польща", country_code: "PL", latitude: 50.0614, longitude: 19.9366 },
  { name: "Honolulu", admin1: "Гаваї", country: "США", country_code: "US", latitude: 21.30694, longitude: -157.85834 },
  { name: "Нульовий острів", country: "Океан", latitude: 0, longitude: 0 },
];

const near = (lat: number, lon: number, place: { latitude: number; longitude: number }) =>
  Math.abs(lat - place.latitude) < 0.05 && Math.abs(lon - place.longitude) < 0.05;

export function fixtureForecast(lat: number, lon: number): unknown {
  const place = PLACES.find((p) => near(lat, lon, p))?.name;
  if (place === "Нульовий острів") throw new Error("fixture: forced forecast failure");
  const raw = { Ужгород: rainy, Київ: noData, Одеса: sunday, Honolulu: honolulu }[place ?? ""] ?? lviv;
  return { ...raw, latitude: lat, longitude: lon };
}

export async function fixtureSearch(query: string): Promise<unknown> {
  if (query.toLowerCase().startsWith("fail")) throw new Error("fixture: forced search failure");
  if ([...query].length === 3) await new Promise((resolve) => setTimeout(resolve, 1200));
  const needle = query.toLocaleLowerCase("uk");
  const results = PLACES.filter((p) => p.name.toLocaleLowerCase("uk").startsWith(needle));
  return results.length ? { results } : { generationtime_ms: 0.05 };
}
