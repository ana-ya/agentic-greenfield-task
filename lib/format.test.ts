import { describe, expect, it } from "vitest";
import { dayLabel, hiLo, temp, weekday, weekendRange } from "./format";

describe("temp", () => {
  it("rounds to a whole degree with a degree sign", () => {
    expect(temp(17.6)).toBe("18°");
  });

  it("never shows a negative zero", () => {
    expect(temp(-0.4)).toBe("0°");
  });
});

describe("hiLo", () => {
  it("writes hi and lo the design-system way", () => {
    expect(hiLo(18, 9)).toBe("18° / 9°");
  });
});

describe("weekday", () => {
  it("returns the two-letter Ukrainian weekday of a calendar date", () => {
    expect(weekday("2026-11-28")).toBe("Сб");
  });

  it("rejects anything that is not a YYYY-MM-DD date", () => {
    expect(() => weekday("2026-11-28T10:00:00Z")).toThrow(RangeError);
    expect(() => weekday("28.11.2026")).toThrow(RangeError);
  });
});

describe("dayLabel", () => {
  it("formats weekday, day and short month", () => {
    expect(dayLabel("2026-11-28")).toBe("Сб, 28 лист.");
  });

  it("rejects anything that is not a YYYY-MM-DD date", () => {
    expect(() => dayLabel("")).toThrow(RangeError);
  });
});

describe("weekendRange", () => {
  it("joins days of the same month", () => {
    expect(weekendRange("2026-11-28", "2026-11-29")).toBe("28–29 листопада");
  });

  it("spells out both months when the weekend spans two", () => {
    expect(weekendRange("2025-05-31", "2025-06-01")).toBe("31 травня – 1 червня");
  });
});
