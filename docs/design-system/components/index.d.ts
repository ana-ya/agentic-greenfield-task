// Weather Explorer components are HTML + the wx- classes in bundle.css.
// bundle.js adds shared comfort helpers on window.WeatherExplorer.

export type ComfortLevelName = 'good' | 'fair' | 'poor';
export interface ComfortLevel { min: number; level: ComfortLevelName; word: 'Комфортно' | 'Терпимо' | 'Некомфортно' }

/** Map a 0–100 comfort score to its level and Ukrainian word. Clamps and rounds; never throws. */
export declare function comfortLevel(score: number): ComfortLevel;
/** HTML string for a ComfortBadge (`wx-badge wx-badge-<level>`), with an aria-label. */
export declare function badgeHTML(score: number, size?: 'md' | 'lg'): string;
/** Two-letter Ukrainian weekday for a local date: «Пн» … «Нд». */
export declare function weekday(date: string | Date): string;
/** Rounded temperature with a degree sign: 17.6 → «18°». */
export declare function temp(celsius: number): string;

export interface ButtonProps { variant?: 'primary' | 'quiet' | 'text'; disabled?: boolean; children: string }
export interface CitySearchProps { value: string; suggestions: Array<{ name: string; admin1?: string; country: string; flag?: string }>; activeIndex?: number }
export interface ComfortBadgeProps { score: number; size?: 'md' | 'lg' }
export interface DayCardProps { date: string; hi: number; lo: number; code: number; precipProb: number; windKmh: number; comfort: number; weekend?: boolean }
export interface WeekendHighlightProps { place: string; score: number; hi: number; lo: number; explanation: string; saturday: string; sunday: string }
export interface CompareTableProps { cities: Array<{ name: string; sat: { hi: number; lo: number; precip: number }; sun: { hi: number; lo: number; precip: number }; score: number }> }
export interface NoticeProps { tone?: 'info' | 'error'; title: string; children?: string }

declare global {
  interface Window { WeatherExplorer: { comfortLevel: typeof comfortLevel; badgeHTML: typeof badgeHTML; weekday: typeof weekday; temp: typeof temp; LEVELS: ComfortLevel[] } }
}
