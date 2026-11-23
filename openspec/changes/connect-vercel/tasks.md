# Tasks

## 1. Connect and verify

- [ ] 1.1 **[owner]** Import `ana-ya/agentic-greenfield-task` into Vercel (Next.js preset, production branch `main`, no environment variables); verify the production build log shows Node 24.x and `/` loads
- [ ] 1.2 **[owner]** Turn off Deployment Protection for previews; verify the production URL and a preview URL open in a private window without a Vercel sign-in page
- [ ] 1.3 Open a pull request (this change's) and confirm the Vercel status links a preview URL and a new commit produces a new preview; open the preview in a private window and confirm a silent console and requests only to the app's own origin
- [ ] 1.4 Update AGENTS.md "Deployments": remove "planned, not connected yet" and add the production URL; verify the link opens

## Workflow follow-up

- After merge: set TC-DEPLOY-01 to `shipped` in the PRD with a change-log line; `openspec archive connect-vercel`.
