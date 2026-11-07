# The Stream skin

The site as a video platform: Home is the **watch page** of a video, Projects is a **Shorts** reel with a live chat beside it, Resume is
the page of a **live** channel, About is a **channel** page. It is one of the **skins** of the site (see `src/skins/types.ts` and
`.ai/skins.md`); the visitor picks it in the header and the URL does not change.

## Rules

1. **Same information as the Standard skin, its own interface.** Every piece of information, link, action and state that Standard shows on a
   page must be present and reachable here (data, copy, both languages, loading / empty / error with Try again, `site/live` switches,
   Download CV, Connect, the chat, forms with their validation), but the layout, the components and the way of interacting are this
   skin's own: the pages are a **career player** (Home, Resume), a **Shorts reel** (Projects), a **channel** (About), a **playlist**
   (Certificates), a **memberships page** (Payment) and a **community tab** (Services). Do not copy a Standard block component into it.
   Reuse the hooks and the copy of Standard, and read the Standard component of a page first to list what it shows (every page section
   below has that list). A thing a video site has and Standard has not is **not built**: view counts, like, subscribe, share,
   notifications, a fake chat transcript, invented durations, "Up next" videos that are not projects or roles.
2. **Decoration is `aria-hidden` and made of real data.** The search field of the top bar (it shows the headline of the site, cannot be
   focused, does nothing), the progress segments of the reel (one per project), the scrubbers of the system screens, the year numeral
   behind a scene of the player, the numbers of the playlist rows.
3. **The red LIVE badge** (`ui/live-badge.tsx`) is only where Standard shows its Current badge, with the Standard word: the scene and the
   chapter of the current role on Home and on Resume.
4. **The "Subscribe" slot** is Standard's Download CV button (`ui/cv-pill.ts` restyles it); Connect is the Standard menu in the top bar.
5. **Accessible names are Standard's** (`content/copy/*`): the nav is `Main`, the menus `Language: English`, `Theme`, `Skin: Stream`, the
   chat `Open chat` / `Close chat` / `BB Bot, AI assistant`. The few words only this skin has are in `content/copy/stream.ts`
   (en and vi).
6. Phone (below 701px): the sidebar is gone and the **bottom navigation** has four pages and a Menu tab whose sheet has the other pages,
   Download CV and the language, theme and **Skin** menus, so a visitor can always leave the skin. From 701px the three menus are in the top
   bar; below 1100px the sidebar is a drawer opened by the burger (on a wide screen the burger folds it).

## The reel of Projects

One project at a time. It changes with the two buttons, the arrow keys (not while a field has the focus), a vertical swipe and a turn of the
mouse wheel over the reel (`wheelStep` in `config.ts`: one turn is one step, 600 ms apart). The segment of the open project at the top fills
in `--sm-reel-time` (8 s, a transform, not a width) and, when it is full, the reel goes on by itself (`onAnimationEnd` in `blocks/reel-card.tsx`):
the bar is a promise, so it is kept. It waits while the pointer or the focus is in the reel (`animation-play-state`), while the screenshots are
open, and when the visitor presses the Pause button beside the reel (`aria-pressed`: a moving thing needs a stop that works without a
mouse). With reduced motion the bar stands still and the reel never moves by itself (the button is not shown). A test that steps by hand
holds the bar with `--sm-reel-time: 600s`; one that waits shortens it (`reelTime` in `stream-pages.spec.ts`).

## Where things are

```text
skin.tsx            SkinDefinition: Frame (StreamShell) + one component for each page + NotFound + Maintenance
stream.css          palette (dark, light), the shadcn and Standard tokens mapped to it, page change, keyframes (prefix sm-)
config.ts           page order, tabs, chapter times, reel stepping and swipe, the progress mark (pure, tested)
fonts.ts            Roboto through next/font, preload: false
shell/              top bar, sidebar, drawer, bottom navigation + Menu sheet, the three menus, StreamShell
chat/               the live chat: provider (one conversation), panel, sheet, dock beside the reel
pages/<page>.tsx    one file for each page
blocks/<name>.tsx   the parts of the pages
ui/                 root, buttons, chips, live badge, headings, data states, 404 / Coming soon / maintenance screens
```

## Styling

- Tailwind utilities + theme colours in the TSX (`bg-sm-surface`, `text-sm-mute`, ...). The colours are declared in
  `app/tailwind-theme-stream.css` and their values live once on `html[data-skin='stream']` in `stream.css` (dark is the base, light is
  `html:not(.dark)`), so portals (menus, sheets, dialogs) follow them. The shadcn tokens and the Standard tokens the reused overlays
  read (`--night`, `--brand`, `--page`, ...) are mapped to the palette there as well.
