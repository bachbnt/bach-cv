/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * The detail design page: context, architecture, flows, states, components, errors, security, delivery and tests.
 */

import { arrow, box, c, canvas, code, fig, sequence, table } from './kit.mjs';

// ---------------------------------------------------------------- diagrams

const context = () => {
  const cv = canvas(1180, 440);
  const items = [
    box(430, 150, 320, 'Browser: the static app', ['Next.js 16 pages, React 19', 'TanStack Query + localStorage cache', 'Firestore lite (one-shot reads)', 'App Check token (reCAPTCHA Enterprise)', '@react-pdf/renderer (on demand)'], 'ink'),
    box(30, 30, 280, 'Firebase Hosting', ['serves out/ (static files)', 'cleanUrls, CSP and security headers'], 'blue'),
    box(430, 330, 320, 'Firestore (bachbntdev)', ['v2 collections + site documents', 'rules: visible == true, create-only messages', 'v1 collections closed to browsers'], 'amber'),
    box(870, 30, 280, 'Cloudflare Worker', ['POST /chat and POST /notify', 'rate limit in KV, provider allow-list', 'keeps the keys; emails via Resend'], 'violet'),
    box(870, 190, 280, 'Model providers', ['Workers AI first (free, no key)', 'Gemini as the fallback'], 'grey'),
    box(30, 230, 280, 'GitHub raw + jsDelivr', ['project and certificate images', 'certificate PDFs (jsDelivr)'], 'grey'),
    box(870, 330, 280, 'Owner: Firebase console', ['edits documents and switches', 'scripts: backup and restore'], 'green'),
  ];
  items.forEach((b) => cv.add(b.svg));
  cv.add(arrow('M310 85 C360 85 380 150 430 175', 'HTML, JS, CSS', 360, 118));
  cv.add(arrow('M590 242 V330', 'read visible, create message', 700, 296));
  cv.add(arrow('M750 190 C800 150 830 100 870 90', 'POST /chat, /notify', 805, 128));
  cv.add(arrow('M1010 120 V190', '', 0, 0));
  cv.add(arrow('M430 245 C380 250 340 255 310 262', 'images, PDFs', 372, 246));
  cv.add(arrow('M870 365 H750', 'edit data', 810, 357, 'red'));
  return cv.end();
};

const layers = () => {
  const cv = canvas(1180, 420);
  const top = box(40, 20, 540, 'src/app', ['routes, layout, per-page metadata, global CSS', 'each page: <PageShell> + page components'], 'ink');
  const comp = box(40, 118, 540, 'src/components', ['pages and features (about, resume, projects, ...)', 'ui/ = shadcn, chat/, cv/, lightbox/', 'data-state, state-notice, skeletons: shared by every block', "'use client' only on leaves"], 'ink');
  const q = box(40, 238, 540, 'src/lib/query', ['query keys, options, useContentQuery/useProfileQuery', 'staleTime, select (sort + localize)'], 'blue');
  const content = box(40, 328, 540, 'src/lib/content', ['schema.ts (contract), repository.ts (interface)', 'firestore-lite.ts (adapter), app-check.ts, shell.ts'], 'amber');
  const i18n = box(680, 20, 460, 'src/lib/i18n + src/content/copy', ['language.tsx (state), define-copy.ts, copy.ts', 'copy/*.ts: defineCopy(en, vi) per page'], 'green');
  const hooks = box(680, 118, 460, 'src/hooks and src/lib', ['use-live, use-clipboard', 'format.ts, pages.ts, seo.ts, notify.ts, chat/, cv/'], 'grey');
  const fb = box(680, 328, 460, 'Firestore', ['via firebase/firestore/lite only', 'Admin SDK only in scripts/'], 'red');
  [top, comp, q, content, i18n, hooks, fb].forEach((b) => cv.add(b.svg));
  cv.add(arrow('M310 98 V118', '', 0, 0));
  cv.add(arrow('M310 218 V238', '', 0, 0));
  cv.add(arrow('M310 318 V328', '', 0, 0));
  cv.add(arrow('M580 360 H680', 'only here', 630, 352, 'red'));
  cv.add(arrow('M580 150 H680', '', 0, 0, 'dash'));
  cv.add(arrow('M910 100 V118', '', 0, 0, 'dash'));
  return cv.end();
};

