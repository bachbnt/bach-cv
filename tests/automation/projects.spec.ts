/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test('the Projects page lists the featured projects by rank, then all projects', async ({
  page,
}) => {
  await page.goto('/projects');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  await expect(
    page.getByRole('heading', { name: 'Featured projects' }),
  ).toBeVisible();
  // the featured cards come first, in rank order
  await expect
    .poll(async () =>
      (await page.getByRole('heading', { level: 3 }).allTextContents()).slice(
        0,
        3,
      ),
    )
    .toEqual(['VenusAI', 'Yoga Lasyn', 'DevPad']);
  const featured = page.locator('article').filter({
    has: page.getByRole('button', { name: /screenshots$/ }),
  });
  await expect(featured.first().getByText('Freelance')).toBeVisible();
  // technologies carry the skill names
  await expect(featured.first().getByText('Flutter')).toBeVisible();
  await expect(
    featured.first().getByRole('link', { name: 'App Store' }),
  ).toHaveAttribute('href', /apps\.apple\.com/);
  await expect(
    page.getByRole('heading', { name: 'All projects' }),
  ).toBeVisible();
  // a featured project is also in the grid, marked Featured
  await expect(page.getByRole('heading', { name: 'DevPad' })).toHaveCount(2);
});

test('a project without a cover gets an initials tile', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByText('FM', { exact: true })).toBeVisible();
  // DevPad has a cover, so no tile stands in for it
  await expect(page.getByText('DP', { exact: true })).toHaveCount(0);
});

test('the kind chips filter the grid', async ({ page }) => {
  await page.goto('/projects');
  const group = page.getByRole('group', { name: 'Filter projects' });
  await expect(group.getByRole('button', { name: 'All' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await group.getByRole('button', { name: 'Freelance' }).click();
  await expect(page.getByRole('heading', { name: 'Beli Coffee' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('heading', { name: 'Com Chay Rop' }),
  ).toBeVisible();
  await group.getByRole('button', { name: 'Personal' }).click();
  await expect(
    page.getByRole('heading', { name: 'Beli Coffee' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Com Chay Rop' })).toHaveCount(
    0,
  );
});

test('the screenshots dialog steps with buttons and arrow keys, and closes with Escape', async ({
  page,
}) => {
  await page.goto('/projects');
  await page.getByRole('button', { name: '6 screenshots' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Screenshot 1 of 6')).toBeVisible();

  await dialog.getByRole('button', { name: 'Next screenshot' }).click();
  await expect(dialog.getByText('Screenshot 2 of 6')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('Screenshot 3 of 6')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  // wraps around to the last one
  await expect(dialog.getByText('Screenshot 6 of 6')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('button', { name: '6 screenshots' }),
  ).toBeFocused();

  // reopening starts at the first screenshot
  await page.getByRole('button', { name: '6 screenshots' }).click();
  await expect(page.getByText('Screenshot 1 of 6')).toBeVisible();
  await page.getByRole('button', { name: 'Close screenshots' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('a page with no visible project shows the empty state', async ({
  page,
}) => {
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const body = route.request().postDataJSON?.() ?? {};
    if (
      route.request().url().includes(':runQuery') &&
      body.structuredQuery?.from?.[0]?.collectionId === 'projects'
    )
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ readTime: '2026-11-04T00:00:00.000000Z' }]),
      });
    return route.fallback();
  });
  await page.goto('/projects');
  await expect(
    page.getByRole('heading', { name: 'No projects to show yet' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All projects' })).toHaveCount(
    0,
  );
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('there is no horizontal scroll and the dialog is a bottom sheet', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);

    await page.getByRole('button', { name: '7 screenshots' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // wait for the slide-in to settle: the sheet sits on the bottom edge
    await expect
      .poll(async () => {
        const box = await dialog.boundingBox();
        return box ? Math.round(box.y + box.height) : 0;
      })
      .toBe(844);
    const box = await dialog.boundingBox();
    expect(box?.x).toBe(0);
    expect(box?.width).toBe(390);
    const radius = await dialog.evaluate(
      (el) => getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe('20px');
  });
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('the page, the chips and the dialog speak Vietnamese', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dự án');
    await expect(
      page.getByRole('heading', { name: 'Dự án nổi bật' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Tất cả dự án' }),
    ).toBeVisible();
    const group = page.getByRole('group', { name: 'Lọc dự án' });
    await expect(group.getByRole('button', { name: 'Cá nhân' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem website' }).first(),
    ).toBeVisible();

    await page
      .getByRole('button', { name: /ảnh chụp màn hình$/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/^Ảnh 1 \/ \d+$/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Ảnh tiếp theo' }).click();
    await expect(dialog.getByText(/^Ảnh 2 \/ \d+$/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
