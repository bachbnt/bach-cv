/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore, interceptCollection } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
});

const entryOf = (page: Page, name: string) =>
  page.locator('article').filter({
    has: page.getByRole('heading', { name, exact: true }),
  });

test.describe('Projects', () => {
  test('lists the featured projects by rank, then all projects, with the same details as Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    const titles = page.getByRole('heading', { level: 3 });
    await expect(titles.nth(0)).toHaveAccessibleName('VenusAI');
    await expect(titles.nth(1)).toHaveAccessibleName('Yoga Lasyn');
    await expect(titles.nth(2)).toHaveAccessibleName('DevPad');
    await expect(
      page.getByRole('heading', { name: 'All projects' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'DevPad' })).toHaveCount(2);

    const venus = entryOf(page, 'VenusAI').first();
    await expect(venus.getByText('Freelance', { exact: true })).toBeVisible();
    await expect(
      venus.getByRole('list', { name: 'Technologies' }).getByText('Flutter'),
    ).toBeVisible();
    await expect(
      venus.getByRole('link', { name: /App Store/ }),
    ).toHaveAttribute('href', /apps\.apple\.com/);
    await expect(
      venus.getByRole('button', { name: '7 screenshots' }),
    ).toBeVisible();
    // the featured ones have their note in the margin
    await expect(
      page.getByText('Featured', { exact: true }).first(),
    ).toBeVisible();
  });

  test('the cover is a numbered figure, and a project without a cover gets an initials tile', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'projects' && id === 'finhub'
        ? { ...doc, cover: '' }
        : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(page.getByText('FM', { exact: true })).toBeVisible();
    await expect(page.getByText('DP', { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('img', { name: 'DevPad cover' }).first(),
    ).toBeVisible();
    await expect(page.getByText(/^Fig\. \d+\.$/).first()).toBeVisible();
  });

  test('the kind chips filter the list and keep the numbers of the references', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const group = page.getByRole('group', { name: 'Filter projects' });
    const all = group.getByRole('button', { name: 'All', exact: true });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    const number = page.locator('#ref-p-finhub').getByText(/^\d+$/).first();
    const before = await number.textContent();
    await group.getByRole('button', { name: 'Freelance' }).click();
    await expect(
      group.getByRole('button', { name: 'Freelance' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'FinHub MCP' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('heading', { name: 'Beli Coffee' }),
    ).toBeVisible();
    await group.getByRole('button', { name: 'Personal' }).click();
    await expect(
      page.getByRole('heading', { name: 'FinHub MCP' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Beli Coffee' }),
    ).toHaveCount(0);
    await expect(number).toHaveText(before ?? '');
  });

  test('a project that is not featured still has its screenshots button, and one without images has none', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'projects' ? { ...doc, highlight: null } : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toHaveCount(0);
    const card = entryOf(page, 'DevCmd');
    await expect(card.getByText('Featured', { exact: true })).toHaveCount(0);
    await expect(
      card.getByRole('button', { name: '7 screenshots' }),
    ).toBeVisible();
    await expect(
      entryOf(page, 'Beli Coffee').getByRole('button', { name: /screenshot/ }),
    ).toHaveCount(0);
  });

  test('a featured project is marked Featured in the list of all projects', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(
      page.locator('#ref-p-venus-ai').getByText('Featured', { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('#ref-p-finhub').getByText('Featured', { exact: true }),
    ).toHaveCount(0);
  });

  test('the screenshots open in the viewer, with the project name and links, and Escape closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const opener = entryOf(page, 'VenusAI')
      .first()
      .getByRole('button', { name: '7 screenshots' });
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('VenusAI').first()).toBeVisible();
    await expect(dialog.getByText(/screenshot 1 of 7/)).toBeVisible();
    await expect(dialog.getByRole('link', { name: /App Store/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('a page with no visible project shows the empty state', async ({
    page,
  }) => {
    await interceptCollection(page, 'projects', 'empty');
    await gotoSkin(page, '/projects');
    const notice = page.locator('[data-state="empty"]');
    await expect(
      notice.getByRole('heading', { name: 'No projects to show yet' }),
    ).toBeVisible();
    await expect(notice.getByRole('link')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'All projects' }),
    ).toHaveCount(0);
  });

  test('shows a skeleton while the data is on its way, then the content', async ({
    page,
  }) => {
    await interceptCollection(page, 'projects', { delay: 1500 });
    await gotoSkin(page, '/projects');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText('VenusAI').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says it could not load, and Try again loads it', async ({ page }) => {
    await interceptCollection(page, 'projects', 'error');
    await gotoSkin(page, '/projects');
    const alert = page.locator('[data-state="error"]');
    // a failed read is tried once more before it counts as an error
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Projects couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText('VenusAI').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('a page that is coming soon says so', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { projects: 'soon' } } });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'All projects' }),
    ).toHaveCount(0);
  });

  test('a hidden page is a 404', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { projects: 'hidden' } },
    });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
  });

  test('on a phone there is no horizontal scroll, in either theme', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const theme of ['dark', 'light']) {
      await page.addInitScript(
        (value) => localStorage.setItem('bach-cv-theme', value),
        theme,
      );
      await gotoSkin(page, '/projects');
      await expect(
        page.getByRole('heading', { name: 'Featured projects' }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });

  test('in Vietnamese the page, the chips, the labels and the links are translated', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dự án');
    await expect(
      page.getByRole('heading', { name: 'Dự án nổi bật' }),
    ).toBeVisible();
    const group = page.getByRole('group', { name: 'Lọc dự án' });
    await expect(group.getByRole('button', { name: 'Cá nhân' })).toBeVisible();
    await expect(page.getByText('Xây dựng với').first()).toBeVisible();
    await expect(
      page.getByText('Liên kết', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Xem website/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /ảnh chụp màn hình$/ }).first(),
    ).toBeVisible();
  });
});
