# BachCV

Personal portfolio and CV of Bach Bui, live at **https://bachbntdev.web.app**.

A static Next.js site whose content lives in Firestore. Editing a document in the Firebase console changes the site within
minutes: no build, no deploy. It speaks English and Vietnamese, has an AI assistant (BB Bot), and builds the CV as a PDF from the
same data.

## Screenshots

The Home page of each skin, in the dark and in the light theme.

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev/01.webp" alt="Home in the Standard skin, dark theme"><br><sub><b>Standard</b>, dark: the portfolio itself, with a rainbow palette.</sub></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev/02.webp" alt="Home in the Standard skin, light theme"><br><sub><b>Standard</b>, light.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev/03.webp" alt="Home in the Dev skin, dark theme"><br><sub><b>Dev</b>, dark: the same content as a code editor, with a working terminal.</sub></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev/04.webp" alt="Home in the Dev skin, light theme"><br><sub><b>Dev</b>, light.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev/05.webp" alt="Home in the Trade skin, dark theme"><br><sub><b>Trade</b>, dark: the same content as a trading terminal, with the career as a chart.</sub></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev/06.webp" alt="Home in the Trade skin, light theme"><br><sub><b>Trade</b>, light.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/bachbnt/assets/main/project/bachbntdev.webp" alt="The Home page of the first version of the site"><br><sub><b>v1</b>: the first version of the site (2022).</sub></td>
    <td width="50%"></td>
  </tr>
</table>

## Highlights

- **Remote config.** `site/live` switches pages (`on` / `soon` / `hidden`), features (chat, CV download, contact form, Connect
  menu), a site-wide maintenance screen, and, for the **skin, the colour theme and the language**, what to offer, what to show a visitor
  who has not chosen, and what to force on everyone (`prefs`, below). Every content document has a `visible` flag that the Firestore rules enforce, so a
  hidden item is never sent to a visitor.
- **Bilingual.** English and Vietnamese. Interface copy is typed (`defineCopy(en, vi)`); content is translated through an `l10n.vi`
  overlay on each document.
- **Static and cheap.** `output: 'export'` served by Firebase Hosting; the browser reads Firestore with the lite SDK and
  TanStack Query caches it (also in `localStorage`). Only `src/content/shell.json` (name, headline, avatar, SEO) is embedded at
  build time.
- **One look for every state.** While data loads a block shows a skeleton of its own shape, with nothing to show it shows an
  explanatory card, and when a read fails it shows the same card with a Try again button. All of it goes through one component
  (`DataState`) and one copy file (`src/content/copy/states.ts`), so every page behaves the same way.
- **Security headers.** `firebase.json` sends HSTS, `X-Frame-Options`, a Content-Security-Policy and more. The policy allows only this
  site, Firestore, the chat Worker, Cloudflare Turnstile and https images; it was tested against the real pages, the CV dialog and the PDF download.
  Adding another origin (for example a new API) means adding it to the policy.
- **BB Bot.** A chat widget backed by a Cloudflare Worker. Workers AI answers first (free, no API key); Gemini is the fallback when the
  free daily allowance is spent. Keys stay in the Worker. The browser sends only the conversation and the language: the Worker builds the
  system prompt itself from the public site content, so a caller cannot give the model instructions of their own. The panel is loaded when the
  chat is first opened. The same Worker emails the owner when a contact-form message is saved (Resend), and with a Cloudflare Turnstile
  secret set it asks for an invisible Turnstile token first (see `worker/README.md`).
- **Search and sharing.** Every page has its own title, description, canonical link and social preview in its static HTML, plus a
  schema.org `Person`, a sitemap and `robots.txt` (`src/lib/seo.ts`). The browser tab title follows the visitor's language.
- **Light and dark.** A Theme menu in the header (System, Light, Dark; also in the phone menu) remembers the choice and follows the
  operating system until one is chosen. A small script in `<head>` sets the theme before the first paint, so there is no flash. Colours are
  tokens in `src/app/globals.css` (`:root` and `.dark`); the CV sheets stay white paper in both.
