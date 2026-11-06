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

- **Same content, same features as Standard.** Read the Standard component of a block first, reuse its hooks and copy; a skin never
  invents content or drops a feature (data states, errors, keyboard, dialogs, `site/live` switches, both languages).
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
  fonts a skin needs go in `app/tailwind-theme.css`, with values on `html[data-skin='<id>']`.
- Window-like skins: the lights, menus and state screens (loading skeleton, empty, error with Try again, 404, Coming soon,
  maintenance) exist in every skin.

## The Dev skin

See `src/skins/dev/README.md`. Its look is Tailwind in the TSX; `dev.css`, `dev-extra.css` and `css/<area>.css` hold the palette, the base rules and the keyframes.
**On a phone there is no activity bar, so Connect and the CV button live in the Explorer drawer** (the account menu opens as a bottom sheet).
