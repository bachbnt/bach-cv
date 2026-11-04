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
    box(430, 150, 320, 'Browser: the static app', ['Next.js 16 pages, React 19', 'TanStack Query + localStorage cache', 'Firestore lite (one-shot reads)', '@react-pdf/renderer (on demand)'], 'ink'),
    box(30, 30, 280, 'Firebase Hosting', ['serves out/ (static files)', 'cleanUrls, security headers'], 'blue'),
    box(430, 330, 320, 'Firestore (bachbntdev)', ['v2 collections + site documents', 'rules: visible == true, create-only messages'], 'amber'),
    box(870, 30, 280, 'Cloudflare Worker', ['chat proxy: validates, rate-limits', 'keeps the model API keys'], 'violet'),
    box(870, 190, 280, 'Model providers', ['Gemini, OpenAI, Anthropic'], 'grey'),
    box(30, 230, 280, 'GitHub raw + jsDelivr', ['project and certificate images', 'certificate PDFs (jsDelivr)'], 'grey'),
    box(870, 330, 280, 'Owner: Firebase console', ['edits documents and switches', 'scripts: backup and restore'], 'green'),
  ];
  items.forEach((b) => cv.add(b.svg));
  cv.add(arrow('M310 85 C360 85 380 150 430 175', 'HTML, JS, CSS', 360, 118));
  cv.add(arrow('M590 242 V330', 'read visible, create message', 700, 296));
  cv.add(arrow('M750 190 C800 150 830 100 870 90', 'POST /chat', 818, 128));
  cv.add(arrow('M1010 120 V190', '', 0, 0));
  cv.add(arrow('M430 245 C380 250 340 255 310 262', 'images, PDFs', 372, 246));
  cv.add(arrow('M870 365 H750', 'edit data', 810, 357, 'red'));
  return cv.end();
};

