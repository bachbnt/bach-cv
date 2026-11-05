/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * The entity diagram of the Firestore model, drawn as SVG. Field names are asserted against src/lib/content/schema.ts,
 * so the picture cannot drift from the schema.
 */

import {
  COLLECTIONS, liveSchema, profileSchema, settingsSchema, shellSchema, messageSchema,
} from '../../src/lib/content/schema.ts';


// f(name, type, ref?)  ref = the collection this field points at (drawn as a line)
const f = (name, type = '', ref = '', sub = false) => ({ name, type, ref, sub });
const SHARED = [f('visible', 'bool'), f('highlight', 'rank | null')];

const CARDS = {
  skills: { x: 490, y: 70, w: 290, layer: 'runtime', sql: 'skills', fields: [
    f('id', 'PK slug'), f('name'), f('category', 'ai|mobile|web|tools'), f('icon'), f('url'), f('listed', 'bool'),
    ...SHARED, f('sort', 'int'), f('l10n', '{ name }'),
  ] },
  experience: { x: 40, y: 70, w: 310, layer: 'runtime', sql: 'experience + 4 child tables', fields: [
    f('id', 'PK slug'), f('company'), f('shortName'), f('role'), f('kind', 'full-time|...'), f('startMonth', 'YYYY-MM'),
    f('endMonth', 'YYYY-MM | null'), f('summary'), f('tagline'), f('team'), f('logo'),
    f('bullets', 'string[]'), f('technologies', 'skill id[]', 'skills'),
    f('projects', 'object[]'),
    f('name', '', '', true), f('description', '', '', true), f('highlight', 'rank | null', '', true),
    f('projectId', 'project id', 'projects', true), f('technologies', 'skill id[]', 'skills', true),
    f('cv', 'full|compact|off'), ...SHARED, f('l10n', '{ role, summary, tagline, ... }'),
  ] },
  education: { x: 490, y: 400, w: 290, layer: 'runtime', sql: 'education + 1 child table', fields: [
    f('id', 'PK slug'), f('degree'), f('school'), f('major'), f('startMonth', 'YYYY-MM'), f('endMonth', 'YYYY-MM | null'),
    f('logo'), f('thesisTitle'), f('thesisUrl'), f('thesisSourceUrl'), f('technologies', 'skill id[]', 'skills'), f('cv', 'full|compact|off'),
    ...SHARED, f('l10n', '{ degree, major, thesisTitle }'),
  ] },
  projects: { x: 920, y: 70, w: 290, layer: 'runtime', sql: 'projects + 3 child tables', fields: [
    f('id', 'PK slug'), f('name'), f('kind', 'personal|freelance|...'), f('summary'), f('cover'), f('images', 'string[]'),
    f('startMonth', 'YYYY-MM | null'), f('endMonth', 'YYYY-MM | null'), f('technologies', 'skill id[]', 'skills'),
    f('links', 'object[]'), f('label', '', '', true), f('url', '', '', true), f('kind', '', '', true),
    ...SHARED, f('sort', 'int'), f('l10n', '{ summary }'),
  ] },
  certificates: { x: 920, y: 520, w: 290, layer: 'runtime', sql: 'certificates + 1 child table', fields: [
    f('id', 'PK slug'), f('name'), f('issuer'), f('issuedAt', 'YYYY-MM-DD'), f('image'), f('pdfUrl'), f('credentialUrl'),
    f('skills', 'skill id[]', 'skills'), ...SHARED, f('l10n', '{ name }'),
  ] },
  services: { x: 1660, y: 70, w: 290, layer: 'runtime', sql: 'services', fields: [
    f('id', 'PK slug'), f('name'), f('description'), f('art', 'app|web|oss|...'), f('starter'), ...SHARED, f('sort', 'int'),
    f('l10n', '{ name, description, starter }'),
  ] },
  contacts: { x: 1660, y: 340, w: 290, layer: 'runtime', sql: 'contacts', fields: [
    f('id', 'PK slug'), f('kind', 'email|phone|address|social'), f('platform'), f('label'), f('url'),
    f('menuGroup', 'professional|messaging|social'), ...SHARED, f('sort', 'int'), f('l10n', '{ label }'),
  ] },
  payments: { x: 1660, y: 640, w: 290, layer: 'runtime', sql: 'payments (sensitive)', fields: [
    f('id', 'PK slug'), f('name'), f('kind', 'bank|wallet'), f('holder'), f('account'), f('qr'), f('logo'),
    ...SHARED, f('sort', 'int'),
  ] },
};
const SITE = {
  shell: { x: 1290, y: 70, w: 290, layer: 'embedded', sql: 'site_doc (JSON)', title: 'site/shell', fields: [
    f('name'), f('alternateNames', 'string[]'), f('headline'), f('avatar'), f('defaultLanguage', 'en|vi'), f('languages', 'en|vi[]'),
    f('seoTitle'), f('seoDescription'), f('ogImage'), f('l10n', '{ headline, seo... }'),
  ] },
  live: { x: 1290, y: 350, w: 290, layer: 'live', sql: 'site_doc (JSON)', title: 'site/live', fields: [
    f('maintenance', '{ enabled, message }'), f('pages', '{ 7 pages }'),
    f('home … payment', 'on | soon | hidden', '', true), f('features', '{ 4 switches }'),
    f('chat, cvDownload,', 'bool', '', true), f('contactForm, connectMenu', 'bool', '', true),
  ] },
  profile: { x: 1290, y: 574, w: 290, layer: 'runtime', sql: 'site_doc (JSON)', title: 'site/profile', fields: [
    f('fullName'), f('summary'), f('location'), f('covers', 'string[]'),
    f('specialties', 'object[]'), f('name, tone, visible', '', '', true), f('cvUrl'), f('cvFileName'), f('l10n', '{ summary }'),
  ] },
  settings: { x: 1290, y: 842, w: 290, layer: 'runtime', sql: 'site_doc (JSON)', title: 'site/settings', fields: [
    f('chat', '{ botName, limits, suggestions[] }'), f('contactForm', '{ nameMax, messageMax }'),
  ] },
  messages: { x: 1290, y: 972, w: 290, layer: 'write', sql: 'messages', title: 'messages', fields: [
    f('id', 'PK auto'), f('name'), f('email'), f('topic'), f('message'), f('locale', 'en|vi'), f('createdAt', 'server time'),
  ] },
};
Object.entries(CARDS).forEach(([k, c]) => (c.title = k));

