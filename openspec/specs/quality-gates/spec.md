# quality-gates Specification

## Purpose

Defines how a change to this repository is verified: which commands exist, what they check, how they fail, how fast they run and which runtime they need. It also covers how framework-free domain code is enforced and how every pull request gets an independent check.

## Requirements

### Requirement: Single verification command
The repository SHALL provide one command, `npm run verify`, that runs in this order: lint, typecheck, unit tests, code-health gate, production build. It SHALL stop at the first failing step and exit non-zero, and exit zero only when every step passes. (NFR-DX-01)

#### Scenario: Clean tree passes
- **GIVEN** a checkout of `main` with dependencies installed
- **WHEN** `npm run verify` is run
- **THEN** all five steps run in order and the command exits with code 0

#### Scenario: Lint error stops verification first
- **GIVEN** a source file with a lint error
- **WHEN** `npm run verify` is run
- **THEN** the lint step reports the file and rule, the command exits non-zero, and no later step runs

#### Scenario: Type error stops verification
- **GIVEN** a source file containing a TypeScript type error
- **WHEN** `npm run verify` is run
- **THEN** the typecheck step reports the file and line, the command exits non-zero, and the unit-test, code-health and build steps do not run

#### Scenario: Failing unit test stops verification
- **GIVEN** a unit test whose assertion fails
- **WHEN** `npm run verify` is run
- **THEN** the command exits non-zero after the unit-test step, and the code-health and build steps do not run

#### Scenario: Build failure fails verification
- **GIVEN** code that passes lint, typecheck, tests and the code-health gate but fails the production build
- **WHEN** `npm run verify` is run
- **THEN** the build step reports the error and the command exits non-zero

### Requirement: Verification time budget
On a clean checkout with dependencies installed (install time not counted) and no build cache, `npm run verify` SHALL finish in under 60 seconds on the CI runner. The duration SHALL be visible as its own step in every CI run. Exceeding the budget is a requirement failure to fix, even though the job doesn't fail automatically. (NFR-DX-01)

#### Scenario: Cold run within budget
- **GIVEN** a CI run on a fresh runner after `npm ci`, with no `.next` directory
- **WHEN** the `npm run verify` step completes
- **THEN** that step's recorded duration in the CI log is below 60 seconds

### Requirement: Unit test command
`npm test` SHALL run every unit test once, without watching or prompting. It SHALL exit zero when all tests pass and non-zero when any test fails, naming the failing test file and test. (TC-STACK-05)

#### Scenario: All tests pass
- **WHEN** `npm test` is run on a tree where all tests pass
- **THEN** it prints a summary with the number of passed tests and exits with code 0 without waiting for input

#### Scenario: A test fails
- **GIVEN** one unit test with a failing assertion
- **WHEN** `npm test` is run
- **THEN** the output names that test's file and title, and the command exits non-zero

### Requirement: Domain code stays framework-free at lint time
Lint SHALL report an error, citing TC-PURE-01, for any file under `lib/` that imports `react`, `react-dom`, `next` or any of their subpaths (static `import`, dynamic `import()` or `require()`), or that reads the browser globals `window`, `document`, `navigator`, `localStorage`, `sessionStorage` or `location`. The same code outside `lib/` SHALL NOT be reported by this rule. (TC-PURE-01)

#### Scenario: Static framework import in lib is rejected
- **GIVEN** a file under `lib/` containing `import { useState } from "react"`
- **WHEN** `npm run lint` is run
- **THEN** lint reports an error for that line whose message mentions TC-PURE-01, and exits non-zero

#### Scenario: Next.js subpath import in lib is rejected
- **GIVEN** a file under `lib/` importing from `next/navigation`
- **WHEN** `npm run lint` is run
- **THEN** lint reports a TC-PURE-01 error for that import

#### Scenario: Dynamic framework import in lib is rejected
- **GIVEN** a file under `lib/` containing `await import("react")`
- **WHEN** `npm run lint` is run
- **THEN** lint reports a TC-PURE-01 error for that expression

#### Scenario: Browser global in lib is rejected
- **GIVEN** a file under `lib/` that reads `window.innerWidth`
- **WHEN** `npm run lint` is run
- **THEN** lint reports a TC-PURE-01 error for that reference

