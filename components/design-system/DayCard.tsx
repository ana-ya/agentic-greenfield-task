import { dayLabel, temp } from "@/lib/format";
import { strings } from "@/lib/i18n";
import { cx } from "@/lib/cx";
import { ComfortBadge } from "./ComfortBadge";
import { WeatherIcon } from "./WeatherIcon";

export interface DayCardProps {
  /** Place-local calendar date, "YYYY-MM-DD". */
  date: string;
  hi: number | null;
  lo: number | null;
  /** WMO weather code (FR-FORECAST-08). */
  code: number | null;
  /** Precipitation probability, %. */
  precipProb: number | null;
  windKmh: number | null;
  /** 0–100 comfort score, or `null` for «Немає даних» (FR-COMFORT-09). */
  comfort: number | null;
  /** Saturday or Sunday: accent top rule and accent-ink weekday. */
  weekend?: boolean;
  className?: string;
}

/** One of the seven daily forecast cards (FR-FORECAST-02). */
export function DayCard({ date, hi, lo, code, precipProb, windKmh, comfort, weekend = false, className }: DayCardProps) {
  return (
    <article className={cx("wx-day", weekend && "wx-day-weekend", className)}>
      <span className="wx-day-name">{dayLabel(date)}</span>
      <WeatherIcon code={code} />
      <span className="wx-hilo">
        {temp(hi)} <span>/ {temp(lo)}</span>
      </span>
      <span className="wx-figs">
        <span>{strings.day.precip(precipProb)}</span>
        <span>{strings.day.wind(windKmh)}</span>
      </span>
      <ComfortBadge score={comfort} />
    </article>
  );
}
