/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

type Mode = 'ok' | 'empty' | 'error' | 'hang';

/** Answers the queries of one collection by mode, on top of `mockFirestore`. Change `mode.value` to recover. */
async function serve(page: Page, collection: string) {
  const mode: { value: Mode } = { value: 'ok' };
  await mockFirestore(page);
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    const body = request.postDataJSON?.() ?? {};
    if (
      !request.url().includes(':runQuery') ||
      body.structuredQuery?.from?.[0]?.collectionId !== collection ||
      mode.value === 'ok'
    )
      return route.fallback();
    if (mode.value === 'hang') return; // never answers: the block keeps loading
    if (mode.value === 'error')
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 500, status: 'INTERNAL' } }),
      });
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ readTime: '2026-11-04T00:00:00.000000Z' }]),
    });
  });
  return mode;
}

/** Each case: where, which collection feeds it, and the headings of its empty and error cards. */
const cases = [
  {
    name: 'projects',
    path: '/projects',
    collection: 'projects',
    empty: ['No projects to show yet'],
    error: ["Projects couldn't be loaded"],
  },
  {
    name: 'certificates',
    path: '/certificates',
    collection: 'certificates',
    empty: ['No certificates to show yet'],
    error: ["Certificates couldn't be loaded"],
  },
  {
    name: 'services',
    path: '/services',
    collection: 'services',
    empty: ['No services to show yet'],
    error: ["Services couldn't be loaded"],
  },
  {
    name: 'experience',
    path: '/resume',
    collection: 'experience',
    empty: ['No experience to show yet'],
    error: ["Experience couldn't be loaded"],
  },
  {
    name: 'education',
    path: '/resume',
    collection: 'education',
    empty: ['No education to show yet'],
    error: ["Education couldn't be loaded"],
  },
  {
    name: 'skills',
    path: '/resume',
    collection: 'skills',
    empty: ['No skills to show yet', 'No core stack to show yet'],
    error: ["Skills couldn't be loaded", "The core stack couldn't be loaded"],
  },
  {
    name: 'work on Home',
    path: '/',
    collection: 'experience',
    empty: ['No roles to show yet'],
    error: ["The work history couldn't be loaded"],
  },
  {
    name: 'contact on Home',
    path: '/',
    collection: 'contacts',
    empty: ['No contact details yet'],
    error: ["The contact details couldn't be loaded"],
  },
  {
    name: 'payments',
    path: '/payment',
    collection: 'payments',
    empty: ['Payments are paused for now'],
    error: ["The payment details couldn't be loaded"],
  },
];

for (const c of cases) {
  test.describe(c.name, () => {
    test('while loading it shows a skeleton, not the word Loading', async ({
      page,
    }) => {
      const mode = await serve(page, c.collection);
      mode.value = 'hang';
      await page.goto(c.path);
      await expect(
        page.getByRole('status', { name: 'Loading' }).first(),
      ).toBeVisible();
      await expect(page.getByText(/^Loading/)).toHaveCount(0);
    });

    test('with nothing to show it shows the empty card', async ({ page }) => {
      const mode = await serve(page, c.collection);
      mode.value = 'empty';
      await page.goto(c.path);
      for (const title of c.empty)
        await expect(
          page.getByRole('heading', { name: title }).first(),
        ).toBeVisible();
    });

    test('when it fails it shows the error card and Try again brings the data back', async ({
      page,
    }) => {
      const mode = await serve(page, c.collection);
      mode.value = 'error';
      await page.goto(c.path);
      for (const title of c.error)
        await expect(
          page.getByRole('heading', { name: title }).first(),
        ).toBeVisible({ timeout: 15_000 });

      mode.value = 'ok';
      await page.getByRole('button', { name: 'Try again' }).first().click();
      await expect(page.getByRole('heading', { name: c.error[0] })).toHaveCount(
        0,
      );
    });
  });
}

test('the cards are the same card on every page', async ({ page }) => {
  const mode = await serve(page, 'certificates');
  mode.value = 'empty';
  await page.goto('/certificates');
  const certificates = page.locator('[data-state="empty"]');
  await expect(certificates).toBeVisible();
  const look = (locator: typeof certificates) =>
    locator.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.borderRadius, s.paddingTop, s.backgroundColor, s.maxWidth];
    });
  const first = await look(certificates);

  const other = await serve(page, 'projects');
  other.value = 'empty';
  await page.goto('/projects');
  await expect(page.locator('[data-state="empty"]')).toBeVisible();
  expect(await look(page.locator('[data-state="empty"]'))).toEqual(first);
});

test('in Vietnamese the error card and Try again are translated', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  const mode = await serve(page, 'projects');
  mode.value = 'error';
  await page.goto('/projects');
  await expect(
    page.getByRole('heading', { name: 'Không tải được dự án' }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
});
