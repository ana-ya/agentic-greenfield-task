import type { ReactNode } from "react";
import { dayLabel, temp } from "@/lib/format";
import { strings } from "@/lib/strings";
import { cx } from "@/lib/cx";
import { ComfortBadge } from "./ComfortBadge";

export interface DayCardProps {
  /** Place-local calendar date, "YYYY-MM-DD". */
  date: string;
  hi: number;
  lo: number;
  /**
   * Condition glyph with its Ukrainian label, e.g. <RainIcon label="Дощ" />.
   * (The design system's DayCardProps takes a WMO `code`; the code → icon map
   * is pending the icon-set decision, so the caller passes the glyph for now.)
   */
  icon: ReactNode;
  /** Precipitation probability, %. */
  precipProb: number;
  windKmh: number;
  /** 0–100 comfort score. */
  comfort: number;
  /** Saturday or Sunday: accent top rule and accent-ink weekday. */
  weekend?: boolean;
  className?: string;
}

export function DayCard({
  date,
  hi,
  lo,
  icon,
  precipProb,
  windKmh,
  comfort,
  weekend = false,
  className,
}: DayCardProps) {
  return (
    <article className={cx("wx-day", weekend && "wx-day-weekend", className)}>
      <span className="wx-day-name">{dayLabel(date)}</span>
      {icon}
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
