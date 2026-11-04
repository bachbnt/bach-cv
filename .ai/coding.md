# Coding Conventions

## TypeScript

- New `.ts` and `.tsx` source/test files start with the copyright header:

  ```ts
  /**
   * Copyright (c) 2026 bachbnt. All rights reserved.
   */
  ```

- Keep `strict` compatibility. Do not silence type errors with broad casts
  unless the boundary is genuinely dynamic.
- Types come from the Zod schemas in `src/lib/content/schema.ts`
  (`z.output<...>`), not from ad hoc object shapes.
- Parse data from Firestore, APIs, and unknown payloads with the schemas.
  Parsing is fail-open: a missing field gets its default.
- Keep nullable/optional access deliberate; avoid chains that hide real missing
  data bugs.

## Imports

- Use the `@/` alias for app code.
- Do not import `firebase/firestore` in app code; use `lib/content`.

## React and Next.js

- Server Components by default. Use `'use client'` only for state, effects,
  event handlers, or browser APIs.
- Read server data in components through TanStack Query hooks built from
  `lib/query/options.ts`; do not call the repository directly from a component.
- Add accessible names to icon-only buttons (`aria-label`) so Playwright and
  assistive tech can target them.
- The site is a static export: no Route Handlers, no middleware, no server
  actions. Check `next.config.ts` before using a Next.js feature.

## Localization

- English and Vietnamese. The visitor's language is `useLang()` (`src/lib/i18n/language.tsx`).
- Interface copy lives in `src/content/copy/<page>.ts` as `defineCopy(en, vi)` (from `@/lib/i18n/define-copy`, which is safe to
  import anywhere). TypeScript forces `vi` to have exactly the English keys. Components read it with `useCopy(copy)` and are Client
  Components. Do not write user-facing literals in JSX, including `aria-label`s and validation messages. Strings with values use
  `{name}` slots, not functions (functions are lost by `defineCopy`'s type for plain copy).
- Content owned by a document (roles, project summaries) is translated in the document's `l10n.vi` overlay. Read collections with
  `useContentQuery` and the profile with `useProfileQuery`, which lay the language over the data.
- Format dates with `formatMonth` / `formatPeriod` from `@/lib/format`, passing the language.
- Tests assert English by default; use `page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'))` for Vietnamese.

## Styling

- Tailwind utilities with shadcn theme tokens (`bg-background`,
  `text-muted-foreground`). Avoid raw color values in components.
- Use `cn(...)` from `@/lib/utils` to combine class names.
- Keep button heights stable across variants and hover states.
- Hover styles belong inside `@media (hover: hover)` (Tailwind's `hover:` already
  does this). Give touch a pressed state with `active:`.
- Avoid layout shifts from hover states, dynamic labels, loading states, and icons.

## Env

- Browser variables use the `NEXT_PUBLIC_` prefix and are public. Add each one
  to `.env.example`.
- Worker-only secrets go in `.env.example` under the Worker section and are never
  read by app code.
