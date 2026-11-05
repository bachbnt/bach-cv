/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * The data design page: the Firestore model, how it is delivered, remote config, rules and the SQL path.
 */

import { readFileSync } from 'node:fs';
import { ER } from './er-diagram.mjs';
import { arrow, box, c, canvas, code, esc, fig, table } from './kit.mjs';

const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8'));
const countOf = (name) => {
  const docs = Object.values(seed[name]);
  return { total: docs.length, visible: docs.filter((d) => d.visible !== false).length };
};

const FIELD_NOTES = {
  visible: 'false hides the item. The Firestore rules enforce it, so a hidden item is never sent to a visitor.',
  highlight: 'Featured rank: 1 is first, null is not featured.',
  sort: 'Manual order, ascending. Collections with dates sort by their date instead.',
  l10n: 'Translations: <code>l10n.vi.&lt;field&gt;</code> overrides the same field. Only the listed fields can be translated.',
  startMonth: 'Period start, <code>YYYY-MM</code>.',
  endMonth: 'Period end, <code>YYYY-MM</code>; null means current.',
  technologies: 'Ids of documents in <code>skills</code>.',
  skills: 'Ids of documents in <code>skills</code>.',
  projectId: 'Optional id of a document in <code>projects</code>.',
  listed: 'false: a tag only, not shown as a chip in the Skills section.',
  category: 'Colours the skill: ai, mobile, web or tools.',
  cv: 'How the entry appears in the CV: full, compact or off.',
  shortName: 'Short label used in "Used at FPT · MoMo".',
  tagline: 'One line shown on the Home page and in lists.',
  issuedAt: 'Issue date, <code>YYYY-MM-DD</code>.',
  pdfUrl: 'A PDF served as application/pdf, so it opens in the browser instead of downloading.',
  art: 'Which CSS-drawn illustration the service card shows.',
  starter: 'The first sentence put into the contact form when this topic is chosen.',
  menuGroup: 'Groups the link in the Connect menu: professional, messaging or social.',
  platform: 'Icon key, for example <code>linkedin</code>.',
  holder: 'Account holder name.',
  qr: 'QR image path; empty means no QR.',
  pages: 'Each page is <code>on</code>, <code>soon</code> or <code>hidden</code>.',
  features: 'Switches: chat, cvDownload, contactForm, connectMenu.',
  maintenance: '<code>enabled</code> covers the whole site; <code>message</code> and <code>l10n.vi.message</code> are shown.',
  defaultLanguage: 'The language used on the first paint.',
  languages: 'The languages the site offers.',
  alternateNames: 'Other names people search for (full name, nickname). Shown in the footer and in the page\'s schema.org Person, so search engines connect them to the site.',
  seoTitle: 'Page title and Open Graph title.',
  seoDescription: 'Meta description.',
  createdAt: 'Server time, set by the rules check <code>createdAt == request.time</code>.',
};

const dictionary = () =>
  Object.entries(ER.cards)
    .map(([key, card]) => {
      const rows = card.fields.map((f) => [
        `<code>${esc((f.sub ? '↳ ' : '') + f.name)}</code>`,
        esc(f.type || 'text'),
        FIELD_NOTES[f.name] ?? '',
      ]);
      const n = seed[key] ? countOf(key) : null;
      const size = n ? ` <span class="tag">${n.total} documents, ${n.visible} visible</span>` : '';
      return `<h3>${esc(card.title)}${size} <span class="tag">${esc(ER.layers[card.layer][0])}</span></h3>${table(['Field', 'Type', 'Meaning'], rows)}`;
    })
    .join('');

