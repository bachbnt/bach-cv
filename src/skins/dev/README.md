# The Dev skin

The site as the window of a code editor (VS Code look): a terminal card at the top of every page, a git log for the career, a file for
every page. It is one of the **skins** of the site (see `src/skins/types.ts` and `.ai/skins.md`); the visitor picks it in the header and
the URL does not change.

## Rules

1. **Same content as the Standard skin; only the presentation differs.** Never add content Standard does not have, and every feature
   Standard has must exist here (data states, errors, keyboard, dialogs, `site/live` switches, both languages). For each block, read the
   Standard component(s) in `src/components/<feature>/` first: they say what data, copy and behaviour the block has. The one exception is
   the Terminal tab of the bottom panel (see "The Terminal" below), which is a feature only this skin has.
2. **Fonts:** mono (`var(--mono)`, JetBrains Mono) for headings, labels, file names, dates and code; sans (`var(--sans)`, Public Sans) for
   prose (descriptions, bullets, notes). The description of a `##`/`###` heading sits under the heading.
3. **Hover:** no mouse-following line band. Hover is the Tailwind `hover:` variant (it is inside `@media (hover: hover)` already; a unit
   test enforces the same for the little CSS there is). A heading shows a real count on hover (`DevSection` `hint`, `ui/count-hint.ts`),
   never invented text.
   Three pointer effects copy VS Code, all mouse-only: _highlight occurrences_ (hover a token in a code window: the tokens of that window
   with the same text and colour class get `data-hit`, `blocks/use-token-highlight.ts`), _indent guides_ (the guide of the Explorer folder
   that holds the hovered row brightens, pure CSS `:has` in `shell/explorer-tree.tsx`) and the _minimap_ (hover darkens its slider; dragging the
   slider scrolls the page, a click on the track centres the slider there; `shell/minimap.tsx`, still `aria-hidden`, a finger is ignored).
