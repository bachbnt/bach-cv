# Stream skin (id `stream`, CSS prefix `sm-`)

State: built on the branch `feat/stream-skin` (based on an older `dev`, not rebased; its `build-skin` skill and rule docs differ from
`dev`, so expect conflicts). **Before shipping it, rebase onto `dev` and bring it to the current rules**: its own components rather than
Standard's blocks in other colours, derivations from `lib/derive`, theme tokens in `app/tailwind-theme-stream.css` imported by
`globals.css`, the shared hooks (`useNow`, `useGoBack`, `usePaymentMethods`, `useChatSettings`, `useContactLimits`), the motion scale
and focus ring of Trade, a CSS test (prefix, hover media, unique keyframes, theme tokens) and a contrast test.

Mock: `design/skins/stream.html` (local, may be absent). The site as a video platform. Palette: YouTube-like dark `#0f0f0f` / `#181818` /
`#272727`, accent red `#ff0033`, link blue `#3ea6ff`; light white / `#f2f2f2`, link `#065fd4`. One system / Roboto family. The red `LIVE`
badge, the progress bar, chips and pill buttons are the vocabulary. No YouTube trademark art: original marks only.

## Frame

- Top bar (56 px): burger, logo mark + site name, search, then the menus **Language, Skin, Theme**, account avatar.
  - The **avatar button is Connect** (the same data as Standard's Connect), not a made-up account.
  - The search field does nothing in Standard: decoration (`aria-hidden`) on desktop, dropped on phones, unless it becomes a real filter
    over real content like Trade's `Ctrl+K` palette. Say which in the report.
- Left sidebar (240 px, desktop): the seven pages with the labels of `content/copy/common.ts`, `aria-current="page"`, Soon marker, hidden
  pages absent; Download CV at the bottom.
- Phone: bottom nav (4 tabs + a "more" sheet on `components/ui/sheet`).
- Page change: `<ViewTransition>` like Dev (`sm-vt-*`).

## Pages: mock -> real content (read the Standard component first)

| Page         | Look in the mock                                 | Real content                                                                                                                                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home         | Watch page: player, title row, description, next | Hero in the player card (title, intro, portrait, Download CV); the pipeline steps are **chapters** (real titles and bodies, timestamps derived from the step index); projects and work fill "Up next"; the contact band is the comment box and sends the real form.                                                                                                        |
| Projects     | Shorts: 9:16 reel, action rail, prev/next, chat  | Real projects by rank, kind filter as chips; the reel is cover + title + description + tags; ArrowUp / ArrowDown move through the filtered list; the rail has the project's real actions (screenshots viewer, links). No like or count. Beside it the **real chat** (`useChatSession`, `features.chat`, failure state), never seeded with fake messages; a sheet on phone. |
| Resume       | "Live" page: LIVE badge, timeline of streams     | Experience and education as the timeline; the red `LIVE` badge only where Standard shows its Current badge; responsibilities as the list; skills as chips.                                                                                                                                                                                                                 |
| About        | Channel page                                     | About head, core stack, education, certificates preview as Standard has them, in a channel header layout; tabs are sections of the page, not routes.                                                                                                                                                                                                                       |
| Services     | Playlist cards                                   | Service list + topic chips + contact form: same fields, validation, sent and failed states.                                                                                                                                                                                                                                                                                |
| Payment      | Membership cards                                 | Payment feature, list, methods, same QR and copy behaviour and empty state.                                                                                                                                                                                                                                                                                                |
| Certificates | Playlist with thumbnails                         | Certificate list and viewer.                                                                                                                                                                                                                                                                                                                                               |

## Mock elements that must NOT become features

View counts, like / dislike, subscribe state, notification bell, share, the fake chat transcript and typing indicator, invented
thumbnail durations and badges, "playlist" captions, search. A number or label comes from data that exists (`careerYears`, counts) or is
left out. The "Subscribe" slot is **Connect** (same accessible name) or Download CV, never a toggle.

## Details worth keeping

- Player card: 16:9, radial red / blue glows, headline left, portrait right-bottom; a play button only if it is a real action.
- Red pulsing dot on LIVE (static in reduced motion); the progress bar under the reel animates per slide (static in reduced motion).
- Description collapses to 2 lines with "Show more" (`aria-expanded`, both languages).
- Cards: 16:9 thumbnails with the project cover over a gradient fallback; hover raises the title.

## Tests worth writing (`tests/automation/skins/stream-*.spec.ts`)

Sidebar has seven links with `aria-current`; every page's states; the reel keyboard moves through the **real** filtered projects; chat
beside the reel (desktop) and in a sheet (phone) with the failed-answer state; Connect avatar menu; the comment box sends the form; the
description toggle; reduced motion; the Skin switch back to Standard.
