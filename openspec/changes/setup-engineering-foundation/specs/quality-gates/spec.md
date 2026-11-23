# Spec Delta

## Purpose

Defines how a change to this repository is verified: which commands exist, what they check, how they fail and how fast they run. It also covers how framework-free domain code is enforced and how every pull request gets an independent check.

## ADDED Requirements

### Requirement: Single verification command
The repository SHALL provide one command, `npm run verify`, that runs in this order: lint, typecheck, unit tests, code-health analysis, production build. It SHALL stop at the first failing step and exit non-zero, and exit zero only when every step passes. (NFR-DX-01)

#### Scenario: Clean tree passes
- **GIVEN** a checkout of `main` with dependencies installed
- **WHEN** `npm run verify` is run
- **THEN** all five steps run in order and the command exits with code 0

#### Scenario: Type error stops verification
- **GIVEN** a source file containing a TypeScript type error
- **WHEN** `npm run verify` is run
- **THEN** the typecheck step reports the file and line, the command exits non-zero, and the unit-test, code-health and build steps do not run

#### Scenario: Failing unit test stops verification
- **GIVEN** a unit test whose assertion fails
- **WHEN** `npm run verify` is run
- **THEN** the command exits non-zero after the unit-test step, and the build step does not run

### Requirement: Verification time budget
On a clean checkout with dependencies installed and no build cache, `npm run verify` SHALL finish in under 60 seconds on the CI runner. (NFR-DX-01)

#### Scenario: Cold run within budget
- **GIVEN** a CI run on a fresh runner after `npm ci`, with no `.next` directory
- **WHEN** the `npm run verify` step completes
- **THEN** its recorded duration in the CI log is below 60 seconds

### Requirement: Unit test command
`npm test` SHALL run every unit test once, without watching or prompting. It SHALL exit zero when all tests pass and non-zero when any test fails, naming the failing test file and test. (TC-STACK-05)

#### Scenario: All tests pass
- **WHEN** `npm test` is run on a tree where all tests pass
- **THEN** it prints a summary with the number of passed tests and exits with code 0 without waiting for input

#### Scenario: A test fails
- **GIVEN** one unit test with a failing assertion
- **WHEN** `npm test` is run
- **THEN** the output names that test's file and title, and the command exits non-zero

### Requirement: Coverage report
`npm run test:coverage` SHALL run the unit tests and write a machine-readable coverage report for the domain code in `lib/` to `coverage/coverage-final.json`. The report SHALL NOT be committed to the repository.

#### Scenario: Report is produced
- **WHEN** `npm run test:coverage` is run
- **THEN** `coverage/coverage-final.json` exists and lists the source files under `lib/`, and `git status` does not show the `coverage/` directory

### Requirement: Domain code stays framework-free at lint time
Lint SHALL report an error, citing TC-PURE-01, for any file under `lib/` that imports `react`, `react-dom`, `next` or any of their subpaths, or that reads the browser globals `window`, `document`, `navigator`, `localStorage`, `sessionStorage` or `location`. The same code outside `lib/` SHALL NOT be reported by this rule. (TC-PURE-01)

#### Scenario: Framework import in lib is rejected
- **GIVEN** a file under `lib/` containing `import { useState } from "react"`
- **WHEN** `npm run lint` is run
- **THEN** lint reports an error for that line whose message mentions TC-PURE-01, and exits non-zero

#### Scenario: Next.js subpath import in lib is rejected
- **GIVEN** a file under `lib/` importing from `next/navigation`
- **WHEN** `npm run lint` is run
- **THEN** lint reports a TC-PURE-01 error for that import

#### Scenario: Browser global in lib is rejected
- **GIVEN** a file under `lib/` that reads `window.innerWidth`
- **WHEN** `npm run lint` is run
- **THEN** lint reports a TC-PURE-01 error for that reference

#### Scenario: Same import outside lib is allowed
- **GIVEN** a file under `components/` importing from `react`
- **WHEN** `npm run lint` is run
- **THEN** no TC-PURE-01 error is reported for that file

### Requirement: Domain code stays framework-free at test time
Unit tests SHALL run in a plain Node.js environment with no DOM, so domain code that touches browser APIs fails its tests even if lint is bypassed. (TC-PURE-01)

#### Scenario: DOM is unavailable in tests
- **GIVEN** a unit test that evaluates `typeof document`
- **WHEN** `npm test` is run
- **THEN** the value is `"undefined"`

### Requirement: Code-health gate
`npm run verify` SHALL include a code-health analysis of the whole project (dead code, unused dependencies, circular imports, duplication, complexity) using the project's committed configuration. Any reported issue SHALL fail verification. Intentional exceptions SHALL be recorded in the committed configuration or as inline suppressions with a reason.

#### Scenario: Unused export fails verification
- **GIVEN** a new exported function under `lib/` that nothing imports
- **WHEN** `npm run verify` is run
- **THEN** the code-health step reports the unused export with its file and line, and the command exits non-zero before the build step

#### Scenario: Clean project passes the gate
- **GIVEN** the project with no unsuppressed findings
- **WHEN** the code-health step runs
- **THEN** it exits with code 0

### Requirement: Pinned Node.js runtime
The repository SHALL declare Node.js 22 (at least 22.12) as its runtime in a version file read by version managers and CI and in `package.json` `engines`. Local work, CI and hosting SHALL use that major version.

#### Scenario: CI uses the declared version
- **WHEN** the CI verification job runs
- **THEN** its log shows Node.js `v22.x` with x ≥ 12

#### Scenario: Unsupported version is flagged locally
- **GIVEN** a developer machine running Node.js 20
- **WHEN** `npm ci` is run
- **THEN** npm prints an engine warning naming the required Node.js version

### Requirement: Independent verification of every pull request
Every push to a pull request branch and every push to `main` SHALL trigger a CI job that installs dependencies from the lockfile on a clean runner and runs `npm run verify`. The job SHALL need no secrets, and its pass/fail status SHALL be shown on the pull request. A newer push to the same branch SHALL cancel an older running job.

#### Scenario: Passing pull request
- **GIVEN** a pull request whose head commit passes `npm run verify`
- **WHEN** the CI job finishes
- **THEN** the pull request shows a successful verification check

#### Scenario: Failing pull request
- **GIVEN** a pull request whose head commit contains a failing unit test
- **WHEN** the CI job finishes
- **THEN** the pull request shows a failed verification check whose log names the failing test

#### Scenario: Superseded run is cancelled
- **GIVEN** a running CI job for a pull request branch
- **WHEN** a new commit is pushed to the same branch
- **THEN** the older job is cancelled and a new job runs for the new commit

#### Scenario: No secrets needed
- **WHEN** the CI workflow definition is inspected
- **THEN** it references no repository or organisation secrets, and its token permissions are read-only for repository contents
