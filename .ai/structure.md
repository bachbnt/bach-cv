# Structure Rules

## Layers

- `app`: routes, layouts, metadata. Server Components by default.
- `components`: UI. Add `'use client'` only to the components that need state,
  effects, or browser APIs, and keep those as small leaves.
- `lib/content`: data contract and access. `schema.ts` (Zod) is the contract;
  `repository.ts` is the interface; `firestore-lite.ts` implements it.
- `lib/query`: TanStack Query wrappers around the repository.

Keep dependencies flowing downward:

```text
app -> components -> lib/query -> lib/content
```

Components never import Firebase. They call query options from `lib/query`.

`lib/derive`: the pure functions that turn content into the values the UI shows (years in software, the current and the first role, the
months a skill was used, a degree abbreviation, counts and orderings). Standard and every skin import them; a skin never re-derives them
(see "One change, every skin" in `.ai/skins.md`).
Each module starts with a one-line comment saying what it works out; read `ls src/lib/derive` before writing a helper:
`career-months` / `career-years` (dates, years in software), `current-job` (current, first, latest role; "is current"), `latest-degree`,
`short-degree`, `recency` (newest-first orders), `skill-use` (roles, months, series and the "Used at" evidence of a skill), `skill-groups`
and `skill-strip` (groups, areas, the strip), `highlighted` (ranked items), `duration-label`, `group-by-year`, `initials`, `job-badge`.

## Data rules

- Only `firebase/firestore/lite` runs in the browser. Never import
  `firebase/firestore` (the full SDK) in app code, and do not mix the two.
- Browser queries use `where('visible', '==', true)` (the rules require it) and
  no `orderBy`. Sort in memory with `resolveItems`.
- `schema.ts` and `repository.ts` keep explicit `.ts` import paths between themselves and have no
  dependency on Next.js, so Node scripts can import them.
- Embed at build time only `src/content/shell.json`. Everything else is read in
  the browser.

## File Conventions

- New `.ts` and `.tsx` files include the repo copyright header:

  ```ts
  /**
   * Copyright (c) 2026 bachbnt. All rights reserved.
   */
  ```

- Use the `@/` alias for app code (`@/components/...`, `@/lib/...`).
- One component per file, named in kebab-case (`featured-projects.tsx`).
  Do not create `index.ts` barrels.
- `src/components/ui` is owned by the shadcn CLI. Add components with
  `npx shadcn@latest add <name>`; change look through theme tokens first and
  edit a generated file only when a token cannot do it.
- Keep props and types inline when short or used by one component.
- Keep tests out of `src`: unit tests in `tests/unit`, automation in
  `tests/automation`.

## Worker

Worker code lives in `worker/src` and stays deployable by Wrangler.
Keep provider-specific HTTP details inside `worker/src/providers.ts`.
Keep request validation in `worker/src/schema.ts`.
Keep rate limiting in `worker/src/rateLimit.ts`.
