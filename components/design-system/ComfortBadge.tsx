import { clampScore, comfortLevel } from "@/lib/scoring/levels";
import { strings } from "@/lib/i18n";
import { cx } from "@/lib/cx";

export interface ComfortBadgeProps {
  /** 0–100, rounded and clamped; `null` shows the neutral «Немає даних» badge (FR-COMFORT-09). */
  score: number | null;
  /** `md` (24px) for day cards and tables, `lg` (32px) in WeekendHighlight. */
  size?: "md" | "lg";
  className?: string;
}

/** Number + word on one of three comfort fills. Colour is never the only signal (FR-COMFORT-04). */
export function ComfortBadge({ score, size = "md", className }: ComfortBadgeProps) {
  const sizeClass = size === "lg" && "wx-badge-lg";
  if (score === null) {
    return (
      <span role="img" aria-label={strings.comfort.none} className={cx("wx-badge", "wx-badge-none", sizeClass, className)}>
        {strings.comfort.none}
      </span>
    );
  }
  const s = clampScore(score);
  const { level, word } = comfortLevel(s);
  return (
    <span role="img" aria-label={strings.comfort.aria(s, word)} className={cx("wx-badge", `wx-badge-${level}`, sizeClass, className)}>
      <span className="wx-score">{s}</span>
      {word}
    </span>
  );
}
