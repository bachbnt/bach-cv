# The Trade skin

The site as a chart terminal (TradingView look): a candlestick chart of the career on top, the page in a bottom panel, a watchlist
that is the navigation, and a rail with the chat and Connect. It is one of the **skins** of the site (see `src/skins/types.ts` and
`.ai/skins.md`); the visitor picks it in the Skin menu and the URL does not change.

## Rules

1. **Same information as Standard, its own interface.** Every piece of information, link, action and state Standard shows on a page is present
   and reachable here (data, copy, both languages, loading / empty / error with Try again, `site/live` switches, Download CV, Connect, the
   chat, forms with their validation), but the layout, the components and the interaction are this skin's own: the pages are a **symbol
   overview** (Home), a **screener** (Projects), **financials** (Resume), a **calendar and feed** (Certificates), a **symbol profile**
   (About), a **catalogue with an order ticket** (Services) and a **deposit page** (Payment). Do not copy a Standard block component into
   it: reuse its hooks and its copy (`content/copy/*`), and read the Standard component of a page first to list what it shows. Words only
   this skin has are in `content/copy/trade*.ts` (en and vi).
2. **Nothing may read as a quote.** The chart is an **illustrative index** derived from the real jobs (`lib/derive/career-series.ts`): its
   accessible name says it is not financial data, the legend says "Career index", values are "index points", and there is no currency,
   no Buy / Sell, no rating and no percentage that reads as a return. The tools on it are real (chart types, indicators, drawings, a
   measure tool, a bar replay of the career), and so are the numbers elsewhere: counts, dates and durations from the data, never
   invented. The tickers of the watchlist (`HOME`, `PROJ`, ...) are decoration beside the real names, which stay the accessible names.
3. **Accessible names are the Standard ones**: `Language: English`, `Theme`, `Skin: Trade`, `Download CV`, `Connect`, `Open chat`, the
   navigation `Main` (a page that is coming soon is marked and is not a link; a hidden page is absent).
4. **Phone** (below 1101px): no rails; toolbar, chart, range buttons, the page, then the watchlist and a row with the chat and
   Connect, and a bar of three pages (Home, About, Resume: a page that is coming soon stays in it with the Soon mark and is not a link; a
   hidden one is absent, as in the Standard menu) and a **Watchlist** button that opens the watchlist as a sheet from the bottom (Pages, Skills,
   Roles and Details: every page is one tap away; it closes when a page is chosen, and has its own close button, because a phone has no Esc).
   The toolbar sticks to the top: when a page is chosen the page opens just under it, never at the scroll offset of the page before
   (`shell/use-scroll-to-page.ts`; a visitor still at the chart stays where they are). The search takes the whole screen and has a close
   button. The language, theme and Skin menus and the CV button stay in the toolbar. The bar under the chart (ranges, Go to date, zoom,
   log, auto, fit) wraps into a second row instead of scrolling sideways, and the list of keyboard shortcuts is not offered on touch. The
   sheets of the watchlist and of BB Bot share one header (the same height, padding and close button).
   **The toolbar sticks to the top of a phone**, so it writes its height to `--tv-sticky` (`shell/use-sticky-offset.ts`) and `trade.css`
   turns that into `scroll-padding-top`: a mark of the chart that opens a job or the education, and a jump link, stop under the toolbar
   and not behind it. The hit area of a mark is 24 px wide and 46 px tall (flags are never closer than 24 px), so it never lies over the
   centre of the next mark.
5. **Reduced motion** stops the live tick of the last candle (a timer, so `useReducedMotion` guards it) and, in `trade.css`, every animation.

## The chart (`chart/`, `lib/derive/career-series.ts`, `shell/range-bar.tsx`, `shell/tool-rail.tsx`, `content/copy/trade-chart.ts`)

A working chart terminal, drawn by hand in SVG: no library, no CDN, its own `next/dynamic` chunk (`shell/chart-slot.tsx`), so the terminal
paints first. **The values are an illustrative index derived from the real jobs** (`buildCandles` of `lib/derive/career-series.ts`: one seeded candle per week from the
first job, about 53 % green weeks, the last near the top; the chart shows them as weeks, months, quarters or years, **months by default**).
**Only the weeks, the flags and the dates of the jobs and degrees are real; the open, high, low, close, the volume and the live tick are seeded decoration**
(one pure function of a seed, the jobs and the degrees, so the same career always draws the same chart). That data is made once, in `lib/derive`,
with the month, quarter and year aggregation (`aggregate`, `periodStart`, `markersOn`); the skin keeps only the geometry (frames, scales,
paths, the window of the chart, hit tests). Which job or degree was active at a bar is `jobAt` / `degreeAt` of `lib/derive`, the same
function Resume uses, so the legend line and the flags can never disagree with the data. The accessible name of the chart says so, the legend says "Career index", and
nothing is a price, a currency, a percentage, a return or an order button. Tools, indicators and replay are real and interactive; the
wording is in `content/copy/trade-chart.ts` (en and vi).

