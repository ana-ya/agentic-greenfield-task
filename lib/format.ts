/**
 * Formatting helpers shared by every view. Ports `temp` and `weekday` from
 * docs/design-system/components/bundle.js.
 *
 * Dates are the PLACE's calendar dates as "YYYY-MM-DD" strings (what Open-Meteo
 * returns with timezone=auto). They are read as UTC midnight and formatted in UTC,
 * so the visitor's own time zone never shifts a day, and server and client render
 * the same text.
 */

const WEEKDAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const dayMonthShort = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const dayMonthLong = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const dayOnly = new Intl.DateTimeFormat("uk-UA", { day: "numeric", timeZone: "UTC" });

function parseCalendarDate(date: string): Date {
  if (!ISO_DATE.test(date)) {
    throw new RangeError(`Expected a "YYYY-MM-DD" calendar date, got "${date}"`);
  }
  return new Date(`${date}T00:00:00Z`);
}

/** Rounded temperature with a degree sign: 17.6 → «18°». Celsius only. Missing → «—». */
export function temp(celsius: number | null): string {
  return celsius === null ? "—" : `${Math.round(celsius) || 0}°`;
}

/** Hi/lo pair as the design system writes it: «18° / 9°». */
export function hiLo(hi: number | null, lo: number | null): string {
  return `${temp(hi)} / ${temp(lo)}`;
}

/** Two-letter Ukrainian weekday for a place-local date: «Пн» … «Нд». */
export function weekday(date: string): string {
  return WEEKDAYS[parseCalendarDate(date).getUTCDay()];
}

/** Day-card label: «Сб, 28 лист.» */
export function dayLabel(date: string): string {
  return `${weekday(date)}, ${dayMonthShort.format(parseCalendarDate(date))}`;
}

/** Weekend range: «28–29 листопада», or «31 травня – 1 червня» across months. */
export function weekendRange(saturday: string, sunday: string): string {
  const sat = parseCalendarDate(saturday);
  const sun = parseCalendarDate(sunday);
  if (sat.getUTCMonth() === sun.getUTCMonth()) {
    return `${dayOnly.format(sat)}–${dayMonthLong.format(sun)}`;
  }
  return `${dayMonthLong.format(sat)} – ${dayMonthLong.format(sun)}`;
}
