/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { mockImages } from './support/images';

// A browser that visited before the Projects page had its filters kept `site/live` without `projects`. When it comes back, the page opens
// all the same: what the cache lacks is filled with the defaults.
test('the Projects page opens with a `site/live` kept by an older version of the site', async ({
  page,
}) => {
  await mockFirestore(page);
  await mockImages(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const now = Date.now();
    localStorage.setItem(
      'bach-cv-query',
      JSON.stringify({
        timestamp: now,
        buster: 'v2-3',
        clientState: {
          mutations: [],
          queries: [
            {
              queryKey: ['site', 'live'],
              queryHash: '["site","live"]',
              state: {
                data: {
                  pages: {},
                  features: {},
                  prefs: {
                    skin: { off: [], default: '', force: '' },
                    theme: { off: [], default: '', force: '' },
                    language: { off: [], default: '', force: '' },
                  },
                },
                dataUpdateCount: 1,
                dataUpdatedAt: now,
                error: null,
                errorUpdateCount: 0,
                errorUpdatedAt: 0,
                fetchFailureCount: 0,
                fetchFailureReason: null,
                fetchMeta: null,
                isInvalidated: false,
                status: 'success',
                fetchStatus: 'idle',
              },
            },
          ],
        },
      }),
    );
  });
  await page.goto('/projects');
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeVisible();
  expect(errors).toEqual([]);
});