- CSS is only what utilities do not say: tokens, the dark stage of the player (`sm-stage`), view transitions, keyframes. Classes have
  the prefix `sm-` and `tests/unit/skin/stream-css-rules.test.ts` checks that, and that every hover is inside `@media (hover: hover)`.
- The font variable is put on `<html>` by `ui/stream-root.tsx`, so what React puts in `<body>` uses Roboto too.

## Home and Resume: the career player

Home and Resume do not copy Standard's layout: they keep its **information** and tell it as a video. The real roles (`useContentQuery('experience')`,
the hidden ones are not served) are the chapters of a video, played from the oldest to the newest. Words only these pages have are in
`content/copy/stream-career.ts` (en and vi); the rest is Standard's copy and hooks.

- **Home**: `blocks/career-watch.tsx` holds one clock (`career-use-player.ts`) for the player (`career-player.tsx`, scenes in `career-scene.tsx`)
  and the chapters panel beside it (`career-panel.tsx`, "Where I've worked": a press seeks the player; the link to Resume is in its heading).
  Under the player: the h1 and the intro as real text, Download CV and Ask BB Bot, the technologies as hashtags (`career-title.tsx`). Then the
  pipeline and what I built at FPT (`career-steps.tsx`), the featured projects (`career-projects.tsx`) and the contact band (`career-contact.tsx`).
- **Resume**: `career-resume.tsx` has the big timeline (the same `career-bar.tsx` as the seek bar of Home, tall) and the transcript of the roles
  (`career-transcript.tsx`: responsibilities open and shut, `inert` when shut, the first role starts open; a chapter of the timeline scrolls to
  its role, opens it and moves the focus there). Skills (`career-skills.tsx`: the core stack as a pinned list, the rest as hashtags by area with
  Standard's tip) and education as a playlist (`career-playlist.tsx`). `#experience`, `#skills` and `#education` are anchors (About links to
  `/resume#skills`).
- **The clock** runs only while the player is on screen (IntersectionObserver), the tab is visible, the visitor has not paused, and neither the
  pointer (a mouse or a pen, never a finger) nor the keyboard focus is on the player. A press on a control ends the hold, so Play works with the
  pointer still there. The default speed is 2x (1x, 1.5x, 2x: one scene is 8 s at 1x, `SCENE_MS`), the progress of a scene is written to `--sm-cp`
  on the player (no render per frame), and the scene and the year are state. At the end it **stops on the current role** and the button becomes
  Replay. With reduced motion nothing plays, the play and speed buttons are not shown, the first scene is whole and only the chapters change it.
  `data-running` on the player says whether the clock is going (a test waits for it before it moves the fake clock).
- **Chapters** (`career-chapters.ts`, pure and tested): as wide as the role lasted, never under 7% of the bar; the label of the time is the year
  of the playhead over the years of the career. Roving focus: arrow keys, Home and End move (and seek, on the player); Enter or a click opens.
- **Hover preview** of a featured project (`career-use-preview.ts`, `career-preview.ts`): a mouse on the thumbnail, or the keyboard focus on the
  link, cycles its real screenshots every 900 ms with a thin red line; nothing is requested before the first hover, a finger and reduced motion do
  nothing, a project with no screenshots does nothing, and the timer stops on leave, blur and unmount.

## Overlays

Nothing is copied from Standard: the picture viewer (`Lightbox`, screenshots, certificates, QR codes), the CV window (`CvDialog`), the
Connect menu and the skill tips are the Standard components, themed by the tokens, and loaded with `next/dynamic` where Standard does or
where the skin opens them (the viewers, the sheets, the chat). The chat is the Standard session (`useChatSession`: same limits, errors and
Try again) held by `chat/stream-chat-provider.tsx`, so it lasts from page to page. On Projects and from 1100px it is docked beside the reel
(`chat/chat-dock.tsx`, which then hides the top bar button); everywhere else it is a sheet (from the right on a tablet, up from the bottom
on a phone).

## Motion

A page change is a React view transition (`<ViewTransition key={page}>` in `shell/stream-shell.tsx`; the top bar, the sidebar and the
bottom navigation are named, so they stay). The reel rises in when the project changes and its progress segment fills. The pulse of the LIVE dot
and the typing dots are keyframes. All of it stops for "reduce motion" (`stream.css`; the view transitions are cut by `globals.css`).

## Keyboard

On Projects, ArrowDown and ArrowUp move through the filtered projects (left alone while a field, a menu or a window has the focus), and
a vertical swipe does the same on a touch screen. The two buttons beside the reel do the same, with the counter between them.

## The channel page and the system screens

