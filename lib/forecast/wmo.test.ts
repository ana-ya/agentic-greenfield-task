import { describe, expect, it } from "vitest";
import { weatherLook } from "./wmo";

// PRD Appendix B.
const TABLE = [
  [[0], "Ясно", "sun", "moon"],
  [[1, 2], "Мінлива хмарність", "cloud-sun", "cloud-moon"],
  [[3], "Хмарно", "cloud", "cloud"],
  [[45, 48], "Туман", "cloud-fog", "cloud-fog"],
  [[51, 53, 55], "Мряка", "cloud-drizzle", "cloud-drizzle"],
  [[61, 63, 80, 81], "Дощ", "cloud-rain", "cloud-rain"],
  [[65, 82], "Сильний дощ", "cloud-rain-wind", "cloud-rain-wind"],
  [[56, 57, 66, 67], "Мокрий сніг", "cloud-hail", "cloud-hail"],
  [[71, 73, 75, 77, 85, 86], "Сніг", "cloud-snow", "cloud-snow"],
  [[95, 96, 99], "Гроза", "cloud-lightning", "cloud-lightning"],
] as const;

describe("weatherLook — Appendix B", () => {
  it.each(TABLE.flatMap(([codes, label, day, night]) => codes.map((code) => [code, label, day, night] as const)))(
    "code %i → «%s» (%s / %s)",
    (code, label, day, night) => {
      expect(weatherLook(code)).toEqual({ icon: day, label });
      expect(weatherLook(code, false)).toEqual({ icon: night, label });
    },
  );

  it.each([42, null, -1])("unknown code %s → «Невідомо» with the cloud icon", (code) => {
    expect(weatherLook(code)).toEqual({ icon: "cloud", label: "Невідомо" });
  });
});
