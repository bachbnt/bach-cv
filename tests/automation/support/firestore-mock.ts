/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

type Value = Record<string, unknown>;
type Seed = { site: Record<string, unknown> } & Record<
  string,
  Record<string, Record<string, unknown>>
>;

const seed = JSON.parse(
  readFileSync('tests/fixtures/seed.json', 'utf8'),
) as Seed;

/** A JS value as a Firestore REST `Value`. */
const encode = (v: unknown): Value => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number')
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(v).map(([k, x]) => [k, encode(x)]),
      ),
    },
  };
};

const fieldsOf = (doc: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(doc).map(([k, v]) => [k, encode(v)]));
const stamp = '2026-11-04T00:00:00.000000Z';

/**
 * Answers the browser's Firestore calls from the seed, the way the rules would:
 * a collection query returns only `visible` documents. Tests stay deterministic and never touch the network.
 * Pass `overrides` to change a document, for example `{ 'site/live': { pages: { payment: 'soon' } } }`.
 * Pass `patch` to change documents of a collection as they are served, for example to take a flag off a project.
 */
export async function mockFirestore(
  page: Page,
  overrides: Record<string, Record<string, unknown>> = {},
  patch?: (
    collection: string,
    id: string,
    doc: Record<string, unknown>,
  ) => Record<string, unknown>,
) {
  const singles = (path: string): Record<string, unknown> | undefined => {
    const [collection, id] = path.split('/');
    if (overrides[path]) return overrides[path];
    return collection === 'site'
      ? (seed.site[id] as Record<string, unknown>)
      : seed[collection]?.[id];
  };

  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const base =
      (url.match(/\/projects\/([^/]+)\/databases\/\(default\)\/documents/) ??
        [])[0] ?? '';
    const body = request.postDataJSON?.() ?? {};
    const json = (data: unknown) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });

    if (url.includes(':runQuery')) {
      const name = body.structuredQuery.from[0].collectionId as string;
      const docs = Object.entries(seed[name] ?? {}).filter(
        ([, d]) => (d as { visible?: boolean }).visible === true,
      );
      return json(
        docs.length
          ? docs.map(([id, d]) => ({
              document: {
                name: `${base}/${name}/${id}`,
                fields: fieldsOf(
                  patch
                    ? patch(name, id, d as Record<string, unknown>)
                    : (d as Record<string, unknown>),
                ),
                createTime: stamp,
                updateTime: stamp,
              },
              readTime: stamp,
            }))
          : [{ readTime: stamp }],
      );
    }

    if (url.includes(':batchGet')) {
      const names = body.documents as string[];
      return json(
        names.map((full) => {
          const path = full.split('/documents/')[1];
          const data = singles(path);
          return data
            ? {
                found: {
                  name: full,
                  fields: fieldsOf(data),
                  createTime: stamp,
                  updateTime: stamp,
                },
                readTime: stamp,
              }
            : { missing: full, readTime: stamp };
        }),
      );
    }

    // writes (the contact form) succeed
    return json({ writeResults: [{ updateTime: stamp }], commitTime: stamp });
  });
}
