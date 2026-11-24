/**
 * Open-Meteo geocoding JSON → search suggestions (FR-SEARCH-01/02/05).
 * A search with no match returns no `results` key at all, which reads as an empty list.
 */

export interface Suggestion {
  name: string;
  /** First-level region (admin1), `null` when unknown. */
  region: string | null;
  country: string | null;
  /** Country flag emoji from the ISO 3166-1 alpha-2 code; the product's only emoji (DESIGN.md). */
  flag: string | null;
  lat: number;
  lon: number;
}

export const MAX_SUGGESTIONS = 8;

const REGIONAL_INDICATOR_A = 0x1f1e6;

function flagFor(code: unknown): string | null {
  if (typeof code !== "string" || !/^[A-Za-z]{2}$/.test(code)) return null;
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => REGIONAL_INDICATOR_A + c.charCodeAt(0) - 65));
}

const text = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value.trim() : null);
const coordinate = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export function toSuggestions(raw: unknown): Suggestion[] {
  const results = typeof raw === "object" && raw !== null ? (raw as { results?: unknown }).results : undefined;
  if (!Array.isArray(results)) return [];
  return results
    .flatMap((item: Record<string, unknown>): Suggestion[] => {
      const name = text(item?.name);
      const lat = coordinate(item?.latitude);
      const lon = coordinate(item?.longitude);
      if (name === null || lat === null || lon === null) return [];
      return [{ name, region: text(item.admin1), country: text(item.country), flag: flagFor(item.country_code), lat, lon }];
    })
    .slice(0, MAX_SUGGESTIONS);
}

/** «Львівська область · Україна»; the region is omitted when unknown, with no leading separator. */
export function secondaryLine({ region, country }: Pick<Suggestion, "region" | "country">): string {
  return [region, country].filter(Boolean).join(" · ");
}