- **State.** `chart/chart-store.ts` is a small external store (`useSyncExternalStore`) shared by the tool rail, the range bar and the chart
  (they sit in different cells of the shell): chart type, indicators, magnet, tool, crosshair mode, the drawings with their undo history,
  log and auto scale, the range the window is on, the replay. The pointer work (zoom, pan, crosshair) stays in the chart. The only
  things kept in the browser are the type, the interval, the indicators and the magnet, under `bach-cv-trade-chart` (`chart-prefs.ts`, in try/catch; a stored interval that is not one of the four is ignored and the default, 1M, is used).
  Drawings live in memory. The chart hands the buttons outside it a controller (`setRange`, `goTo`, `fit`, `zoom`).
- **Window.** `chart/view.ts`: a window is `{from, span}` in bars. **Zooming never slides the chart at its limits** (`zoomView`, `spanWithin`): at the widest
  window zooming out, or at the closest zooming in, the window stays exactly where it is, whatever the pointer or the key (`+` and `-` included). The wheel zooms around the pointer (`wheel-zoom.ts`: an event only queues a zoom, about 15 % for a notch of 100 px, each event clamped to 120 px and the queue capped; one animation frame applies a share of it with an 80 ms time constant, so a spin glides, and reduced motion applies it at once; the listener is on the box around the chart so a flag under the pointer cannot swallow it), a drag pans, a pinch zooms, a double
  click resets, dragging the price scale takes "auto" off, dragging the time axis zooms. `useChartView` slides there (300 ms) unless
  reduced motion. The range bar (3M ... All) slides the window, shows the one the window is on, and has Go to date, log, auto and reset.
- **Interval** (`intervals.ts`, `time-axis.ts`, `bar-label.ts`, pure and unit-tested): the toolbar has 1W 1M 3M 1Y (Alt+1 to Alt+4); **1M is the
  default**. `aggregate` builds the candles of a month, quarter or year from the weekly ones (first open, highest high, lowest low, last close,
  summed volume; the period still going is a candle that ticks), kept for each interval (`barsOf`). Everything works on those bars: the
  indicators are computed on them and one with no value yet is not drawn or listed (`availableIndicators`: no MA 20 on seven yearly bars);
  a flag sits on the bar of the period its job started in, two jobs on one bar are side by side; the replay plays bars; the range buttons are
  spans of time turned into bars with a minimum for each interval (`rangeBars`); zoom and pan limits, the empty slots at the right and the
  time axis labels are per interval (`limitsOf`, `axisLabels`). Drawings are kept in time (`Point = {t, p}`) and put on screen through
  the `TimeAxis` of the interval, so they stay at their date when it changes, and the measure tool counts real weeks. Changing the interval
  keeps the centre of the window on the same date (`retargetView`; "All" stays "All") and fades the old candles out while the new fade in.
- **Education** (`education.ts`, `flags.tsx`): the chart reads `education` like `experience` and draws nothing until both have arrived (the volume
  depends on both). Each degree is a **mark on the candles**: a violet flag with a graduation cap on the last day of its end month (its start
  while it goes on), a briefcase in the job blue marks a past job and a star the current one, so the kinds are told apart by glyph and colour.
  The chart still starts at the first job (March 2020): a degree whose mark falls before the first candle or after the last is not drawn
  (`onChart`; it is not moved to the nearest bar) and stays reachable from Resume, the search and the watchlist. A mark is a button with a tip
  (degree, major, school, period) that opens `#tv-education` on Resume (`shell/reveal.ts` scrolls there once the page has loaded); flags on
  one bar sit side by side. The legend adds the degree in progress (`MSc · University of Science`, `shortDegree` is imported from
  `lib/derive/short-degree`, the one Standard and Dev use) beside the job, and the replay shows and announces the marks as the playhead passes them. The years in software are counted from the
  jobs only (`lib/derive/career-years.ts`).
