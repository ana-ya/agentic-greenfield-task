import { clampScore, comfortLevel } from "@/lib/comfort";
import { strings } from "@/lib/strings";
import { cx } from "@/lib/cx";

export interface ComfortBadgeProps {
  /** 0–100; rounded and clamped. */
  score: number;
  /** `md` (24px) for day cards and tables, `lg` (32px) in WeekendHighlight. */
  size?: "md" | "lg";
  className?: string;
}

/** Number + word on one of three comfort fills. Colour is never the only signal. */
export function ComfortBadge({ score, size = "md", className }: ComfortBadgeProps) {
  const s = clampScore(score);
  const { level, word } = comfortLevel(s);
  return (
    <span
      role="img"
      aria-label={strings.comfort.aria(s, word)}
      className={cx("wx-badge", `wx-badge-${level}`, size === "lg" && "wx-badge-lg", className)}
    >
      <span className="wx-score">{s}</span>
      {word}
    </span>
  );
}