#### Scenario: Same import outside lib is allowed
- **GIVEN** a file under `components/` importing from `react`
- **WHEN** `npm run lint` is run
- **THEN** no TC-PURE-01 error is reported for that file

### Requirement: Domain code stays framework-free at test time
Unit tests SHALL run in a plain Node.js environment with no DOM. Tests can detect only executed, unguarded reads of unavailable globals, and only when those reads cause a test failure. Guarded or unexecuted DOM access may not fail tests. Node.js also provides some browser-like globals, such as `navigator`; lint enforces the prohibition on browser globals in `lib/`, including those available in Node.js. (TC-PURE-01)

#### Scenario: DOM is unavailable in tests
- **GIVEN** a unit test that evaluates `typeof document` and `typeof window`
- **WHEN** `npm test` is run
- **THEN** both values are `"undefined"`

### Requirement: Code-health gate
`npm run verify` SHALL include a whole-project code-health gate, using the committed configuration, that fails on dead code (unused files, exports, types), unused or unlisted dependencies, unresolved imports and circular imports. Duplication and complexity SHALL NOT fail the gate. Intentional exceptions SHALL be recorded in the committed configuration or as inline suppressions with a reason. (NFR-DX-03)

#### Scenario: Unused export fails verification
- **GIVEN** a new exported function under `lib/` that nothing imports
- **WHEN** `npm run verify` is run
- **THEN** the code-health step names the export with its file and line, and the command exits non-zero before the build step

#### Scenario: Unused dependency fails verification
- **GIVEN** a package added to `devDependencies` that nothing uses and the configuration doesn't exempt
- **WHEN** the code-health step runs
- **THEN** it names the package and exits non-zero

#### Scenario: Duplication alone does not fail
- **GIVEN** two functions with identical bodies in different files and no dead code
- **WHEN** the code-health step runs
- **THEN** it exits with code 0

#### Scenario: Clean project passes the gate
- **GIVEN** the project with no unsuppressed dead-code or dependency findings
- **WHEN** the code-health step runs
- **THEN** it exits with code 0

### Requirement: Pinned Node.js runtime
The repository SHALL declare Node.js 24 in a version file read by version managers and CI and in `package.json` `engines`. Local work, CI and hosting SHALL use that major version. (TC-RUNTIME-01)

#### Scenario: Declarations agree
- **WHEN** the version file and `package.json` `engines` are inspected
- **THEN** the version file names major 24, and `engines.node` accepts 24.x but not 22.x or 25.x

#### Scenario: CI uses the declared version
- **WHEN** the CI verification job runs
- **THEN** its log shows Node.js `v24.x`

#### Scenario: Hosting uses the declared version
- **WHEN** a deployment build runs
- **THEN** its build log reports Node.js version 24.x

### Requirement: Independent verification of every pull request
Every push to a pull request branch and every push to `main` SHALL trigger a CI job that installs dependencies from the lockfile on a clean runner and runs `npm run verify`. The job SHALL need no secrets, have read-only repository permissions, cancel an older run for the same branch, stop after at most 10 minutes, and show its pass/fail status on the pull request. (NFR-DX-02)

#### Scenario: Passing pull request
- **GIVEN** a pull request whose head commit passes `npm run verify`
- **WHEN** the CI job finishes
- **THEN** the pull request shows a successful verification check

#### Scenario: Failing pull request
- **GIVEN** a pull request whose head commit contains a failing unit test
- **WHEN** the CI job finishes
- **THEN** the pull request shows a failed verification check whose log names the failing test

#### Scenario: Lockfile out of sync fails before verification
- **GIVEN** a pull request where `package.json` lists a dependency that `package-lock.json` does not contain
- **WHEN** the CI job runs
- **THEN** the install step fails, the verification step does not run, and the pull request shows a failed check

#### Scenario: Workflow configuration is safe
- **WHEN** the CI workflow definition is inspected
- **THEN** it references no secrets, grants only read access to repository contents, groups runs per branch with cancellation of in-progress runs, and sets a job timeout of 10 minutes or less