// ---- the picture can never drift from schema.ts: top-level field names must match
const top = (c) => c.fields.filter((x) => !x.sub && !x.name.includes(' ') && !x.name.includes(',')).map((x) => x.name).filter((n) => n !== 'id');
const same = (label, drawn, real) => {
  const a = [...new Set(drawn)].sort().join(), b = Object.keys(real).sort().join();
  if (a !== b) throw new Error(`${label}: drawing has [${a}] but schema.ts has [${b}]`);
};
for (const [k, c] of Object.entries(CARDS)) same(k, top(c), COLLECTIONS[k].shape);
same('live', ['maintenance', 'pages', 'features'], liveSchema.shape);
same('shell', top(SITE.shell), shellSchema.shape);
same('profile', top(SITE.profile), profileSchema.shape);
same('settings', top(SITE.settings), settingsSchema.shape);
same('messages', top(SITE.messages).filter((n) => n !== 'createdAt'), messageSchema.shape);

// ---- geometry
const HEAD = 46, ROW = 22, PAD = 12;
const all = { ...CARDS, ...Object.fromEntries(Object.entries(SITE).map(([k, v]) => [`site/${k}`, v])) };
for (const c of Object.values(all)) {
  c.h = HEAD + c.fields.length * ROW + PAD;
  c.rowY = (i) => c.y + HEAD + i * ROW + ROW / 2;
}
const rowOf = (card, name, sub = false) => card.fields.findIndex((x) => x.name === name && x.sub === sub);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LAYER = {
  embedded: ['Embedded', 'in the page at build time (the only thing that needs a build)'],
  runtime: ['Runtime', 'read by the browser when a page needs it'],
  live: ['Live switch', 'the first read, switches only'],
  write: ['Write only', 'created by the browser, never read back'],
};

