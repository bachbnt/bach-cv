# Testing Rules

## Unit Tests

Unit tests live in `tests/unit` and run with:

```bash
npm run test:unit:run
```

Use Vitest. The environment is `node`; add `jsdom` and Testing Library when the
first component test needs them. Add unit tests for:

- Zod schemas and the helpers in `src/lib/content/schema.ts`.
- The seed: `tests/unit/content/seed.test.ts` parses
  `tests/fixtures/seed.json` against the schemas.
- Query options and mutation hooks.
- Worker schema, rate limiting, provider mapping, and error handling.

Keep tests deterministic. Mock Firebase and provider boundaries rather than
calling network services.

## Firestore data

`tests/fixtures/seed.json` is a snapshot of the Firestore data with fake payment accounts. Unit tests parse it against the
schemas and the Playwright mock (`tests/automation/support/firestore-mock.ts`) serves it. Refresh it from a backup
(`npm run backup:firestore`) when the model changes, and replace the real payment accounts with fake ones.

Firestore rules are checked against the real project (see `docs/data-design.html`, section Rules); the emulator needs a
download that some networks block.

## Automation Tests

Automation tests live in `tests/automation` and run with:

```bash
npm run test:automation
```

Playwright starts `next dev` on port 3100. Tests target user-visible behavior:
navigation, forms and validation, responsive layout, the chatbot flow, critical
layout regressions, and the 404 page. Prefer roles, labels, and text selectors.
Shared stubs live in `tests/automation/support/` (`mockFirestore`, `mockWorker`, `mockNotify`, `servePayments`, `mockImages`, `useSkin`): use them
instead of copying a stub into a spec, and wait for a condition (`expect`, `expect.poll`), never for a fixed time.
Add `aria-label` to icon-only controls instead of using class selectors.

## When To Add Tests

- Bug fix: add a regression test that fails before the fix.
- New schema behavior: add unit tests.
- New route or user flow: add Playwright coverage.

## Required Checks

```bash
npm run typecheck
npm run lint
npm run test:unit:run
```

Also run automation when UI behavior changes.
