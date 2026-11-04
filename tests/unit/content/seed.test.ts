/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COLLECTIONS,
  findBrokenRefs,
  liveSchema,
  profileSchema,
  settingsSchema,
  shellSchema,
  type CollectionName,
  type Content,
} from '@/lib/content/schema';
import shell from '@/content/shell.json';

// A snapshot of the Firestore data (payment accounts are fake). Refresh it from a backup when the model changes.
const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8'));

describe('seed matches the schema', () => {
  it.each(Object.keys(COLLECTIONS) as CollectionName[])(
    'every %s document parses without losing a field',
    (name) => {
      const docs = Object.entries(seed[name]) as [
        string,
        Record<string, unknown>,
      ][];
      expect(docs.length).toBeGreaterThan(0);
      for (const [id, doc] of docs) {
        const parsed = COLLECTIONS[name].parse(doc);
        expect(Object.keys(doc).sort(), `${name}/${id}`).toEqual(
          Object.keys(parsed).sort(),
        );
      }
    },
  );

  it('the single documents parse', () => {
    for (const [schema, id] of [
      [shellSchema, 'shell'],
      [liveSchema, 'live'],
      [profileSchema, 'profile'],
      [settingsSchema, 'settings'],
    ] as const) {
      expect(() => schema.parse(seed.site[id])).not.toThrow();
    }
  });

  it('has no reference to a skill or project that does not exist', () => {
    const list = (name: CollectionName) =>
      Object.entries(seed[name]).map(([id, d]) => ({ id, ...(d as object) }));
    const content = Object.fromEntries(
      (Object.keys(COLLECTIONS) as CollectionName[]).map((n) => [n, list(n)]),
    ) as unknown as Content;
    expect(findBrokenRefs(content)).toEqual([]);
  });

  it('the embedded shell file mirrors site/shell', () => {
    expect(shellSchema.parse(shell)).toEqual(
      shellSchema.parse(seed.site.shell),
    );
  });
});
