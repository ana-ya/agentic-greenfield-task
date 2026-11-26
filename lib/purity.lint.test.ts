import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/**
 * TC-PURE-01 regression check: the lint rule that keeps lib/ framework-free, run on sample code
 * with the project's real ESLint config. A probe file path under lib/ selects the lib/ rules.
 */

const eslint = new ESLint();

async function pureErrors(code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: "lib/__purity_probe__.ts" });
  return result.messages.filter((m) => m.message.includes("TC-PURE-01")).map((m) => m.message);
}

describe("TC-PURE-01 lint rule for lib/", () => {
  it.each([
    ["a framework import", 'import { useState } from "react";\nexport const x = useState;'],
    ["a Next.js subpath import", 'import { redirect } from "next/navigation";\nexport const x = redirect;'],
    ["a browser global", "export const x = window.innerWidth;"],
    ["a browser global via globalThis", "export const x = globalThis.navigator;"],
    ["a browser global via Node's global", "export const x = global.navigator;"],
  ])("rejects %s", async (_, code) => {
    expect(await pureErrors(code)).not.toHaveLength(0);
  });

  it("accepts plain domain code", async () => {
    expect(await pureErrors("export const add = (a: number, b: number) => a + b;")).toEqual([]);
  });
}, 30_000);