// ---------------------------------------------------------------- the delivery diagram
const delivery = () => {
  const cv = canvas(1180, 330);
  const a = box(30, 20, 300, 'Build time', ['npm run build', 'reads src/content/shell.json', 'writes static HTML'], 'ink');
  const b = box(440, 20, 300, 'First paint (static HTML)', ['name, headline, avatar, SEO', 'page frame and interface copy', 'no wait for Firestore'], 'ink');
  const s1 = box(850, 20, 300, 'Firestore: site/shell', ['mirrored in shell.json', 'change it, then rebuild'], 'grey');
  const l = box(440, 170, 300, 'Run time, step 1', ['site/live: page state, features,', 'maintenance (about every minute)'], 'green');
  const r = box(850, 170, 300, 'Run time, step 2', ['collections the page needs,', 'where visible == true', 'cached 5 minutes + localStorage'], 'blue');
  const p = box(30, 170, 300, 'Payments', ['only read while the', 'Payment page is on', 'never in the HTML'], 'red');
  [a, b, s1, l, r, p].forEach((x) => cv.add(x.svg));
  cv.add(arrow('M330 70 H440', 'embeds', 385, 62));
  cv.add(arrow('M850 70 H740', '', 0, 0));
  cv.add(arrow('M590 20 V8 H1000 V20', '', 0, 0, 'dash'));
  cv.add(arrow('M590 110 V170', 'hydrates', 625, 148));
  cv.add(arrow('M740 215 H850', 'then', 795, 207));
  cv.add(arrow('M440 215 H330', 'if on', 385, 207, 'red'));
  return cv.end();
};

