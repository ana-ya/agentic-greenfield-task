import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// TC-PURE-01: lib/ is framework-free — no React, no Next.js, no browser globals.
const PURE_HINT = "keep lib/ framework-free; move this to components/ or app/.";
const FRAMEWORK_MODULE = "/^(react|react-dom|next)(\\u002F|$)/";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["react", "react-dom", "next"].map((name) => ({
            name,
            message: `TC-PURE-01: ${PURE_HINT}`,
          })),
          patterns: [
            {
              group: ["react/*", "react-dom/*", "next/*"],
              message: `TC-PURE-01: ${PURE_HINT}`,
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: `ImportExpression[source.value=${FRAMEWORK_MODULE}]`,
          message: `TC-PURE-01: no dynamic import of React or Next.js — ${PURE_HINT}`,
        },
        {
          selector: `CallExpression[callee.name='require'][arguments.0.value=${FRAMEWORK_MODULE}]`,
          message: `TC-PURE-01: no require() of React or Next.js — ${PURE_HINT}`,
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          // checkGlobalObject also catches access through the global object, e.g. globalThis.document.
          // The default objects are globalThis, self and window; Node's `global` is added so that
          // global.navigator is caught too.
          checkGlobalObject: true,
          globalObjects: ["global"],
          globals: ["window", "document", "navigator", "localStorage", "sessionStorage", "location"].map(
            (name) => ({ name, message: `TC-PURE-01: no browser global \`${name}\` — ${PURE_HINT}` }),
          ),
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
