import type { Strings } from "./uk";

/**
 * English fallback dictionary (NFR-I18N-01). Not rendered in the MVP: the locale is fixed to `uk`.
 * Typed as `Strings`, so a missing or extra key fails `npm run typecheck`.
 */

const dash = "—";
const pct = (value: number | null) => (value === null ? dash : `${Math.round(value)}%`);
const kmh = (value: number | null) => (value === null ? dash : `${Math.round(value)} km/h`);

export const en: Strings = {
  appName: "Weather Explorer",
  tagline: "Is the weekend worth the trip. Calm, no accounts, no trackers.",
  hero: "Where to go this weekend",

  theme: {
    light: "Light theme",
    dark: "Dark theme",
  },

  search: {
    label: "Search for a city",
    placeholder: "City or village",
    suggestions: "Matching places",
    useMyLocation: "Use my location",
    empty: "Nothing found",
    emptyHint: "Try another name.",
    failed: "Search is unavailable right now",
    failedHint: "Try again in a minute.",
  },

  location: {
    invalid: "This place can't be opened. Choose a city in the search.",
    north: "N",
    south: "S",
    east: "E",
    west: "W",
  },

  weekend: {
    title: "This weekend",
    verdict: {
      good: (place: string) => `${place} — worth the trip`,
      fair: (place: string) => `${place} — possible, with a plan B`,
      poor: (place: string) => `${place} — better postpone`,
    },
    unavailable: "The forecast for this weekend isn't available yet.",
  },

  comfort: {
    good: "Comfortable",
    fair: "Tolerable",
    poor: "Uncomfortable",
    none: "No data",
    aria: (score: number, word: string) => `Comfort ${score} out of 100, ${word.toLowerCase()}`,
    rationale: {
      ideal: "Comfortable weather — a good day for a walk.",
      cold: "Chilly, so bring a warm jacket.",
      coldStrong: "Cold — walks will need winter clothes.",
      heat: "Warm, so look for shade in the hottest hours.",
      heatStrong: "Hot — plan walks for the morning and evening.",
      rain: "Rain is possible, so bring an umbrella.",
      rainStrong: "Likely to rain for most of the day.",
      wind: "Noticeable wind, colder in open places.",
      windStrong: "Strong wind — better avoid open places.",
      cloud: "Overcast, but dry and calm.",
      uv: "Strong sun — you'll need a hat and sunscreen.",
      none: "Not enough data to rate.",
    },
  },

  weather: {
    clear: "Clear",
    partlyCloudy: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Fog",
    drizzle: "Drizzle",
    rain: "Rain",
    heavyRain: "Heavy rain",
    sleet: "Sleet",
    snow: "Snow",
    thunder: "Thunderstorm",
    unknown: "Unknown",
  },

  day: {
    precip: (percent: number | null) => `Precipitation ${pct(percent)}`,
    precipShort: (percent: number | null) => `precipitation ${pct(percent)}`,
    wind: (speed: number | null) => `Wind ${kmh(speed)}`,
  },

  forecast: {
    loading: "Loading the forecast",
    days: "Seven-day forecast",
  },

  compare: {
    action: "Compare weekends",
    pin: "Pin city",
    pinned: (count: number, max: number) => `Pinned ${count} of ${max}`,
    city: "City",
    saturday: "Saturday",
    sunday: "Sunday",
    comfort: "Comfort",
    best: "Best choice",
  },

  errors: {
    forecast: "Couldn't load the forecast",
    forecastHint: "Search still works — try again in a minute.",
  },

  credits: {
    dataLabel: "Data:",
    openMeteo: "Open-Meteo",
    mapLabel: "Map:",
    copyright: "©",
    osm: "OpenStreetMap contributors",
  },
};
