---
name: build-skin
description: Build a new skin of the site in src/skins/<id>/ from its HTML mock in design/skins/. Covers the two planned skins, `stream` (YouTube, Shorts, live stream) and `trade` (a TradingView-style candlestick terminal). Use when asked to "make / implement / build the stream or trade skin", or to turn a design/skins/*.html mock into a real skin.
---

# Build a skin from its mock

A skin changes how the content is presented, never the content. The mock in `design/skins/<id>.html` is a **look**, not a spec of
content: its titles, numbers and names are placeholders. The real content, copy and behaviour always come from Standard.

| Arg      | Mock                       | What it is                                       | Details                |
| -------- | -------------------------- | ------------------------------------------------ | ---------------------- |
| `stream` | `design/skins/stream.html` | YouTube watch page, Shorts, live chat, Live page | `references/stream.md` |
| `trade`  | `design/skins/trade.html`  | TradingView-style chart, watchlist, bottom panel | `references/trade.md`  |

No arg: ask which one. Do one skin per run. Reply in Vietnamese. **Never commit, push or deploy** unless the user asks in that turn.

## 0. Read first (do not skip)

1. `.ai/skins.md`, `.ai/project.md`, `.ai/coding.md`, `.ai/structure.md`, `.ai/testing.md`, then `src/skins/types.ts` and `src/skins/dev/README.md`
   (the Dev skin is the model of how a skin is built, tested and documented).
2. The mock: open it with Playwright (`channel: 'chrome'` works when the bundled browsers are missing) and take screenshots at 1440 and
   390 px, in both themes. Read the HTML for the exact colours, spacing and motion.
3. For every block, the **Standard component** that owns it (`src/components/<feature>/`) and its hook (`lib/query/use-content.ts`,
   `useProfileQuery`): the data, copy (`content/copy/*`), states and behaviour are reused, not re-invented.
4. `src/skins/dev/pages/*.tsx`, `src/skins/dev/ui/dev-page.tsx` and `shell/dev-shell.tsx`: copy the _structure_ (page wrapper, head,
   data states, view transition), not the look.

## 1. Rules that never bend (from `.ai/skins.md` and the owner's decisions)

- **Same content, same features as Standard.** A mock element with no Standard counterpart (view counts, likes, "Buy" ratings, price
  changes, a fake chat transcript, canned replies) is **not built**. If it is pure decoration, make it `aria-hidden` and derive it from
  real data only; otherwise drop it and say so in the final report.
- **One change, every skin; no derived data in a skin (the owner's rule, `.ai/skins.md`).** (1) The UI of a skin shows the data it is given: any
  number, label, ordering, grouping or "current/first/latest" that more than one place needs comes from ONE pure function in
  `src/lib/derive/` (unit-tested in `tests/unit/lib/derive/`), imported by Standard and by every skin. Look there before writing any
  derivation; if it is missing, create it there first. Never copy a helper from another skin; replace copies you find. If the data lacks
  what the design needs, add a field to the schema and the documents, do not infer it in a component. Layout, geometry and animation maths
  stay in the skin. (2) A feature, a behaviour change or a data fix is applied to Standard and to EVERY skin in the same change, with copy
  keys, tests and docs; grep the other skins for the same concept before finishing.
- Data only through `lib/query` hooks, never Firebase. Interface copy in `content/copy/*` with `defineCopy` (en **and** vi). Words only
  this skin has go in `content/copy/<id>.ts`. The UI word is "Skin"; a skin name must not contain "Giao diện".
- Both languages, both themes (`html.dark` / `html:not(.dark)`), `site/live` switches, loading skeleton, empty, error with Try again,
  404, Coming soon and maintenance screens in the skin's own look.
- A control that looks different keeps the Standard accessible name (`aria-label`).
- Everything that opens (viewer, chat, CV, Connect, dialogs) is built on `components/ui` (shadcn: dialog, sheet, field, toggle-group,
  spinner, alert, message-scroller, bubble…) and loaded with `next/dynamic`. Skin CSS reaches portals through tokens defined on
  `html[data-skin='<id>']`, including the shadcn tokens.
- CSP in `firebase.json`: no `fetch`/XHR/WebSocket to another origin, no CDN script, no chart library from a URL. `<img>` from https is fine.
  Fonts through `next/font` in `skins/<id>/fonts.ts` with `preload: false` (like `skins/dev/fonts.ts`).
- Browser storage only for small UI preferences under a `bach-cv-*` key.
- **One Tailwind build.** Utilities in the TSX with `cn()`/`cva`; palette as theme colours in `app/tailwind-theme.css`, values defined once
  on `html[data-skin='<id>']` (dark and light), names that do not clash with shadcn or with Dev's tokens. A skin never has its own Tailwind
  stylesheet. CSS only for keyframes, view transitions and token colours, with the class prefix **`sm-`** (stream) or **`tv-`** (trade),
  scoped to the skin root. Unlayered CSS beats utilities: leave no rule on an element that carries utilities.
- Hover only inside `@media (hover: hover)` (the Tailwind `hover:` variant already is). Every motion off for `prefers-reduced-motion`.
- Phone: the layout works at 390 px with no horizontal page scroll; controls the phone cannot use move into a drawer or bottom nav.
- Sparse comments (why, not what), the copyright header on every file, no `any`, no dead code, no leftover mock text.

## 2. Register the skin

1. `lib/skin/skins.ts`: add the id to `SKIN_IDS`.
2. `content/copy/skins.ts`: names + hint in `en` and `vi` (`stream`: "Stream" / "Video & live"; `trade`: "Trade" / "Trading chart"; vi hints in Vietnamese).
3. `skins/registry.ts`: add the lazy loader (`() => import('@/skins/<id>/skin')`).
4. `tests/automation/support/skin.ts`: widen the `useSkin` id type to the new ids.
5. Check `tests/unit/skin/skins.test.ts` still passes (it checks loaders and names for every id).
6. `grep -rn "data-skin\|'dev'" src scripts tests` for anything else that lists skins (for example `scripts/docs/detail-design.mjs`); update only where a list of skins is meant to be complete.

## 3. Build

Layout of `src/skins/<id>/` (mirror Dev):

```
skin.tsx            default-exports the SkinDefinition (Frame, pages, NotFound, Maintenance); imports the skin CSS
config.ts           nav items, page-key → label/icon/route mapping (pure, unit-testable)
fonts.ts            next/font declarations
<id>.css            palette on html[data-skin='<id>'], base rules, keyframes (tokens only)
shell/              the frame: header/toolbar, side navigation, bottom nav, overlays host
pages/              one file per PageKey: home about resume projects certificates services payment
blocks/             the blocks of the pages (same data as Standard, own look)
ui/                 small skin primitives (button, chip, card, data-state, skeleton, not-found, maintenance)
README.md           rules of the skin, in the style of skins/dev/README.md
```

Order of work (validate between steps, keep the app compiling after each):

1. Palette + fonts + root + `Frame` with the real navigation (links to the real routes, `aria-current`, keyboard) and the header controls
   Standard has (language, theme, **skin switch**, CV download, Connect). The skin switch must always be reachable to leave the skin.
2. `Maintenance`, `NotFound`, state screens, skeletons.
3. Home → Projects → Resume → About → Services → Payment → Certificates, each one reading the Standard component first.
4. Overlays: lightbox/viewer, chat, CV window, Connect, built on `components/ui`, `next/dynamic`.
5. Mobile, reduced motion, light theme.

## 4. Verify

- `npm run typecheck && npm run lint && npm run test:unit:run`.
- Unit tests for the skin's own pure logic in `tests/unit/skin/` (for example the candle generator, chapter timestamps, `config.ts`).
- Playwright spec(s) in `tests/automation/skins/<id>-*.spec.ts` using `useSkin(page, '<id>')`, `mockFirestore` and `gotoSkin`: navigation of
  all 7 pages, data states (loading / error + retry / empty / soon / maintenance), both languages, the overlays, the phone width, the
  Skin switch back to Standard. Then `npm run test:automation` (known flaky under load: chat "failed answer", services "failed send",
  one CV focus test, title-bar menu: re-run before calling it a regression).
- Visual check: run the app (`run` skill), screenshot each page of the skin at 1440 and 390 px in dark and light, put them beside the
  mock, and fix differences in spacing, colour, type and motion. Real data will be longer or shorter than the mock: check overflow.
- Check the Standard pages did not change (the home CSS size in particular: one Tailwind build means every new class costs Standard too;
  keep the skin to existing tokens/utilities where possible).

## 5. Finish

Add `src/skins/<id>/README.md` and one line for the skin in `.ai/skins.md`. Report in Vietnamese, with a **cross-skin check** (for each other skin: what you did for the same concept, or why it does not apply; and any derivation you needed, with the file in `src/lib/derive/` where it now lives): what was built, which mock elements were
**dropped or made decoration** because Standard has no such content, what was verified, and anything not done. Do not commit.
