# Skins (looks of the site)

A skin changes how the content is presented, never the content. The visitor picks one in the header, like the colour theme and
the language: it is kept in the browser (`bach-cv-skin`) and the URL does not change. `?skin=name` picks and remembers one.
Standard is the app itself (`app/**`, `components/**`); every other skin lives in `src/skins/<id>/` and is loaded only when chosen.

## How it works

- The static HTML is always Standard. `lib/skin/skin-script.ts` (in `<head>`) puts the saved choice on `<html data-skin>`; until the
  skin has loaded, `globals.css` keeps the body hidden (`data-skin-ready`) and runs a thin line along the top (`html::after`, no words, so it is the
  same in every language) so the page is not blank on a slow connection. Standard visitors get nothing: no attribute, no delay.
- `lib/skin/skin.tsx` holds the choice; `components/skin-frame.tsx` shows Standard (`children`) or the skin: its `Frame` around the
  component of the current page, its `NotFound` for a path that is not a page, its `Maintenance` instead of everything.
- A skin is a `SkinDefinition` (`skins/types.ts`): `Frame`, `pages: Record<PageKey, …>`, `NotFound`, `Maintenance`. A missing page does
  not compile. `skins/registry.ts` lists the loaders; `lib/skin/skins.ts` the ids; `content/copy/skins.ts` the names of the menu.

## Add a skin

1. `src/skins/<id>/skin.tsx` default-exports the `SkinDefinition`.
2. Add the id to `SKIN_IDS`, its names to `content/copy/skins.ts` (en and vi), its loader to `skins/registry.ts`.
3. The menus in the headers build themselves from `SKIN_IDS`.
4. Add a Playwright spec in `tests/automation/skins/` that runs the same user-visible checks in the new skin. `useSkin(page, id)` from
   `tests/automation/support/skin.ts` makes a test open in it; unit tests of the skin's own logic go in `tests/unit/skin/`.

## Rules

- **Same information, same features as Standard.** Read the Standard component of a block first, reuse its hooks and copy; a skin never
  invents content or drops a feature (data states, errors, keyboard, dialogs, `site/live` switches, both languages). Its layout and
  components may be entirely its own (Trade is not Standard in other colours): the test is that nothing Standard tells or
  lets a visitor do is missing, not that the blocks look alike.
- **One change, every skin. A skin shows data; it never works out new data.** Two rules that keep a growing number of skins maintainable:
  1. **No derived data in a skin.** A number, label, ordering, grouping or "which one is current / first / latest" that more than one place
     needs (years in software, a degree abbreviation, the current role, the months a skill was used and its "Used at", the series of the
     chart, counts, sorting, date and period text) comes from ONE pure function in `src/lib/derive/` (no React, the copyright header, a
     unit test in `tests/unit/lib/derive/`), imported by Standard and by every skin. If it does not exist yet, create it there FIRST and
     use it; never copy a helper into a skin, and when you find a copy, replace it with the shared function. If the data lacks what the UI
     needs (a flag, a label, a number), add the field to the schema and the documents (`lib/content/schema.ts`, the seed, the docs) and
     read it everywhere, instead of guessing it in a component. Only maths that is purely visual (layout, geometry, animation) stays in
     the skin.
  2. **Maintenance goes to every skin in the same change.** When a feature is added, a behaviour changes or a data bug is fixed, apply it
     to Standard and to EVERY skin (`SKIN_IDS`), with its copy keys (en and vi), tests and docs. Before finishing, search the other skins
     for the same concept (the hook, the helper, the copy key, the component) and say in the report what was done in each skin or why it
     does not apply. A change that touches how one skin presents data and not the others is not finished.
- Data only through `lib/query` hooks; never Firebase. Interface copy in `content/copy/*` with `defineCopy` (en + vi). A string that
  only a skin has goes in `content/copy/<skin>.ts`; decoration (a command line) is `aria-hidden`.
- A control that looks different keeps the Standard accessible name (`aria-label`), so tests and screen readers find the same control.
- Everything that opens (dialogs, chat, viewer) is built on the shadcn components of `components/ui` (focus trap, Esc, titles) and
  loaded with `next/dynamic`. Skin CSS reaches them through tokens: a skin defines the shadcn tokens on `html[data-skin='<id>']`
  so portals follow it.
