# Project Context

This repo is the bach-cv portfolio/CV site: Next.js 16 (App Router, static
export), TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Firebase
Firestore (lite SDK in the browser), Zod, Vitest, and Playwright.

The chatbot uses a Cloudflare Worker in `worker/` as a proxy for Gemini,
OpenAI, and Anthropic. Provider API keys must stay in the Worker, never in
`NEXT_PUBLIC_*` variables.

The previous Vite/React/MUI app is not in this tree. It lives on the `master`
and `dev` branches.

## Read before writing Next.js code

This Next.js version differs from older releases. Read the relevant guide in
`node_modules/next/dist/docs/` first. Project skills live in `.claude/skills/`
(see `.claude/skills/SOURCES.md`).

## Important Paths

- `src/app`: routes, layouts, metadata, global CSS (App Router).
- `src/components/ui`: shadcn/ui components, added with the shadcn CLI.
- `src/components`: app components, one file per component.
- `src/lib/content`: the data contract (`schema.ts`), the repository interface,
  the Firestore lite implementation, and the embedded `shell`.
- `src/lib/query`: TanStack Query keys, options and hooks.
- `src/content/shell.json`: the only content embedded at build time.
- `worker/src`: Cloudflare Worker chat proxy.
- `tests/unit`: Vitest. `tests/automation`: Playwright.
- `docs/data-design.html` and `docs/detail-design.html`: the data design and the detail design (rebuild with `npm run docs`;
  the entity diagram is drawn from `src/lib/content/schema.ts`). `docs/schema.sql` is the SQL form of the model.
- `scripts/`: Firestore backup and restore.
- `tests/fixtures/seed.json`: a snapshot of the Firestore data for tests (payment accounts are fake).

## Default Checks

Run focused checks for the change, and before finishing broader changes run:

```bash
npm run typecheck
npm run lint
npm run test:unit:run
```

Run Playwright when routing, forms, layout, theme, chatbot, or visible UI
behavior changes:

```bash
npm run test:automation
```

Set `PW_CHANNEL=chrome` to use an installed Chrome instead of downloading
Chromium.
