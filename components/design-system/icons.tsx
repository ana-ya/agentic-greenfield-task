import type { ReactNode, SVGProps } from "react";

/**
 * UI icons taken from the design-system previews: 24px grid, 1.75px stroke,
 * `currentColor`. Weather glyphs come from Lucide via `WeatherIcon`. Size comes from the wx- component CSS.
 *
 * Decorative by default (aria-hidden). Pass `label` when the icon carries meaning
 * next to a number, e.g. <InfoIcon label="Довідка" />.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { label?: string };

function Icon({ label, children, ...rest }: IconProps & { children: ReactNode }) {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Icon>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3l9.5 17h-19z" />
      <path d="M12 10v4M12 17v.01" />
    </Icon>
  );
}
