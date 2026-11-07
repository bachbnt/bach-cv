/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'moba');
  await mockFirestore(page);
});

const featured = (page: Page) => page.locator('#featured');
const all = (page: Page) => page.locator('#all');
const card = (page: Page, name: string) =>
  all(page)
    .getByTestId('project')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });

test.describe('Projects in the Moba skin', () => {
  test('has the title and intro, the featured objectives by rank, then every visible project', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Tools I build for myself, and apps and sites I shipped for clients.',
      ),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Featured projects' }),
    ).toBeVisible();
    await expect(featured(page).getByRole('heading', { level: 3 })).toHaveText([
      'VenusAI',
      'Yoga Lasyn',
      'DevPad',
      'DevCmd',
    ]);
    await expect(
      page.getByRole('heading', { level: 2, name: 'All projects' }),
    ).toBeVisible();
    // the hidden project (visible: false) never shows
    await expect(all(page).getByTestId('project')).toHaveCount(9);
    await expect(
      page.getByRole('heading', { name: 'Good Morning Coffee & Tea' }),
    ).toHaveCount(0);
    // a featured project is marked Featured in the list; the others are not
    await expect(all(page).getByText('Featured', { exact: true })).toHaveCount(
      4,
    );
    await expect(
      card(page, 'Beli Coffee').getByText('Featured', { exact: true }),
    ).toHaveCount(0);
    await expect(
      card(page, 'DevCmd').getByText('Featured', { exact: true }),
    ).toBeVisible();
  });

  test('a card has its kind, summary, technologies tinted by category, and links named as on Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const venus = featured(page).getByTestId('project').first();
    await expect(venus.getByText('Freelance', { exact: true })).toBeVisible();
    await expect(
      venus.getByText(
        'An app that creates AI avatars, built with Flutter and Firebase.',
      ),
    ).toBeVisible();
    const tech = venus.getByRole('list', { name: 'Technologies' });
    await expect(tech.getByRole('listitem')).toHaveText([
      'Flutter',
      'Firebase',
    ]);
    await expect(tech.getByText('Flutter', { exact: true })).toHaveClass(
      /bg-mobile/,
    );
    await expect(tech.getByText('Firebase', { exact: true })).toHaveClass(
      /bg-tools/,
    );
    const store = venus.getByRole('link', { name: 'App Store' });
    await expect(store).toHaveAttribute('href', /apps\.apple\.com/);
    await expect(store).toHaveAttribute('target', '_blank');
    await expect(store).toHaveAttribute('rel', /noopener/);

    const pad = featured(page).getByTestId('project').nth(2);
    await expect(pad.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      /github\.com/,
    );
    await expect(pad.getByRole('link', { name: 'Releases' })).toHaveAttribute(
      'href',
      /releases/,
    );
    // a card with no links has no link
    await expect(card(page, 'Beli Coffee').getByRole('link')).toHaveCount(0);
    await expect(
      card(page, 'Com Chay Rop').getByRole('link', { name: 'Visit site' }),
    ).toHaveAttribute('href', 'https://comchayrop.com/');
  });

  test('a project without a cover gets an initials tile tinted by its first technology', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'projects' && id === 'finhub'
        ? { ...doc, cover: '' }
        : doc,
    );
    await gotoSkin(page, '/projects');
    const tile = card(page, 'FinHub MCP').getByText('FM', { exact: true });
    await expect(tile).toBeVisible();
    await expect(tile).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByText('DP', { exact: true })).toHaveCount(0);
  });

  test('the kind filter has All and the kinds in order, swaps the grid, and is a group of pressed buttons', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const group = page.getByRole('group', { name: 'Filter projects' });
    await expect(group.getByRole('button')).toHaveText([
      'All',
      'Personal',
      'Freelance',
    ]);
    await expect(
      group.getByRole('button', { name: 'All', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await group.getByRole('button', { name: 'Freelance' }).click();
    await expect(
      group.getByRole('button', { name: 'Freelance' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      group.getByRole('button', { name: 'All', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');
    await expect(all(page).getByTestId('project')).toHaveCount(5);
    await expect(card(page, 'Beli Coffee')).toBeVisible();
    await expect(
      all(page).getByRole('heading', { name: 'FinHub MCP' }),
    ).toHaveCount(0);
    await group.getByRole('button', { name: 'Personal' }).click();
    await expect(all(page).getByTestId('project')).toHaveCount(4);
    await expect(
      all(page).getByRole('heading', { name: 'Beli Coffee' }),
    ).toHaveCount(0);
    await group.getByRole('button', { name: 'All', exact: true }).click();
    await expect(all(page).getByTestId('project')).toHaveCount(9);
    // the featured block does not follow the filter
    await expect(featured(page).getByTestId('project')).toHaveCount(4);
  });

  test('the filter works with the keyboard alone', async ({ page }) => {
    await gotoSkin(page, '/projects');
    const personal = page
      .getByRole('group', { name: 'Filter projects' })
      .getByRole('button', { name: 'Personal' });
    await personal.focus();
    await page.keyboard.press('Enter');
    await expect(personal).toHaveAttribute('aria-pressed', 'true');
    await expect(all(page).getByTestId('project')).toHaveCount(4);
    await personal.focus();
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('group', { name: 'Filter projects' })
        .getByRole('button', { name: 'Freelance' }),
    ).toBeFocused();
    await page.keyboard.press('Space');
    await expect(all(page).getByTestId('project')).toHaveCount(5);
  });

  test('with one kind only there is no filter, and with no featured project no featured block', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'projects'
        ? { ...doc, kind: 'personal', highlight: null }
        : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { level: 2, name: 'All projects' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Filter projects' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toHaveCount(0);
    await expect(all(page).getByText('Featured', { exact: true })).toHaveCount(
      0,
    );
  });

  test('every card with screenshots says how many and a card without has no button', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'projects' && id === 'finhub'
        ? { ...doc, images: [(doc.images as string[])[0]] }
        : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(
      featured(page).getByRole('button', { name: '7 screenshots' }).first(),
    ).toBeVisible();
    await expect(
      featured(page).getByRole('button', { name: '6 screenshots' }),
    ).toBeVisible();
    await expect(
      featured(page).getByRole('button', { name: '12 screenshots' }),
    ).toBeVisible();
    await expect(
      card(page, 'FinHub MCP').getByRole('button', {
        name: '1 screenshot',
        exact: true,
      }),
    ).toBeVisible();
    await expect(card(page, 'Beli Coffee').getByRole('button')).toHaveCount(0);
  });

  test('the screenshots open in the viewer with the Standard names, step with the arrows, and give focus back', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const opener = featured(page)
      .getByRole('button', { name: '7 screenshots' })
      .first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('VenusAI')).toBeVisible();
    await expect(dialog.getByText('1 of 7', { exact: true })).toBeVisible();
    await expect(
      dialog.getByRole('img', { name: 'VenusAI screenshot 1' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Close screenshots' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Previous screenshot' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Next screenshot' }),
    ).toBeVisible();
    await expect(
      dialog
        .getByRole('group')
        .getByRole('button', { name: 'Go to screenshot 3' }),
    ).toBeVisible();
    // the arrow keys step while focus is in the picture area (a thumbnail here)
    await dialog.getByRole('button', { name: 'Go to screenshot 1' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('2 of 7', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Go to screenshot 5' }).click();
    await expect(dialog.getByText('5 of 7', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Next screenshot' }).click();
    await dialog.getByRole('button', { name: 'Next screenshot' }).click();
    await dialog.getByRole('button', { name: 'Next screenshot' }).click();
    await expect(dialog.getByText('1 of 7', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText('7 of 7', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    // every opening starts at the first screenshot, of the project that was asked for
    await card(page, 'DevPad')
      .getByRole('button', { name: '12 screenshots' })
      .click();
    await expect(
      page.getByRole('dialog').getByText('1 of 12', { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('img', { name: 'DevPad screenshot 1' }),
    ).toBeVisible();
  });

  test('the controls of a card are reachable with Tab in reading order', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const first = featured(page).getByTestId('project').first();
    await first.getByRole('button', { name: '7 screenshots' }).focus();
    await page.keyboard.press('Tab');
    await expect(first.getByRole('link', { name: 'App Store' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      featured(page)
        .getByTestId('project')
        .nth(1)
        .getByRole('button', { name: '6 screenshots' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('shows a skeleton while the data is on its way', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return route.fallback();
    });
    await gotoSkin(page, '/projects');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(
      page.getByRole('heading', { name: 'VenusAI' }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says there is nothing to show yet', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      if (
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"projects"')
      )
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-11-04T00:00:00.000000Z' }]),
        });
      return route.fallback();
    });
    await gotoSkin(page, '/projects');
    await expect(
      page
        .locator('[data-state="empty"]')
        .getByRole('heading', { name: 'No projects to show yet' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'All projects' }),
    ).toHaveCount(0);
  });

  test('says it could not load, and Try again loads it', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      if (
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"projects"')
      )
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        });
      return route.fallback();
    });
    await gotoSkin(page, '/projects');
    const alert = page.locator('[data-state="error"]').first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Projects couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByRole('heading', { name: 'VenusAI' }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('a page that is soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { projects: 'soon' } } });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toHaveCount(0);
  });

  test('a page that is hidden shows the 404', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { projects: 'hidden' } },
    });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toHaveCount(0);
  });

  test('in Vietnamese the page, the chips, the links and the viewer are translated', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dự án' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Dự án nổi bật' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Tất cả dự án' }),
    ).toBeVisible();
    const group = page.getByRole('group', { name: 'Lọc dự án' });
    await expect(group.getByRole('button')).toHaveText([
      'Tất cả',
      'Cá nhân',
      'Freelance',
    ]);
    await expect(
      featured(page).getByRole('list', { name: 'Công nghệ' }).first(),
    ).toBeVisible();
    await expect(
      featured(page).getByText('Freelance', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      card(page, 'Com Chay Rop').getByRole('link', { name: 'Xem website' }),
    ).toBeVisible();
    await expect(
      card(page, 'DevCmd').getByText('Nổi bật', { exact: true }),
    ).toBeVisible();
    const opener = featured(page)
      .getByRole('button', { name: '7 ảnh chụp màn hình' })
      .first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('button', { name: 'Đóng ảnh chụp màn hình' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Ảnh tiếp theo' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Xem ảnh 2' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('img', { name: 'VenusAI, ảnh chụp màn hình 1' }),
    ).toBeVisible();
  });

  for (const [width, height] of [
    [360, 740],
    [390, 844],
  ] as const)
    test(`at ${width}px nothing overflows sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
      await gotoSkin(page, '/projects');
      await expect(featured(page).getByTestId('project').first()).toBeVisible();
      const widest = await page.evaluate(() =>
        Math.max(
          ...[
            ...document.querySelectorAll('[data-testid="project"], h1, h2, h3'),
          ].map((el) => el.getBoundingClientRect().right),
        ),
      );
      expect(widest).toBeLessThanOrEqual(width + 0.5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      // a touch target is at least 44px high
      const filter = page
        .getByRole('group', { name: 'Lọc dự án' })
        .getByRole('button')
        .first();
      expect((await filter.boundingBox())!.height).toBeGreaterThanOrEqual(36);
    });
});
