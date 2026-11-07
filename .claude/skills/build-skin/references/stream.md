# Stream skin (id `stream`, CSS prefix `sm-`)

Mock: `design/skins/stream.html`. The site as a video platform. Palette: YouTube dark `#0f0f0f` / `#181818` / `#272727`, accent red
`#ff0033`, link blue `#3ea6ff`; light theme white / `#f2f2f2`, link `#065fd4`. Font: system / Roboto, one family (no mono rule here).
The red `LIVE` badge, the progress bar, the chips and the pill buttons are the vocabulary.

## Frame (`Frame`)

- Top bar (56 px): burger, logo mark + site name, search field, language, theme, Skin switch, account avatar.
  - The **avatar button is Connect** (same menu as Standard: `connect-menu`), not a made-up account.
  - The search field **does nothing in Standard, so it is decoration**: either drop it, or make it a real filter only if Standard has one.
    Default: drop it on phones, keep as `aria-hidden` decoration on desktop. Say so in the report.
- Left sidebar (240 px, desktop): the 7 pages as items (Home, About, Resume, Projects, Services, Payment, Certificates) with the page label
  from `content/copy/common.ts`; `aria-current="page"`; a page that is `soon` shows its Soon marker; a hidden page is absent. Download CV at the bottom.
- Phone: bottom nav (4 tabs + a "more" sheet for the rest, built on `components/ui/sheet`).
- Page change: React `<ViewTransition>` like Dev (`dv-vt-*` → `sm-vt-*`).

## Pages: mock → real content

| Page         | Look in the mock                                      | Real content (read the Standard component first)                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home         | Watch page: player, title row, description, "Up next" | Hero (`home-hero`): title + intro in the player card, portrait, Download CV. Pipeline steps (`home-build`) become **chapters** with the real step titles and bodies; timestamps are decoration derived from the step index. Projects (`home-projects`) and work (`home-work`) fill the Up next column. Tech strip becomes the chips row. Contact band is the comment box and sends the real contact form (`use-send-message`, same validation and states).                                        |
| Projects     | Shorts: 9:16 reel, action rail, prev/next, chat       | Real projects by rank (`projects-content`), kind filter as chips. The reel is the project cover + title + description + tags; prev/next and ArrowUp/ArrowDown move through the filtered list; the rail's buttons are the project's **real** actions: screenshots (opens the lightbox), links. No like/count. The chat beside it is the **real chat** (`components/chat`, its hooks, `features.chat` switch, failure state); never seed it with fake messages. On phone the chat opens as a sheet. |
| Resume       | "Live" page: LIVE badge, timeline of streams          | Experience (`experience-list`) and education as the timeline; the current job carries the red `LIVE` badge only where Standard shows its Current badge (`current-badge`); responsibilities as the list; skills as chips.                                                                                                                                                                                                                                                                          |
| About        | Channel page                                          | `about-head`, core stack, education, certificates preview exactly as Standard has them; layout of a channel header (banner, avatar, name, "tabs"). Tabs are anchors/sections of the same page, not routes.                                                                                                                                                                                                                                                                                        |
| Services     | Playlist cards                                        | Service list + topic chips + contact form (`services/*`), same fields, errors and sent state.                                                                                                                                                                                                                                                                                                                                                                                                     |
| Payment      | Playlist / membership cards                           | Payment feature + list + methods (`payment/*`), same QR/copy behaviour and empty state.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Certificates | Playlist with thumbnails                              | Certificate list/gallery + viewer (`certificates/*`).                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Mock elements that must NOT become features

View counts ("1,2 N lượt xem"), like/dislike, "Đăng ký"/subscribe state, notification bell, share, the fake chat transcript, the typing
indicator, fake thumbnail durations ("2:41", "2025" badges invented), "Danh sách phát"/"Danh sách chạy" captions, search. If a visual
needs a number or label, derive it from data that exists (years of experience via `careerYears` of `lib/derive/career-years.ts`, counts of items) or leave it out. The
"Subscribe" button slot is the **Connect** button (same accessible name as Standard's Connect) or Download CV, never a toggle.

## Details to keep from the mock

- Player card: 16:9, radial red/blue glows, big headline left, portrait block right-bottom; the fake play button is hidden until hover and
  is the real "open picture" action only if Standard has one; otherwise drop it.
- Red pulsing dot on LIVE (reduced motion: static). Progress bar under the Shorts reel animates per slide (reduced motion: static).
- Description box collapses to 2 lines with "Show more" (real expand/collapse, `aria-expanded`), translated in both languages.
- Cards: 16:9 thumbnails with the cover image of the project (`project-cover`) over the gradient fallback; hover raises the title.

## Tests worth writing (`tests/automation/skins/stream-*.spec.ts`)

Sidebar has 7 links with `aria-current`; every page's states; reel keyboard (ArrowDown/ArrowUp) moves through the **real** filtered
projects; chat opens beside the reel (desktop) / in a sheet (phone) and shows the failed-answer state; Connect avatar menu; contact
form sends via the comment box; description toggle; reduced motion; Skin switch back to Standard.