- **Volume** (`volume.ts`, `series-layer.tsx`, `buildCandles`): a decoration that behaves like a volume: larger for long candles and big
  bodies, a spike in the weeks a job began, a small rise where a degree began or ended, a slow drift and quiet and busy stretches (a separate seeded
  generator, so the prices do not change; the bars of a month differ by four times or more), summed by every interval. The histogram is two paths at the bottom of the price pane (24 % of it for the biggest bar
  on screen), up and down colours at half opacity, a gap that grows with the bar, the bar under the crosshair brighter, the average of 20 bars
  as a thin orange line, and a tag with the last volume on the right scale. Numbers are plain and the same in both languages (`46.3K`, `1.2M`:
  no unit of money or shares). The legend row is `Vol 70.2K 258.2K` (the bar and its average).
- **Dividers** (`shell/splitter.tsx`, `blocks/shell-layout.ts`): on the wide terminal the chart and the page panel, and the workspace and the
  watchlist, are divided by real separators (`role='separator'`, value and limits, focusable): drag them (pointer captured, no text
  selection, one update for each frame), or use the arrows (24 px, Shift 96), Home and End; Enter or a double click puts them back. The chart
  is at least 220 px and the page at least 160 px; the watchlist 240 to 480 px. The chart's size is kept as a share of the window
  (`split`) and the watchlist's as pixels (`side`) in `bach-cv-trade-layout`, validated on load, and the Layout menu has Reset layout. A phone has
  no dividers, and of the layout it follows only the tool strip and the ticker tape.
- **Window and new bars.** Whenever the bars change (another interval, or a series that is rebuilt) the window is moved by **time**, never by bar
  number (`retargetView`), so a zoom or a pan is kept; only the first window is the initial range.
- **Types.** Candles, Hollow candles, Bars, Heikin Ashi (`series.ts`), Line, Area, Baseline: a change fades one picture into the next.
- **Indicators** (`indicators.ts`, pure, unit-tested against hand-worked values): Volume (with its average of 20 bars), the simple averages MA 20,
  50, 100 and 200, the exponential ones EMA 20, 50, 100 and 200 (one list, `OVERLAYS`: id, kind, period and colour, so a period is data, not
  code; four colours are mixes of two palette colours, `--tv-ind-*` in `css/chart.css`), Bollinger Bands (20, 2), RSI 14 and MACD (12, 26, 9),
  the last two in their own panes. **A first visit shows Volume, MA 20 and EMA 50** (a stored choice wins). The Indicators button says how
  many are on; its window is lazy, has a search field and the groups (moving averages, volatility, oscillators, volume) with a switch each.
  An indicator that needs more bars than the interval has (MA 100 on 80 monthly candles) is not drawn and has no legend row (no garbage); the
  window says "Needs 100 bars. Enough bars on 1W." and it is drawn as soon as such an interval is chosen (`availableIndicators`). The legend has
  a row for each with its value under the crosshair, an eye and a remove button. Lines draw themselves with `stroke-dashoffset`.
- **Drawing tools** (`drawings.ts`, `tool-groups.ts`, `use-pointer-gestures.ts`, `shell/tool-rail.tsx`): the rail has one button for each group,
  showing the tool of the group used last, with a triangle that (like a right click, a long press or the arrow keys) opens a flyout with the name
  and keys of every tool: cursors (Cross, Dot, Arrow, eraser), lines (trend line, ray, horizontal and vertical line), Fibonacci, rectangle, text
  note and measure (weeks and years, the jobs at both ends, the change in index points); then the magnet, hide all and remove all. A tool
  double-clicked stays on after each drawing (`sticky` in the store) until Escape; a hint line in the chart says what to click next. Undo and
  redo are in the top toolbar. Points are in data units (time and index value), so they follow zoom and pan; a drawing is made with two clicks or a drag, can be chosen, moved, stretched by an end and deleted. On a phone the rail is a
  strip above the chart.
- **Replay** (`replay.ts`): choose the first bar by clicking (or Enter on the keyboard crosshair), play at 1x, 3x or 10x, step, jump to real
  time, exit. Later bars are hidden; each job's flag appears when the playhead passes its bar and is announced in a polite live region.
  With reduced motion there is no autoplay (Play is `aria-disabled` and says why), stepping works.
- **Flags** are the jobs at their real start (the week on the weekly chart, else the month, quarter or year; a briefcase for a past job, a star for the current one): Enter or a click shows that job on Resume
  (`TradeProvider.showJob`); hover or focus shows a tip with the company, role and period.
- **Keys** (the list opens with `?`): arrows, Home and End move the crosshair, plus and minus zoom, Alt+T, H, V, R, F, M pick a tool, Alt+1 to 4 the interval, Escape
  cancels, Delete removes the chosen drawing, Ctrl or Cmd+Z undoes, Shift+Ctrl+Z redoes, Shift+R is the replay. Shortcuts that work anywhere
  ignore fields and open windows.