- **Skins.** The header has a Skin menu next to Theme and Language. Standard is the site itself; Dev shows the same content as the window of
  a code editor (a file for every page, a git log for the career, a small working Terminal, an Output tab with a live log of the page).
  Its three window lights work: red goes back to Standard, yellow is Zen mode, green is full screen.
  Trade is a chart terminal with its own interface for every page (the career as a working chart with chart types, indicators,
  drawing tools and a bar replay; a symbol search, a ticker tape and a watchlist; a screener, financials and a calendar for the data pages).
  Academic is a chalkboard (dark) or whiteboard (light) with an annotated manuscript pinned to it (see `src/skins/academic/README.md`).
  Travel is a 2.5D trip map of Nha Trang drawn from OpenStreetMap data (© OpenStreetMap contributors, ODbL): the stops are the real roles, the pages are parts of the trip (see `src/skins/travel/README.md`).
  The choice is kept in the browser (`bach-cv-skin`, or `?skin=dev`, `?skin=trade`, `?skin=academic`, `?skin=travel`) and the URL does not change. A skin is loaded only when it is chosen,
  so Standard visitors download none of its scripts (its styles share the one Tailwind build: the main stylesheet is about 54 KB gzip, it was about 20 KB before skins). See `.ai/skins.md` and the README of each skin in `src/skins/<id>/`.
- **Card hover.** Cards rise 3px with a growing shadow (class `lift`) and light up where the mouse is: a soft spotlight inside and a
  lit edge, in the colour of the page (class `glow`, `<PointerGlow>`). The tinted head of each page also lights up softly under the
  mouse (class `band-glow`). Only for a mouse, and off for "reduce motion".
- **Experience.** On Resume a timeline runs down the roles (a line that draws itself, a dot for each, the current one breathing), the
  parts of a role arrive one after another, the responsibilities slide open line by line and the company logo zooms on hover. The
  "Current" pill has a live dot on Resume and Home. All of it is off for "reduce motion".
- **Page and list motion.** A page change blends: the header stays put (only its tint changes) and the page fades out and the next
  fades in (React view transitions). A filter on Projects or Payment swaps its list the same way. A thin line along the top grows with the scroll,
  a project cover zooms a little under the mouse, the personal photos (Home, About) rise like a card and zoom slowly, the arrow of an outside link nudges, the specialty chips on About lean toward the mouse like a magnet (and do not pile up when two are pulled at once), and the picture of a dialog fades in when it changes.
  All of it is off for "reduce motion", and a browser without support just swaps.
- **Accessible.** A visible focus ring on every control (a browser test tabs through the pages and dialogs), 44 px touch targets on
  phones, one set of buttons (filled, outline, link) and one image dialog for screenshots, certificates and QR codes. The moving list of
  skills has a pause button (also for the keyboard), and names read by a screen reader are in the visitor's language.
- **CV dialog and PDF.** A preview of the CV as A4 sheets and a PDF download, both built from the visitor's language.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query ·
Firebase (Firestore lite, Hosting, App Check with reCAPTCHA Enterprise) · Zod · `@react-pdf/renderer` · Vitest · Playwright ·
Cloudflare Worker (Workers AI, KV) · Resend.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the NEXT_PUBLIC_FIREBASE_* values (and NEXT_PUBLIC_CHAT_PROXY_URL for the chat)
npm run dev                  # http://localhost:3000
```

| Script                                | What it does                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`                         | Next.js dev server                                                                        |
| `npm run build`                       | static export into `out/`                                                                 |
| `npm run typecheck`                   | `next typegen` then `tsc --noEmit`                                                        |
| `npm run lint` / `lint:fix`           | ESLint (Next.js config + Prettier)                                                        |
| `npm run test:unit:run`               | Vitest                                                                                    |
| `npm run test:automation`             | Playwright against `next dev` on port 3100 (`PW_CHANNEL=chrome` uses an installed Chrome) |
| `npm run backup:firestore`            | download every v2 collection into `backup/`                                               |
| `npm run restore:firestore -- <file>` | plan (add `--apply` to write) a restore from a backup                                     |
| `npm run sync:fixture`                | refresh `tests/fixtures/seed.json` from the latest backup (payment numbers are replaced)  |
| `npm run docs`                        | rebuild `docs/data-design.html` and `docs/detail-design.html`                             |

