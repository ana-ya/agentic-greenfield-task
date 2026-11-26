# Proposal

## Why

The app needs a public URL for the course demo video and for sharing, and previews would let reviewers try each PR. The owner postponed this until there's something worth showing, so it's a small change of its own instead of a part of `setup-engineering-foundation` or `weather-core`.

## What Changes

- Connect the GitHub repository to Vercel through its Git integration: a preview per pull request, production from `main`, Node 24, no environment variables.
- Make previews public by switching off Deployment Protection (BC-DEMO-01).
- Record the production URL in AGENTS.md and mark TC-DEPLOY-01 shipped.

## Capabilities

### New Capabilities
- `deployment`: preview per PR, production from `main`, public access, no secrets (spec carried over unchanged from `setup-engineering-foundation` → `weather-core` → here).

### Modified Capabilities
None.

## Impact

- **External:** a Vercel project, set up by the owner. No code changes are required (the Next.js preset and `engines.node: 24.x` are enough).
- **Docs:** AGENTS.md "Deployments", PRD TC-DEPLOY-01 status.
- **Requirements:** TC-DEPLOY-01, BC-DEMO-01, NFR-COST-01.