const statesPage = () => {
  const cv = canvas(1180, 330);
  const a = box(20, 40, 250, 'Loading', ['site/live not read yet', 'shows the site (fail open)'], 'grey');
  const m = box(340, 40, 250, 'Maintenance', ['maintenance.enabled = true', 'whole site replaced'], 'red');
  const on = box(680, 40, 230, 'Page: on', ['page content shows'], 'green');
  const soon = box(960, 40, 200, 'Page: soon', ['Coming soon screen'], 'amber');
  const hid = box(680, 190, 230, 'Page: hidden', ['404 screen, no menu entry'], 'blue');
  const ok = box(20, 190, 250, 'Switches unreadable', ['error or no network', 'defaults: all on'], 'grey');
  [a, m, on, soon, hid, ok].forEach((b) => cv.add(b.svg));
  cv.add(arrow('M270 80 H340', 'maintenance on', 305, 72, 'red'));
  cv.add(arrow('M145 40 V14 H795 V40', 'maintenance off, page on', 470, 8));
  cv.add(arrow('M910 80 H960', 'soon', 935, 72));
  cv.add(arrow('M795 130 V190', 'hidden', 830, 166));
  cv.add(arrow('M145 130 V190', 'read fails', 190, 166));
  cv.add(arrow('M270 235 H620 V100 H680', 'defaults', 450, 227, 'dash'));
  return cv.end();
};

const statesForm = () => {
  const cv = canvas(1180, 450);
  // contact form
  const i = box(20, 20, 170, 'Idle', ['typing, topic chips'], 'grey');
  const inv = box(270, 20, 170, 'Invalid', ['aria-invalid, announced'], 'amber');
  const snd = box(520, 20, 170, 'Sending', ['button disabled', 'aria-busy'], 'blue');
  const ok = box(770, 20, 170, 'Sent', ['Message sent', 'Send another'], 'green');
  const bad = box(520, 150, 170, 'Failed', ['text kept', 'Try again'], 'red');
  [i, inv, snd, ok, bad].forEach((b) => cv.add(b.svg));
  cv.add(arrow('M190 50 H270', 'invalid', 230, 42));
  cv.add(arrow('M355 100 V120 H105 V100', 'edit', 230, 113, 'dash'));
  cv.add(arrow('M190 80 C300 130 440 130 520 85', 'valid', 360, 132));
  cv.add(arrow('M690 60 H770', 'ok', 730, 52));
  cv.add(arrow('M605 100 V150', 'error', 640, 130, 'red'));
  cv.add(arrow('M520 195 H105 V100', 'retry', 300, 187, 'dash'));
  // chat
  const cl = box(20, 290, 170, 'Closed', ['floating button'], 'grey');
  const op = box(270, 290, 170, 'Open, idle', ['greeting, suggestions'], 'ink');
  const wt = box(520, 290, 170, 'Waiting', ['typing dots'], 'blue');
  const an = box(770, 290, 170, 'Answered', ['can ask again'], 'green');
  const er = box(1000, 290, 160, 'Error', ['rate limit, daily', 'limit, network'], 'red');
  [cl, op, wt, an, er].forEach((b) => cv.add(b.svg));
  cv.add(arrow('M190 330 H270', 'open', 230, 322));
  cv.add(arrow('M440 330 H520', 'send', 480, 322));
  cv.add(arrow('M690 330 H770', 'reply', 730, 322));
  cv.add(arrow('M690 372 C800 420 950 420 1010 372', 'fails', 850, 428, 'red'));
  cv.add(arrow('M855 290 C800 250 520 250 440 310', 'ask again', 650, 246, 'dash'));
  return cv.end();
};

// ---------------------------------------------------------------- sections

