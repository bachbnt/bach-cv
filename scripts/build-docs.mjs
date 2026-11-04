/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Builds docs/data-design.html and docs/detail-design.html (static pages, no network, no libraries).
 * The entity diagram is drawn from the schema and fails if a drawn field is not in src/lib/content/schema.ts.
 *
 * Usage: npm run docs
 */

import { writeFileSync } from 'node:fs';
import { dataDesign } from './docs/data-design.mjs';
import { detailDesign } from './docs/detail-design.mjs';
import { page } from './docs/kit.mjs';

const other = (href, label) => `<a href="${href}">${label}</a>`;

writeFileSync(
  'docs/data-design.html',
  page({
    title: 'bach-cv: data design',
    lead: 'The Firestore model behind the site: what is stored, how it reaches the page, how remote config works, who may read what, and how it moves to SQL.',
    sections: dataDesign(),
    other: other('detail-design.html', 'Detail design') + other('schema.sql', 'schema.sql'),
  }),
);
writeFileSync(
  'docs/detail-design.html',
  page({
    title: 'bach-cv: detail design',
    lead: 'How the site is built: context, architecture, the main flows, states, shared blocks, errors, security, delivery and tests.',
    sections: detailDesign(),
    other: other('data-design.html', 'Data design') + other('schema.sql', 'schema.sql'),
  }),
);
console.log('wrote docs/data-design.html and docs/detail-design.html');
