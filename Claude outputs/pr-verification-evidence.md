### Verification evidence (setup-engineering-foundation)

**2.7 failing test (npm test)** — one assertion temporarily changed to expect `19°`:
```
 FAIL  lib/format.test.ts > temp > rounds to a whole degree with a degree sign
AssertionError: expected '18°' to be '19°' // Object.is equality
 Test Files  1 failed | 3 passed (4)
      Tests  1 failed | 20 passed (21)
exit=1   → after revert: Tests 21 passed (21), exit=0
```

**3.2 TC-PURE-01 lint probes** (throwaway files, deleted after each run):
| Probe | Result |
| --- | --- |
| `lib/__probe.ts`: `import { useState } from "react"` | error, `no-restricted-imports`, "TC-PURE-01: keep lib/ framework-free…" |
| `lib/__probe.ts`: import from `next/navigation` | error, `no-restricted-imports`, TC-PURE-01 |
| `lib/__probe.ts`: `await import("react")` | error, `no-restricted-syntax`, "TC-PURE-01: no dynamic import of React or Next.js" |
| `lib/__probe.ts`: `require("react")` | error, `no-restricted-syntax`, "TC-PURE-01: no require() of React or Next.js" |
| `lib/__probe.ts`: `window.innerWidth` | error, `no-restricted-globals`, "TC-PURE-01: no browser global `window`" |
| `components/__probe.tsx`: `import { useState } from "react"` | no error (exit 0) |

**4.2 `npm run verify` fail-fast** (each break made in a throwaway copy, then reverted):
| Break | Stopped at | Evidence |
| --- | --- | --- |
| `var` declaration in `lib/cx.ts` | lint (exit 1) | `error  Unexpected var, use let or const instead  no-var` |
| `const broken: number = "nope"` | typecheck (exit 2) | `lib/cx.ts(5,14): error TS2322: Type 'string' is not assignable to type 'number'.` |
| unused `export function notUsedAnywhere` in `lib/cx.ts` | health (exit 1) | `Unused exports (1) lib/cx.ts :5 notUsedAnywhere` |
| `npm i -D left-pad` (unused) | health (exit 1) | names `left-pad` under unused devDependencies |
| identical function bodies in `format.ts` and `comfort.ts`, both used | health passes (exit 0) | `✓ No issues found`; duplication appears only in the advisory `npx fallow --only dupes` |
| `useState` in the `app/page.tsx` Server Component | build (exit 1) | `You're importing a module that depends on useState into a React Server Component module` |

The failing-test case is in 2.7. After all reverts: `npm run verify` → exit 0.

**4.3 local timing** (Linux VM, `rm -rf .next && npm run verify`): **8.3 s**, exit 0. The authoritative budget is the CI measurement (5.2).

**Changes made during apply** (planning artifacts updated to match):
- `typecheck` runs `next typegen && tsc --noEmit`: route types such as `LayoutProps` live in `.next/types`, which a clean checkout doesn't have (design D-3).
- Fallow didn't flag `vite` or the test files, so no `vite` exemption was added. It did flag two design-system exports already on `main` (`SearchIcon`, `MAX_PINNED_CITIES`). By the owner's decision they're exempted in `.fallowrc.json` with a reason, and the now-unused `fallow` entry in `ignoreDependencies` was removed.
- GitHub Actions pinned to the current majors: `actions/checkout@v7`, `actions/setup-node@v7`.