export const detailDesign = () => [
  {
    id: 'context',
    title: '1. System context',
    html: `<p>A static site on Firebase Hosting. All dynamic data comes straight from Firestore in the visitor's browser; the only other server-side piece is the chat Worker.</p>
${fig(context(), 'Arrows show who talks to whom and what travels.', 1180)}
${table(
  ['Part', 'Role', 'Notes'],
  [
    ['Firebase Hosting', 'serves <code>out/</code>', 'HTML revalidates every load; <code>/_next/static</code> is cached for a year, <code>/fonts</code> for 30 days; HSTS, Content-Security-Policy, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.'],
    ['Firestore', 'content, switches, contact messages', 'free tier; protected by rules, not by hiding the URL; App Check tokens are sent but not yet enforced'],
    ['Cloudflare Worker', 'chat proxy and email notification', '<code>/chat</code>: validates, rate-limits per visitor (KV), tries Workers AI then Gemini, caps the answer at 1024 tokens. <code>/notify</code>: emails the owner about a saved message. Keys live in the Worker.'],
    ['Workers AI', 'answers the chat', 'free daily allowance of the Cloudflare account, no API key; a spent allowance falls back to Gemini'],
    ['Resend', 'email to the owner', 'free plan; without a verified domain it delivers only to the account\'s own address'],
    ['reCAPTCHA Enterprise', 'App Check provider', 'a score-based key; Firebase no longer accepts new reCAPTCHA v3 keys for App Check'],
    ['GitHub raw / jsDelivr', 'images and PDFs', 'images are WebP, resized to the size they show (payment QR codes stay PNG); PDFs go through jsDelivr so they open in the browser'],
  ],
)}`,
  },
  {
    id: 'architecture',
    title: '2. Architecture',
    html: `<p>Dependencies flow downward. Components never import Firebase; only the Firestore adapter does, and only the lite SDK.</p>
${fig(layers(), 'Solid arrows: allowed dependencies. Dashed: shared helpers.', 1180)}
${table(
  ['Folder', 'Responsibility'],
  [
    [c('src/app'), 'App Router: routes, root layout (fonts, providers, favicon), 404, global CSS and design tokens'],
    [c('src/components'), 'UI by page or feature; <code>ui/</code> is shadcn (Base UI); <code>page-shell</code>, <code>page-gate</code>, <code>maintenance-gate</code>, header, footer'],
    [c('src/lib/content'), 'the data contract (Zod schemas, helpers <code>resolveItems</code>, <code>localize</code>, <code>skillEvidence</code>), the repository interface, the lite adapter, the embedded shell'],
    [c('src/lib/query'), 'TanStack Query keys, options (<code>staleTime</code>, <code>select</code>), and <code>useContentQuery</code> / <code>useProfileQuery</code> / <code>useSendMessage</code>'],
    [c('src/lib/i18n'), 'language state (<code>useLang</code>) and the bilingual copy helpers'],
    [c('src/content'), '<code>shell.json</code> (embedded) and <code>copy/*.ts</code> (interface text in English and Vietnamese)'],
    [c('src/lib/chat'), 'Worker client (asks without naming a provider), system prompt builder, message shaping, suggestions'],
    [c('src/lib/notify.ts, src/lib/seo.ts'), 'the fire-and-forget email request after a message is saved; metadata of each page (description, canonical link, social preview)'],
    [c('src/lib/cv'), 'builds the CV model from the data, paginates it for A4'],
    [c('scripts'), 'Firestore backup, restore and test-fixture sync (Admin SDK, run by hand); <code>scripts/docs</code> builds these documents'],
    [c('worker'), 'the Worker (Wrangler project): chat with provider fallback, email notification, KV rate limits'],
  ],
)}`,
  },
  {
    id: 'routes',
    title: '3. Pages and routes',
    html: `<p>Every page is a static file. A page that is not Home is wrapped in <code>&lt;PageShell page="..."&gt;</code>, which sets the page colours, renders the
header and footer and applies the page switch. Home uses the same gate inside its own layout.</p>
${table(
  ['Route', 'Page switch', 'Main parts', 'Data read'],
  [
    [c('/'), 'home', 'hero, pipeline card, skills strip, where I worked, what I built at FPT, featured projects, contact band', 'live, profile, contacts, skills, experience, projects'],
    [c('/about'), 'about', 'page head with summary and photos, Core stack, skill groups', 'profile, skills, experience, projects'],
    [c('/resume'), 'resume', 'roles with key project and responsibilities, skills, education with thesis', 'experience, skills, projects, education'],
    [c('/projects'), 'projects', 'featured projects, kind filter, grid, screenshots dialog', 'projects, skills'],
    [c('/certificates'), 'certificates', 'latest certificate, grid, preview dialog, PDF link', 'certificates, skills'],
    [c('/services'), 'services', 'service cards with drawings, contact form', 'services, settings'],
    [c('/payment'), 'payment', 'preferred methods, more ways to pay, QR dialog, copy buttons; paused state', 'payments (only here)'],
    ['other', '-', '404 screen', '-'],
  ],
)}
<p>Header and menus read ${c('site/live')} and ${c('contacts')} on every page. The chat widget and the language switch are mounted for the whole site.</p>
<p>Each page has its own title, description, canonical link and social preview in its static HTML (English, for search engines and link previews).
<code>DocumentTitle</code> then sets the tab title in the visitor's language and keeps it when the framework resets it. The root layout also carries a schema.org
<code>Person</code>. <code>public/sitemap.xml</code> lists the six public pages; <code>/payment</code> is left out and disallowed in <code>robots.txt</code>.</p>`,
  },
  {
    id: 'flows',
    title: '4. Main flows',
    html: `<h3>4.1 Opening a page</h3>
${fig(
  sequence(
    ['Browser', 'Hosting', 'Cache', 'Firestore'],
    [
      { from: 0, to: 1, text: 'GET /resume' },
      { from: 1, to: 0, text: 'static HTML + JS (shell, copy, frame)', back: true },
      { note: 'first paint: title, hero, header', at: 0 },
      { from: 0, to: 2, text: 'restore persisted queries (≤ 24 h)' },
      { from: 0, to: 3, text: 'read site/live (with an App Check token when enabled)' },
      { from: 3, to: 0, text: 'switches', back: true },
      { note: 'PageGate: on, soon or hidden; maintenance?', at: 0 },
      { from: 0, to: 3, text: 'query experience, skills, projects, education (visible == true, parallel)' },
      { from: 3, to: 0, text: 'documents', back: true },
      { from: 0, to: 2, text: 'store (stale in 5 min), persist' },
      { note: 'sort in memory, overlay the language, render', at: 0 },
    ],
    { col: 270 },
  ),
  'Stale cached data shows at once and is refetched in the background.',
  900,
)}
<h3>4.2 Changing a switch</h3>
${fig(
  sequence(
    ['Owner', 'Firestore', 'Browser'],
    [
      { from: 0, to: 1, text: 'set pages.payment = "soon"' },
      { note: 'stored; rules unchanged', at: 1 },
      { from: 2, to: 1, text: 'refetch site/live (60 s or on focus)' },
      { from: 1, to: 2, text: 'new switches', back: true },
      { note: 'menu shows Soon; /payment shows Coming soon', at: 2 },
    ],
    { col: 280 },
  ),
  'No build or deploy is involved. A change to site/shell is the exception: it needs a rebuild.',
  700,
)}
<h3>4.3 Sending a message</h3>
${fig(
  sequence(
    ['Visitor', 'Form', 'Firestore', 'Worker'],
    [
      { from: 0, to: 1, text: 'type, choose a topic chip' },
      { note: 'validate with messageSchema; honeypot', at: 1 },
      { from: 1, to: 2, text: 'addDoc messages (createdAt = server time)' },
      { note: 'rules check fields, sizes, email, locale', at: 2 },
      { from: 2, to: 1, text: 'ok or permission-denied', back: true },
      { from: 1, to: 0, text: 'Message sent, or failed with text kept', back: true },
      { from: 1, to: 3, text: 'POST /notify (only after it was saved; not waited for)' },
      { note: 'same checks, limits per visitor and per day, one email per address (Resend)', at: 3 },
    ],
    { col: 260 },
  ),
  'A filled honeypot pretends success and sends nothing. The message is always in Firestore first: if the email fails, nothing is lost and the visitor sees nothing.',
  900,
)}
<h3>4.4 Asking BB Bot</h3>
${fig(
  sequence(
    ['Visitor', 'Widget', 'Worker', 'Workers AI / Gemini'],
    [
      { from: 0, to: 1, text: 'question' },
      { note: 'system prompt from visible data (no payments), language', at: 1 },
      { from: 1, to: 2, text: 'POST /chat {system, messages} (no provider named)' },
      { note: 'zod check, rate limit in KV', at: 2 },
      { from: 2, to: 3, text: 'generate: Workers AI first' },
      { note: 'allowance spent or an error: the next provider (Gemini)', at: 2 },
      { from: 3, to: 2, text: 'text', back: true },
      { from: 2, to: 1, text: '{ text, provider } or { error }', back: true },
      { from: 1, to: 0, text: 'answer, or error note with Try again', back: true },
    ],
    { col: 250 },
  ),
  'Limits: 40 turns, 2000 characters per turn, 8000 for the system prompt, 1024 tokens for the answer; the widget shapes the conversation to fit. Only providers listed in ALLOWED_PROVIDERS are served.',
  900,
)}
<h3>4.5 Downloading the CV</h3>
${fig(
  sequence(
    ['Visitor', 'Dialog', 'Data layer', 'PDF'],
    [
      { from: 0, to: 1, text: 'Download CV' },
      { from: 1, to: 2, text: 'useCv: localized visible documents' },
      { note: 'buildCv(model, copy, lang); paginate A4 sheets', at: 1 },
      { from: 1, to: 0, text: 'preview sheets', back: true },
      { from: 0, to: 1, text: 'Download PDF' },
      { from: 1, to: 3, text: 'import @react-pdf/renderer (on demand)' },
      { from: 3, to: 0, text: 'file named by profile.cvFileName', back: true },
    ],
    { col: 250 },
  ),
  'Hidden roles are not in the CV because the browser cannot read them.',
  900,
)}
<h3>4.6 Switching language</h3>
<p>The visitor picks EN or VI. <code>LanguageProvider</code> updates its state, stores the choice in <code>localStorage</code> (<code>bach-cv-lang</code>) and sets
<code>&lt;html lang&gt;</code>. Components read copy with <code>useCopy</code>; <code>useContentQuery</code> re-lays <code>l10n</code> over the cached documents. No refetch happens. The first paint is
always the default language, so the static HTML and the first client render agree; the saved or browser language applies right after.</p>`,
  },
  {
    id: 'states',
    title: '5. States',
    html: `<h3>5.1 Page and maintenance gates</h3>
${fig(statesPage(), 'Everything fails open: if the switches cannot be read, the site shows.', 1180)}
<h3>5.2 Contact form and chat</h3>
${fig(statesForm(), 'Top: the contact form. Bottom: the chat session. Both keep what the visitor typed on failure.', 1180)}
<h3>5.3 Blocks that read data</h3>
<p>Every block that reads a collection goes through one component, <code>DataState</code>, so loading, empty and failed look the same on every page. The words are in
<code>src/content/copy/states.ts</code> (English and Vietnamese).</p>
${table(
  ['State', 'What shows', 'Detail'],
  [
    ['Loading', 'a skeleton the shape of the real block', '<code>LoadingBlock</code> is one <code>role="status"</code> region; the grey blocks pulse unless the visitor prefers reduced motion'],
    ['Empty', 'a card: title, a sentence, a way forward', '<code>StateNotice kind="empty"</code>; the button goes to a page that has something to see'],
    ['Failed', 'the same card with Try again', '<code>kind="error"</code>, <code>role="alert"</code>; the button reads the query again, which shows the skeleton while it runs'],
    ['Ready', 'the content', 'rendered only when there is at least one item'],
  ],
)}
<h3>5.4 Colour theme</h3>
<p>The visitor chooses <b>System</b>, <b>Light</b> or <b>Dark</b> in the header (or the phone menu). System follows the operating system and changes with it.
A choice is kept in <code>localStorage</code> (<code>bach-cv-theme</code>; System removes the key).</p>
${table(
  ['Part', 'How it works'],
  [
    ['Before the first paint', 'a small inline script in <code>&lt;head&gt;</code> reads the choice and the system setting and puts the <code>dark</code> class on <code>&lt;html&gt;</code>, so a dark visitor never sees a white flash. The CSP already allows inline scripts.'],
    ['After hydration', '<code>ThemeProvider</code> reads the saved choice (the first render says System, so the static HTML and the client agree), keeps the class in step and listens for the system setting changing.'],
    ['Colours', 'tokens in <code>globals.css</code>: <code>:root</code> for light and <code>.dark</code> for dark (background, text, card, border, the category tag pairs, the error colours, the dark panels). Components use tokens, not hex values.'],
    ['Page colours', 'each page has one accent and one tint (light values, set per page). In dark the accent is lightened and the tint is a wash of the accent over the page background, derived in CSS, so no page needs a second pair of colours.'],
    ['Stays light', 'the CV sheets (preview and skeleton) carry <code>theme-light</code>, which restores the light tokens inside them. The PDF is not themed. QR codes and screenshots keep their white background.'],
    ['Checks', 'a unit test measures the contrast of every token pair and every page colour in both themes; a browser test fails on text that is hard to read on its background in dark mode, and checks the menu, the saved choice, the system setting and the CV sheet.'],
  ],
)}`,
  },
  {
    id: 'components',
    title: '6. Shared building blocks',
    html: `${table(
  ['Block', 'What it does'],
  [
    [c('Providers'), 'persisted query client, language, tooltip, chat state, maintenance gate, scroll reveal, chat widget'],
    [c('SitePage / PageShell / PageGate'), 'colours per page, header and footer, the on / soon / hidden switch'],
    [c('MaintenanceGate'), 'replaces the whole site when maintenance is on'],
    [c('SiteHeader, ConnectMenu, MobileMenu, LanguageSwitch'), 'navigation driven by site/live; contacts grouped by <code>menuGroup</code>; drawer below 1200 px'],
    [c('Tag, BrandIcon, Button'), 'design tokens: category colours, brand marks. One <code>Button</code> for every action: filled ink is the main action (one per card or dialog), outline is the second, an underlined link is the quiet one (with an arrow when it leaves the site). 40 px high, 44 px on touch and phones.'],
    ['Focus rings', 'the global <code>:focus-visible</code> outline is kept: no control sets <code>outline-none</code> without its own ring. A browser test tabs through the pages and the dialogs and fails on any control without one.'],
    [c('DataState, StateNotice, skeletons'), 'loading, empty and failed states of every data block (see 5.3)'],
    [c('Lightbox'), 'the one image dialog: screenshots, certificates and QR codes; previous/next with the counter between them, keyboard, bottom sheet on phones'],
    [c('PointerGlow, glow, lift'), 'the hover on cards: <code>lift</code> raises the card 3px with a bigger shadow (animated; the same on every card); the head of each page lights up softly under the mouse too (<code>band-glow</code>, on the header block and the title block together); the cursor glow: <code>glow</code> is a CSS utility (a soft spotlight and a lit edge, in the page colour); <code>PointerGlow</code> is one mouse listener that writes the pointer position into the card under it. Only with a mouse (hover and a fine pointer), and off for reduced motion'],
    [c('Responsibilities'), 'the responsibilities of a role: a button and a list that slides open (<code>grid-template-rows</code> from 0fr to 1fr), lines arriving one after another; <code>inert</code> while shut, so it cannot be reached by keyboard'],
    [c('CurrentBadge'), 'the Current pill with a live dot that breathes (Resume and Home)'],
    [c('MediaBadge'), 'the always-visible corner badge ("7 screenshots", "Enlarge") on a picture that opens the dialog'],
    [c('DocumentTitle'), 'the tab title in the visitor\'s language'],
    [c('ThemeProvider, ThemeSwitch'), 'light, dark or follow the system (see 5.4); the header dropdown and a group of three buttons in the phone menu'],
    [c('RevealOnScroll'), 'fades sections in; off for reduced motion; also picks up content that arrives after mount'],
    [c('useContentQuery'), 'one collection, sorted (dates newest first, otherwise <code>sort</code>, featured first when asked), translated'],
  ],
)}`,
  },
  {
    id: 'errors',
    title: '7. Errors and fail-open behaviour',
    html: `${table(
  ['Situation', 'What the visitor sees'],
  [
    ['site/live cannot be read', 'defaults: every page and feature on, no maintenance'],
    ['a collection query fails', 'that block shows its error or empty state with Try again; the rest of the page works'],
    ['one malformed document', 'it is skipped (parsed with <code>safeParse</code>); the others show'],
    ['no translation for a field', 'the English text'],
    ['Firestore quota exhausted', 'blocks stay empty; the static shell, name and photo remain'],
    ['chat proxy empty or down', 'the panel says the assistant is not available; the input is disabled'],
    ['Workers AI allowance spent or an error', 'the Worker tries the next provider (Gemini); the visitor sees the answer'],
    ['every provider fails', 'the chat error note (rate limit, or a general error) with Try again'],
    ['an old Worker that still requires a provider', 'the app asks once more with <code>provider: "gemini"</code>, so the site and the Worker can be deployed in any order'],
    ['the email notification fails or is not configured', 'nothing: the message is already saved, and the visitor sees Message sent'],
    ['App Check token cannot be obtained', 'the request goes without a token; it only matters once enforcement is on'],
    ['chat rate limit / daily limit / network', 'a specific note and Try again; the conversation is kept'],
    ['message send fails', 'the text is kept and Try again is offered'],
    ['PDF fails to build', 'the dialog stays open; the preview still works'],
  ],
)}`,
  },
  {
    id: 'security',
    title: '8. Security',
    html: `${table(
  ['Topic', 'Decision'],
  [
    ['Data exposure', 'the rules return only <code>visible == true</code> documents; payments are read only on the Payment page and are never embedded or sent to the chat model'],
    ['Writes', 'the browser can only create a validated <code>messages</code> document; the old v1 collections (<code>config</code>, <code>user</code>, <code>message</code>) are closed (their data is kept in a backup)'],
    ['Secrets', 'no secret in <code>NEXT_PUBLIC_*</code>; model keys live in the Worker; service account files are git-ignored'],
    ['Public repository', 'no real account numbers in fixtures; <code>backup/</code> is ignored'],
    ['Headers', 'HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy and a Content-Security-Policy: scripts from the site and reCAPTCHA (plus WebAssembly for the PDF), connections to the site, Firestore, the Worker and App Check, https images, no frames except reCAPTCHA, no <code>eval</code>. It was checked against every page, the dialogs, the CV preview, the PDF download and the chat.'],
    ['App Check', 'tokens are sent with Firestore requests (reCAPTCHA Enterprise). Enforcement is <b>off</b>: when on, Firestore refuses every request without a token, reads included, so a visitor whose browser blocks reCAPTCHA would see no content. Watch the metrics first.'],
    ['Worker', 'only the providers in <code>ALLOWED_PROVIDERS</code> are served (a caller cannot spend OpenAI or Anthropic credit); answers capped at 1024 tokens; a visitor limit per minute and per day in KV, required (<code>REQUIRE_RATE_LIMIT</code>); the model key goes in a header, not in the URL; CORS names only this site; secrets are Wrangler secrets'],
    ['Email notification', 'the Worker sends nothing without the KV limit; at most 5 per visitor per hour and 40 per day for the whole site (the free email plan allows 100 a day); one email per address; a line break in the name cannot add a header'],
    ['Abuse', 'honeypot on the form; Worker limits; Firestore rules cap sizes. Nothing stops a script from writing straight to <code>messages</code> within those rules; App Check enforcement would.'],
  ],
)}
<div class="note">Maintenance and page switches are UI only. Do not use them to protect data; use <code>visible</code>.</div>`,
  },
  {
    id: 'delivery',
    title: '9. Build, deploy and environments',
    html: `${table(
  ['Item', 'Detail'],
  [
    ['Build', c('npm run build') + ': Next.js static export into <code>out/</code> (<code>output: "export"</code>, unoptimized images)'],
    ['Environment', '<code>NEXT_PUBLIC_FIREBASE_*</code> (public project identifiers), <code>NEXT_PUBLIC_CHAT_PROXY_URL</code> and, for App Check, <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> (the key ID), in <code>.env.local</code>; template in <code>.env.example</code>'],
    ['Deploy', c('npx firebase-tools deploy --only hosting') + '; rules separately with <code>--only firestore:rules</code>; the Worker with <code>npm run deploy</code> in <code>worker/</code> (needs <code>wrangler login</code>)'],
    ['Worker setup', 'a KV namespace <code>CHAT_RATE_LIMIT</code>, the <code>AI</code> binding, secrets <code>GEMINI_API_KEY</code>, <code>RESEND_API_KEY</code>, <code>NOTIFY_TO</code>; <code>GET /health</code> reports the rate limit, the providers and whether email is ready. See <code>worker/README.md</code>.'],
    ['Images', 'in the assets repository (GitHub raw): WebP resized to what they show (covers 1280 px, the avatar and profile photos 1280, screenshots and photos 1600). Payment QR codes stay PNG. The originals stay in the repository.'],
    ['CI', '<code>.github/workflows/main.yml</code>: on a push to <code>master</code> whose message contains <code>[build]</code>: typecheck, lint, unit tests, build, deploy hosting'],
    ['Rollback', 'Firebase Hosting keeps releases: roll back from the console'],
    ['Parallel builds', c('NEXT_DIST_DIR=.next-name') + ' gives a dev server its own build folder'],
  ],
)}`,
  },
  {
    id: 'tests',
    title: '10. Testing',
    html: `${table(
  ['Layer', 'Tool', 'What it covers'],
  [
    ['Unit', 'Vitest', 'schemas and helpers (fail-open defaults, <code>l10n</code>, sorting, references), formatting, chat prompt, shaping and the Worker client, CV model and pagination, form validation, page helpers, the notify and App Check helpers, and the Worker itself (provider order and fallback, caps, email, limits, CORS)'],
    ['Browser', 'Playwright', 'each page and flow in English and Vietnamese, phone layout (no sideways scroll), switches (soon, hidden, maintenance), loading, empty and failed states of every block, chat with a stubbed Worker, contact form and the email request, CV dialog, payments, a visible focus ring on every control, page metadata and translated tab titles'],
    ['Data in tests', 'a Firestore mock', '<code>mockFirestore</code> serves <code>tests/fixtures/seed.json</code> filtered by <code>visible</code>, so tests need no network; overrides change a document'],
    ['Production check', 'requests run by hand', 'after deploying rules: an anonymous visitor reads visible data and the site documents, is refused unfiltered queries, hidden documents, writes and reads of <code>messages</code>, and the v1 collections. After deploying the site: every page, dialog, the PDF and the chat run against the real policy with no violation.'],
  ],
)}
${code(`npm run typecheck && npm run lint && npm run test:unit:run
npm run test:automation          # PW_CHANNEL=chrome uses an installed Chrome`)}`,
  },
  {
    id: 'decisions',
    title: '11. Decisions and known limits',
    html: `<div class="cols">
<div class="card"><h3>Decisions</h3><ul>
<li>Static export on free hosting, data read in the browser, only the shell embedded.</li>
<li>Firestore lite, not the full SDK: no listeners needed, smaller bundle.</li>
<li>Interface copy in code, content in Firestore, translations as an overlay.</li>
<li>Per-document <code>visible</code> enforced by rules instead of filtering in the client.</li>
<li>A repository interface so the database can change.</li>
<li>The chat does not name a provider: the Worker owns the order and the fallback, so a model can change without a site release.</li>
<li>The email is a nudge after the save, never part of it.</li>
<li>One data-state component and one action vocabulary, so pages cannot drift apart.</li>
<li>The theme is a class on the root and tokens, not a second stylesheet: a new colour has two values in one place.</li>
</ul></div>
<div class="card"><h3>Known limits</h3><ul>
<li>The static HTML (search results, link previews) carries English titles and descriptions; only the tab title follows the language.</li>
<li>The illustrations on the Services page keep their own colours in dark mode (they are drawings of an app window); they sit on a tinted tile.</li>
<li>The CV and PDF omit hidden roles (TMA, EasyGDS, Freelancer).</li>
<li>Switches fall back to "on" while loading, so a maintenance screen can appear a moment after the content.</li>
<li>No Firestore emulator run for the rules; they are checked against the real project.</li>
<li>The Gemini key in the Worker is currently invalid, so the chat depends on the Workers AI daily allowance; its small free models answer Vietnamese less well than Gemini.</li>
<li>Email reaches only the Resend account's own address until a domain is verified.</li>
<li>App Check is not enforced (see Security). Messages can still be written by a script within the rules.</li>
<li>Free tiers change often (Workers AI, Resend, reCAPTCHA): check their pages before relying on a limit.</li>
<li>Skills are read in full (62 documents) even where only the listed ones are shown.</li>
</ul></div>
</div>`,
  },
];
