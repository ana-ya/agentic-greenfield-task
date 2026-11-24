import { describe, expect, it } from "vitest";
import { capName, coordinateLabel, hrefFor, parseLocation, roundCoordinate } from ".";

describe("parseLocation", () => {
  it("is empty without parameters", () => {
    expect(parseLocation({})).toEqual({ kind: "empty" });
  });

  it("reads a valid shared link", () => {
    expect(parseLocation({ lat: "49.84", lon: "24.03", name: "Львів" })).toEqual({
      kind: "ok",
      lat: 49.84,
      lon: 24.03,
      name: "Львів",
      label: "Львів",
    });
  });

  it.each([
    ["latitude out of range", { lat: "123", lon: "24", name: "X" }],
    ["longitude out of range", { lat: "49", lon: "181" }],
    ["non-numeric latitude", { lat: "abc", lon: "24.03" }],
    ["exponent notation", { lat: "4e1", lon: "24" }],
    ["missing longitude", { lat: "49.84" }],
    ["name only", { name: "Львів" }],
  ])("is invalid with %s", (_case, params) => {
    expect(parseLocation(params)).toEqual({ kind: "invalid" });
  });

  it("labels a place without a name by its coordinates", () => {
    expect(parseLocation({ lat: "49.84", lon: "24.03" })).toMatchObject({
      kind: "ok",
      name: null,
      label: "49,84° пн. ш., 24,03° сх. д.",
    });
  });

  it("treats a blank name as missing", () => {
    expect(parseLocation({ lat: "49.84", lon: "24.03", name: "   " })).toMatchObject({ name: null });
  });

  it("rounds coordinates on read, so equal places share a cache key", () => {
    expect(parseLocation({ lat: "49.83826", lon: "24.02324" })).toMatchObject({ lat: 49.84, lon: 24.02 });
  });

  it("takes the first value of repeated parameters", () => {
    expect(parseLocation({ lat: ["49.84", "1"], lon: "24.03" })).toMatchObject({ lat: 49.84 });
  });
});

describe("coordinateLabel", () => {
  it("uses southern and western hemisphere words", () => {
    expect(coordinateLabel(-33.87, -151.21)).toBe("33,87° пд. ш., 151,21° зх. д.");
  });
});

describe("roundCoordinate", () => {
  it.each([
    [49.83826, 49.84],
    [24.02324, 24.02],
    [1.005, 1.01],
    [-0.001, 0],
  ])("%s → %s", (input, expected) => {
    expect(roundCoordinate(input)).toBe(expected);
  });
});

describe("capName", () => {
  it("keeps the first 80 characters of a long name", () => {
    const long = "Л".repeat(95);
    expect(capName(long)).toBe("Л".repeat(80));
  });
});

describe("hrefFor", () => {
  it("writes rounded coordinates", () => {
    expect(hrefFor({ lat: 49.83826, lon: 24.02324, name: "Львів" })).toBe(
      `/?lat=49.84&lon=24.02&name=${encodeURIComponent("Львів")}`,
    );
  });

  it("omits an empty name", () => {
    expect(hrefFor({ lat: 49.84, lon: 24.03, name: null })).toBe("/?lat=49.84&lon=24.03");
  });

  it("round-trips through parseLocation", () => {
    const place = { lat: 48.6208, lon: 22.2879, name: "Ужгород, Закарпатська область" };
    const params = Object.fromEntries(new URLSearchParams(hrefFor(place).slice(2)));
    expect(parseLocation(params)).toMatchObject({ kind: "ok", lat: 48.62, lon: 22.29, name: place.name });
  });
});
