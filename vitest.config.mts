import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests cover the framework-free domain code in lib/ (TC-STACK-05, TC-PURE-01).
// The Node environment has no DOM, so lib/ code that touches browser APIs fails here.
export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL("./", import.meta.url)) }],
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
