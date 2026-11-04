/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Syncs the Firestore `user` collection into the local backup file.
 *
 * Usage:
 *   node scripts/download-user-data.mjs
 *   node scripts/download-user-data.mjs --dry-run
 *
 * Reads:  Firestore user/*
 * Writes: src/data/firestore-user-backup.json  (skipped with --dry-run)
 */

import { access, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const root = process.cwd();
const isDryRun = process.argv.includes('--dry-run');
const backupPath = resolve(root, 'src/data/firestore-user-backup.json');

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const assertFileExists = async (path, envName) => {
  try {
    await access(path);
  } catch {
    throw new Error(
      `${envName} points to a missing file: ${path}. Update .env with the full path to your Firebase service account JSON.`,
    );
  }
};

const parseServiceAccount = (raw) => {
  const data = JSON.parse(raw);
  if (typeof data.private_key === 'string') {
    data.private_key = data.private_key.replace(/\\n/g, '\n');
  }
  return data;
};

const readEnv = async (path) => {
  const values = {};
  let content = '';
  try {
    content = await readFile(path, 'utf8');
  } catch {
    return values;
  }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    values[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
  return values;
};

// Firestore Timestamps are not JSON friendly, so store them as ISO strings.
const toPlain = (value) => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toPlain(item)]),
    );
  }
  return value;
};

const env = {
  ...(await readEnv(resolve(root, '.env'))),
  ...process.env,
};

let serviceAccount;
if (env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  serviceAccount = parseServiceAccount(
    Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'),
  );
} else if (env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT);
} else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
  const credentialsPath = resolve(root, env.GOOGLE_APPLICATION_CREDENTIALS);
  await assertFileExists(credentialsPath, 'GOOGLE_APPLICATION_CREDENTIALS');
  serviceAccount = await readJson(credentialsPath);
}

const projectId =
  env.FIREBASE_PROJECT_ID ??
  env.VITE_FIREBASE_PROJECT_ID ??
  serviceAccount?.project_id;

const app = initializeApp({
  credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  projectId,
});
const firestore = getFirestore(app);

const snapshot = await firestore.collection('user').get();
const documents = {};
for (const doc of snapshot.docs) {
  documents[doc.id] = toPlain(doc.data());
}

let previous = null;
try {
  previous = await readJson(backupPath);
} catch {
  // first sync: nothing to compare against
}

const changes = [];
const oldDocs = previous?.documents ?? {};
for (const name of new Set([...Object.keys(oldDocs), ...Object.keys(documents)])) {
  const before = JSON.stringify(oldDocs[name]);
  const after = JSON.stringify(documents[name]);
  if (before === after) continue;
  if (before === undefined) changes.push(`+ ${name} (new document)`);
  else if (after === undefined) changes.push(`- ${name} (removed from Firestore)`);
  else {
    const oldKeys = Object.keys(oldDocs[name] ?? {});
    const newKeys = Object.keys(documents[name] ?? {});
    const added = newKeys.filter((key) => !oldKeys.includes(key));
    const removed = oldKeys.filter((key) => !newKeys.includes(key));
    const changed = newKeys.filter(
      (key) =>
        oldKeys.includes(key) &&
        JSON.stringify(oldDocs[name][key]) !== JSON.stringify(documents[name][key]),
    );
    changes.push(
      `~ ${name}: +${added.length} -${removed.length} changed ${changed.length}` +
        [...added.map((k) => `\n    + ${k}`), ...removed.map((k) => `\n    - ${k}`), ...changed.map((k) => `\n    ~ ${k}`)].join(''),
    );
  }
}

console.log(
  `Read ${snapshot.size} documents from Firestore user/* (project ${projectId}).`,
);
console.log(changes.length ? changes.join('\n') : 'No differences from the local backup.');

if (isDryRun) {
  console.log('Dry run: backup file not written.');
  process.exit(0);
}

const backup = {
  metadata: {
    source: 'Firestore user collection',
    syncedAt: new Date().toISOString(),
    projectId,
  },
  documents,
};
await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`);
console.log(`Wrote ${backupPath}`);
