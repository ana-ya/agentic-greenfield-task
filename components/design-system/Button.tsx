import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "quiet" | "text";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` at most once per view; `quiet` (default) elsewhere; `text` for inline secondary actions. */
  variant?: ButtonVariant;
  /** Optional 18px outline icon before the label (decorative). */
  icon?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "wx-btn wx-btn-primary",
  quiet: "wx-btn",
  text: "wx-btn wx-btn-text",
};

/** Verb-first, sentence-case Ukrainian label. A disabled button says why in its label. */
export function Button({
  variant = "quiet",
  icon,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cx(VARIANT_CLASS[variant], className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}