export const dataDesign = () => {
  const layerLegend = Object.entries(ER.layers)
    .map(([k, [n, d]]) => {
      const col = { embedded: 'var(--c-ink)', runtime: 'var(--c-blue)', live: 'var(--c-green)', write: 'var(--c-grey)' }[k];
      return `<li><span class="sw" style="background:${col}"></span><b>${esc(n)}</b> ${esc(d)}</li>`;
    })
    .join('');

  return [
    {
      id: 'principles',
      title: '1. Principles',
      html: `<p>The data lives in Firestore today and is shaped so that it can move to SQL without changing the app. The contract is
${c('src/lib/content/schema.ts')} (Zod); the app only talks to the data through ${c('src/lib/content/repository.ts')}.</p>
${table(
  ['#', 'Rule', 'Why it helps a SQL move'],
  [
    ['1', 'One collection is one table. A document id is a slug and the primary key.', c('id TEXT PRIMARY KEY')],
    ['2', 'A reference to another document is always its id, never a path.', 'becomes a foreign key'],
    ['3', 'One type per field. No unions, no "1" next to 1.', 'one type per column'],
    ['4', 'No missing fields: null for numbers, dates and ranks; empty text for strings. Every field is written.', c('NOT NULL DEFAULT \'\'')],
    ['5', 'An array of ids is a many-to-many table with a position. An array of strings or objects is a child table with a position. Nothing nests deeper.', c('experience_skill, experience_bullet')],
    ['6', 'Dates are strings: <code>YYYY-MM</code> for periods, <code>YYYY-MM-DD</code> for days. No Timestamp in content.', 'sorts correctly as text'],
    ['7', 'Field names are lowerCamelCase and avoid SQL words: <code>sort</code>, <code>category</code>, <code>startMonth</code>, <code>menuGroup</code>.', 'no quoting'],
    ['8', 'Translations are an overlay on the same field names, not a second copy of the document.', 'an l10n table'],
  ],
)}
<p>Simplifications against the first version: no per-field visibility flags (an empty field is simply not shown), no <code>pages</code> or
<code>i18n</code> collections (interface copy lives in code), and no manual <code>order</code> for data that has dates.</p>`,
    },
    {
      id: 'er',
      title: '2. Entity diagram',
      html: `<p>Thirteen collections and documents. Red arrows are references by id: every <code>skill id[]</code> points at
${c('skills')}, which is how "Used at FPT · MoMo" is computed instead of typed. The dashed line is
${c('experience.projects[].projectId')}. The header colour is the delivery layer.</p>
<ul class="legend">${layerLegend}</ul>
${fig(ER.svg, 'Scroll sideways to see every card. Generated from the schema: the build fails if a drawn field is not in schema.ts.', 1180)}`,
    },
    {
      id: 'delivery',
      title: '3. How the data reaches the page',
      html: `<p>Only ${c('site/shell')} is embedded when the site is built. Everything else is read in the browser with
${c('firebase/firestore/lite')} (one-shot reads, no listeners) and cached by TanStack Query.</p>
${fig(delivery(), 'The first paint never waits for Firestore; the data blocks fill in about a second later.', 1180)}
${table(
  ['Layer', 'Documents', 'Read', 'A change shows'],
  [
    ['Embedded', c('site/shell'), 'at build', 'after a rebuild and deploy'],
    ['Live', c('site/live'), 'first, then about every 60 s and when the tab regains focus', 'within about a minute'],
    ['Runtime', 'the 8 content collections, ' + c('site/profile') + ', ' + c('site/settings'), 'when a page needs them; cached 5 minutes and in localStorage (24 h)', 'within about 5 minutes'],
    ['Write only', c('messages'), 'never read back', '-'],
  ],
)}`,
    },
    {
      id: 'dictionary',
      title: '4. Field dictionary',
      html: `<p>Counts come from the test snapshot of the data (${c('tests/fixtures/seed.json')}).</p>${dictionary()}`,
    },
    {
      id: 'remote',
      title: '5. Remote config',
      html: `<p>Edit a document in the Firebase console; the site follows without a build.</p>
${table(
  ['You set', 'The site does'],
  [
    [c('visible: false') + ' on any content document', 'the item disappears; the rules stop returning it, so it is not downloadable either'],
    [c('highlight: 1, 2, 3') + ' (projects, payments, skills)', 'featured first, in rank order'],
    [c('site/live.pages.payment = "soon"'), 'the menu shows Payment with a Soon badge; the URL shows Coming soon'],
    [c('site/live.pages.payment = "hidden"'), 'the menu entry goes; the URL shows the 404 screen'],
    [c('site/live.features.chat = false'), 'the floating button, the Ask BB Bot buttons and the chat card disappear'],
    [c('site/live.features.cvDownload = false'), 'the Download CV buttons disappear'],
    [c('site/live.features.contactForm = false'), 'the form is replaced by a short note'],
    [c('site/live.features.connectMenu = false'), 'the Connect button disappears'],
    [c('site/live.maintenance.enabled = true'), 'the whole site is replaced by a maintenance screen with your message (and Vietnamese in <code>l10n.vi.message</code>)'],
    [c('l10n.vi.summary') + ' etc.', 'the Vietnamese text for that field'],
  ],
)}
<div class="note">A hidden <em>page</em> is a UI switch: its content is still in the static files. Sensitive data is protected by <code>visible</code> and the
rules, and payments are never embedded.</div>
<p>All switches fail open: if ${c('site/live')} cannot be read, every page and feature is on and maintenance is off.</p>`,
    },
    {
      id: 'i18n',
      title: '6. Languages',
      html: `<p>English is the base text in every document. A document may carry an overlay for Vietnamese:</p>
${code(`experience/fpt-software
  role: "Team Lead"
  summary: "Own delivery of the FPT-scope functions, ..."
  l10n:
    vi:
      role: "Trưởng nhóm (Team Lead)"
      summary: "Chịu trách nhiệm giao các chức năng thuộc phạm vi FPT, ..."`)}
<p>${c('localize(doc, lang)')} lays the overlay over the base; a field with no translation keeps the English text. The schema lists which fields are
translatable per collection (a key outside the list is dropped), so a typo cannot silently do nothing. Interface copy is separate:
it lives in ${c('src/content/copy/*.ts')} as <code>defineCopy(en, vi)</code>.</p>`,
    },
    {
      id: 'rules',
      title: '7. Access rules',
      html: `<p>${c('firestore.rules')}, deployed to the project. The old site's collections (config, user, message) are closed to browsers; their data is kept.</p>
${table(
  ['Path', 'Browser can', 'Condition'],
  [
    [c('site/shell|live|profile|settings'), 'read', 'always; never write'],
    [c('skills experience education projects certificates services payments contacts'), 'get, list', c('resource.data.visible == true') + ': the query must include <code>where(\'visible\', \'==\', true)</code> or the whole query is rejected'],
    [c('messages'), 'create only', 'only name, email, topic, message, locale, createdAt; name 1-100, email format and ≤ 254, message 1-1000, topic ≤ 40, locale en|vi, <code>createdAt == request.time</code>'],
    ['everything else', 'nothing', 'denied'],
  ],
)}
<p>Verified against the real project as an anonymous visitor: visible queries succeed; a query that could return hidden payments is rejected;
a hidden payment cannot be read by id; writes to content and reads of messages are denied; invalid messages are rejected; the old v1 collections are denied.
The browser queries have no <code>orderBy</code> (it would need a composite index); lists are sorted in memory.</p>`,
    },
    {
      id: 'sql',
      title: '8. Moving to SQL',
      html: `<p>The tables are in ${c('docs/schema.sql')} (SQLite syntax, only types Postgres also has). The mapping from a document is mechanical:</p>
${table(
  ['Firestore', 'SQL'],
  [
    ['camelCase field', 'snake_case column'],
    ['boolean', 'INTEGER 0/1 (BOOLEAN in Postgres)'],
    ['array of skill ids', c('<entity>_skill(<entity>_id, skill_id, pos)')],
    ['array of strings or objects', 'child table with <code>pos</code>'],
    ['l10n overlay', c('l10n(collection, id, lang, field, value)') + ', arrays as JSON text'],
    ['site/shell, live, profile, settings', c('site_doc(id, data)') + ' as JSON; never joined'],
    ['"Used at ..." (derived in code)', 'the view ' + c('skill_usage')],
  ],
)}
<p>What changes: the rules disappear, so only a server may read the tables and it always filters <code>visible = 1</code>. The browser cannot hold
database credentials, so every run-time read needs a small read API (for example a Worker with D1). Only <code>site/shell</code> is read at build.
The app code is unchanged because it depends on ${c('ContentRepository')}, not on Firestore.</p>
<p>This path was proven on the real data before the design folder was retired: every document loaded into SQLite and read back identically, and the
SQL view for skill usage gave the same result as the code.</p>`,
    },
    {
      id: 'cost',
      title: '9. Reads and caching',
      html: `<p>Each document returned is one billed read (free tier: 50,000 reads a day). Measured on the live site, one parallel batch per page:</p>
${table(
  ['Page', 'Firestore calls', 'About'],
  [
    ['Home', 'site/live, site/profile, contacts, skills, experience, projects', '86 reads'],
    ['Resume', '+ education', 'about 80-90 reads'],
    ['Projects', 'live, profile, contacts, skills, projects', 'about 80 reads'],
  ],
)}
${table(
  ['Query', 'staleTime', 'Other'],
  [
    [c('site/live'), '60 s', 'refetch when the tab regains focus'],
    ['profile, settings, collections', '5 minutes', 'persisted to localStorage for 24 h (payments are never persisted); bump the cache version when the schema changes'],
  ],
)}
<p>Returning visitors read from the persisted cache and only refetch what is stale. Idea for later: load blocks below the fold when they near the
viewport, load the Connect menu on open, and read only <code>listed</code> skills on Home.</p>`,
    },
    {
      id: 'ops',
      title: '10. Operations',
      html: `${table(
  ['Task', 'How'],
  [
    ['Back up the data', c('npm run backup:firestore') + ' writes <code>backup/firestore-v2.json</code> (every v2 collection, hidden items included) and <code>backup/messages.json</code>. The folder is git-ignored: it holds payment details and visitors\' emails.'],
    ['Restore', c('npm run restore:firestore -- backup/firestore-v2.json') + ' prints a plan; add <code>--apply</code> to write. It overwrites the backed-up documents and deletes extra ones in v2 collections; v1 and messages are never touched.'],
    ['Deploy rules', c('npx firebase-tools deploy --only firestore:rules') + ' (changes production; back up first).'],
    ['Refresh the test snapshot', c('npm run sync:fixture') + ' copies the latest backup to <code>tests/fixtures/seed.json</code> and replaces real payment accounts with fake ones (the repository is public).'],
    ['Add images', 'put them in the assets repository as WebP, resized to what they show (about 1600 px at most; covers and the avatar 1280), and paste the raw URL into the document. Payment QR codes stay PNG so they stay scannable.'],
  ],
)}
<h3>Example: a document and the switches</h3>
${code(`site/live
  maintenance: { enabled: false, message: "", l10n: {} }
  pages:       { home: "on", about: "on", resume: "on", projects: "on",
                 certificates: "on", services: "on", payment: "on" }
  features:    { chat: true, cvDownload: true, contactForm: true, connectMenu: true }

payments/bidv
  name: "BIDV", kind: "bank", holder: "...", account: "...", qr: "https://...",
  visible: true, highlight: 1, sort: 10`)}`,
    },
  ];
};
