/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Puts a backup made by firestore-backup.mjs back into Firestore (v2 collections only).
 *
 *   node scripts/firestore-restore.mjs backup/firestore-v2.json            plan only
 *   node scripts/firestore-restore.mjs backup/firestore-v2.json --apply    write, then verify
 *
 * Every document in the backup overwrites the live one; documents that exist live but not in the backup are deleted.
 * Never touches v1 (`user`, `config`, `message`) or `messages`.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const root = process.cwd();
const [file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const apply = process.argv.includes('--apply');
if (!file)
  throw new Error('usage: firestore-restore.mjs <backup.json> [--apply]');

const envText = await readFile(resolve(root, '.env'), 'utf8').catch(() => '');
const keyLine = envText
  .split(/\r?\n/)
  .find((l) => l.startsWith('GOOGLE_APPLICATION_CREDENTIALS='));
const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  (keyLine
    ? keyLine
        .slice(keyLine.indexOf('=') + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')
    : null);
const account = keyPath
  ? JSON.parse(await readFile(resolve(root, keyPath), 'utf8'))
  : null;
const db = getFirestore(
  initializeApp({
    credential: account ? cert(account) : applicationDefault(),
    projectId: account?.project_id,
  }),
);

const backup = JSON.parse(await readFile(resolve(root, file), 'utf8'));
const PROTECTED = ['user', 'config', 'message', 'messages'];
const plan = [];
for (const [name, docs] of Object.entries(backup.documents)) {
  if (PROTECTED.includes(name)) throw new Error(`refusing to restore ${name}`);
  const live = new Set((await db.collection(name).get()).docs.map((d) => d.id));
  const remove = [...live].filter((id) => !(id in docs));
  plan.push({ name, docs, remove });
  console.log(
    `${name.padEnd(13)} restore ${String(Object.keys(docs).length).padStart(3)}  delete ${String(remove.length).padStart(3)}`,
  );
}
if (!apply) {
  console.log(
    `\nPlan only (backup from ${backup.metadata?.backedUpAt}). Add --apply to write.`,
  );
  process.exit(0);
}

const ops = plan.flatMap(({ name, docs, remove }) => [
  ...Object.entries(docs).map(([id, data]) => ({
    set: true,
    ref: db.collection(name).doc(id),
    data,
  })),
  ...remove.map((id) => ({ set: false, ref: db.collection(name).doc(id) })),
]);
for (let i = 0; i < ops.length; i += 400) {
  const batch = db.batch();
  for (const op of ops.slice(i, i + 400)) {
    if (op.set) batch.set(op.ref, op.data);
    else batch.delete(op.ref);
  }
  await batch.commit();
}
let bad = 0;
for (const { name, docs } of plan) {
  const got = (await db.collection(name).get()).size;
  const ok = got === Object.keys(docs).length;
  if (!ok) bad++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(13)} ${got}/${Object.keys(docs).length}`,
  );
}
process.exit(bad ? 1 : 0);
