import { strings } from "../i18n";

/**
 * WMO weather code → icon key + Ukrainian label (FR-FORECAST-08, PRD Appendix B).
 * Icon keys name `lucide-react` icons; `components/design-system/WeatherIcon.tsx` maps them,
 * so this module stays framework-free.
 */

export type WeatherIconKey =
  | "sun"
  | "moon"
  | "cloud-sun"
  | "cloud-moon"
  | "cloud"
  | "cloud-fog"
  | "cloud-drizzle"
  | "cloud-rain"
  | "cloud-rain-wind"
  | "cloud-hail"
  | "cloud-snow"
  | "cloud-lightning";

type Condition = keyof typeof strings.weather;

const GROUPS: ReadonlyArray<[codes: number[], condition: Condition, day: WeatherIconKey, night?: WeatherIconKey]> = [
  [[0], "clear", "sun", "moon"],
  [[1, 2], "partlyCloudy", "cloud-sun", "cloud-moon"],
  [[3], "cloudy", "cloud"],
  [[45, 48], "fog", "cloud-fog"],
  [[51, 53, 55], "drizzle", "cloud-drizzle"],
  [[61, 63, 80, 81], "rain", "cloud-rain"],
  [[65, 82], "heavyRain", "cloud-rain-wind"],
  [[56, 57, 66, 67], "sleet", "cloud-hail"],
  [[71, 73, 75, 77, 85, 86], "snow", "cloud-snow"],
  [[95, 96, 99], "thunder", "cloud-lightning"],
];

export interface WeatherLook {
  icon: WeatherIconKey;
  label: string;
}

/** Day cards always pass `isDay = true`; night variants are for current conditions only. */
export function weatherLook(code: number | null, isDay = true): WeatherLook {
  const group = GROUPS.find(([codes]) => code !== null && codes.includes(code));
  if (!group) return { icon: "cloud", label: strings.weather.unknown };
  const [, condition, day, night] = group;
  return { icon: isDay ? day : (night ?? day), label: strings.weather[condition] };
}
