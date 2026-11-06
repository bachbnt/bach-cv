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
  await expect(
    featured.first().getByText('Flutter', { exact: true }),
  ).toBeVisible();
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
  // every project has a cover now, so take FinHub MCP's away
  await mockFirestore(page, {}, (collection, id, doc) =>
    collection === 'projects' && id === 'finhub' ? { ...doc, cover: '' } : doc,
  );
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
  // FinHub MCP is personal and not featured, so only the grid can show it
  await expect(page.getByRole('heading', { name: 'FinHub MCP' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('heading', { name: 'Beli Coffee' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Com Chay Rop' }),
  ).toBeVisible();
  await group.getByRole('button', { name: 'Personal' }).click();
  await expect(page.getByRole('heading', { name: 'FinHub MCP' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Beli Coffee' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('heading', { name: 'Com Chay Rop' })).toHaveCount(
    0,
  );
});

test('the screenshots dialog has a row of thumbnails to pick a screenshot from', async ({
  page,
}) => {
  await page.goto('/projects');
  await page.getByRole('button', { name: '6 screenshots' }).first().click();

  const dialog = page.getByRole('dialog');
  const row = dialog.getByRole('group', { name: 'All screenshots' });
  await expect(row.getByRole('button')).toHaveCount(6);
  await expect(
    row.getByRole('button', { name: 'Go to screenshot 1' }),
  ).toHaveAttribute('aria-current', 'true');

  await row.getByRole('button', { name: 'Go to screenshot 4' }).click();
  await expect(dialog.getByText('4 of 6')).toBeVisible();
  await expect(
    row.getByRole('button', { name: 'Go to screenshot 4' }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(
    row.getByRole('button', { name: 'Go to screenshot 1' }),
  ).toHaveAttribute('aria-current', 'false');

  // the arrows and the thumbnails agree
  await page.keyboard.press('ArrowRight');
  await expect(
    row.getByRole('button', { name: 'Go to screenshot 5' }),
  ).toHaveAttribute('aria-current', 'true');
});

test('the screenshots dialog steps with buttons and arrow keys, and closes with Escape', async ({
  page,
}) => {
  await page.goto('/projects');
  await page.getByRole('button', { name: '6 screenshots' }).first().click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('1 of 6')).toBeVisible();

  await dialog.getByRole('button', { name: 'Next screenshot' }).click();
  await expect(dialog.getByText('2 of 6')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('3 of 6')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  // wraps around to the last one
  await expect(dialog.getByText('6 of 6')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('button', { name: '6 screenshots' }).first(),
  ).toBeFocused();

  // reopening starts at the first screenshot
  await page.getByRole('button', { name: '6 screenshots' }).first().click();
  await expect(page.getByText('1 of 6')).toBeVisible();
  await page.getByRole('button', { name: 'Close screenshots' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('a project that is not featured can still open its screenshots from its card', async ({
  page,
}) => {
  // take every project off the featured list: only the grid is left
  await mockFirestore(page, {}, (collection, _id, doc) =>
    collection === 'projects' ? { ...doc, highlight: null } : doc,
  );
  await page.goto('/projects');
  await expect(
    page.getByRole('heading', { name: 'Featured projects' }),
  ).toHaveCount(0);

  const card = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'DevCmd' }),
  });
  await expect(card.getByText('Featured', { exact: true })).toHaveCount(0);
  const opener = card.getByRole('button', { name: '7 screenshots' });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('1 of 7')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();

  // a project without screenshots has no button
  const beli = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Beli Coffee' }),
  });
  await expect(beli.getByRole('button', { name: /screenshot/ })).toHaveCount(0);
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

    await page.getByRole('button', { name: '7 screenshots' }).first().click();
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
    await expect(dialog.getByText(/^1 \/ \d+$/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Ảnh tiếp theo' }).click();
    await expect(dialog.getByText(/^2 \/ \d+$/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