- **Controls place.** The interval, the chart type, Indicators, Replay, undo and redo are portalled into the strip `#tv-chart-controls` of the
  top toolbar, which is one row (on a phone the strip is a row of its own that scrolls); zoom and the shortcuts button are in the range bar under
  the chart, and the ticker tape is a thin strip under that (the Layout menu turns it off). With no such strip (the chart mounted alone) the
  buttons make their own bar at the top of the chart.
- **Speed.** Candles, wicks, volume and bars are a few `<path>`s per colour (about 4 for candles), only the bars on screen are drawn,
  pointer work runs once per animation frame, the box is measured by a `ResizeObserver`, `memo` keeps layers that did not change out of the
  frame. Animation uses transform, opacity and stroke only (`css/chart.css`, classes `tv-chart-*`), and every one stops for reduced motion.
- **States.** The chart cell uses the same three states as every block that reads data (`TvDataState`): a skeleton while `experience` and `education` load, a
  card with Try again (it refetches `experience`) when the roles cannot be read, and "No experience to show yet" with a link to the projects when there is no role. An error is
  never drawn as an empty chart.
- Tested in `tests/unit/skin/trade-chart-*.test.ts`, `tests/unit/lib/derive/career-series.test.ts` and `tests/automation/skins/trade-chart*.spec.ts`, `trade-sync.spec.ts`.

## Where things are

```text
skin.tsx            SkinDefinition: Frame (TradeShell) + one component for each page + NotFound + Maintenance
config.ts           the watchlist (tickers, routes, order, hidden/soon), the ranges, the phone bar, the chart seed
trade.css           the palette (--tv-*, dark and light), the shadcn tokens mapped to it, focus ring, keyframes, view transitions
shell/              toolbar and its menus, tool rail (the drawing tools), icon rail (chat, Connect), range bar, watchlist, hero note,
                    bottom bar, overlays (`TvDialogShell` and the family built on it: viewer, screenshots, QR, CV, `overlay-chat-panel`), context
chart/              the SVG chart and its layers. `career-chart` loads the data and measures the box, `chart-body` holds the window, the replay
                    clock and the link to the buttons outside (`use-chart-controller`, `use-replay-clock`), `chart-scene` the state of one
                    window and interval, drawn by `chart-svg` (layers) and `chart-overlays` (flags, legend, hint, replay bar); the pointer is
                    `use-pointer-gestures` with `gesture-math` (pure: `zoneAt`, `scaleRange`, `timeZoom`, `pinchView`, unit-tested),
                    `use-wheel-zoom` and `use-drawing-session`/`start-tool-gesture` (the drawing tools). One component for each file.
pages/<page>.tsx    one file for each page: TvPage + TvPanel + the blocks
blocks/             the blocks of the pages
ui/                 tv-root, tv-button, tv-chip, tv-toggle-chip, tv-field, tv-menu, tv-ask-button, tv-tile, tv-panel, tv-page,
                    tv-data-state, tv-state-notice, tv-skeleton, status and maintenance screens
```

## Styling

- Tailwind utilities with the palette as theme colours (`app/tailwind-theme-trade.css`: `bg-tv-bg`, `text-tv-mute`, `border-tv-line`,
  `fill-tv-up`, ...). Values live once on `html[data-skin='trade']` in `trade.css`; the shadcn tokens and the Standard ones the reused
  windows read (`--night`, `--brand`, `--mobile`...) are mapped there too, so the dialogs, menus and chat follow the skin.
- CSS is only for tokens, the focus ring, keyframes and view transitions; its classes have the prefix `tv-` (a unit test enforces it,
  and that every `:hover` is inside `@media (hover: hover)`). Fonts: the system sans stack, so nothing is downloaded.
- **Contrast.** A colour used as TEXT is its `-ink` token (`text-tv-up-ink`, `-down-`, `-gold-`, `-sky-`, `-orange-`, `-violet-`: on the light
  theme the bright colour is too pale on white); a fill that carries white text or a price tag is `bg-tv-up-solid` / `-down-solid`; `--tv-dim`
  and `--tv-mute` are readable text. `tests/unit/skin/trade-contrast.test.ts` reads the palette from the CSS and checks AA (4.5:1 text, 3:1 for the
  focus ring and glyphs) in both themes, and `trade-theme-tokens.test.ts` that every `tv-` utility in the TSX has a theme token (a class
  with none is silently dropped by Tailwind).
