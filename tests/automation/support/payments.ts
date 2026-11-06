/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8')) as {
  payments: Record<string, Record<string, unknown>>;
};

const encode = (v: unknown): Record<string, unknown> =>
  v === null || v === undefined
    ? { nullValue: null }
    : typeof v === 'boolean'
      ? { booleanValue: v }
      : typeof v === 'number'
        ? { integerValue: String(v) }
        : { stringValue: String(v) };

/**
 * Serves these payments from the browser's Firestore query, on top of `mockFirestore`.
 * Pass the documents the rules would return (only visible ones); an empty list is the paused state.
 */
export async function servePayments(
  page: Page,
  docs: Record<string, Record<string, unknown>>,
) {
  const stamp = '2026-11-04T00:00:00.000000Z';
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    const body = request.postDataJSON?.() ?? {};
    if (
      !request.url().includes(':runQuery') ||
      body.structuredQuery?.from?.[0]?.collectionId !== 'payments'
    )
      return route.fallback();
    const base =
      request
        .url()
        .match(/projects\/[^/]+\/databases\/\(default\)\/documents/)?.[0] ?? '';
    const entries = Object.entries(docs);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        entries.length
          ? entries.map(([id, d]) => ({
              document: {
                name: `${base}/payments/${id}`,
                fields: Object.fromEntries(
                  Object.entries(d).map(([k, v]) => [k, encode(v)]),
                ),
                createTime: stamp,
                updateTime: stamp,
              },
              readTime: stamp,
            }))
          : [{ readTime: stamp }],
      ),
    });
  });
}

/** Everything switched on: BIDV and MoMo highlighted, the rest as rows. */
export const allOn = () =>
  Object.fromEntries(
    Object.entries(seed.payments).map(([id, d]) => [
      id,
      {
        ...d,
        visible: true,
        highlight: id === 'bidv' ? 1 : id === 'momo' ? 2 : null,
        holder: d.holder || 'NGUYEN VAN A',
      },
    ]),
  );
