import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { weatherLook, type WeatherIconKey } from "@/lib/forecast/wmo";

const ICONS: Record<WeatherIconKey, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-rain-wind": CloudRainWind,
  "cloud-hail": CloudHail,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
};

export interface WeatherIconProps {
  /** WMO weather code; unknown or missing → «Невідомо» (FR-FORECAST-08, PRD Appendix B). */
  code: number | null;
  /** Day cards always use the day variant. */
  isDay?: boolean;
  className?: string;
}

/** Outline weather glyph (Lucide, stroke 1.75, `currentColor`) with its Ukrainian label as accessible name. */
export function WeatherIcon({ code, isDay = true, className }: WeatherIconProps) {
  const { icon, label } = weatherLook(code, isDay);
  const Icon = ICONS[icon];
  return <Icon role="img" aria-label={label} aria-hidden={false} focusable={false} strokeWidth={1.75} className={className} />;
}
