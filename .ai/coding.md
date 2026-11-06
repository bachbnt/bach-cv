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
- The site has a light and a dark theme (`.dark` on `<html>`, tokens in `src/app/globals.css`). A new color is a token with a value
  in both `:root` and `.dark`, not a hex in a component. Use `bg-card` (not `bg-white`), `text-body` for paragraphs, `text-brand-ink`
  for red text or links (`bg-brand` only fills a button), `bg-page` / `text-page` for the page accent, and `text-danger` with
  `bg-danger-bg` for errors. On the dark panels (`bg-night`) the light text is `text-white`, not `text-background`.
- Paper that must stay white in dark mode (the CV sheets) carries `theme-light`, which restores the light tokens inside it. Images
  with a white background (QR codes, screenshots) keep `bg-white`.
- A card-like surface gets `lift` (rises 3px, bigger shadow, animated) and `glow`. Do not write a per-card hover; a form or a small
  box inside a card does not get `lift`. The `glow` class (cursor spotlight and lit edge, set up in `globals.css`; `<PointerGlow>` feeds it the mouse
  position). It uses `::before` and `::after`, so those cannot be used on the same element: use a real child element instead.
  Rows, sections and anything without a rounded card shape do not get it.
- The tinted head of a page (the header block and the title block, both `bg-page-tint`) carries `band-glow`: a soft light under the mouse
  that is the block's own background-image, so it sits behind the text. Every `band-glow` is lit together by `<PointerGlow>`.
- Parts of a revealed block that should arrive one after another carry `data-part` and `style={{ '--p': n }}` (see the reveal block in
  `globals.css`). Animated open/shut content uses the `grid-template-rows: 0fr → 1fr` trick plus `inert` while shut, not `<details>`.
- Motion beyond hover: a page change and a filter swap are React `<ViewTransition>`s (`SitePage` names the header `site-header` (`default='none'`, so a filter swap does not freeze it) and
  `SkinFrame` wraps the page in `<ViewTransition key={pathname}>`; a filter wraps its list with `key={filter}` and sets the filter inside `startTransition`). The classes `page-in`,
  `page-out`, `list-in`, `list-out` are in the "page change" block of `globals.css`. The progress line along the top is
  `<ScrollProgress>` (a CSS scroll-driven animation, no script). Every one is off for "reduce motion" (view transitions still start, so a `reduce` block gives their animations a duration of 0) and for browsers without support.
  The pseudo-elements hang off `<html>`: write `html[data-skin='dev']::view-transition-new(.x)`, never with a space before `::view-transition`.
  A test of a transition reads the animations it really plays (`tests/automation/support/view-transitions.ts`), because a selector that does not match leaves the browser's own fade.
  A magnetic list (the chips of About) is `useMagnet(ref)` with `data-magnet` on each item, which turns `--tx`, `--ty` and `--s` into `translate` and `scale`; `lib/magnet-overlaps.ts` keeps the pulled items from lying on top of each other. A photo frame is `group/photo lift` with the picture zooming on `group-hover/photo`; it does not take `glow`, whose spotlight would sit under a `fill` image.
  `scale-*` utilities set the `scale` property, so a test reads `getComputedStyle(el).scale`, not `transform`.
- `tests/unit/theme/contrast.test.ts` checks the token pairs for contrast; run it after changing a color.
- A photo whose size CSS decides (a fixed height with `w-full`, a grid cell) is a `fill` image inside a `relative overflow-hidden`
  frame that has the size, with `object-cover` on the image. Do not set a CSS width or height on an `<Image>` that has `width` and
  `height`: Next.js warns when only one of them differs from the attributes. Use `priority` for the image at the top of a page.
- Use `cn(...)` to combine class names: `@/lib/utils` re-exports the one of the `cn` alias (shadcn files import it as `from 'cn'`); either import is fine.
- Keep button heights stable across variants and hover states.
- Hover styles belong inside `@media (hover: hover)` (Tailwind's `hover:` already
  does this). Give touch a pressed state with `active:`.
- Avoid layout shifts from hover states, dynamic labels, loading states, and icons.

## Env

- Browser variables use the `NEXT_PUBLIC_` prefix and are public. Add each one
  to `.env.example`.
- Worker-only secrets go in `.env.example` under the Worker section and are never
  read by app code.
