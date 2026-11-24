/**
 * Fixture mode (design D-9): serve recorded-shape sample data instead of calling Open-Meteo,
 * for development where the network to Open-Meteo is unavailable. Never in production.
 */
export function fixturesEnabled(env: { WEATHER_FIXTURES?: string; NODE_ENV?: string }): boolean {
  return env.WEATHER_FIXTURES === "1" && env.NODE_ENV !== "production";
}
