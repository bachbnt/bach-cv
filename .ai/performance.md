# Performance Rules

## Frontend

- Keep client components small and at the leaves; prefer Server Components.
- Avoid large dependencies for small UI behavior.
- Import Firebase only through `lib/content`, using `firebase/firestore/lite`.
- Load code that only appears on interaction (dialogs, the chat) with
  `next/dynamic`.
- Use `next-bundle-optimizer` (project skill) when a route's initial load grows.
- Images are not optimized by Next.js (static export). Give every image explicit
  dimensions and size sources sensibly.

## Rendering

- Avoid hover/focus styles that trigger layout shifts.
- Prefer CSS transforms/opacity for animation over layout-affecting properties.
- Make fixed-format UI stable with explicit dimensions, aspect ratios, or
  consistent borders/padding.

## Data

- Every Firestore document returned is a billed read. Read only the collections
  a page uses, in parallel, and let the persisted TanStack Query cache absorb
  repeat visits.
- Keep query keys in `lib/query/keys.ts` stable.
- Refetch on window focus only for `site/live`.
- No `orderBy` in browser queries (it can require a composite index).

## Worker

- Validate before provider calls.
- Keep provider response parsing minimal and defensive.
- Rate-limit before upstream calls.
- Avoid returning verbose upstream errors to the client.

## Measurement

- Use Playwright to protect critical layout invariants.
- Use `next build` output, the bundle analyzer, or Lighthouse only when
  optimizing a real performance issue.