const layers = () => {
  const cv = canvas(1180, 420);
  const top = box(40, 20, 540, 'src/app', ['routes, layout, metadata, global CSS', 'each page: <PageShell> + page components'], 'ink');
  const comp = box(40, 118, 540, 'src/components', ['pages and features (about, resume, projects, ...)', 'ui/ = shadcn, chat/, cv/, lightbox/', "'use client' only on leaves"], 'ink');
  const q = box(40, 238, 540, 'src/lib/query', ['query keys, options, useContentQuery/useProfileQuery', 'staleTime, select (sort + localize)'], 'blue');
  const content = box(40, 328, 540, 'src/lib/content', ['schema.ts (contract), repository.ts (interface)', 'firestore-lite.ts (adapter), shell.ts'], 'amber');
  const i18n = box(680, 20, 460, 'src/lib/i18n + src/content/copy', ['language.tsx (state), define-copy.ts, copy.ts', 'copy/*.ts: defineCopy(en, vi) per page'], 'green');
  const hooks = box(680, 118, 460, 'src/hooks and src/lib', ['use-live, use-clipboard', 'format.ts, pages.ts, chat/, cv/'], 'grey');
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
    ['Firebase Hosting', 'serves <code>out/</code>', 'HTML revalidates every load; <code>/_next/static</code> is cached for a year; security headers (HSTS, X-Frame-Options DENY, nosniff).'],
    ['Firestore', 'content, switches, contact messages', 'free tier; protected by rules, not by hiding the URL'],
    ['Cloudflare Worker', 'chat proxy', 'validates the request, rate-limits, keeps provider keys. Provider is hard-coded to <code>gemini</code> in the app.'],
    ['GitHub raw / jsDelivr', 'images and PDFs', 'PDFs go through jsDelivr so they open in the browser'],
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
    [c('src/lib/chat'), 'Worker client, system prompt builder, message shaping, suggestions'],
    [c('src/lib/cv'), 'builds the CV model from the data, paginates it for A4'],
    [c('scripts'), 'Firestore backup and restore (Admin SDK, run by hand)'],
    [c('worker'), 'the chat proxy (Wrangler project)'],
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
<p>Header and menus read ${c('site/live')} and ${c('contacts')} on every page. The chat widget and the language switch are mounted for the whole site.</p>`,
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
      { from: 0, to: 3, text: 'read site/live' },
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
    ['Visitor', 'Form', 'Firestore'],
    [
      { from: 0, to: 1, text: 'type, choose a topic chip' },
      { note: 'validate with messageSchema; honeypot', at: 1 },
      { from: 1, to: 2, text: 'addDoc messages (createdAt = server time)' },
      { note: 'rules check fields, sizes, email, locale', at: 2 },
      { from: 2, to: 1, text: 'ok or permission-denied', back: true },
      { from: 1, to: 0, text: 'Message sent, or failed with text kept', back: true },
    ],
    { col: 280 },
  ),
  'A filled honeypot pretends success and sends nothing. The message locale is the visitor language.',
  700,
)}
<h3>4.4 Asking BB Bot</h3>
${fig(
  sequence(
    ['Visitor', 'Widget', 'Worker', 'Model'],
    [
      { from: 0, to: 1, text: 'question' },
      { note: 'system prompt from visible data (no payments), language', at: 1 },
      { from: 1, to: 2, text: 'POST /chat {provider, system, messages}' },
      { note: 'zod check, rate limit', at: 2 },
      { from: 2, to: 3, text: 'generate' },
      { from: 3, to: 2, text: 'text', back: true },
      { from: 2, to: 1, text: '{ text } or { error }', back: true },
      { from: 1, to: 0, text: 'answer, or error note with Try again', back: true },
    ],
    { col: 250 },
  ),
  'Limits: 40 turns, 2000 characters per turn, 8000 for the system prompt; the widget shapes the conversation to fit.',
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
${fig(statesForm(), 'Top: the contact form. Bottom: the chat session. Both keep what the visitor typed on failure.', 1180)}`,
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
    [c('Tag, BrandIcon, Button'), 'design tokens: category colours, brand marks, 40/48 px buttons'],
    [c('Lightbox'), 'image dialog with previous/next, counter, keyboard, bottom sheet on phones'],
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
    ['Writes', 'the browser can only create a validated <code>messages</code> document'],
    ['Secrets', 'no secret in <code>NEXT_PUBLIC_*</code>; model keys live in the Worker; service account files are git-ignored'],
    ['Public repository', 'no real account numbers in fixtures; <code>backup/</code> is ignored'],
    ['Headers', 'HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy'],
    ['Abuse', 'honeypot on the form; Worker rate limits; Firestore rules cap sizes'],
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
    ['Environment', '<code>NEXT_PUBLIC_FIREBASE_*</code> (public project identifiers) and <code>NEXT_PUBLIC_CHAT_PROXY_URL</code>, in <code>.env.local</code>; template in <code>.env.example</code>'],
    ['Deploy', c('npx firebase-tools deploy --only hosting') + '; rules separately with <code>--only firestore:rules</code>'],
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
    ['Unit', 'Vitest', 'schemas and helpers (fail-open defaults, <code>l10n</code>, sorting, references), formatting, chat prompt and shaping, CV model and pagination, form validation, page helpers'],
    ['Browser', 'Playwright', 'each page and flow in English and Vietnamese, phone layout (no sideways scroll), switches (soon, hidden, maintenance), chat with a stubbed Worker, contact form, CV dialog, payments'],
    ['Data in tests', 'a Firestore mock', '<code>mockFirestore</code> serves <code>tests/fixtures/seed.json</code> filtered by <code>visible</code>, so tests need no network; overrides change a document'],
    ['Production check', 'a script run by hand', 'an anonymous visitor reads visible data, is refused hidden data and writes, and v1 stays readable'],
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
</ul></div>
<div class="card"><h3>Known limits</h3><ul>
<li>The browser tab title is always English (static pages).</li>
<li>The CV and PDF omit hidden roles (TMA, EasyGDS, Freelancer).</li>
<li>Switches fall back to "on" while loading, so a maintenance screen can appear a moment after the content.</li>
<li>No Firestore emulator run for the rules; they are checked against the real project.</li>
<li>The chat provider is hard-coded to <code>gemini</code>.</li>
<li>Skills are read in full (62 documents) even where only the listed ones are shown.</li>
</ul></div>
</div>`,
  },
];
