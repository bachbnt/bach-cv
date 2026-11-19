/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Makes the CV as a PDF on this computer, from a seed file (the same JSON shape as tests/fixtures/seed.json), with the same
 * code the site uses (buildCv and the PDF document). Nothing is read from Firestore and nothing is sent anywhere.
 *
 *   npm run cv:pdf                      make local/<name>-cv.pdf from local/cv-seed.json and open it
 *   npm run cv:pdf -- --lang vi         the Vietnamese CV
 *   npm run cv:pdf -- --seed some.json  use another seed file
 *   npm run cv:pdf -- --out my.pdf      write the PDF somewhere else
 *   npm run cv:pdf -- --no-open         do not open the PDF afterwards
 *   npm run cv:pdf -- --reset           make local/cv-seed.json again from tests/fixtures/seed.json (the old one is kept as .bak)
 *
 * local/cv-seed.json is yours: edit it by hand (a contact's label, hide a project with "visible": false or "cv": "off", the summary)
 * and run again. It is a git-ignored copy, so tests/fixtures/seed.json (which the tests read) is never touched. The first run makes it
 * from the fixture as it is.
 * The `local` folder is git-ignored. Double-click `scripts/make-cv-pdf.command` to run this without a terminal.
 */

import { createJiti } from 'jiti';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const FIXTURE = join(root, 'tests/fixtures/seed.json');
const LOCAL_SEED = join(root, 'local/cv-seed.json');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

/** The first run: a plain copy of the fixture, for you to edit. */
const makeLocalSeed = async () => {
  const seed = JSON.parse(await readFile(FIXTURE, 'utf8'));
  await mkdir(dirname(LOCAL_SEED), { recursive: true });
  await writeFile(LOCAL_SEED, `${JSON.stringify(seed, null, 2)}\n`);
};

if (flag('reset') && existsSync(LOCAL_SEED)) {
  await copyFile(LOCAL_SEED, `${LOCAL_SEED}.bak`);
  console.log(`The old seed is kept as ${LOCAL_SEED}.bak`);
}
if (flag('reset') || (!option('seed') && !existsSync(LOCAL_SEED))) {
  await makeLocalSeed();
  console.log(`Made ${LOCAL_SEED} from the fixture.`);
}

const seedPath = resolve(option('seed') ?? LOCAL_SEED);
const lang = option('lang') ?? 'en';
if (!['en', 'vi'].includes(lang))
  throw new Error(`--lang is en or vi, not ${lang}`);
const seed = JSON.parse(await readFile(seedPath, 'utf8'));

// The PDF document reads its fonts from this folder instead of the site's /fonts URL.
process.env.CV_FONT_DIR = join(root, 'public/fonts');

// jiti runs the TypeScript of the site as it is: the `@/` paths and the JSX of the PDF document.
const jiti = createJiti(`${root}/`, {
  alias: { '@': join(root, 'src') },
  jsx: { runtime: 'automatic' },
});
const { COLLECTIONS, localize, profileSchema, shellSchema } = await jiti.import(
  '@/lib/content/schema',
);
const { buildCv, cvFileName } = await jiti.import('@/lib/cv/build-cv');
const { cvCopy } = await jiti.import('@/content/copy/cv');
const { CvPdfDocument } = await jiti.import('@/components/cv/cv-pdf-document');
const { renderToBuffer } = await jiti.import('@react-pdf/renderer');
const { createElement } = await import('react');

/** What a visitor's browser reads: the documents that are `visible`, parsed with the schema. */
const visible = (name) =>
  Object.entries(seed[name] ?? {})
    .map(([id, doc]) => ({ id, ...COLLECTIONS[name].parse(doc) }))
    .filter((doc) => doc.visible);

const profile = profileSchema.parse(seed.site.profile);
const model = buildCv(
  {
    shell: localize(shellSchema.parse(seed.site.shell), lang),
    profile,
    contacts: visible('contacts'),
    experience: visible('experience'),
    education: visible('education'),
    skills: visible('skills'),
    projects: visible('projects'),
    certificates: visible('certificates'),
  },
  cvCopy[lang],
  lang,
);

const out = resolve(
  option('out') ??
    join(root, 'local', cvFileName(profile.cvFileName, model.name, 'cv.pdf')),
);
await mkdir(dirname(out), { recursive: true });
await writeFile(
  out,
  await renderToBuffer(
    createElement(CvPdfDocument, { cv: model, copy: cvCopy[lang] }),
  ),
);

console.log(
  `Contacts on the CV: ${model.contacts.map((c) => `${c.kind} ${c.value}`).join(' | ') || 'none'}`,
);
console.log(`Wrote ${out}`);

if (!flag('no-open') && process.platform === 'darwin') {
  spawn('open', [out], { detached: true, stdio: 'ignore' }).unref();
}
