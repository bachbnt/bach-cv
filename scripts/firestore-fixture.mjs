/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Refreshes tests/fixtures/seed.json from the latest backup (backup/firestore-v2.json), so the committed snapshot of the data
 * follows Firestore. The repository is public, so payment account numbers and holder names are replaced with fake values.
 *
 *   npm run backup:firestore && npm run sync:fixture
 */

import { readFile, writeFile } from 'node:fs/promises';

const backup = JSON.parse(await readFile('backup/firestore-v2.json', 'utf8'));
const documents = backup.documents;

const ids = Object.keys(documents.payments).sort();
ids.forEach((id, i) => {
  const method = documents.payments[id];
  method.account = id === 'bidv' ? '1234567890' : `0000000${String(i).padStart(3, '0')}`;
  if (method.holder) method.holder = 'NGUYEN VAN A';
});

await writeFile('tests/fixtures/seed.json', `${JSON.stringify(documents, null, 2)}\n`);
const counts = Object.fromEntries(Object.entries(documents).map(([name, docs]) => [name, Object.keys(docs).length]));
console.log('Wrote tests/fixtures/seed.json (backed up', backup.metadata?.backedUpAt, ')', counts);
