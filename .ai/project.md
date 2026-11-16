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
- `src/skins`: the other looks of the site (see `.ai/skins.md`), loaded only when the visitor picks one.
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

## Docs go with the code

Whenever code changes, before finishing, read the documents that describe it and fix what is now wrong or missing, in the same
change. Do not leave it for later.

- The root `README.md`, and the README of every skin the change touches (`src/skins/<id>/README.md`: its file list, its system
  screens and behaviour notes).
- `.ai/*.md`, when a rule or a structure changed.
- The design documents `docs/data-design.html` and `docs/detail-design.html` (and the entity diagram, `docs/schema.sql`). They are
  generated from `scripts/docs/*.mjs`: edit the script, run `npm run docs`, and keep the regenerated files with the change; never
  edit `docs/*.html` by hand or run prettier on `docs/`.
- A schema or data change always reaches the data design. A new module, screen, component, failure mode, cache rule or
  `SkinDefinition` field reaches the detail design.
- If nothing needs updating, say "docs checked, no change" in the report so it is clear they were looked at.

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