Before finishing a change: `npm run typecheck && npm run lint && npm run test:unit:run`, and `npm run test:automation` for UI changes.

## Optional services (all free, no card)

**Firebase App Check** (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`) tells Firestore which requests come from this site. It is off until you do this.
Firebase no longer accepts new reCAPTCHA v3 keys for App Check; the provider is reCAPTCHA Enterprise (Google Cloud Fraud Defense):

1. Google Cloud console → Security → reCAPTCHA / Fraud Defense, project `bachbntdev`: enable the API if asked, then create a key for the
   **website** platform, **score-based** (no checkbox), with the domains `bachbntdev.web.app`, `bachbntdev.firebaseapp.com` and `localhost`.
   Copy the _key ID_. Check on the pricing page that the free quota applies to your project and whether a billing account is asked for.
2. Firebase console → App Check → Apps → the web app → register it with the reCAPTCHA Enterprise provider and the key ID.
3. Put the key ID in `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (`.env.local`, and the GitHub secret of the same name), rebuild and deploy.
4. Watch App Check → Firestore → Metrics for a day. **Do not turn on "Enforce" until nearly all requests are verified.** Once enforced,
   Firestore rejects every request without a token, reads included, so a visitor whose browser blocks reCAPTCHA (an ad blocker, for
   example) would see no content at all. The site stays usable while it is only monitored.
5. Local development: the console prints an App Check debug token; register it in the Firebase console (App Check → Apps → Manage debug tokens).

**Workers AI and email when someone writes** run in the Worker (`worker/`, see `worker/README.md`):

```bash
cd worker
npx wrangler login
npx wrangler secret put RESEND_API_KEY     # also NOTIFY_TO (one or more addresses) and GEMINI_API_KEY if you have one
npm run deploy
curl https://chat-proxy.<account>.workers.dev/health   # {"ok":true,"rateLimit":true,"providers":[...],"notify":true}
```

The KV namespace `CHAT_RATE_LIMIT` and the `AI` binding are in `wrangler.toml`. Without a verified domain Resend delivers only to the
address of the Resend account; to reach another address, forward it in that mailbox or verify a domain and set `NOTIFY_FROM`.

### Known limits

- The Gemini key in the Worker is invalid, so the chat relies on the Workers AI free daily allowance.
- App Check is monitoring only (see the warning above). Nothing stops a script from writing to `messages` within the rules.
- Free tiers change; check Workers AI, Resend and reCAPTCHA pricing before relying on a limit.

## Content and remote config

Images live in the [assets repository](https://github.com/bachbnt/assets) and are served from GitHub raw. Use WebP resized to what it
shows (about 1600 px at most, covers and the avatar 1280); payment QR codes stay PNG so they stay sharp and scannable.

The data is in Firestore, one document per item:

| Collection                                                                              | Holds                                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `site`                                                                                  | `shell` (embedded at build), `live` (switches), `profile`, `settings` |
| `skills`, `experience`, `education`, `projects`, `certificates`, `services`, `contacts` | the content                                                           |
| `payments`                                                                              | payment methods, read only while the Payment page is on               |
| `messages`                                                                              | contact-form messages (create only from the browser)                  |

Common edits in the Firebase console:

- Hide or show an item: set `visible` on the document. Feature it with `highlight` (1 is first); order it with `sort`.
- Switch a page: `site/live` → `pages.<page>` = `on`, `soon` or `hidden`. Switch a feature: `features.<name>` = `true` / `false`.
- Skin, theme and language: `site/live` → `prefs.skin`, `prefs.theme`, `prefs.language`, each with `default`, `force` and `off`:
  `default` is what a visitor who has not chosen sees (`travel`, `dark`, `vi`); `force` shows it to everyone, ignores their own choice and `?skin=`, and hides that
  menu (for a campaign, or a skin that has a bug); `off` is a list of options to leave out of the menu (a visitor who had chosen one is given the default;
  `standard` cannot be left out; leaving out `dark` or `light` leaves that scheme out altogether, also for a visitor who follows the system). Leave a text empty for
  "not set". Anything that is not one of the options counts for nothing. The order is: force, the visitor's `?skin=` / `?theme=` / `?lang=` (also kept as a
  choice) and their saved choice, the default, the browser's language / the system's colours, the default of the site (`lib/preference/preference.ts`).
  The last read is kept in this browser (`bach-cv-prefs`), so a visitor who comes back has no flash; a first visit may see the default for a moment.
- Maintenance: `site/live` → `maintenance.enabled = true` (message in `maintenance.message`, Vietnamese in `maintenance.l10n.vi.message`).
- Translate: add `l10n.vi.<field>` on the document.
- Skills: a skill with `listed: false` is not shown as a chip but can still be a technology tag on a project or a role.

Changes show after the browser cache expires (`site/live` about a minute, content about five minutes).
The model is in `src/lib/content/schema.ts`; the rules are in `firestore.rules`. The old site's collections (`config`, `user`, `message`) are closed to browsers; their data is
kept, and `backup/firestore-v1.json` (git-ignored) holds a copy.

## Repository layout

```text
src/app                 routes, layout, global CSS
src/components          UI (ui/ is shadcn), one folder per page or feature; data-state, state-notice and skeletons are shared by all pages
src/content             shell.json (embedded) and the interface copy in src/content/copy/*.ts
src/lib/content         the data contract (schema.ts), repository interface, Firestore lite adapter
src/lib/query           TanStack Query keys, options and hooks
src/lib/i18n            language state and the copy helpers
src/lib/theme           theme provider and the no-flash script
src/lib/derive          pure derivations shared by every skin (years, current job, stops, lists of Home...), each with a unit test
src/lib/skin            the skin ids, the choice of the visitor and the loader of the lazy skin chunks
src/hooks               hooks shared by the skins (live switches, now, clipboard, chat settings...)
src/skins               one folder for each skin besides Standard (dev, trade, academic, travel), each with its own README
src/lib/seo.ts          page metadata        src/lib/notify.ts   email request after a message        src/lib/content/app-check.ts   App Check
tests/unit              Vitest        tests/automation   Playwright        tests/fixtures   Firestore snapshot for tests
scripts/                Firestore backup, restore and test-fixture sync; scripts/docs builds the design documents; scripts/travel builds the map data
worker/                 Cloudflare Worker: chat with provider fallback, email notification, KV limits (see worker/README.md)
docs/                   data-design.html, detail-design.html (npm run docs) and schema.sql
.ai/, .claude/skills    working rules and installed skills (Next.js, frontend design, shadcn, Firebase, Vercel, Cloudflare; see SOURCES.md)
```

## Deploy

```bash
npm run build
npx firebase-tools deploy --only hosting      # the site
npx firebase-tools deploy --only firestore:rules   # the rules (changes production)
(cd worker && npx wrangler deploy)            # the chat and email Worker
```

Deploy the **Worker first** when its contract changes (the chat request, the checks of `/notify`): an old site works against a new Worker,
but a new site against an old Worker is refused. Variables that start with `NEXT_PUBLIC_` (the chat proxy address, the App Check and Turnstile
site keys) are read **at build time**, so they must be set in the environment of `npm run build` (see `.env.example`); the secrets live in the
Worker (`wrangler secret put`, see `worker/README.md`).

Work happens on `dev` and is merged into `master`. CI (`.github/workflows/main.yml`) builds and deploys hosting when a commit on
`master` contains `[build]`; otherwise deploy by hand with the command above.
Back up the data before changing the model: `npm run backup:firestore`. The `backup/` folder is git-ignored because it holds
payment details and visitors' emails.

`master` and `dev` hold this version. The previous Vite/React/MUI site is kept on the `backup-v1` branch.
