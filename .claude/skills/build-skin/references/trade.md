# Trade skin (id `trade`, CSS prefix `tv-`): the model of a skin with an engine inside

Built and shipped (on `dev`, in production). Its README (`src/skins/trade/README.md`) is the full as-built description; this page is
what to copy from it. The mock was `design/skins/trade.html` (TradingView look: dark `#131722`, panels `#1e222d`, up `#26a69a`, down
`#ef5350`, accent `#2962ff`; light white / `#f0f3fa`; tabular figures; system sans).

## Shape

- **Frame** (`shell/`): one toolbar row like TradingView's (symbol button with search `Ctrl+K`, intervals 1W 1M 3M 1Y, chart type,
  Indicators, Bar replay, undo/redo, Layout, full screen, then the menus **Language, Skin, Theme**, CV window, Download CV); a tool rail
  on the left (drawing tools in grouped flyouts); the chart; a range bar (3M ... All, Go to date, log, auto); a ticker tape; the page in a
  bottom panel; a right column with the **watchlist** (the navigation: Pages, Skills with a sparkline of the years used, Roles) and the
  docked BB Bot panel; a rail with chat and Connect. Dividers are real separators (keyboard, persisted). Phone: no rails, a bottom bar
  of three pages (Home, About, Resume, with the Soon mark) and a Watchlist button that opens the watchlist as a sheet, the page opens
  under the sticky toolbar after a page change, the search is full screen with a close button.
- **Pages are interfaces, not blocks:** Home = symbol overview (profile card, years in software, counts, hero note, pipeline card, work,
  featured projects), Projects = screener (grid / cards / heatmap, columns, filters), Resume = financials (roles as bars, statements,
  skill heat, corporate actions for education), Certificates = calendar and feed, About = symbol profile and facts, Services = catalogue
  and order ticket, Payment = deposit page. Each one lists every datum and action of its Standard page.
- **Overlays** are the skin's own on shared parts: `TvDialogShell`, one toolbar family (`overlay-toolbar`, `-zoom-tools`, `-nav-tools`,
  `-tool-button`, `-zoom-stage`) for the viewer, QR and CV dialogs, a docked chat panel, a Connect profile card (email and copy as ONE
  joined control).
- **UI tokens defined once** in `ui/`: `tv-menu`, `tv-field`, `TvChip`, `TvButton` (variants and sizes, including the joined control),
  `TvDataState` / `TvStateNotice` for loading, empty and error with Try again, `TvStatusScreen` (404, soon, maintenance).

## The engine

- Hand-written SVG chart, no library, own lazy chunk. The series is an **illustrative index**: `lib/derive/career-series.ts` (seeded
  candles per week, volume, aggregation to months / quarters / years, markers); only the weeks, the flags and the job and degree dates are
  real, and the accessible name and the legend say so ("Career index", index points, no currency, no rating, no percentage).
- Pure and unit-tested: `view.ts` (the window; zooming never slides the chart at its limits), `wheel-zoom.ts`, `gesture-math.ts`,
  `intervals.ts`, `time-axis.ts`, `indicators.ts`, `volume.ts`, `drawings.ts`, `flag-spread.ts`, `replay.ts`, `guide-text.ts`.
- Flags are real jobs (briefcase, a star for the current one) and degrees (violet cap); a flag opens that job on Resume
  (`useTrade().showJob`). Chart state lives in a small external store; the only things kept in the browser are chart preferences and the
  layout (`bach-cv-trade-chart`, `bach-cv-trade-layout`).
- The chart pauses its tick when the tab is hidden, the chart is off screen or a dialog is open, and in reduced motion.

## Derived data used (never recomputed in the skin)

`careerYears`, `useCareerYears` / `useYearsText`, `currentJob`, `jobAt`, `degreeAt`, `jobLength`, `careerSpan`, `careerFacts`, `monthsUsed`,
`rolesUsing`, `skillGroups`, `skillSeries`, `highlighted`, `latestRoles`, `featuredProjects`, `latestCertificate`, `issuedNewestFirst`,
`shortDegree`, `initialOf`, `groupByYear`, `formatDuration`, `paymentView`, `useNow`, `foldText`. When a number is needed twice, it goes
to `lib/derive` first.

## Mock elements that were NOT made features

The two order buttons as separate actions, response-time claims, ratings (Strong buy / Buy), Chg and Chg % columns, fake percentages in
the tape, alerts, compare, the fake terminal text, anything that reads as financial advice or a real quote: this is a CV.

## Lessons that became rules

Unlayered CSS beats utilities (focus ring now in `@layer base`); a colour without a `--color-tv-*` token is a silent no-op; keyframes names
are unique; a joined control (email + copy) is one control of one height; selected, hover and focus states of a list row fill the row
and keep their padding; a `title` on a button is replaced by a tip; a flag under the pointer must not swallow the wheel; the same
zoom function serves wheel, keys, buttons, axis drag and pinch; `useNow` gives every component the same month.

## Tests to copy

`tests/automation/skins/trade-*.spec.ts` (shell, split, home, data pages, desk pages, states, overlays and dialogs, chart areas, wheel,
polish, sync) and `tests/unit/skin/trade-*.test.ts` (css rules, theme tokens, keyframes, contrast, view, intervals, indicators,
gestures, guards, copy keys).