- The CSP in `firebase.json` applies to every skin: no request to another origin (`fetch`, XHR, WebSocket) unless the origin is in
  `connect-src`; `<img>` from https is fine. A skin that needs one degrades when it is refused, and a test shows it.
- The only things a skin may keep in the browser are small UI preferences under a `bach-cv-*` key (never personal data or content).
- The Standard layers still apply (`app -> components -> lib/query -> lib/content`); a skin sits beside `components` and uses the same
  hooks. Components never import Firebase.
- Styling: Tailwind utilities and the semantic/skin tokens in the TSX, with `cn()` and `cva`. A skin's palette is theme colours in
  `app/tailwind-theme.css` whose values are defined once (dark and light) on `html[data-skin='<id>']`; names never clash with shadcn
  tokens. CSS is only for what utilities do not express (keyframes, view transitions, token colours): classes carry the skin prefix
  (`dv-`), and CSS outside a layer beats utilities, so do not leave rules behind that target an element that carries utilities.
- **One Tailwind build.** `app/globals.css` scans `src/skins` too. A skin never has a Tailwind stylesheet of its own: a second one,
  loaded later, reorders utilities of the same name (`hidden` after `md:flex`) and breaks the header of Standard. New theme colours or
  fonts a skin needs go in `app/tailwind-theme.css` (Dev) or in the file of the skin, `app/tailwind-theme-<id>.css` (imported by `globals.css`), with
  values on `html[data-skin='<id>']`.
- Window-like skins: the lights, menus and state screens (loading skeleton, empty, error with Try again, 404, Coming soon,
  maintenance) exist in every skin.

## The Dev skin

See `src/skins/dev/README.md`. Its look is Tailwind in the TSX; `dev.css`, `dev-extra.css` and `css/<area>.css` hold the palette, the base rules and the keyframes.
**On a phone there is no activity bar, so Connect and the CV button live in the Explorer drawer** (the account menu opens as a bottom sheet).

## The Trade skin

See `src/skins/trade/README.md`. A chart terminal (TradingView look) with its own interface for every page: a chart of the career as an
illustrative index derived from the real jobs (candles of a week, month, quarter or year, month by default; chart types, indicators, drawing
tools in grouped flyouts, a measure tool, a bar replay, flags that open the job on Resume, honest in its accessible name and never a quote), all
of it controlled from ONE toolbar row like TradingView's (menus in the order Language, Skin, Theme, as in every skin), a symbol search (Ctrl+K) over all the real content, a ticker tape and a
watchlist (pages, technologies with a sparkline of the years they were used, roles), a screener for Projects, financials for Resume, a
calendar for Certificates, a symbol profile for About, an order ticket for Services and a deposit page for Payment. Prefix `tv-`, colours
`tv-*`. The chart is its own lazy chunk; the watchlist counts are read from the cache only.

## The Travel skin

See `src/skins/travel/README.md`. A 2.5D trip map of Nha Trang: the map is real (`map/geo.ts` is generated from OpenStreetMap by
`scripts/travel/build-geo.mjs`, credit "© OpenStreetMap contributors (ODbL)" in the UI and the README), the stops of the trip are the real roles
(`routeStops` in `src/lib/derive/route-stops.ts`, placed along the real coast road by `map/route.ts`), and the famous sights are decoration
(`aria-hidden`, copy in `content/copy/travel-map.ts`). Every page is a card over the map (a sheet on a phone) and a real link in the rail, so the map
is never the only way to anything. The map's weight is kept down: about 4,800 elements, only transform and opacity animate (a unit test enforces it),
what moves stops when the whole map is on screen (`tl-whole`), and a state class of the map root (`tl-moving`, `tl-close`, `tl-whole`) is never also a drawing class. Styling: Tailwind with the `--tl-*` tokens (`travel.css`, night base and day `:not(.dark)`), CSS only for
keyframes and the map, class prefix `tl-`.

A new skin follows the skill `.claude/skills/build-skin` (read its SKILL.md first).
