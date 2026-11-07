# The Moba skin

The site as an in-game arena of a MOBA: a top-down map of the arena fills the window, the visitor's champion (the owner, with the owner's
photo) walks it, and the pages are stations of the map that open as in-game panels. It is one of the **skins** of the site (see
`src/skins/types.ts` and `.ai/skins.md`); the visitor picks it in the Skin menu and the URL does not change.

## Rules

1. **Same information as Standard, its own interface.** Every datum, link, action and state Standard shows is here and reachable (all
   pages, Language / Skin / Theme, BB Bot chat, Connect, Download CV and the CV window, the picture viewer, the QR dialog, the contact
   form, `site/live` switches, loading / empty / error with Try again / 404 / Coming soon / maintenance, both languages). The layout,
   the components and the interaction are this skin's own. Read the Standard component of a block before writing it, reuse its hooks,
   its copy (`content/copy/*`) and the pure windows (`CvDialogContent`, the chat sub-components); never copy a Standard block.
2. **Nothing is invented.** The map, the HUD and the scoreboard present real data only. A number is a count of the owner's data with a
   visible name (Projects 9, Years in software 7, Roles 4, Certificates 3); decoration (the minions, the camps, the fog, the bars'
   ticks) is `aria-hidden` and never reads as a stat. No fake kills, players, chat or gold. Everything a number or an ordering needs
   comes from `src/lib/derive/` (`careerYears`, `latestJob`, `oldestFirst`, `coreSkills`, `careerMonthCount`, ...), never from a copy
   of a helper in this skin. Pure visual maths (map geometry, camera, walking) stays in `world/`.
3. **Every page is a real control.** The map, the minimap and the tags over it are pointer shortcuts and are `aria-hidden`; the list of
   places (`shell/places-list.tsx`, a `nav` named `Main` with a link for every page, `aria-current`, keys beside each) is the real
   navigation, and the champion bar's buttons carry the Standard accessible names (`Connect`, `Open chat`, `Download CV`).
4. **Tokens, not colours.** Palette = `--mb-*` on `html[data-skin='moba']` (dark "night" is the base, light "day" is
   `html:not(.dark)`), utilities `bg-mb-panel`, `text-mb-title`, ... from `app/tailwind-theme-moba.css`. The shadcn tokens are mapped
   in `moba.css`, so every Standard window (dialogs, chat parts, CV) follows the skin. No raw colours in TSX. CSS classes carry the
   prefix `mb-` (a unit test enforces it, and that every `:hover` is inside `@media (hover: hover)`). **Unlayered CSS beats utilities**,
   so a rule of `css/*` never sets `position`, `display` or sizes that a utility also sets on the same element.
5. **Frames are cut, not rounded**: `mb-plaque` (card), `mb-card` (window / popover), `mb-slot`, `mb-btn`, `mb-chip`, `mb-tag` have
   their corners cut with `clip-path`. So a `clip-path` element never contains a popover or a focus ring that has to leave it.
6. **Motion** is off for `prefers-reduced-motion` and while the window is hidden or the map is off screen (`data-paused` on the map root,
   `use-animation-gate.ts`, SMIL `pauseAnimations`). The only thing that moves a transform per frame is the walker.
7. Words only this skin has are in `content/copy/moba*.ts` (`defineCopy`, en and vi, always both). Page copy goes in
   `content/copy/moba-<page>.ts`.

## The metaphor

| Page         | Place on the map                   | What the page is                                                                                                                                      |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home         | the **Fountain** (blue base)       | champion select: hero, the pipeline as a recall path, skills, roles, builds, featured objectives, contact                                             |
| Resume       | the **Mid lane** (bridge, centre)  | the scoreboard: roles are the towers of the red half of the mid lane in the order they happened, the current role is the red nexus; skills; education |
| Projects     | the **Dragon pit** (and Baron pit) | the objectives: every project is an objective with its real screenshots                                                                               |
| Certificates | the **Shrine**                     | the inventory: every certificate is an item slot (also in the champion bar)                                                                           |
| Services     | the **Shop**                       | the shop: services are items, the contact form is the purchase                                                                                        |
| Payment      | the **Vault**                      | the chest: payment methods, copy and QR                                                                                                               |
| About        | the **Lore stone**                 | champion select: photos, the summary, the specialties, the core stack as key skills                                                                   |

The champion bar is the owner's data: the portrait with the years in software as its level, two bars that count the projects and the
skills (one tick per unit), the key skills Q W E R (the core stack, a ring around each is the share of the career the roles using it
cover), the current role as the passive, Connect (D), BB Bot (F), Download CV (4), and the latest certificates as the six item slots.

## Where things are

```text
skin.tsx            SkinDefinition: Frame (MobaShell) + one component for each page + NotFound + Maintenance
config.ts           the places (icon, key), the keys
moba.css            the palette (--mb-*, night and day), the shadcn tokens mapped to it, focus ring, headings
css/*.css           map (camera, tags, motion), ui (buttons, slots, plaques), hud, panel, states
world/              pure maths: geometry (lanes, river, towers), nav (graph, routing), walker (movement), camera, stations,
                    career-stops (roles as towers), shapes (blobs, brush), decor (camps, brush, clearings)
map/                the SVG art (terrain, lanes, river, pits, bases, towers, landmarks, minions, fog), the stage, the champion,
                    the tags over the map, the towers of the career
shell/              the frame: game context (walker loop, panel, fog, captured towers), overlay context (viewer, CV, keys, toast),
                    top bar, places list, champion bar (portrait, abilities, spells, items), minimap, page panel, menus,
                    hotkeys, the windows (viewer, CV, keys, chat, Connect)
pages/              one file for each page
blocks/             the blocks of the pages
ui/                 mb-button, mb-chip, mb-card, mb-section, mb-page-head, mb-data-state, mb-state-notice, mb-state-screen,
                    mb-loading, mb-skeleton, mb-page-gate, mb-not-found, mb-maintenance, mb-root
```

## Playing

- A click or tap (or a right click) on the map or the minimap walks the champion there along the lanes (`world/nav.ts` routes it on a
  graph of the lanes, the river path and the trails; `world/walker.ts` moves it; `shell/game-context.tsx` runs a rAF loop only while
  it moves and writes transforms to the elements, so a walk renders nothing in React). Arriving at a place opens its page; a click on a
  tower of the career opens Resume at that role. With reduced motion the champion is placed, not walked.
- The arrow keys steer by hand (the champion slides along the lanes). Keys: Q W E R the key skills, D Connect, F chat, 4 the CV,
  B recall to the fountain, S Resume, P Services, O Payment, J Projects, C Certificates, H About, 1 to 6 the certificates, M the
  minimap, `?` the key list, Esc folds the page. **Tab and Enter are never taken**: the keys are shortcuts, never the only way.
- The towers of the career are taken (turn blue) as the champion walks past them; the minimap's fog clears where it has been.
- The page is a panel on the right of a wide screen (over the stage on a smaller one, the whole screen on a phone) and folds away with
  the button in its title bar or Esc; walking folds it and arriving opens it.

## Phone

Below 1100px there is no list of places on the left: the top bar's Menu button opens a drawer with the places and the actions the page
panel covers (Download CV, Connect, chat, keys). The champion bar is two rows (champion, then key skills and spells), the certificates
are left to their page and the minimap comes and goes with a button. Pages are full-screen panels.
