/**
 * Weather Explorer design-system components (React ports of docs/design-system).
 * CitySearch is not ported yet: it is behavioural (debounced geocoding, combobox
 * keyboard model) and will be built with the search feature, on the existing
 * `wx-search` / `wx-field` / `wx-list` / `wx-option` classes.
 */
export { Button, type ButtonProps, type ButtonVariant } from "./Button";
export { ComfortBadge, type ComfortBadgeProps } from "./ComfortBadge";
export { Notice, type NoticeProps } from "./Notice";
export { DayCard, type DayCardProps } from "./DayCard";
export { WeatherIcon, type WeatherIconProps } from "./WeatherIcon";
export { WeekendHighlight, type WeekendHighlightProps, type WeekendDay } from "./WeekendHighlight";
export {
  CompareTable,
  MAX_PINNED_CITIES,
  type CompareTableProps,
  type CompareCity,
  type CompareDay,
} from "./CompareTable";
export * from "./icons";
