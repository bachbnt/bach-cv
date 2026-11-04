# Agent Instructions

This repo uses shared AI working rules in `.ai/`. Read the relevant files before
editing.

Start with:

- `.ai/project.md`
- `.ai/coding.md`
- `.ai/structure.md`
- `.ai/testing.md`

For reviews, also read:

- `.ai/review.md`
- `.ai/performance.md`
- `.ai/security.md`

For refactors and cleanup, also read:

- `.ai/clean-code.md`

Before finishing, run the checks that match the change. For broad source
changes, prefer:

```bash
npm run typecheck
npm run lint
npm run test:unit:run
```

Run Playwright when UI behavior changes:

```bash
npm run test:automation
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
