import { describe, expect, it } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
  it("joins truthy class names with single spaces", () => {
    expect(cx("wx-btn", "wx-btn-primary")).toBe("wx-btn wx-btn-primary");
  });

  it("drops false, null, undefined and empty strings", () => {
    expect(cx("wx-day", false, null, undefined, "", "wx-day-weekend")).toBe("wx-day wx-day-weekend");
  });
});
