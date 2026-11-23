import type { ReactNode, SVGProps } from "react";

/**
 * Outline icons taken from the design-system previews: 24px grid, 1.75px stroke,
 * `currentColor`. The full weather glyph set (~12 WMO groups) is NOT chosen yet —
 * see DESIGN.md → "Open decisions". Size comes from the wx- component CSS.
 *
 * Decorative by default (aria-hidden). Pass `label` when the icon carries meaning
 * next to a number, e.g. <RainIcon label="Дощ" />.
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

/* Weather glyphs available so far (4 of ~12). */

export function ClearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  );
}

export function PartlyCloudyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 4v1.5M3.5 8H2M4.8 4.8l1 1" />
      <path d="M5.3 11.2A3.5 3.5 0 0 1 11 6.5" />
      <path d="M8 20h9a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.5A3.3 3.3 0 0 0 8 20z" />
    </Icon>
  );
}

export function CloudyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 19h10a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 2A3.5 3.5 0 0 0 7 19z" />
    </Icon>
  );
}

export function RainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 15h10a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.4 2A3.5 3.5 0 0 0 7 15z" />
      <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
    </Icon>
  );
}
