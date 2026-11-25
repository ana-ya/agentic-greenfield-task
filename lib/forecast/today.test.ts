import { describe, expect, it } from "vitest";
import { firstShownDate, placeToday } from "./today";
import type { ForecastDay } from "./types";

const at = (iso: string) => Date.parse(iso);

describe("placeToday", () => {
  it("uses the place's offset, not the server's or the visitor's", () => {
    // 23:30 UTC on Saturday is already Sunday in Kyiv (UTC+2) and still Saturday in Honolulu (UTC−10).
    expect(placeToday(at("2026-11-28T23:30:00Z"), 7200)).toBe("2026-11-29");
    expect(placeToday(at("2026-11-28T23:30:00Z"), -36000)).toBe("2026-11-28");
  });
});

describe("firstShownDate", () => {
  const days = ["2026-11-28", "2026-11-29", "2026-11-30"].map((date) => ({ date }) as ForecastDay);

  it("skips a day that is already over (forecast cached before the place's midnight)", () => {
    expect(firstShownDate(days, "2026-11-29")).toBe("2026-11-29");
  });

  it("falls back to the data's first day when the data does not cover today", () => {
    expect(firstShownDate(days, "2027-01-15")).toBe("2026-11-28");
  });
});
