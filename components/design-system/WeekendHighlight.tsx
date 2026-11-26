import { useId } from "react";
import { hiLo, temp, weekday, weekendRange } from "@/lib/format";
import { strings } from "@/lib/i18n";
import { cx } from "@/lib/cx";
import { ComfortBadge } from "./ComfortBadge";

export interface WeekendDay {
  hi: number | null;
  lo: number | null;
  /** Precipitation probability, %; `null` renders «—». */
  precipProb: number | null;
}

export interface WeekendHighlightProps {
  /** Verdict title, e.g. strings.weekend.verdict.good("Львів"). */
  title: string;
  /** Saturday and Sunday as place-local "YYYY-MM-DD". */
  saturdayDate: string;
  sundayDate: string;
  /** Averaged weekend comfort, 0–100. */
  score: number;
  /** Combined weekend hi / lo; `null` renders «—». */
  hi: number | null;
  lo: number | null;
  /** One calm Ukrainian sentence. */
  explanation: string;
  saturday: WeekendDay;
  sunday: WeekendDay;
  className?: string;
}

/** The headline answer. Exactly one per page, always above the day cards. */
export function WeekendHighlight({
  title,
  saturdayDate,
  sundayDate,
  score,
  hi,
  lo,
  explanation,
  saturday,
  sunday,
  className,
}: WeekendHighlightProps) {
  const headingId = useId();
  return (
    <section className={cx("wx-weekend", className)} aria-labelledby={headingId}>
      <div>
        <span className="wx-weekend-label">
          {strings.weekend.title} · {weekendRange(saturdayDate, sundayDate)}
        </span>
        <h2 id={headingId}>{title}</h2>
        <p>{explanation}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="wx-weekend-temp">
          {temp(hi)} <span>/ {temp(lo)}</span>
        </div>
        <ComfortBadge score={score} size="lg" />
      </div>
      <div className="wx-weekend-days">
        <span>
          {weekday(saturdayDate)} <b>{hiLo(saturday.hi, saturday.lo)}</b> · {strings.day.precipShort(saturday.precipProb)}
        </span>
        <span>
          {weekday(sundayDate)} <b>{hiLo(sunday.hi, sunday.lo)}</b> · {strings.day.precipShort(sunday.precipProb)}
        </span>
      </div>
    </section>
  );
}