- **Focus ring.** One rule in `@layer base` on `html[data-skin='trade']` (so portals get it too, and a utility such as `outline-none` still wins):
  2px, inset (`outline-offset: -2px`, which an `overflow-hidden` panel cannot clip), in `--tv-accent-ink`. It sets no radius, so a round control stays
  round. Do not add `outline-offset-*` or ring utilities to a control; a field draws its own line (`TV_FIELD`).
- **Motion scale**, defined once (`app/tailwind-theme-trade.css`): 100 ms press and hover colour or scale, 160 ms toggles, menus, tips and dialogs
  (`TV_DIALOG_MOTION`), 240 ms panels, lists, expand and collapse, FLIP and the grid easing, 400 ms hero and staggered reveals and the sparkline,
  300 ms for an image zoom. Curves: `ease-tv-out` (everything that arrives), `ease-tv-state` (a fade or a state), ease-in-out only for loops,
  linear only for the tape, the overshoot only for the flag drop. Entrances are named utilities (`animate-tv-pop`, `-fade-up`, `-slide-in`, `-grow`...);
  keyframes are in `css/*.css` and a test checks that no name repeats. `active:scale-*` and `translate-*` set the `scale` and `translate`
  properties, so the transition lists `scale` or `translate`, never `transform`. The endless loops pause in a background tab (`data-hidden`
  on the root) and while they are scrolled out of view (`useLoopGate` puts `data-off` on the root of a loop: a skeleton, the drawing of a service,
  the chart, the "Current" dot; one shared observer, and `trade.css` pauses every animation inside); the chart's tick also waits while the chart
  is off screen or one of its windows is open. The content of a block that showed a skeleton fades in over it (`TvFadeIn`, 240 ms, opacity only,
  a `display: contents` wrapper so the layout is the content's own, children that already arrive with an animation are left alone, off for
  reduced motion); a block that had its data from the cache just appears.
