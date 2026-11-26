/**
 * Every product UI string, Ukrainian first (NFR-I18N-01). See DESIGN.md → "Hard rules → Copy":
 * no exclamation marks, no emoji in product text, sentence case, numbers always carry units.
 * `en.ts` must define exactly the same keys (type-checked through `Strings`).
 */

const dash = "—";
const pct = (value: number | null) => (value === null ? dash : `${Math.round(value)}%`);
const kmh = (value: number | null) => (value === null ? dash : `${Math.round(value)} км/год`);

export const uk = {
  appName: "Weather Explorer",
  tagline: "Чи варті вихідні поїздки. Спокійно, без акаунтів і трекерів.",
  hero: "Куди поїхати на вихідні",

  theme: {
    light: "Світла тема",
    dark: "Темна тема",
  },

  search: {
    label: "Пошук міста",
    placeholder: "Місто або село",
    suggestions: "Варіанти міст",
    useMyLocation: "Використати моє місцезнаходження",
    empty: "Нічого не знайдено",
    emptyHint: "Спробуйте іншу назву.",
    failed: "Пошук зараз недоступний",
    failedHint: "Спробуйте ще раз за хвилину.",
  },

  location: {
    invalid: "Не вдалося відкрити це місце. Оберіть місто в пошуку.",
    north: "пн. ш.",
    south: "пд. ш.",
    east: "сх. д.",
    west: "зх. д.",
  },

  weekend: {
    title: "Ці вихідні",
    verdict: {
      good: (place: string) => `${place} — варто їхати`,
      fair: (place: string) => `${place} — можна їхати, але з планом Б`,
      poor: (place: string) => `${place} — краще перенести`,
    },
    unavailable: "Прогноз на ці вихідні поки недоступний.",
  },

  comfort: {
    good: "Комфортно",
    fair: "Терпимо",
    poor: "Некомфортно",
    none: "Немає даних",
    aria: (score: number, word: string) => `Комфорт ${score} зі 100, ${word.toLowerCase()}`,
    // PRD Appendix A: one sentence, at most 80 characters.
    rationale: {
      ideal: "Комфортна погода — гарний день для прогулянки.",
      cold: "Прохолодно, тож візьміть теплу куртку.",
      coldStrong: "Холодно — для прогулянок знадобиться зимовий одяг.",
      heat: "Тепло, а в найспекотніші години краще шукати тінь.",
      heatStrong: "Спекотно — плануйте прогулянки на ранок і вечір.",
      rain: "Можливий дощ, тож візьміть парасолю.",
      rainStrong: "Ймовірно, дощитиме більшу частину дня.",
      wind: "Відчутний вітер, на відкритих місцях буде прохолодніше.",
      windStrong: "Сильний вітер — краще уникати відкритих місць.",
      cloud: "Похмуро, але сухо й спокійно.",
      uv: "Сонце активне — знадобляться капелюх і крем від сонця.",
      none: "Немає даних для оцінки.",
    },
  },

  // PRD Appendix B labels; also the icons' accessible names.
  weather: {
    clear: "Ясно",
    partlyCloudy: "Мінлива хмарність",
    cloudy: "Хмарно",
    fog: "Туман",
    drizzle: "Мряка",
    rain: "Дощ",
    heavyRain: "Сильний дощ",
    sleet: "Мокрий сніг",
    snow: "Сніг",
    thunder: "Гроза",
    unknown: "Невідомо",
  },

  day: {
    precip: (percent: number | null) => `Опади ${pct(percent)}`,
    precipShort: (percent: number | null) => `опади ${pct(percent)}`,
    wind: (speed: number | null) => `Вітер ${kmh(speed)}`,
  },

  forecast: {
    loading: "Завантаження прогнозу",
    days: "Прогноз на сім днів",
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
    forecastHint: "Пошук працює — спробуйте ще раз за хвилину.",
  },

  credits: {
    dataLabel: "Дані:",
    openMeteo: "Open-Meteo",
    mapLabel: "Карта:",
    copyright: "©",
    osm: "OpenStreetMap contributors",
  },
} as const;

/** `uk` with string literals widened to `string`, so other locales can have different text. */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Strings = Widen<typeof uk>;