4. **Window lights** (red/yellow/green, `ui/window-dots.tsx`) really work in the windows that are windows (viewer, CV, chat; Connect is a palette and has none). A light
   with no action in such a window is grey (the viewer's yellow when it has nothing to hide: otherwise it hides the thumbnails and tags); lights that are only decoration (the editor, the terminal cards) keep their
   colours and the hover, but cannot be pressed. Files of the Explorer that open nothing are faded like a cut file.
   **The three lights of the editor window itself (the title bar) work too:** red closes the editor (back to the Standard look, like the
   Skin menu), yellow is **Zen mode** (the tabs, breadcrumb, activity bar, Explorer, minimap, bottom panel and status bar are hidden with
   CSS, so the terminal keeps its scrollback; the title bar and the page stay; Esc or the light leaves it, and an open window takes Esc
   first; not on a phone), green is the **full screen** of the page (`hooks/use-fullscreen.ts`; a browser that cannot do it, such as an iPhone,
   leaves it grey).
5. Dev-only strings (command lines like `whoami`) are decoration: `aria-hidden`. Anything a visitor reads or operates uses the Standard
   copy (`content/copy/*`), so both languages work. A new string needs `en` and `vi` (`defineCopy`).
6. Buttons that look like commands (`./download-cv.sh`) keep the Standard accessible name (`aria-label`), so tests and screen readers find
   the same control in every skin (`ui/dev-download-cv.tsx`). So do the three menus of the title bar: `Language: English`, `Skin: Dev`, `Theme`
   (`DevMenu` takes the name apart from its heading).
7. Phone: `max-[900px]:` utilities (the root, `ui/dev-root.tsx`, carries the state of the drawer); below 640 px the status bar keeps only its buttons
   (Problems, Output, Terminal) and the items that only decorate it (project, branch, sync, language, Prettier, bell) give way, so no real control
   is cut off; the footer leaves room for the chat button; on touch every control reaches 44 px (`pointer-coarse:`): the small ones (title bar menus, Files,
   status bar, the tabs, Clear and Close of the bottom panel) with an invisible `::after` area that never reaches past the gap to the next control, the others
   (command buttons, filter chips, skill chips, the tools of a window, the arrows of the viewer) by growing, which only happens on touch
   (`tests/automation/skins/dev-touch.spec.ts` measures them; the three lights of a window are 12 px dots with their own area and are not covered); the Explorer is a drawer, and Connect and the CV button live in it
   (the account menu opens as a bottom sheet).

## Motion

Beyond hovers, and all of it off for "reduce motion":

- **Page change** is a React view transition: `shell/dev-shell.tsx` wraps the page in `<ViewTransition key={page}>`, so the window stays and the
  page fades out while the next one fades in (`.dv-vt-out`, `.dv-vt-in` in `dev.css`, which play the keyframes `vt-out` and `vt-in` of
  `globals.css`). The green line of the open tab is the one element named `dv-tabline`, so it glides to the new tab. The selectors have no space before
  `::view-transition` (the pseudo-elements hang off `<html>`). Reduced motion: the `reduce` block of `globals.css` gives every
  view-transition animation a duration of 0 (React still starts the transition), and `.dv-root` rules cut the rest, including the folders
  (`::details-content`) and the portaled windows (viewer, CV, Connect palette, listed in `css/services-chat-cv.css`).
- **Reveal** is an animation (`dv-reveal`), not a transition: unlayered CSS beats utilities, so a transition list on `[data-reveal]` would
  replace the hover transitions of every card that is revealed.
- **Status bar**: the sync icon turns while TanStack Query is fetching (`useIsFetching`), and the count of problems nudges when it goes up
  (`shell/use-bumps.ts`: nothing moves on load or when it goes down).
- **Bottom panel** rises (`dv-panelin`) when it opens. The Connect palette, the windows and the chat have their own pop-in. The chat
  header says `online` with a breathing dot while the chat can be reached.
- **Photos**: on About the picture zooms slowly inside its frame and the frame takes the accent colour under the mouse; the photo of the card on Home only zooms.
- The terminal card types its command and the caret blinks (`.dv-typed`), the marquee of skills and the live pill are older motion.
- **Endless loops wait** when nobody can see them: the marquee, the fill bars of the pipeline, the shimmer of a skeleton, the caret and the live pill carry
  `data-off` while they are scrolled out of view (`useLoopGate`, `src/hooks/use-loop-gate.ts`, shared with Trade), and the root has `data-hidden` while the
  tab is in the background (`useDocumentHidden`, `ui/dev-root.tsx`); `dev-extra.css` pauses every animation under either. The chat button's dot and ring and the
  dots and carets of the chat window are under the root, so the background tab stops them too. Reduced motion still removes them all.

## The Terminal

The Terminal tab of the bottom panel is a small working shell: the one place where this skin has behaviour Standard does not (it only
drives what Standard already has, so no content or data is added). The code is in `shell/terminal/`, the words in
`content/copy/dev-terminal.ts` (en and vi; the command names are not translated).

- `run-command.ts` is pure: `runCommand(line, env)` returns the lines to print and an action; `complete(line, env)` is Tab. The
  environment (`TerminalEnv`) carries the copy, the pages with their `site/live` state and the feature switches, so
  `tests/unit/skin/terminal.test.ts` covers it without React. `use-terminal.ts` holds the scrollback, the history and the keys;
  `use-terminal-actions.ts` does what a command asks of the page (Next.js navigation, the CV window, the chat); `dev-terminal.tsx` is the view.
- Commands: `help`, `ls` (the files of the tabs; a page that is `soon` is marked), `cd <page>` (key, file name with or without extension in
  any case, `~`, `..` or nothing for Home; a hidden page does not exist, a `soon` page says it is coming soon), `cv`, `connect`, `ask`
  (each prints `opening ...` then opens its window, or says `not available` when its switch is off: `cvDownload`, `connectMenu`,
  `chat`), `clear` (and Ctrl+L), `exit` (closes the panel). Anything else is `zsh: command not found`.
- Keys: Enter runs, Arrow up and down browse the history, Tab completes a command or a page after `cd` (several matches are listed, and
  with nothing to complete Tab moves on, so focus is never trapped). Esc is not used by the terminal, so it still closes the windows the
  commands open, and focus goes back to the line.
- The panel keeps the terminal mounted (it only hides it), so the scrollback and history last while the page is open; nothing is stored.
  The line takes the focus when the visitor opens the tab, never on page load.

## Output and Problems

The Output and Problems tabs of the bottom panel show a real **dev log**: what this page load did, in the format of Android's logcat. The
code is in `shell/devlog/`, the words around it in `content/copy/dev-output.ts` (en and vi). The lines themselves are technical
English and are not translated. The log is plain memory (module-level store, read with `useSyncExternalStore`): at most 200 lines,
nothing is stored, nothing is sent, and there is no `console` output.

- **Output**: `HH:MM:SS.mmm  I/Tag: message`, coloured by level (`I` ink, `D` dim, `W` gold, `E` red), a polite `role='log'` that follows the
  newest line unless the visitor scrolled up; the Clear button in the panel header empties it (the problems stay).
- Lines (all typed events, see `events.ts`): `I/Portfolio: ready (+812 ms)`, `I/Perf: TTFB 80 ms`, `I/Perf: LCP 1.2 s · CLS 0.00` (once the
  page settled: first key or tap, tab hidden, or 3 s; `PerformanceObserver`, no library), `I/Router: /about`, `D/Query: projects read (9 docs, 82 ms)`
  (`site/live read (40 ms)` for a document, `cached (N docs)` when it came back from the browser's cache), `W/Query: projects retry 1`,
  `E/Query: projects failed (FirebaseError)`, `I/Settings: language -> vi` (also `theme`, `skin`), `I/UI: cv opened | connect opened |
chat opened | viewer opened | copied`, `I/Terminal: ls`, `E/Runtime: uncaught (TypeError)` and `unhandled rejection (RangeError)`.
- **Problems**: a row for each error or warning, grouped with a count (icon, text, dim source `query` or `runtime`). Failed queries,
  retried queries (warning), uncaught errors and unhandled rejections. The status bar counters (`⊗ 0 ⚠ 0`) are the number of different
  errors and warnings; the button opens the tab.
- Sources are mounted by `<LogSources>` (first child of `DevShell`, so it listens before the page's queries start): the `QueryCache`,
  `usePathname`, the language and theme (a change after mount), the chat and Connect (when they open), `window` `error` and
  `unhandledrejection`. The overlay context writes `cv opened` and `viewer opened`, the terminal writes its command, the title bar writes a
  change of skin (the shell is gone by then), and the copy buttons announce `bach-cv:copied` on `window` (`lib/copied-event.ts`, no payload).

### Security: the log is public, so it holds metadata only

1. **Typed events, no free text.** A line is only built by `buildEntry` from a `DevLogEvent`; no caller passes a string that is printed.
2. **Allow-lists.** A query is named from its key and only the collections of the schema (`COLLECTION_NAMES`) and `site/live|profile|settings`
   get through, anything else is `unknown`. A route must be a page of the site (`pageOfPath`), else `/not-found`: query string and hash are
   cut. A command must be one of the terminal's `COMMANDS`, else `unknown` (never its arguments). A setting value must be one the site
   offers. An error is reduced to its name from `ERROR_NAMES` (`TypeError`, `RangeError`, `NetworkError`, `FirebaseError`, ...), else `Error`:
   never its message, stack, file name or URL. Counts and times are finite numbers, never text.
3. **`safeName`** is for any other free name: only `a-z 0-9 . _ / -`, at most 80 characters, no run of 6 digits (phone and account numbers),
   no 25-character token. Text that does not fit is replaced by a fallback, not trimmed to something that still resembles it.
4. Never log: documents or fields, emails, phone or account numbers, QR data, URLs, Firebase ids or keys, environment values, request
   headers, raw error messages, what was typed in the contact form, the chat or the terminal. `tests/unit/skin/devlog.test.ts` feeds hostile
   values to every event and checks the output; `tests/automation/skins/dev-output.spec.ts` checks the text of the log and of the Problems
   list after copying the email and after failing requests.
5. A new line is a new `DevLogEvent` kind with typed fields and a test; do not add a `message: string` field.

## Where things are

```text
skin.tsx            SkinDefinition: Frame (DevShell) + one component for each page + NotFound + Maintenance
dev.css             the palette (dark and light), the base of links/images/buttons, code colours, keyframes and view transitions
dev-extra.css       focus ring, shadcn tokens mapped to the palette, reduced motion, folder animation
css/<area>.css      keyframes of an area (imported by skin.tsx, or by the page when only that page needs them)
config.ts           page -> file map, Explorer tree, constants
shell/              the editor window (title bar, tabs, explorer, status bar, Connect palette, overlays context, viewer, CV, chat);
                    window-chrome.tsx is the frame shared by the viewer and the CV window; terminal/ is the Terminal tab;
                    devlog/ is the log behind the Output and Problems tabs
pages/<page>.tsx    one file for each page: DevPage + DevPageHead + the blocks
blocks/<name>.tsx   one file for each part of a page
ui/                 shared pieces: dev-root.tsx (the root), dev-button/chip/card/term/kind/badge/link/kbd, dev-page.tsx,
                    dev-page-head.tsx, dev-section.tsx, window-dots.tsx, dev-menu.tsx, dev-download-cv.tsx, dev-ask-bot-button.tsx,
                    dev-data-state.tsx, state screens, count-hint.ts
icons/              dev-icon.tsx (Codicons, CC-BY-4.0), file-icon.tsx
```

## Styling

- **Tailwind utilities + tokens, in the TSX.** The palette is theme colours (`app/tailwind-theme.css`: `bg-chrome`, `border-line`, `text-ink`,
  `text-kw`, ...), whose values live once on `html[data-skin='dev']` in `dev.css` (dark is the base, light is `html:not(.dark)`), so portals
  (dialogs, sheets) see them. The shadcn tokens are mapped to the same palette in `dev-extra.css`, so the shadcn components follow the
  skin. Two palette names are `--dv-accent` and `--dv-muted`, because `--accent` and `--muted` mean something else in shadcn. Code font:
  `font-code` (never `font-mono`, which is Standard's).
- CSS is only for what utilities do not express: keyframes, view transitions, code-token colours, the folder animation, the base of
  links/images/buttons. Its classes have the prefix `dv-`. CSS outside a layer beats utilities on the same element, so never leave a CSS
  rule behind that targets an element which carries utilities; a control that must escape the base rule for links or buttons sets
  `data-slot='dev-*'`.
- Icons: `<DevIcon name='copy' />` (an inline SVG; size it with `size-*`, because `.dv-codicon` sets the font size). File type icons: `<FileIcon kind='kt' />`. `icons/codicons.ts` is
  a table of Codicons path data: to add an icon, add its entry (the paths come from its SVG in the Codicons package).
- Reveal on scroll: put `data-reveal` on a block (`--i` for its order). `shell/use-dev-reveal.ts` adds `data-in`.
- Shared primitives are components in `ui/` (`dev-button`, `dev-chip`, `dev-card`, `dev-term`, `dev-kind`, `dev-badge`, `dev-link`,
  `dev-kbd`, `dev-section`, `window-dots`); each sets `data-slot='dev-*'`. Use the shadcn components of `components/ui` for forms,
  alerts, spinners, toggle groups and chat.

## Data

Components never import Firebase. Read through `@/lib/query/use-content` (`useContentQuery`, `useProfileQuery`), `@/hooks/use-live`,
`components/skills/use-skills`, `components/cv/use-cv`, `components/services/use-contact-form`, `components/chat/use-chat-session` and the
helpers in `components/payment/*`, `components/projects/project-helpers.ts`. Loading, empty and error states follow the Standard blocks
(`components/data-state.tsx`, `state-notice.tsx`); the Dev versions are `ui/dev-data-state.tsx` and `ui/dev-state-notice.tsx`.

## Things to know

- The page's server-rendered content is not used in a skin: `SkinFrame` renders `skins/<id>/pages/<page>` instead.
- `shell/dev-overlay-context.tsx`: `useDevOverlays()` gives `openViewer(items, index)`, `openCv()`, `say(message)` (toast).
- The Standard chat (`ChatProvider`, `useChat`) is global; the Dev chat panel reads the same state.
- The only thing the skin keeps in the browser is the state of the chrome (Explorer, folders, bottom panel) under `bach-cv-dev-ui`
  (`shell/use-dev-ui.ts`, booleans and folder paths, no personal data); the choice of skin itself is `bach-cv-skin`.
- **The CSP of `firebase.json` still applies** (`connect-src` lists this site, Firestore, the Worker and App Check). The picture viewer
  does two `fetch`es to the host of the picture (`raw.githubusercontent.com`): a HEAD for the weight (`viewer/use-image-info.ts`) and a GET
  for Download (`viewer/save-image.ts`). With the policy of the live site both are refused and the viewer degrades on purpose: the status
  line has the size and type without the weight, and Download opens the picture in a new tab instead of saving it (no "Saved" message).
  `tests/automation/skins/dev-overlays.spec.ts` covers both cases. A new network call of a skin must do the same or add its origin to the policy.