About is its own layout, not Standard's: a **channel page** (`blocks/channel-header.tsx`: banner = first cover, round photo, the name as the one `h1`, the
headline, the specialties as tags, Download CV and Ask BB Bot where Subscribe would be) with **tabs that really switch** (`blocks/channel-tabs.tsx`: a
tab list with roving focus, arrows, Home and End; only the open panel is in the page). Tab 1 is the **About panel** (`channel-about-panel.tsx`):
Description (the profile summary), Links (`channel-links.tsx`: the email with Copy, the phone, then the profiles in the groups of the Connect menu),
Details (`channel-details.tsx`: location, the year of the first role as "Since", the years in software, the languages of the site; each from data
and left out when it is not there), and beside it the second cover and the Ask BB Bot card. Tab 2 is the core stack as a grid of videos
(`about-core-stack.tsx`: the skill mark on a wash of its own colour, the name and the Standard "Used at" line). No subscriber count, no views. Pure
helpers (`yearsSince`, `careerFacts`, `siteLanguageNames`, `tabTarget`) are in `blocks/channel-facts.ts`; the words only this page has are in
`content/copy/stream-channel.ts`.

The system screens are a **player** (`ui/channel-player.tsx`: 16:9, black in both themes, a scrubber along its foot that is decoration):
404 is "Video unavailable" (a crossed-out camera), Coming soon is a **Premiere** waiting room (a pulsing clock, a red segment going back and forth, no date
and no countdown because there is none) and maintenance is a player that stopped to buffer (the wheel turns, the owner's message, the email). Under the
player the Standard title, words and the same two ways out. The empty and error panels are centred, a round mark, one line and a blue pill
(`ui/stream-state-notice.tsx`); the skeleton is grey 16:9 pictures with a round channel mark and two lines, shimmering (`ui/stream-skeleton.tsx`).
Keyframes for these are in `css/channel.css`; reduced motion stops them all (`stream.css`).

On a phone the Projects reel has the projects below it as **chapters** (`blocks/channel-reel-chapters.tsx`): tap one to go to it; the time is
decoration (`chapterTime`).

## Certificates, Payment and Services (the library pages)

These three pages keep every piece of **information** of Standard (data, copy, both languages, states, copy-to-clipboard, the QR and picture
viewers, the contact form) but not its layout: each is a different page of a video site. Hooks, helpers and copy are Standard's
(`useContentQuery`, `copyToClipboard`, `summaryOf`, `useContactForm`, `content/copy/*`); the overlays are Standard's `Lightbox` and
`PaymentQrDialog`. The few words only the skin has are in `content/copy/stream-library.ts`. All files are `blocks/library-*`.

- **Certificates is a playlist page** (`library-playlist.tsx`). The card on the left stays in view (`library-playlist-card.tsx`): the cover is
  the latest certificate with Standard's Latest word, the title is the `h1`, then the owner, the real count, the intro and View all (which opens
  the viewer at the first certificate). It shows while the data loads or fails, so the page always has its title; the cover and count wait for
  data. On the right a numbered list: the thumbnail opens the viewer (`View <name> certificate`), the issuer is the channel name, the issue date
  the upload date, the skills are hashtags, then Open PDF. The viewer is `library-certificate-viewer.tsx` (same prev/next, counter, Open PDF).
- **Payment is the Join page** (`library-join.tsx`). A header with the owner's picture and Standard's title and intro, then the notice. The
  featured methods are the main membership levels (`library-tier.tsx`: a coloured band, the account number as the price, the QR, Copy
  number and Copy all details); the others are "More ways to pay" as perks (`library-perk-row.tsx`) under bank / wallet tabs
  (`library-join-tabs.tsx`: drawn as tabs, but `aria-pressed` toggles, as Standard's filter is). Which method is featured, which kinds
  the tabs offer, and the order of the QR viewer are pure and tested (`library-model.ts`). The toast is a snackbar (`library-snackbar.tsx`, same
  messages and two seconds). Payments paused is `payment-empty.tsx`.
- **Services is the Community tab** (`library-community.tsx`). Each service is a post (`library-post.tsx`: owner, name and text, Standard's
  drawing as the picture, **Ask about this**, which is the topic chip of the same service). The contact form is the comment composer
  (`library-composer.tsx`, `#contact-cta`): beside the feed from 1000px (it stays in view), after the feed on a phone. The avatar takes the
  first letter of the name being typed; once sent, the message shows as the comment that was posted, then Standard's "Message sent".
  The posts and the composer share one `useContactForm`.
- Tests: `tests/automation/skins/stream-library.spec.ts` and `tests/unit/skin/stream-library-model.test.ts`; the three data states of
  Certificates and Services and the two of Payment are in `stream-states.spec.ts`.
