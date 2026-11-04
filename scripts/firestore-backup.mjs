/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Downloads every v2 collection from Firestore into backup/firestore-v2.json and the contact-form messages into backup/messages.json.
 * The backup/ folder is git-ignored: it holds payment details and visitors' emails.
 *
 *   node scripts/firestore-backup.mjs              download and write
 *   node scripts/firestore-backup.mjs --dry-run    download and only report what changed
 *
 * Restore: node scripts/firestore-restore.mjs backup/firestore-v2.json   (plan), add --apply to write.
 * Reads with the Admin SDK, so hidden (`visible: false`) documents are included. Never touches v1 (`user`, `config`, `message`).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const root = process.cwd();
const dryRun = process.argv.includes('--dry-run');
const COLLECTIONS = [
  'site',
  'skills',
  'experience',
  'education',
  'projects',
  'certificates',
  'services',
  'payments',
  'contacts',
];

const readEnv = async () => {
  const values = {};
  try {
    for (const raw of (await readFile(resolve(root, '.env'), 'utf8')).split(
      /\r?\n/,
    )) {
      const line = raw.trim();
      const i = line.indexOf('=');
      if (!line || line.startsWith('#') || i === -1) continue;
      values[line.slice(0, i).trim()] = line
        .slice(i + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // no .env: use the process environment
  }
  return { ...values, ...process.env };
};
// Timestamps are not JSON friendly: store them as ISO strings
const toPlain = (v) =>
  v instanceof Timestamp
    ? v.toDate().toISOString()
    : Array.isArray(v)
      ? v.map(toPlain)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toPlain(x)]))
        : v;
const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'));

const env = await readEnv();
const keyPath = env.GOOGLE_APPLICATION_CREDENTIALS
  ? resolve(root, env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;
const account = keyPath ? await readJson(keyPath) : null;
const projectId =
  env.FIREBASE_PROJECT_ID ??
  env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  account?.project_id;
const db = getFirestore(
  initializeApp({
    credential: account ? cert(account) : applicationDefault(),
    projectId,
  }),
);

const documents = {};
for (const name of COLLECTIONS) {
  const snap = await db.collection(name).get();
  documents[name] = Object.fromEntries(
    snap.docs.map((d) => [d.id, toPlain(d.data())]),
  );
}
const messages = Object.fromEntries(
  (await db.collection('messages').get()).docs.map((d) => [
    d.id,
    toPlain(d.data()),
  ]),
);

const file = resolve(root, 'backup/firestore-v2.json');
let previous = null;
try {
  previous = await readJson(file);
} catch {
  /* first backup */
}

const changes = [];
for (const name of COLLECTIONS) {
  const before = previous?.documents?.[name] ?? {};
  const after = documents[name];
  for (const id of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const a = JSON.stringify(before[id]),
      b = JSON.stringify(after[id]);
    if (a === b) continue;
    changes.push(
      a === undefined
        ? `+ ${name}/${id}`
        : b === undefined
          ? `- ${name}/${id}`
          : `~ ${name}/${id}`,
    );
  }
}
const counts = Object.fromEntries(
  COLLECTIONS.map((n) => [n, Object.keys(documents[n]).length]),
);
console.log(
  `Project ${projectId}. Read`,
  counts,
  `+ ${Object.keys(messages).length} message(s)`,
);
console.log(
  changes.length
    ? changes.join('\n')
    : previous
      ? 'No differences from the last backup.'
      : 'First backup.',
);
if (dryRun) {
  console.log('Dry run: nothing written.');
  process.exit(0);
}

await mkdir(resolve(root, 'backup'), { recursive: true });
await writeFile(
  file,
  `${JSON.stringify({ metadata: { source: 'Firestore v2 collections', projectId, backedUpAt: new Date().toISOString(), counts }, documents }, null, 2)}\n`,
);
await writeFile(
  resolve(root, 'backup/messages.json'),
  `${JSON.stringify(messages, null, 2)}\n`,
);
console.log(`Wrote backup/firestore-v2.json and backup/messages.json`);
