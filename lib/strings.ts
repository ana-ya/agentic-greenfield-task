/**
 * Every UI string lives here. Ukrainian first; see DESIGN.md → "Content".
 * Rules: no exclamation marks, no emoji (except a country flag in search
 * suggestions), sentence case, numbers always carry units.
 */
export const strings = {
  appName: "Weather Explorer",
  tagline: "Чи варті вихідні поїздки. Спокійно, без акаунтів і трекерів.",
  hero: "Куди поїхати на вихідні",

  search: {
    label: "Пошук міста",
    placeholder: "Місто або село",
    useMyLocation: "Використати моє місцезнаходження",
    empty: "Нічого не знайдено",
    emptyHint: "Спробуйте іншу назву або клацніть на карті.",
  },

  weekend: {
    title: "Ці вихідні",
    worthIt: (place: string) => `${place} — варто їхати`,
    postpone: (place: string) => `${place} — краще перенести`,
  },

  comfort: {
    good: "Комфортно",
    fair: "Терпимо",
    poor: "Некомфортно",
    aria: (score: number, word: string) =>
      `Комфорт ${score} зі 100, ${word.toLowerCase()}`,
  },

  day: {
    precip: (percent: number) => `Опади ${Math.round(percent)}%`,
    precipShort: (percent: number) => `опади ${Math.round(percent)}%`,
    wind: (kmh: number) => `Вітер ${Math.round(kmh)} км/год`,
  },

  compare: {
    action: "Порівняти вихідні",
    pin: "Закріпити місто",
    pinned: (count: number, max: number) => `Закріплено ${count} з ${max}`,
    city: "Місто",
    saturday: "Субота",
    sunday: "Неділя",
    comfort: "Комфорт",
    best: "Найкращий вибір",
  },

  errors: {
    forecast: "Не вдалося завантажити прогноз",
    forecastHint: "Карта й пошук працюють. Спробуйте ще раз за хвилину.",
  },

  credits: "Дані: Open-Meteo · Карта: © OpenStreetMap contributors",
} as const;
