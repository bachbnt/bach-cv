# Moba skin (id `moba`, CSS prefix `mb-`)

State: built on the branch `feat/moba-skin` (rebased on the `dev` that had Trade at `a48f97e`, so it still lacks the later polish of
Trade: the zoom fix, motion scale, `@layer base` focus ring, ink colours, `useNow` and the other shared hooks). Its README
(`src/skins/moba/README.md` on that branch) is the as-built description. Mocks: `design/skins/game-mock*.html`, `game-ingame.html`
(local, may be absent). **Do not copy any game's art, names or assets**: everything is original, "inspired by a MOBA".

## Metaphor

A top-down arena map fills the window; the visitor's champion (the owner, with the owner's photo) walks it; pages are stations that open
as in-game panels.

| Page         | Place                          | What the page is                                                                                                   |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Home         | the Fountain (blue base)       | champion select: hero, pipeline as a recall path, skills, roles, builds, featured objectives, contact              |
| Resume       | the Mid lane                   | the scoreboard: roles are the towers of the red half in the order they happened; the current role is the red nexus |
| Projects     | the Dragon pit (and Baron pit) | objectives: each project with its real screenshots                                                                 |
| Certificates | the Shrine                     | inventory: each certificate is an item slot (also in the champion bar)                                             |
| Services     | the Shop                       | services are items; the contact form is the purchase                                                               |
| Payment      | the Vault                      | payment methods, copy and QR                                                                                       |
| About        | the Lore stone                 | photos, summary, specialties, the core stack as the key skills Q W E R                                             |

The champion bar is the owner's data: portrait with the years in software as its level, bars that count projects and skills, key skills
Q W E R (the core stack, a ring = the share of the career the roles using it cover), the current role as the passive, Connect, chat,
Download CV, the latest certificates as item slots.

## Decisions that matter

- Map = ONE inline SVG (3 lanes, river, pits, jungle camps, brush, towers, fog of war), original art; the world maths (`world/`: lane
  graph and routing, walker, camera) is pure and unit-tested; a walk writes transforms from a rAF loop that runs only while the champion
  moves (no React render per frame). Reduced motion places the champion instead of walking it.
- The map, minimap and tags are pointer shortcuts and `aria-hidden`; the **list of places** (a `nav` named `Main`, a link per page,
  `aria-current`) is the real navigation. Hotkeys (B recall, S Resume, P Services, O Payment, J Projects, C Certificates, H About,
  M minimap, `?` key list, Esc) never take Tab or Enter; arrows steer, no WASD.
- Frames are cut with `clip-path` (`mb-plaque`, `mb-card`, `mb-slot`, `mb-btn`...): a `clip-path` element never contains a popover or a
  focus ring that must leave it.
- Numbers come from `lib/derive` only (`careerYears`, `latestJob`, `oldestFirst`, `coreSkills`, `careerLength`...); no fake kills,
  players, gold or chat. Decoration (minions, camps, fog) is `aria-hidden` and never reads as a stat.
- Motion pauses with the tab hidden or the map off screen (`data-paused`, SMIL `pauseAnimations`).
- Phone: below 1100 px a Menu button opens a drawer with the places and the actions; pages are full-screen panels; the minimap comes and
  goes with a button.

## Known rough edges (as of the branch)

Art not yet at "as real as LoL" (towers, minions and icons are simple; the map at 1.75x shows part of it); Certificates shows an extra
"View credential" link and Resume an extra "Held ..." line; a duplicate `.mb-focus-in` class in two css files; Vietnamese long strings
checked for overflow only; only Home, Resume and Projects reviewed closely; the shared CSS is ~1760 lines of hand-written CSS, far more
than Dev or Trade (~470): the next pass should move what utilities can say into the TSX (rule: CSS only for keyframes, view transitions,
token colours and base rules).

## Tests

`tests/automation/skins/moba-*.spec.ts` (shell, pages, map and keys, states, services emblems: await `[data-art]` before counting) and
`tests/unit/skin/moba-*.test.ts` (world nav, walker, camera, css rules, copy keys).
