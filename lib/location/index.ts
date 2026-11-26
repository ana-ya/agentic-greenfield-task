import { strings } from "../i18n";

/**
 * The active location lives only in the URL: `?lat=&lon=&name=` (FR-LOC-01, PRD Appendix C).
 * Coordinates are rounded to 2 decimals (≈1 km) on read and write, so they double as cache keys.
 */

const MAX_NAME_LENGTH = 80;

export interface Place {
  lat: number;
  lon: number;
  /** Display name; `null` when the URL has none, in which case `label` shows the coordinates. */
  name: string | null;
}

export type ParsedLocation =
  | { kind: "empty" }
  | { kind: "invalid" }
  | ({ kind: "ok"; label: string } & Place);

type SearchParams = Record<string, string | string[] | undefined>;

const DECIMAL = /^-?\d+(\.\d+)?$/;

/** Round half-up to 2 decimals; `toPrecision` first removes float noise such as 1.005 × 100 = 100.4999…. */
export function roundCoordinate(value: number): number {
  const rounded = Math.round(Number((value * 100).toPrecision(12))) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Trim and cap to 80 characters (code points, not UTF-16 units); empty → null. */
export function capName(name: string | null | undefined): string | null {
  const trimmed = (name ?? "").trim();
  return trimmed ? Array.from(trimmed).slice(0, MAX_NAME_LENGTH).join("") : null;
}

/** «49,84° пн. ш., 24,03° сх. д.» */
export function coordinateLabel(lat: number, lon: number): string {
  const part = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(2).replace(".", ",")}° ${value < 0 ? negative : positive}`;
  const { north, south, east, west } = strings.location;
  return `${part(lat, north, south)}, ${part(lon, east, west)}`;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function coordinate(raw: string | undefined, limit: number): number | null {
  if (raw === undefined || !DECIMAL.test(raw)) return null;
  const value = Number(raw);
  return Math.abs(value) <= limit ? roundCoordinate(value) : null;
}

/** Read the active location from search params (FR-LOC-01). */
export function parseLocation(params: SearchParams): ParsedLocation {
  const rawLat = first(params.lat);
  const rawLon = first(params.lon);
  const name = capName(first(params.name));
  if (rawLat === undefined && rawLon === undefined && name === null) return { kind: "empty" };

  const lat = coordinate(rawLat, 90);
  const lon = coordinate(rawLon, 180);
  if (lat === null || lon === null) return { kind: "invalid" };

  return { kind: "ok", lat, lon, name, label: name ?? coordinateLabel(lat, lon) };
}

/** The canonical URL for a place (FR-LOC-01): rounded coordinates, name capped and encoded. */
export function hrefFor(place: Place): string {
  const params = new URLSearchParams({
    lat: String(roundCoordinate(place.lat)),
    lon: String(roundCoordinate(place.lon)),
  });
  const name = capName(place.name);
  if (name) params.set("name", name);
  return `/?${params.toString()}`;
}
