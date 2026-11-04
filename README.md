# BachCV

Personal portfolio and CV of Bach Bui, live at **https://bachbntdev.web.app**.

A static Next.js site whose content lives in Firestore. Editing a document in the Firebase console changes the site within
minutes: no build, no deploy. It speaks English and Vietnamese, has an AI assistant (BB Bot), and builds the CV as a PDF from the
same data.

## Highlights

- **Remote config.** `site/live` switches pages (`on` / `soon` / `hidden`), features (chat, CV download, contact form, Connect
  menu) and a site-wide maintenance screen. Every content document has a `visible` flag that the Firestore rules enforce, so a
  hidden item is never sent to a visitor.
- **Bilingual.** English and Vietnamese. Interface copy is typed (`defineCopy(en, vi)`); content is translated through an `l10n.vi`
  overlay on each document.
- **Static and cheap.** `output: 'export'` served by Firebase Hosting; the browser reads Firestore with the lite SDK and
  TanStack Query caches it (also in `localStorage`). Only `src/content/shell.json` (name, headline, avatar, SEO) is embedded at
  build time.
- **BB Bot.** A chat widget backed by a Cloudflare Worker that proxies Gemini, OpenAI or Anthropic (keys stay in the Worker).
- **CV dialog and PDF.** A preview of the CV as A4 sheets and a PDF download, both built from the visitor's language.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query ·
Firebase (Firestore lite, Hosting) · Zod · `@react-pdf/renderer` · Vitest · Playwright · Cloudflare Worker.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the NEXT_PUBLIC_FIREBASE_* values (and NEXT_PUBLIC_CHAT_PROXY_URL for the chat)
npm run dev                  # http://localhost:3000
```

| Script                                | What it does                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`                         | Next.js dev server                                                                        |
| `npm run build`                       | static export into `out/`                                                                 |
| `npm run typecheck`                   | `next typegen` then `tsc --noEmit`                                                        |
| `npm run lint` / `lint:fix`           | ESLint (Next.js config + Prettier)                                                        |
| `npm run test:unit:run`               | Vitest                                                                                    |
| `npm run test:automation`             | Playwright against `next dev` on port 3100 (`PW_CHANNEL=chrome` uses an installed Chrome) |
| `npm run backup:firestore`            | download every v2 collection into `backup/`                                               |
| `npm run restore:firestore -- <file>` | plan (add `--apply` to write) a restore from a backup                                     |

Before finishing a change: `npm run typecheck && npm run lint && npm run test:unit:run`, and `npm run test:automation` for UI changes.

## Content and remote config

The data is in Firestore, one document per item:

| Collection                                                                              | Holds                                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `site`                                                                                  | `shell` (embedded at build), `live` (switches), `profile`, `settings` |
| `skills`, `experience`, `education`, `projects`, `certificates`, `services`, `contacts` | the content                                                           |
| `payments`                                                                              | payment methods, read only while the Payment page is on               |
| `messages`                                                                              | contact-form messages (create only from the browser)                  |

Common edits in the Firebase console:

- Hide or show an item: set `visible` on the document. Feature it with `highlight` (1 is first); order it with `sort`.
- Switch a page: `site/live` → `pages.<page>` = `on`, `soon` or `hidden`. Switch a feature: `features.<name>` = `true` / `false`.
- Maintenance: `site/live` → `maintenance.enabled = true` (message in `maintenance.message`, Vietnamese in `maintenance.l10n.vi.message`).
- Translate: add `l10n.vi.<field>` on the document.

Changes show after the browser cache expires (`site/live` about a minute, content about five minutes).
The model is in `src/lib/content/schema.ts`; the rules are in `firestore.rules` (v1 and v2 side by side until the old site is retired).

## Repository layout

```text
src/app                 routes, layout, global CSS
src/components          UI (ui/ is shadcn), one folder per page or feature
src/content             shell.json (embedded) and the interface copy in src/content/copy/*.ts
src/lib/content         the data contract (schema.ts), repository interface, Firestore lite adapter
src/lib/query           TanStack Query keys, options and hooks
src/lib/i18n            language state and the copy helpers
tests/unit              Vitest        tests/automation   Playwright        tests/fixtures   Firestore snapshot for tests
scripts/                Firestore backup and restore
worker/                 Cloudflare Worker for the chat (see worker/README.md)
docs/                   data-design.html, detail-design.html (npm run docs) and schema.sql
.ai/, .claude/skills    working rules and installed skills for AI assistants
```

## Deploy

```bash
npm run build
npx firebase-tools deploy --only hosting      # the site
npx firebase-tools deploy --only firestore:rules   # the rules (changes production)
```

CI (`.github/workflows/main.yml`) builds and deploys hosting when a commit on `master` contains `[build]`.
Back up the data before changing the model: `npm run backup:firestore`. The `backup/` folder is git-ignored because it holds
payment details and visitors' emails.

The previous Vite/React/MUI version lives on the `master` and `dev` branches.
