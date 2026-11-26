/**
 * Forecast domain model (framework-free, TC-PURE-01). Dates are the PLACE's calendar dates
 * ("YYYY-MM-DD"); times are place-local ISO strings without an offset ("2026-11-28T07:42").
 * Missing values are `null` (FR-COMFORT-09 depends on telling "missing" apart from 0).
 */

export interface ForecastDay {
  date: string;
  /** WMO weather code. */
  code: number | null;
  tempMax: number | null;
  tempMin: number | null;
  apparentMax: number | null;
  /** Precipitation probability max, %. */
  precipProb: number | null;
  /** Wind speed max, km/h. */
  windMax: number | null;
  uvMax: number | null;
  sunrise: string | null;
  sunset: string | null;
  /** Mean hourly cloud cover 09:00–18:00 place time, %; `null` when none of those hours is known. */
  cloudMean: number | null;
}

export interface CurrentConditions {
  time: string;
  temperature: number | null;
  code: number | null;
  isDay: boolean | null;
  cloud: number | null;
}

export interface Forecast {
  /** IANA time zone of the place, e.g. "Europe/Kyiv". */
  timezone: string;
  utcOffsetSeconds: number;
  /** All fetched days (8), today first. The UI shows the first seven. */
  days: ForecastDay[];
  current: CurrentConditions | null;
}
