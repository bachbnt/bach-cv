---
name: build-skin
description: Build, extend or finish a skin of the site in src/skins/<id>/ (the ids so far are standard, dev, trade, academic, travel, and stream and moba on their own branches), from a design/skins/*.html mock or from a brief. Use when asked to "make / implement / build / finish a skin", to turn a mock into a real skin, to add a feature to every skin, or to review a skin against the project's skin rules.
---

# Build a skin

A skin changes how the content is presented, never the content. **Same information, its own interface.** The mock (if there is one) is a
**look**, not a spec of content: its titles, numbers and names are placeholders. Content, copy and behaviour come from Standard; layout,
components and interaction are the skin's own. Reply in Vietnamese.

| Id         | State                                                   | What it is                                               | Details                                              |
| ---------- | ------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `standard` | the site itself (`app/**`, `components/**`)             | the default look                                         | -                                                    |
| `dev`      | on `dev`, the model of a window-like skin               | code editor (`src/skins/dev/README.md`)                  | -                                                    |
| `trade`    | on `dev`, the model of a skin with a real engine inside | chart terminal                                           | `references/trade.md`                                |
| `academic` | on `dev`                                                | chalkboard / whiteboard with a pinned manuscript         | `src/skins/academic/README.md`                       |
| `stream`   | branch `feat/stream-skin` (based on an older `dev`)     | video platform: watch page, Shorts, live chat, Live page | `references/stream.md`                               |
| `moba`     | branch `feat/moba-skin`                                 | arena map you walk, pages are stations of the map        | `references/moba.md`                                 |
| `travel`   | on `dev`                                                | 2.5D trip map of Nha Trang from OpenStreetMap            | `references/travel.md`, `src/skins/travel/README.md` |

No id: ask which one. One skin per run.

## Ground rules of the run

- **Never commit, push or deploy** unless the owner asks in that turn. Never commit `design/`, `backup/`, `.env*`, service-account files
  or real payment numbers: the repo is public. No online Artifacts: mock-ups are local HTML.
- Work in **its own git worktree** when the owner is using the main checkout (`git worktree add ../bach-cv-<id> -b feat/<id>-skin dev`,
  then `cp -Rc node_modules` and copy `.env*`); never touch the main checkout or the other worktrees from there.
- Several skins are built on different branches, so the shared files you must touch stay **one added line each** (section 2): merging
  the skins later is then trivial. If you rebase onto a newer `dev`, resolve those lines by hand and regenerate the docs.
- `design/skins/*.html` is local and untracked and may be absent: then work from `references/<id>.md`, the skin's README and the
  screenshots the owner gives.

## 0. Read first (do not skip)

1. `CLAUDE.md`, then `.ai/skins.md`, `.ai/project.md`, `.ai/coding.md`, `.ai/structure.md`, `.ai/testing.md`, `.ai/performance.md`,
   `src/skins/types.ts`.
2. The two finished skins as models: `src/skins/dev/README.md` (window, tokens, tests) and `src/skins/trade/README.md` (an engine
   inside, shared overlay toolbar, motion scale, contrast tokens); `references/<id>.md` for the skin at hand.
3. The mock, if any: open it with Playwright (`channel: 'chrome'` works when the bundled browsers are missing), screenshot it at 1440
   and 390 px in both themes, read the HTML for colours, spacing, motion.
4. For every block, the **Standard component** that owns it (`src/components/<feature>/`) and its hook (`lib/query/use-content.ts`,
   `useProfileQuery`): learn what it tells and offers before designing yours.
5. What already exists to reuse, **before writing any helper**: `ls src/lib/derive src/hooks src/lib/chat`
   (career years, current job, skill use, skill groups, group by year, home lists, years phrase, `usePaymentMethods`, `useChatSettings`,
   `useContactLimits`, `useGoBack`, `useNow`, `useMediaQuery`, `useBox`, `useFullscreen`, `useClipboard`, ...), plus the pure windows
   (`CvDialogContent`, the chat session hook and sub-components).

## 1. Rules that never bend (`.ai/skins.md` and the owner's decisions)

- **Same information as Standard.** Every datum, link, action and state Standard shows or offers stays reachable: all seven pages
  (Home, Projects, Resume, About, Certificates, Services, Payment), the header actions (Language, Skin, Theme, BB Bot chat, Connect,
  Download CV and the CV window, picture viewers, the QR payment dialog, the contact form), `site/live` switches that turn a feature
  off, the data states (loading, empty, error with Try again, 404, Coming soon, maintenance), keyboard, both languages, both themes.
  The menus are in the order **Language, Skin, Theme** in every skin, and the Skin menu must always be reachable to leave the skin.
- **Its own interface, never a clone.** Do not re-colour Standard's blocks. Reuse hooks, query options, copy and overlays that are
  pure behaviour; write your own components. The test is that nothing Standard tells is missing, not that blocks look alike.
- **Nothing invented.** A mock element with no Standard counterpart (view counts, likes, ratings, price changes, fake chat, canned
  replies, kills and gold) is not built. Pure decoration is `aria-hidden` and derived from real data only; a number on screen is a
  count of the owner's data with a visible name. An illustrative series (the Trade candles) is labelled as such and lives in
  `lib/derive`. Say what was dropped in the final report.
- **One change, every skin; no derived data in a skin.** (1) Any number, label, ordering, grouping or "current / first / latest" that
  more than one place needs comes from ONE pure function in `src/lib/derive/` (no React, copyright header, unit test in
  `tests/unit/lib/derive/`), imported by Standard and by every skin. Look there first; if it is missing, create it there first; never
  copy a helper from another skin, replace copies you find. If the data lacks a field, add it to the schema and the documents, do not
  infer it in a component. Layout, geometry and animation maths stay in the skin. (2) A feature, a behaviour change or a data fix is
  applied to Standard and to EVERY skin in the same change, with copy keys, tests and docs; grep the other skins for the same concept.
- Data only through `lib/query` hooks, never Firebase. Interface copy in `content/copy/*` with `defineCopy` (en **and** vi); words only
  this skin has go in `content/copy/<id>*.ts`. No visible literal in JSX, `aria-label`, `title`, `alt`. The UI word is "Skin"; a skin
  name never contains "Giao diện". A control that looks different keeps the Standard accessible name.
- **A map, scene or chart is decoration plus a real control set.** The art is `aria-hidden` (or honestly named), and every page and
  item is reachable by Tab and Enter without the pointer; hotkeys are shortcuts, never the only way, and never take Tab or Enter.
  Focus returns to the trigger after a dialog or menu. Touch targets are 44 px under `pointer-coarse` (a small control gets an invisible `::after` area, never wider than the gap to its
  neighbour: a bigger one lies over the neighbour's centre and the tap opens the wrong thing); the phone layout (320 and 375 px: an iPhone SE) has
  no horizontal page scroll, no control cut off by `overflow-hidden` (what only decorates gives way first) and nothing under a fixed button;
  it moves what a phone cannot use into a drawer or bottom bar, and anything sticky at the top is subtracted from what scrolls under it
  (`scroll-padding-top`).
- **Original art only.** No trademark art, logos, names or assets of games, map apps or brands: inline SVG/CSS made for the skin,
  "inspired by", never a copy. Use the owner's own logo and photo that Standard uses. Map data from OpenStreetMap needs its credit.
- **Everything that opens** (viewer, chat, CV, Connect, QR, dialogs) is built on `components/ui` (shadcn on Base UI: focus trap, Esc,
  titles), loaded with `next/dynamic`, and reaches the skin through tokens defined on `html[data-skin='<id>']` (including the shadcn
  tokens). Viewer, QR and CV dialogs of a skin share one toolbar family (see Trade's `overlay-*`), not three.
- CSP in `firebase.json`: no `fetch`/XHR/WebSocket to another origin, no CDN script or chart library. Fonts through `next/font` in
  `skins/<id>/fonts.ts` with `preload: false`. Browser storage only for small UI preferences under a `bach-cv-*` key.
- **One Tailwind build.** Look = utilities in the TSX with `cn()`/`cva`. Theme colours in `app/tailwind-theme-<id>.css` (imported by
  `globals.css`, which scans `src/skins`), every colour used as a utility has a `--color-<prefix>-<name>` there (a name that is only
  defined as a variable silently produces no class: a unit test checks it), values defined once on `html[data-skin='<id>']`
  (dark, and light as `:not(.dark)`), names that never clash with shadcn tokens. Never a second Tailwind stylesheet. No raw colour or
  shadow in TSX: tokens (`--shadow-<prefix>-card`...).
- **CSS only for what utilities cannot say**: keyframes, view transitions, token colours, base rules, in `<id>.css` and `css/<area>.css`,
  classes with the skin prefix (`dv-` dev, `tv-` trade, `sm-` stream, `mb-` moba, `tl-` travel). **Unlayered CSS beats utilities**: put
  base rules (focus ring, links) in `@layer base`, never leave a rule on an element that carries utilities, and never repeat a
  `@keyframes` name across files.
- **Motion.** Hover only under `hover:` / `@media (hover: hover)`, plus an `active:` pressed state for touch. One motion scale and
  easing set in the theme (Trade: 100 / 160 / 240 / 400 ms), a transition lists the property that moves (`active:scale-*` and `translate-*`
  set the `scale` / `translate` properties, not `transform`), only transform, opacity and stroke move (no layout), everything is off
  for `prefers-reduced-motion`, and every loop and rAF pauses when the tab is hidden or the scene is off screen. Hover and focus never
  change layout.
- **Contrast** AA (4.5 text, 3 large and UI) in both themes: check the token pairs with a unit test like `trade-contrast.test.ts`;
  text colours get an `-ink` variant where the fill colour is too light.
- **Performance.** The skin is a lazy chunk loaded only when chosen; the Standard bundle and its CSS must not grow noticeably; big art
  is inline SVG/CSS (no big raster); images are `next/image` with a reserved ratio; no layout thrash.
- Sparse comments (why, not what), the copyright header on every file, no `any`, no casts to dodge types, no barrels, no dead code or
  exports, one component per file, no leftover mock text. English in code, Vietnamese only in `vi` copy and in your report.

## 2. Register the skin (one added line each)

1. `lib/skin/skins.ts`: id appended to `SKIN_IDS`.
2. `content/copy/skins.ts`: name and a hint of 2 to 3 words in `en` and `vi` (like "Code editor", "Trading chart", "Rainbow palette").
3. `skins/registry.ts`: the lazy loader `() => import('@/skins/<id>/skin')`.
4. `app/globals.css`: `@import './tailwind-theme-<id>.css';`.
5. Docs: `src/skins/<id>/README.md` (metaphor table, rules, files, tests, what was not built on purpose), a paragraph "## The <Name> skin"
   in `.ai/skins.md`, the Skins bullet of `README.md`, section 5.5 of `scripts/docs/detail-design.mjs`, then `npm run docs`
   (`docs/*.html` are GENERATED: never hand-edit, never run prettier on `docs/`).
6. `grep -rn "'dev'\|data-skin" src scripts tests` for any other list of skins that is meant to be complete.
   `tests/automation/support/skin.ts` and `tests/unit/skin/skins.test.ts` follow `SKIN_IDS` by themselves.

## 3. Build

```
skin.tsx          default-exports the SkinDefinition (Frame, pages, NotFound, Maintenance); imports the skin CSS
config.ts         nav items, page-key -> label / icon / route (pure, unit-testable)
fonts.ts          next/font declarations
<id>.css          palette (dark base, light :not(.dark)), shadcn tokens mapped to it, base rules in @layer base
css/<area>.css    keyframes and what utilities cannot say, one file per area
shell/            the frame: header or toolbar, navigation, bottom nav or drawer, context, overlays host, menus
pages/            one file per PageKey
blocks/           the blocks of the pages (Standard's data, the skin's own look)
ui/               skin primitives (button, chip, card, data state, state notice, skeleton, status screen, not found, maintenance)
README.md         the rules of the skin, in the style of skins/dev/README.md
```

Order of work (validate between steps, keep the app compiling after each):

1. Palette, fonts, root, theme tokens, `Frame` with the real navigation (`aria-current`, Soon marker, hidden pages absent, keyboard) and
   the header controls Standard has. Write the plan in the skin's README first (page <-> metaphor mapping, shell, tokens).
2. `Maintenance`, `NotFound`, the state screens (loading skeleton, empty, error with Try again), the shared data-state primitive.
3. The pages one by one, each after reading its Standard component; then the overlays (viewer, chat docked or sheet, CV, Connect, QR).
4. Phone, reduced motion, light theme, both languages, then the polish pass: hover / press / focus on every control, one motion scale.
5. Big engines (chart, map) in their own lazy chunk, geometry in pure unit-tested modules, scene art in its own files.

## 4. Verify

- `npx next typegen` if `LayoutProps` is missing, then `npm run typecheck`, `npx eslint src tests` (not `eslint .`: it scans build
  folders), `npx prettier --check` on the files you changed (never on `docs/`), `npx vitest run`.
- Unit tests in `tests/unit/skin/<id>-*.test.ts`: the skin's pure logic; **CSS rules** (prefix, hover only inside `@media (hover: hover)`,
  palette in both themes, no duplicate `@keyframes`, every utility colour has a theme token); **contrast**; copy keys in en and vi.
  Playwright in `tests/automation/skins/<id>-*.spec.ts` with `useSkin`, `mockFirestore`, `mockImages`, `mockWorker`, `gotoSkin`: all seven
  pages with the real seed, every Standard datum, link and action, the states (loading, error + retry, empty, soon, maintenance, 404),
  vi, reduced motion, phone width, keyboard, the overlays, the `site/live` switches, and the Skin switch back to Standard.
- Run Playwright with its own server: `PW_PORT=<port> NEXT_DIST_DIR=.next-<id> NEXT_PUBLIC_CHAT_PROXY_URL=http://localhost:9999/chat
PW_CHANNEL=chrome npx playwright test <specs> --workers=2 --timeout=90000` (a server started with the real chat proxy URL breaks the
  chat tests). The machine is loaded: re-run a failing spec alone, and against the previous commit, before calling it a regression.
  Next rewrites `tsconfig.json`: `git checkout tsconfig.json` afterwards. Then the shared edits' neighbours: `dev-shell*` specs, the
  skin-switch spec, one Standard spec.
- **Look at it.** Screenshot every page and overlay at 1440, 1024, 800 and 390 px, dark and light (hover, selected and focus states too),
  READ the PNGs, and fix what is ugly, misaligned, clipped or inconsistent: the owner reviews the visuals closely and has already
  reported ugly graphics, misaligned maps, broken image ratios, inconsistent toolbars, duplicate sections, ugly selected states and a
  button made of two mismatched parts. Real data is longer or shorter than the mock: check overflow, and Vietnamese strings.
- Sizes: `NEXT_DIST_DIR=.next-build npm run build` and compare the main stylesheet and the JS of `/services` against `dev`
  (Standard must not grow); report the skin chunk.

## 5. Finish

Remove `.next-*`, `test-results*`, `zz-*` scratch specs, stop the servers; `git status` shows only intended files. Report in Vietnamese:
what was built per page (the metaphor and what each datum became), what was changed in shared files, the **derivations** created or
used in `src/lib/derive/`, a **cross-skin check** (for each other skin: what you did for the same concept, or why it does not apply),
the mock elements **dropped or made decoration**, test results (counts, flakes named), sizes, anything rough or undecided, and where
the screenshots are. Do not commit.

## 6. Ship (only when the owner asks)

`next build` writes the export to `NEXT_DIST_DIR`, but Firebase serves `out/`: a deploy without copying uploads a stale site (it has
happened). So: `NEXT_DIST_DIR=.next-build npm run build`, check the build holds a string of the new work, `rm -rf out && cp -R
.next-build out`, `npx firebase-tools deploy --only hosting` (site `bachbntdev`), then open the live site with Playwright and read
the Skin menu and the page, never trust "complete". Commit subjects are lowercase (commitlint), body lines at most 100 characters.