let svg = '';
const card = (c) => {
  const [layerName] = LAYER[c.layer];
  svg += `<g class="er-card ${c.layer}"><rect class="er-body" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="12"/>`;
  svg += `<path class="er-head" d="M${c.x} ${c.y + HEAD} V${c.y + 12} a12 12 0 0 1 12 -12 H${c.x + c.w - 12} a12 12 0 0 1 12 12 V${c.y + HEAD} Z"/>`;
  svg += `<text class="er-title" x="${c.x + 16}" y="${c.y + 21}">${esc(c.title)}</text>`;
  svg += `<text class="er-sql" x="${c.x + 16}" y="${c.y + 38}">${esc(c.sql)}</text>`;
  svg += `<text class="er-chip" x="${c.x + c.w - 16}" y="${c.y + 21}" text-anchor="end">${layerName}</text>`;
  c.fields.forEach((fl, i) => {
    const y = c.rowY(i), ind = fl.sub ? 22 : 0;
    if (i % 2 === 1) svg += `<rect class="er-zebra" x="${c.x + 1}" y="${y - ROW / 2}" width="${c.w - 2}" height="${ROW}"/>`;
    svg += `<text class="er-fn ${fl.ref ? 'ref' : ''} ${fl.type.startsWith('PK') ? 'pk' : ''} ${fl.sub ? 'sub' : ''}" x="${c.x + 16 + ind}" y="${y + 4}">${fl.sub ? '↳ ' : ''}${esc(fl.name)}</text>`;
    svg += `<text class="er-ft ${fl.ref ? 'ref' : ''}" x="${c.x + c.w - 14}" y="${y + 4}" text-anchor="end">${esc(fl.type)}</text>`;
  });
  svg += '</g>';
};

const edge = (d, label, lx, ly, dashed = false) => {
  svg += `<path class="er-edge ${dashed ? 'dash' : ''}" d="${d}" marker-end="url(#er-arrow)"/>`;
  svg += `<text class="er-elabel" x="${lx}" y="${ly}" text-anchor="middle">${esc(label)}</text>`;
};
const L = (c) => c.x, R = (c) => c.x + c.w;
const S = CARDS.skills;

// every `skill id[]` field points at skills
const ref = (c, name, sub = false) => c.rowY(rowOf(c, name, sub));
// experience.technologies (left of skills)
edge(`M${R(CARDS.experience)} ${ref(CARDS.experience, 'technologies')} C ${R(CARDS.experience) + 40} ${ref(CARDS.experience, 'technologies')}, ${L(S) - 40} ${S.y + 90}, ${L(S)} ${S.y + 90}`,
  'technologies[]', 420, ref(CARDS.experience, 'technologies') - 8);
edge(`M${R(CARDS.experience)} ${ref(CARDS.experience, 'technologies', true)} C ${R(CARDS.experience) + 50} ${ref(CARDS.experience, 'technologies', true)}, ${L(S) - 50} ${S.y + 140}, ${L(S)} ${S.y + 140}`,
  'technologies[]', 420, ref(CARDS.experience, 'technologies', true) + 20);
// education -> skills (short, straight up)
const ex = 635;
edge(`M${ex} ${CARDS.education.y} V${S.y + S.h}`, 'technologies[]', ex + 50, (S.y + S.h + CARDS.education.y) / 2 + 4);
// projects -> skills
edge(`M${L(CARDS.projects)} ${ref(CARDS.projects, 'technologies')} C ${L(CARDS.projects) - 40} ${ref(CARDS.projects, 'technologies')}, ${R(S) + 40} ${S.y + 110}, ${R(S)} ${S.y + 110}`,
  'technologies[]', 850, ref(CARDS.projects, 'technologies') - 8);
// certificates -> skills
edge(`M${L(CARDS.certificates)} ${ref(CARDS.certificates, 'skills')} C ${L(CARDS.certificates) - 60} ${ref(CARDS.certificates, 'skills')}, ${R(S) + 60} ${S.y + 200}, ${R(S)} ${S.y + 200}`,
  'skills[]', 850, ref(CARDS.certificates, 'skills') - 8);
// experience.projects[].projectId -> projects, routed over the top
const pid = ref(CARDS.experience, 'projectId', true), topY = 48;
edge(`M${R(CARDS.experience)} ${pid} H${R(CARDS.experience) + 22} V${topY} H${L(CARDS.projects) + 40} V${CARDS.projects.y}`,
  'projects[].projectId', 666, topY - 6, true);
// live.off -> any content document

Object.values(all).forEach(card);


const DEFS = '<defs><marker id="er-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker></defs>';

export const ER = {
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1240" width="2000" role="img" aria-label="Entity diagram of the Firestore model">${DEFS}${svg}</svg>`,
  width: 2000,
  height: 1240,
  layers: LAYER,
  /** the collections and documents drawn, with their fields, for the field dictionary */
  cards: all,
};
