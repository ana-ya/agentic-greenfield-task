import { describe, expect, it } from "vitest";
import { fixturesEnabled } from "./fixtures-enabled";

describe("fixturesEnabled (design D-9)", () => {
  it.each([
    [{ WEATHER_FIXTURES: "1", NODE_ENV: "development" }, true],
    [{ WEATHER_FIXTURES: "1", NODE_ENV: "test" }, true],
    [{ WEATHER_FIXTURES: "1", NODE_ENV: "production" }, false],
    [{ WEATHER_FIXTURES: "true", NODE_ENV: "development" }, false],
    [{ NODE_ENV: "development" }, false],
    [{}, false],
  ])("%j → %s", (env, expected) => {
    expect(fixturesEnabled(env)).toBe(expected);
  });
});
