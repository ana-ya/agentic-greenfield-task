import { describe, expect, it } from "vitest";
import empty from "./__fixtures__/search-empty.json";
import lviv from "./__fixtures__/search-lviv.json";
import { MAX_SUGGESTIONS, secondaryLine, toSuggestions } from "./results";

describe("toSuggestions", () => {
  it("maps name, region, country, flag and coordinates", () => {
    expect(toSuggestions(lviv)[0]).toEqual({
      name: "Львів",
      region: "Львівська область",
      country: "Україна",
      flag: "🇺🇦",
      lat: 49.83826,
      lon: 24.02324,
    });
  });

  it("skips malformed entries", () => {
    expect(toSuggestions(lviv).map((s) => s.name)).toEqual(["Львів", "Львове", "Lwówek", "Без регіону"]);
  });

  it("reads a response without `results` as nothing found (FR-SEARCH-05)", () => {
    expect(toSuggestions(empty)).toEqual([]);
  });

  it.each([null, "x", { results: "nope" }])("reads %j as nothing found", (raw) => {
    expect(toSuggestions(raw)).toEqual([]);
  });

  it(`keeps at most ${MAX_SUGGESTIONS} suggestions`, () => {
    const many = { results: Array.from({ length: 12 }, (_, i) => ({ name: `Місто ${i}`, latitude: 1, longitude: 2 })) };
    expect(toSuggestions(many)).toHaveLength(MAX_SUGGESTIONS);
  });
});

describe("secondaryLine (FR-SEARCH-02)", () => {
  it("joins region and country", () => {
    expect(secondaryLine({ region: "Львівська область", country: "Україна" })).toBe("Львівська область · Україна");
  });

  it("shows only the country when the region is unknown, without a leading separator", () => {
    expect(secondaryLine({ region: null, country: "Венесуела" })).toBe("Венесуела");
  });
});
