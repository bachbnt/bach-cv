# Trade skin (id `trade`, CSS prefix `tv-`)

Mock: `design/skins/trade.html`. The site as a TradingView-style chart terminal. Palette (dark): bg `#131722`, panels `#1e222d`, borders
`#2a2e39`, text `#d1d4dc` / `#787b86`, up `#26a69a`, down `#ef5350`, accent `#2962ff`, gold (MA line) `#f7a600`. Light: white,
`#f0f3fa`, `#e0e3eb`, up `#089981`, down `#f23645`. Numbers use a tabular figure font (`font-variant-numeric: tabular-nums`); UI font is
system sans (Trebuchet-like stack); a mono font only in the terminal tab.

## Frame (`Frame`)

CSS grid like the mock: top toolbar (38 px) | left tool rail (52 px, `aria-hidden` decoration) | chart | range bar | bottom panel | right
widget (300 px) | right icon rail (46 px).

- Top toolbar: symbol button (avatar + `BACH` + headline from the profile), range buttons, language, theme, Skin switch, **Download CV** (the
  blue button). "Indicators / Alerts / Replay" are decoration (`aria-hidden`, not buttons) unless Standard has the feature: do not make
  them look clickable-and-dead (no hover, `pointer-events: none`) or drop them.
- Right widget "Watchlist" = **the navigation**: one row per real page (`aria-current`, Soon marker for `soon` pages, absent when
  hidden). Rows show a ticker (`HOME`, `PROJ`, `RSM`, `ABOUT`, `SVC`, `PAY`, `CERT`; decoration beside the real label from
  `content/copy/common.ts`, which stays the accessible name) and, instead of invented prices, **real counts** (projects, certificates,
  years) in the "Last" column. Drop the Chg / Chg% columns (Standard has no data that changes over time). A "Technologies" group lists the real skills the Standard tech strip shows.
- Right icon rail: Chat (real chat), Connect (real Connect menu). Same switches as Standard (`features.chat`, `connectMenu`).
- Phone: no side rails; chart on top, range bar, bottom tabs, watchlist below; a bottom nav with Chart / Projects / Resume / Contact.

## The chart (the one piece of real engineering)

- Candles are **decoration derived from real data**, `role="img"` with an `aria-label` that states what it shows (for example the career
  of the profile by year). A pure function `buildCandles(experience, seed)` in `skins/trade/blocks/` (unit-tested in
  `tests/unit/skin/`): deterministic (seeded PRNG like the mock), one candle per week from the first experience start month to now,
  gentle upward trend with real pullbacks (about 50-55 % green: **not** an unbroken green climb: the owner asked for visible ups and
  downs), the last candle ends at the highest close region. It must **not** present itself as financial data and must not appear in
  text a screen reader reads as facts.
- Markers (blue "E" flags, ★ for the current job) are the **real experience entries** at their real start months (tooltip = company + role
  from Standard data). Clicking/pressing a marker opens that experience, not a fake popup.
- Header "price" = years since the first job (`careerYears`, `lib/derive/career-years.ts`), the same number Standard shows.
- Hand-written SVG, no library, no CDN. Crosshair (dashed lines, price label on the right scale, date label on the bottom axis), OHLC
  legend following the pointer, MA 20 line, volume bars, last-price label ("Current"). The live tick on the last candle is a gentle
  animation, **off for reduced motion**, and paused while the pointer is on the chart. Redraw on resize (ResizeObserver) and on theme change.
- Range buttons (1M…All) change the visible window; keyboard: ←/→ moves the crosshair when the chart has focus.
- Keep the chart in its own lazy chunk (`next/dynamic`) so the shell paints first; the skin is already lazy.

## Pages: mock → real content

| Page         | Look in the mock                                       | Real content (read the Standard component first)                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home         | Chart + note box + bottom panel + right widget         | The note box is the hero (title + intro + Download CV). Right widget "idea" = pipeline steps (`home-build`). Details card = profile facts Standard shows. Bottom panel tabs hold the Projects and Resume previews and the contact form, like Home's blocks. |
| Projects     | "Screener" table in the bottom panel (and a full page) | Real projects, rank, kind filter, tags, links, screenshots viewer. The "rating" chip shows the project's **kind/rank label**, never "Buy". Columns: symbol (cover + title), tech tags, year, links.                                                         |
| Resume       | "History" table                                        | Experience and education rows from Standard (current job marked with the Current badge), responsibilities in an expandable row, skills.                                                                                                                     |
| About        | Details card + notes                                   | About head, core stack, education as Standard has them, in panels.                                                                                                                                                                                          |
| Services     | "Trading panel"                                        | Service list + topic chips + contact form: same fields/validation/sent state. The two big buttons of the mock become **one** submit button (Standard has one action).                                                                                       |
| Payment      | Panel with methods table                               | Payment feature + methods + list + empty state, same QR/copy behaviour.                                                                                                                                                                                     |
| Certificates | Table / cards                                          | Certificate list + viewer.                                                                                                                                                                                                                                  |

## Mock elements that must NOT become features

The two order buttons ("Thuê / Mời", "Hỏi thăm") as separate actions, "Phản hồi < 24h", ratings (Mua mạnh/Mua/Trung lập), Chg and Chg %
numbers, the ticker tape of fake percentages, replay, alerts, indicators, compare, drawing tools, the fake terminal text, "Hiện tại" as a
countdown. Anything that looks like financial advice or a real quote must be absent: this is a CV.

## Tests worth writing

Unit: `buildCandles` (deterministic for a seed, share of green candles between 45 and 60 percent, last close ≥ first close, count per week,
markers land on real months, empty experience gives an empty chart, not a crash); `config.ts`. Playwright
(`tests/automation/skins/trade-*.spec.ts`): watchlist has the 7 pages with `aria-current` and Soon/hidden pages; range buttons change the
candle count; crosshair legend follows the pointer; marker opens the matching experience; states (loading/error/empty/maintenance/404);
contact form; chat from the icon rail; reduced motion stops the live tick; phone layout; Skin switch back to Standard.
