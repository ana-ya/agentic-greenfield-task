/* eslint-disable no-restricted-globals -- this test asserts the browser globals are absent */
import { expect, it } from "vitest";

// TC-PURE-01 runtime backstop: lib/ is tested without a DOM, so browser APIs are absent.
it("runs lib/ tests without a DOM", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});
