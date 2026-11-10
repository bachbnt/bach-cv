# The Academic skin

The site as a **chalkboard** (dark theme) or a **whiteboard** (light theme) with an annotated manuscript pinned to it: each page is a part of a
manuscript, a hand-written margin runs down the right of the page, paper (the abstract, the reviewers' cards, a sticky note, the chat slip) is
pinned or taped to the board, and an eraser wipes one page away for the next. It is one of the **skins** of the site (see `src/skins/types.ts`
and `.ai/skins.md`); the visitor picks it in the header and the URL does not change. Id `academic`, class prefix `ac-`, colours `ac-*`.

Same information and features as Standard; only the presentation is its own. The look was designed as a mock (`design/skins/academic-*.html`) and
the real content, copy and behaviour were read from the Standard components, like every skin.

## The tabs keep the Standard names

The pages are Home, About, Resume, Projects, Certificates, Services and Payment, in the tabs, the page titles and the page turns. The word of
the manuscript that goes with a page (Abstract, Authors, Results, References, Peer review, Proposal, Funding; `content/copy/academic.ts`, en and
vi) is a small kicker above the title (`§ Results`), decoration, so nothing is hard to find.

## Rules of the skin

1. **Paper has its own ink.** The board is `ac-board` with chalk-white (dark) or marker-black (light) ink. Anything on paper (`.ac-paper`,
   `AcPaper`) redefines `--ac-ink`, `--ac-mute`, `--ac-accent`, `--ac-link`, `--ac-rule` to the ink of paper, so `text-ac-ink` is dark inside it
   in both themes. A dialog is paper too (`shell/ac-viewer`, `ac-chat-sheet`, `ac-cv-sheet`, the menus).
2. **Fonts: three families.** A book serif for the text (Crimson Pro), handwriting for notes, labels, buttons and names on paper (Kalam) and a
   brush for the headings written on the board (Caveat Brush). The two handwriting fonts have no Vietnamese letters: in Vietnamese (`html:lang(vi)`) the notes,
   buttons and headings use Patrick Hand and Playpen Sans, which have. A portal sits outside `.ac-root`, so its content carries `ac-scope` and
   `AC_FONT_VARS` (`ui/ac-fonts.ts`) to get the font variables. The name of a language in the language menu carries its own `lang` (`en`, `vi`), so it takes the fonts of that language on a page of either one: the two menus match, and a Vietnamese name is not a mix of Kalam and the letters of the other font.
3. **No mono, no hover-only information.** Hover is the Tailwind `hover:` variant (inside `@media (hover: hover)`). Every control has a pressed
   state and a 44 px target on touch (`pointer-coarse:`). The marks after the words of a button, the arrows and the close cross are strokes drawn
   with a round pen (`ui/ac-icon.tsx`), not typed characters (which come from whatever font has them) and not an icon library; a line you write on
   is `ui/ac-line-input.ts` (the contact form and the chat share it), and its focus is an accent underline, not a box.
4. **Tallies are only for years.** In the skills table of Resume a skill carries one stroke for each year it was used (months / 12, rounded up;
   four strokes and a crossing stroke make five, `lib/derive/tally.ts`). The exact months are always the text beside it; the tally is
   `aria-hidden`. Services and Payment show plain numbers.
5. **Margin notes are real text.** `AcRow` ties a block to its note with `aria-describedby`; on a wide screen the note stands in the right margin
   with a bracket and an arrow, on a phone it folds under the block. A note only says what is derived from real data (the current role, the years
   in software, the length of a role, how many services, the latest certificate); nothing is invented.
6. **The contents list of the manuscript is on Home** (`blocks/home-contents.tsx`): the same pages as the tabs, with the same names and tags
   (`shell/use-page-labels.ts`), in the dotted-leader form of a book.
7. **Wind.** Every sheet, note and photo of the board is lifted from behind when the pointer is over it (`.ac-wind` in `academic.css`: a small turn
   about its top edge, held by the tape or the pin, then it settles), the contact form too: `AcPaper` has it by default, the photos and the
   cards that are not an `AcPaper` carry the class. Not for the paper of a window, a menu or the toast (it is not pinned to the board), only
   where there is a hover, never with reduced motion.
8. **The line of rights** of Standard's footer (`© {year} {name}. {rights}`, `commonCopy.footer.rights`, the year from `useNow()`) is written in chalk at the
   foot of the board, centred under the turn of the page and above the ledge (`shell/footer.tsx`). The ledge sticks to the bottom of the window and
   comes to rest after it at the end of the page, so the line never lies under the ledge or the chat slip; at 320, 390 and 1440 px, in both themes and
   both languages, it is a single line clear of both (`academic-shell.spec.ts`).
9. **Accessible names are Standard's.** The language, skin and theme tags keep the words they show (`EN`, `Academic`, `Chalkboard`) but their
   `aria-label` is the one of Standard's menus: `Language: English`, `Skin: Academic`, `Theme` (`shell/header.tsx` builds it, `ui/ac-menu.tsx` sets it).
10. **Content the mock had and Standard has not** was dropped or made decoration: the circled citations
    between roles and projects, the full-time/part-time label, the canned chat answers, the placeholder CV and QR dialogs, the moving tech strip
    (a still list of keywords, so there is no pause button to keep).

## Page change: the eraser

`shell/use-eraser-wipe.ts` copies the page that is on screen when the visitor chooses another (a click on a link of the skin or an arrow key,
`shell/pager.tsx`), and when the new page has mounted an eraser crosses the board along an arc around a pivot below it (about 0.6 s), leaving a
hazy swath where the old page is gone; then the swath swells to the corners (about 0.7 s, 1.2 s in all). The old page is the copy, fixed over the
board, inert and `aria-hidden` (class `ac-ghost`, no ids), and the new page is masked in behind the eraser. Each board needs only two mask layers
(a radial-gradient ring around the pivot and a conic-gradient sector: a row of many gradients janked), so a frame takes the 16.7 ms of the display.
The arithmetic is pure and tested (`shell/wipe-geometry.ts`, `tests/unit/skin/academic-wipe.test.ts`). No wipe on the first render, with
reduced motion, for an anchor jump, for back/forward of the browser (they fall back to the foundation's fade, `ac-vt-in` / `ac-vt-out`), or when
the old page is not on screen; a second change during a wipe ends the first at once. The copy is of the whole page and the mask is on the whole
new page on purpose: the layout of what is on screen depends on the rest of the page, and a visitor who scrolls during the wipe would find the
part outside a smaller mask missing. In desktop Chrome with the CPU throttled 6 times a 7,000 px page still wipes at the display's rate, with one slow
frame when the copy is taken (no measurement on a device was made).

## Where things are

```text
skin.tsx            SkinDefinition: Frame (AcademicShell) + one component for each page + NotFound + Maintenance
academic.css        the palette (dark = chalkboard, light = whiteboard), the shadcn tokens, the board and its frame, paper, tape, pins, the hand-drawn line,
                    the ledge, keyframes and reduced motion
css/<area>.css      pseudo-element decoration of an area (home-about, overlays, wipe), imported by the component that needs it
fonts.ts            next/font declarations (preload false, so they load only with the skin)
shell/              the frame: header (language, skin, theme, Connect, CV), contents (tabs), pager, ledge with the chat slip, the overlays host
                    (viewer, chat, CV sheet, toast), the eraser wipe
pages/<page>.tsx    one file for each page: AcPage + AcPageHead + the blocks
blocks/             the parts of a page (named for their page)
ui/                 ac-root, ac-page, ac-page-head, ac-section (chalk headings), ac-note (AcRow, a block with its margin note), ac-paper, ac-button,
                    ac-chip, ac-menu, ac-icon (the drawn marks), ac-line-input, ac-soon-tag, ac-data-state, ac-state-notice, ac-skeleton, status screens
```

Words only this skin has: `content/copy/academic*.ts` (shell, home and about, resume, projects, certificates and services, payment,
overlays), en and vi; Standard's own copy is reused wherever Standard has the word.

## Styling

- The board (colour, light, grain) is the `position: fixed` layer `.ac-root::before` behind the content (the root is `isolation: isolate`), not
  `background-attachment: fixed` on the root: a fixed attachment on a tall element is painted again on every scroll in some browsers, a fixed layer is
  not. The look is the same in both themes.
- Tailwind utilities with the `ac-*` theme colours (`bg-ac-sheet`, `text-ac-mute`) and fonts (`font-ac-chalk`, `font-ac-note`, `font-ac-serif`) of `app/tailwind-theme-academic.css`; their values live once on `html[data-skin='academic']` in `academic.css`, so portals
  see them. The shadcn tokens are mapped to the same palette there, so the shadcn components follow the skin.
- CSS only for what utilities do not say: the palette, the board and its frame, paper grain, tape and pins, the wavy hand-drawn line (a mask),
  the ledge, keyframes. Classes have the prefix `ac-`. CSS outside a layer beats utilities on the same element, so no rule is left that targets an
  element which also carries utilities.

## Data

Components never import Firebase. The pages read through `@/lib/query/use-content`, `@/hooks/use-live`, `components/skills/use-skills`,
`components/cv/use-cv`, `components/services/use-contact-form`, `components/chat/use-chat-session`, `components/payment/*` and the helpers of
`components/projects/project-helpers.ts`. What more than one place needs is in `src/lib/derive/` (`tally`, `career-timeline`, `payment-kinds`
were added with this skin, and `shown-pages`, `offered-languages`, `core-stack`, `contacts`, `specialties` were moved there from the skins). The chat, the CV and the payments are Standard's logic in this skin's windows.

## Things to know

- **CSP.** The only request the viewer makes to the host of a picture is the one of **Save QR**, the same `saveQr` as Standard's QR dialog
  (`components/payment/save-qr.ts`): a `fetch` of the image to save it, and when the browser or the policy of the live site refuses it, the
  picture opens in a new tab and the toast says so. There is no HEAD for the weight of a picture. `academic-payment.spec.ts` covers both.
- The page's server-rendered content is not used in a skin: `SkinFrame` renders `skins/academic/pages/<page>`.
- Standard's floating chat button is not shown in a skin: the slip on the ledge opens the same chat (`useChat`). The BB Bot notepad has a fixed
  size (560 px, or the window if it is smaller): the conversation scrolls inside it, the header, the suggestions, the input and the count stay.
- The toast (`shell/ac-toast.tsx`) is a slip fixed in the window above the ledge, read out politely. Paper does not take `position` from an element
  that a utility has already placed (`.ac-paper:not(.absolute, .fixed, .sticky)`), which is why a toast and a sticky note can be paper.
- A page that scrolls to a focused control keeps it clear of the ledge (`scroll-padding-bottom` on `html`).
- The only things the skin keeps in the browser are the choice of skin (`bach-cv-skin`), the language and the theme, like Standard.

## Tests

- Unit (`tests/unit/skin/academic-*.test.ts`, `tests/unit/lib/derive/{tally,career-timeline,payment-kinds}.test.ts`): the timeline model, the
  skills table (filter, sort), the screenshots of a project, the geometry of the eraser, the tally, and the contrast of the palette on the board
  and on paper (`academic-contrast.test.ts`).
- Playwright (`tests/automation/skins/academic-*.spec.ts`): the frame and the menus (shell), each page with real data, its states (loading,
  error with Try again, empty), `soon` and `hidden`, Vietnamese, 390 px without a horizontal scroll, the overlays (viewer, chat, CV, Connect), the
  eraser (`academic-wipe`), the wind (`academic-wind`) and what an audit of the board found (`academic-polish`: the toast, the sticky note, no
  page wider than 320 px, keys pressed in a row, the focus clear of the ledge).