- **One look for each kind of control, defined once in `ui/`**: `tvButton` (primary, ghost, outline; sizes sm, default, lg, icon; 44px on
  touch and a press that scales), `TvChip` (a label; tones for state and for a skill's area; `sm` in dense rows), `TvToggleChip` and
  `TV_PILL` (a round chip that is pressed or not), `DataSegmented` (a few views side by side), `TV_FIELD` (every field and select: a line that
  turns blue on focus, no browser outline), `TV_POPUP` and `TV_MENU_ITEM` (every menu and popover), the shadows `shadow-tv-menu` (floats over
  the page) and `shadow-tv-dialog` (covers it), and `HintTip` (the one tooltip: no native `title` on a button). The type scale is 10 (kicker),
  11 (group label, small chip), 12 (secondary), 13 (body, section and item titles), 15 (a card's headline). Panels and cards are
  `rounded-md`, what sits inside them `rounded`.
- Layout is a CSS grid on wide screens (`min-[1101px]:`) and a column on a phone. Spacing uses the Tailwind scale where it can.

## Data and windows

- Components never import Firebase; they read `useContentQuery`, `useProfileQuery`, `useLive`, `useSkills`, `useContactForm`,
  `useChatSession` and the helpers of `components/*`. Nothing is derived in the skin (see `.ai/skins.md`): numbers, orders and "which one is current" come
  from `lib/derive`; the clock is `useNow` (`hooks/use-now.ts`, one `Date` for the whole month, so every block agrees and a test can fake it); dates are written by
  `lib/format` (the same Vietnamese months as the rest of the site, also on the chart axis); accent-free text matching is `lib/fold-text.ts`; "Go back" of the 404 is `useGoBack`.
- The **watchlist is on every page and reads nothing itself**: its counts and its Skills tab come from queries a page has
  already made (`shell/use-cached-content.ts`, `enabled: false`), so no page pays for documents it does not show. The chart reads `experience`.
- Windows are the skin's own, built on the shadcn primitives and the `tv-*` tokens, with Standard's logic and hooks, and loaded with
  `next/dynamic` when first opened. `shell/overlay-dialog-shell.tsx` is `TvDialogShell` (a dark panel with a 1px border, a title bar
  with the close button, optional tabs on the left and a footer toolbar, a quick scale and fade, a sheet or the whole screen on a
  phone); the picture viewer (`overlay-viewer.tsx`: zoom, fit, previous and next, thumbnails, arrow keys), the screenshots
  (`overlay-screenshots.tsx`), the QR window as a deposit dialog (`overlay-qr-dialog.tsx`) and the CV window (`overlay-cv-dialog.tsx`,
  `overlay-cv-sheets.tsx`: Download PDF, page counter, zoom, with `buildBlocks` and `paginate` of the Standard preview) all use it.
  **They are one family**: the same toolbar (`overlay-toolbar.tsx` with `overlay-zoom-tools.tsx`, `overlay-nav-tools.tsx` and the icon
  button `overlay-tool-button.tsx`, which carries the accessible name and the tooltip): zoom on the left, a separator, the actions of the
  window (Open PDF, Copy number with Copy all details and Save QR, Download PDF), and previous / counter / next (or the page counter) at
  the right end, over the same grey stage (`overlay-zoom-stage.tsx` for a picture, which keeps the ratio it has and is as large as the window
  leaves room for) and the same keys (arrows, `+`, `-`, `0`, Esc; `zoomFromKey` in `overlay-tools.ts`). The QR window keeps the account
  name and number under the picture.
  `blocks/lazy-dialogs.ts` points the blocks at them with the props of the Standard windows. **Connect** is a popover built on the shadcn one; its email is one **joined row**: a blue block as high as a button with the word Email (`connect.email`
  of Standard), the address as a link and the copy control (`TvButton` variant `joined`, size `join`, defined once in `ui/tv-button.tsx`) after a divider. The copy control has the
  accessible name `Copy`, a `HintTip` (no native `title`) that says `Copied` for a moment, and a status that announces it; Tab goes link, copy, then the list.
- **BB Bot** (`shell/trade-chat.tsx`, `overlay-chat-panel.tsx`): the Standard session (`useChatSession` with `useChatSettings`, `errorText` and `remainingSuggestions` of `lib/chat`, the helpers Standard and Dev use: same limits, errors, Try again,
  counter) drawn as a docked widget panel that takes the watchlist's column while it is open (the shell makes a `dock` element for it
  and `TradeChat` portals into it), or as a bottom sheet of 80% on a phone. Rows with an avatar and a name instead of bubbles, the
  questions not asked yet as chips, a composer that grows with the text. Esc closes it and gives the focus back to the rail button
  (`aria-pressed`). It stays mounted once opened, so there is one conversation from page to page. There is no "clear conversation": the
  session has none.
- The skin keeps two small UI preferences in the browser: the choice of skin (`bach-cv-skin`) and the layout of the terminal
  (`bach-cv-trade-layout`, read and written inside try/catch; a damaged value falls back to showing everything).

## The data pages: Projects, Resume and Certificates

Same information as Standard (every field, link, action and state), with an interface of a chart site. Words that only these pages have
are in `content/copy/trade-data.ts` (en and vi); Standard's copy (`projects.ts`, `resume.ts`, `certificates.ts`) and hooks are reused.
Pure logic is in `blocks/data-*-model.ts` and `data-treemap.ts`, tested in `tests/unit/skin/trade-data-*.test.ts`; the keyframes and the
kind colours (`--tv-data-*`) are in `css/data.css`. Nothing reads as a quote: every number is a count, a date or a duration of the data.

- **Projects = screener** (`data-projects-screener.tsx`). A bar of filters (text, kind chips, featured only, a technology multi-select built
  from the skills projects use: a project must use all chosen), density, and a column chooser (the name is always shown). Three views:
  **Table** (sortable headers with `aria-sort`, a click or Enter cycles ascending, descending, default order; a row opens to the cover,
  kind, rank, summary, every technology, links and screenshots, so a hidden column is still reachable), **Cards** (cover, kind, rank,
  summary, tags, links) and **Heatmap** (a squarified treemap: **area is the number of technologies of the project, colour its kind**, both
  said in the legend; a tile opens the project below the map). Keys: arrows, Home and End move between rows, Enter opens, `/` focuses the
  filter (it takes the key before the symbol search does; Ctrl or Cmd with K still opens that), Esc clears the filters.
- **Resume = statements** (`data-resume-view.tsx`). **Experience** is a grid of years (columns) and roles (rows) with a bar over the months
  each role ran (both end months count); hovering or focusing a bar reads company, role, dates and duration in the line above, a click
  opens the notes of the role. The period toggle switches to **By role**: each bar as long as the role lasted, against the longest.
  **Notes** are the Standard role (summary, key project, technologies, responsibilities) behind the Standard button words, `inert` and
  invisible while shut; the first role is open, a bar, an event or a flag of the chart opens its note and scrolls to it (`data-job`,
  `data-active`). The grid has one row height and one label column (long names are cut and carry a `title`), years share the width down
  to 52px and then the grid scrolls inside its own box with the labels kept in view, and bars are clipped to their cells. The
  picture of each role (16:9 beside the note) and degree (a thumbnail beside the text) opens the Standard preview, which steps through
  all of them, roles first. **Events** is the calendar of jobs, degrees and certificates, newest first, with a filter. Education follows.
  **Skills** is one section with a List (the core stack and every skill by area, as tiles with the Standard tip) and a **Heatmap** view: a
  map for each area, a tile for each listed skill, **area the months the skill was used, colour the area**, at least 6 months of area so
  every skill can be read. The months and the roles are `monthsUsed` and `rolesUsing` of `lib/derive/skill-use.ts`, the numbers of the
  watchlist and the ticker; nothing is derived in the skin. A tile shows the tip, a click or Enter pins it and the list beside the map names
  its roles (each opens its note); the arrows move between tiles; every tile is at least 44px (`fitScale`).
- **Certificates = calendar and feed** (`data-certs-view.tsx`). The calendar is a timeline (`data-certs-calendar.tsx`): a rail of dates
  (day and month) and on it a card with a real thumbnail of the certificate (`data-cert-thumb.tsx`, a 4:3 frame reserved so nothing moves
  while it loads; it opens the preview), the issuer chip, the title, the date, the skills as tags and a primary Open PDF. The years are named
  (`groupByYear` of `lib/derive`) only when the certificates span more than one; there are no bars for a single certificate. The layout
  follows the width of the panel (container queries): the rail from 720px, the action beside the card from 560px. The feed is a grid of
  cards; both have an issuer filter, newest or oldest first and density. The preview is the Standard window's content in the family
  viewer, and steps through the certificates shown. "Latest" stays on the newest certificate whatever the filter.
- **Motion**: rows, cards and tiles slide, rise or pop in (CSS keyframes); a sort or a filter re-lays the list out with FLIP
  (`data-use-flip.ts`: transforms through the Web Animations API, which the CSS reduced-motion rule cannot stop, so the hook is off for
  that visitor); the bars grow from their start. All of it is off for `prefers-reduced-motion`.

## The terminal frame, the symbol search, the watchlist and Home

Words of this part are in `content/copy/trade-shell.ts` (en and vi); the rest is Standard's copy and hooks. Pure logic is in
`blocks/shell-*.ts` and tested in `tests/unit/skin/trade-shell-*.test.ts`.

- **Toolbar** (`shell/toolbar.tsx`): the logo (a link home), the **symbol button** (photo, name, headline; opens the search), an empty
  strip `#tv-chart-controls` that the chart can portal its own controls into, **Layout** (on a phone only the tool strip, the ticker tape and Reset), **full screen** (grey and disabled where the
  Fullscreen API is missing), language, theme, Skin and Download CV. Chat and Connect stay in the icon rail on the right (a row under the
  watchlist on a phone), so each control exists once.
- **Symbol search** (`shell/search-palette.tsx`, lazy, Ctrl or Cmd with K, or `/` outside a field): a shadcn Dialog with a combobox over
  the pages, projects, roles, skills, certificates, services and education (`blocks/shell-search.ts`: accent-free matching, every word must
  match, title matches first; **a kind whose page is hidden or coming soon gives no result**, as the page would not open: `KIND_PAGE`). Arrows, Enter, Esc. A page goes to its route, a role calls `TradeProvider.showJob`, a skill goes to
  `/resume#skills`, the rest to their page. Recent picks live in the provider (memory only). Full screen below 700px.
- **Layout** (`blocks/shell-layout.ts`, `shell/use-layout.ts`): watchlist, page panel and tool rail, saved as `bach-cv-trade-layout`. A
  hidden panel leaves a bar with a button that brings it back, and opening a page brings it back too. Not applied on a phone.
- **Ticker tape** (`shell/ticker-tape.tsx`, `blocks/shell-tape.ts`): the pages with their counts and the listed technologies with the
  years they were used. It stops on hover, on focus, in a background tab and with its button; reduced motion makes it a wrapped static row.
- **Years used** (`lib/derive/skill-use.ts`, worked out once for every skin): the months of the roles that list a skill (on the role or on one of its projects, the rule
  of the "Used at" line), overlaps counted once. The **sparkline** is, for each year of the career, the number of roles that listed it. A
  skill no role lists has no number and no line.
- **Watchlist** (`shell/watchlist.tsx`): tabs Pages (the `Main` navigation, flag and flash on the open page), Skills (rows grouped by area with the
  sparkline, a legend of the roles under the list; `skillGroups` with `STRIP_ORDER`, so the same skills as Resume are listed, mobile first) and Roles (a timeline;
  a press opens the job on Resume), then the Details widget. The pipeline is not here: it is a block of Home (`blocks/home-pipeline.tsx`), so it stays when the Layout
  menu turns the watchlist off. Arrow keys move between rows (`shell/roving-keys.ts`), every row stays a Tab stop.
- The frame now reads `skills` and `experience` itself (the tape and the Skills list need them; the chart already read the roles).
  The counts of projects, certificates and services still come from the query cache only.
- **Home** (`pages/home.tsx`): the symbol overview (a number that counts up once, the real counts of projects, certificates and roles),
  the hero note (its years in software are the number every skin states: `{years}` of the Standard copy, from `lib/derive/career-years`), featured projects as
  idea cards, the latest roles as a timeline (`latestRoles`, `featuredProjects` of `lib/derive/home-lists`, the lists Standard and Dev use), what I built as a numbered timeline,
  the pipeline card of the Standard hero and the contact band (`blocks/contact-card.tsx`, which only Home uses; About has its own links list).
  A bar of sections scrolls to each. Motion: page change fade, count-up, tape, flash, panels sliding in, sparkline growth, skeleton shimmer.

## About, Services, Payment and the system screens (`blocks/desk-*`, `css/desk.css`, `content/copy/trade-desk.ts`)

The rule is "same information, own interface": every fact, link, action and state of the Standard page is present and reachable; the
layout is the skin's. Words only these screens have (the kickers, "Trade", "Recommended", "Symbol not found") are in `trade-desk.ts`.

- **About = symbol page** (`pages/about.tsx`). Left: the name and headline as the symbol with the specialty tags, the Description (the
  profile summary), Key facts (place, the languages the site offers, years in software that count up once, the areas Mobile / Web / AI that
  have listed skills, the first role's year, the current role and company; the numbers come from `lib/derive`), Education as
  a dated timeline whose rows slide in when first seen, and the Core stack as tiles with "Used at". Right: the links list (email with Copy,
  phone, the place, the Professional / Messaging / Social groups, the `#contact` anchor), the three photos and the Ask BB Bot card.
- **Services = broker catalogue + order ticket** (`desk-services.tsx`). One `useContactForm` serves both: a **Trade** button on a row
  picks the topic (and writes the starter) of the ticket, a sticky panel beside the catalogue from 700px of panel (after it on a
  phone). The ticket has a row of topic chips, Name, Email, Message with its counter, the honeypot, ONE Send button, the sending,
  sent ("Message sent" takes focus, Send another) and failed (Try again, text kept, `?form=error`) states, the form-off note, Ask BB
  Bot and the `#contact-cta` anchor. The ticket glows while a field has the focus. **Each service has its own drawing** (`ui/tv-service-art.tsx`,
  chosen by the `art` of the service: `app` a phone of candles and a sparkline, `web` a dashboard with a chart and an order book, `oss` a
  commit graph with a diff, `teaching` a lesson as an annotated chart with a trend line and numbered steps, `writing` a research note with a
  figure, anything else an empty chart), in inline SVG with the `tv-` tokens (`ui/tv-art-*.tsx`), so it follows the theme; decorative
  (`aria-hidden`), an 11:8 frame, a little motion that reduced motion switches off (the skin-wide rule) and a hover zoom only where hover exists.
- **Payment = deposit methods** (`desk-payment.tsx`). The highlighted methods are the Recommended ones with a QR thumbnail that opens the
  QR window of the skin (the family toolbar: zoom, Copy number, Copy all details, Save QR, previous / next); the rest are the rows of a table (a stack of labelled values on a phone) with a
  bank / wallet filter when there are both. The filter, the QR step and Copy number / Copy all details are `usePaymentMethods` (`components/payment`, with `paymentView`), the same hook Standard and Dev use, and show a snackbar for 2 seconds
  (`desk-snackbar.tsx`, placed in the terminal root with a portal, because the page's rise animation would otherwise be the box
  `fixed` is measured from). Paused and error states keep the Standard link and Try again.
- **System screens** (`ui/tv-*`): 404 is "Symbol not found" (with the path), Coming soon is "Pre-market" (no date), maintenance is "Market
  closed", each with candles that draw themselves (`tv-candle-art.tsx`); loading is a chart of grid lines and breathing bars
  (`tv-chart-skeleton.tsx`, `tv-skeleton.tsx`) with a line sweeping along the top, empty is "No data for this symbol" and an error
  is the widget error with Try again.
- Motion is transform and opacity only (the count-up is the one script), all of it off for reduced motion (the rule at the end of
  `trade.css`; the count-up and the timeline check `useReducedMotion`).
- Tests: `tests/automation/skins/trade-desk-about|services|payment.spec.ts`, `trade-states.spec.ts`.
