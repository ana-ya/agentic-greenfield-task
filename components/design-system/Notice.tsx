import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { AlertIcon, InfoIcon } from "./icons";

export interface NoticeProps {
  tone?: "info" | "error";
  /** Short: what happened. */
  title: string;
  /** One sentence: what still works or what to do. */
  children?: ReactNode;
  className?: string;
}

/**
 * Calm inline state for empty results and failed requests. Place it where the
 * missing content would be. `role="status"`, never `alert`; no red fill.
 */
export function Notice({ tone = "info", title, children, className }: NoticeProps) {
  return (
    <div role="status" className={cx("wx-notice", tone === "error" && "wx-notice-error", className)}>
      {tone === "error" ? <AlertIcon /> : <InfoIcon />}
      <div>
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}
