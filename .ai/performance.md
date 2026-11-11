# Performance Rules

## Frontend

- Keep client components small and at the leaves; prefer Server Components.
- Avoid large dependencies for small UI behavior.
- Import Firebase only through `lib/content`, using `firebase/firestore/lite`.
- Load code that only appears on interaction (dialogs, the chat) with
  `next/dynamic`.
- Use `next-bundle-optimizer` (project skill) when a route's initial load grows.
- Images are not optimized by Next.js (static export). Give every image explicit
  dimensions and size sources sensibly. A picture that is only shown small gets its own small file (the header logo
  is `public/logo-sm.png`, 3x of its 36 px; `logo.png` is the full one for the manifest and the skins).
- Links in Standard use `IntentLink` (`components/intent-link.tsx`), not `next/link`: Next.js prefetches every visible
  `<Link>`, which on a first visit downloads the code of every other page. `IntentLink` prefetches when the pointer comes over
  the link, it gets the focus or a finger touches it. Keep `next/link` only where the visitor is about to choose (the open mobile menu).
- Keep the root providers to what every Standard page needs. A provider only a skin uses (the tooltip provider of Trade) lives
  in that skin's frame, so Standard does not download it.
- First-load budget to keep an eye on (gzip/brotli, desktop `/`): about 370 KB of JavaScript in 19 requests (React and Next.js 180 KB,
  Firebase lite 47 KB, zod 35 KB, base-ui 55 KB) and 54 KB of CSS. About 30 KB of that CSS is utilities that only the skins use: it
  stays in the one Tailwind build on purpose (see "One Tailwind build" in `.ai/skins.md`).

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
