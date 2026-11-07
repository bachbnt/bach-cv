/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'moba');
  await mockFirestore(page);
});

test.describe('the arena frame', () => {
  test('lists every page as a link, marks the open one and keeps the Standard name of the navigation', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const name of [
      'Home',
      'About',
      'Resume',
      'Certificates',
      'Services',
      'Payment',
    ])
      await expect(nav.getByRole('link', { name })).toBeVisible();
  });

  test('a click on a link opens that page at once and moves the champion to its place', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Services' })
      .click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Services' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
        name: 'Services',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('every page is reachable with Tab and Enter alone', async ({ page }) => {
    await gotoSkin(page, '/');
    const link = page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Payment' });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/payment$/);
  });

  test('shows the scoreboard with counts of the real data, each with its name', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const board = page.getByRole('list', { name: 'Scoreboard' });
    await expect(board.getByRole('listitem').nth(0)).toContainText('9');
    await expect(board.getByRole('listitem').nth(0)).toContainText('Projects');
    await expect(board.getByRole('listitem').nth(1)).toContainText(
      'Years in software',
    );
    await expect(board.getByRole('listitem').nth(2)).toContainText('4');
    await expect(board.getByRole('listitem').nth(2)).toContainText('Roles');
  });

  test('has the Language, Skin and Theme menus in that order, with the Standard names', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const header = page.getByRole('banner');
    const names = await header
      .getByRole('button')
      .evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));
    expect(names.indexOf('Language: English')).toBeGreaterThanOrEqual(0);
    expect(names.indexOf('Language: English')).toBeLessThan(
      names.indexOf('Skin: Moba'),
    );
    expect(names.indexOf('Skin: Moba')).toBeLessThan(names.indexOf('Theme'));
  });

  test('switches to Vietnamese from the language menu and keeps it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Language: English' }).click();
    await page.getByRole('menuitemradio', { name: 'Tiếng Việt' }).click();
    await expect(page.getByRole('navigation', { name: 'Chính' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Bảng điểm' })).toBeVisible();
  });

  test('changes the theme and the skin, and the Skin menu leaves the arena', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Skin: Moba' }).click();
    await page.getByRole('menuitemradio', { name: /Standard/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', 'moba');
  });

  test('folds the page away with its button and with Esc, and brings it back', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const panel = page.getByRole('main');
    await expect(panel).toBeVisible();
    await page
      .getByRole('button', { name: 'Fold the page, show the map' })
      .click();
    await expect(panel).toBeHidden();
    await page.getByRole('button', { name: 'Open About' }).click();
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('keeps the document title of the page', async ({ page }) => {
    await gotoSkin(page, '/resume');
    await expect(page).toHaveTitle(/Resume/);
  });
});

test.describe('the states of the whole arena', () => {
  test('shows the out-of-bounds screen for a path that is not a page, with a way home', async ({
    page,
  }) => {
    await gotoSkin(page, '/nowhere');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      "This page doesn't exist.",
    );
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('shows Coming soon for a page that is soon, and does not make it a link', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { pages: { payment: 'soon' } } });
    await gotoSkin(page, '/payment');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'This page is coming soon.',
    );
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: /Payment/ }),
    ).toHaveCount(0);
  });

  test('shows the 404 for a hidden page and drops it from the list', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'hidden' } },
    });
    await gotoSkin(page, '/payment');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      "This page doesn't exist.",
    );
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link'),
    ).toHaveCount(6);
  });

  test('replaces everything with the maintenance screen, with the owner message and an address', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true, message: 'Back at noon.' } },
    });
    await gotoSkin(page, '/');
    await expect(page.getByText('Back at noon.')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /@/ })).toBeVisible();
  });
});

test.describe('the arena on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true });

  test('has no horizontal scroll, and the menu opens the places and the actions', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Menu' }).click();
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(
      page.getByRole('button', { name: 'Download CV' }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Connect' }).last(),
    ).toBeVisible();
    await nav.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
  });

  test('the page is a full-screen panel; folded, the champion bar and a minimap toggle show', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await page
      .getByRole('button', { name: 'Fold the page, show the map' })
      .click();
    const toggle = page.getByRole('button', { name: 'Hide the minimap' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('[data-minimap]')).toBeHidden();
    await page.getByRole('button', { name: 'Show the minimap' }).click();
    await expect(page.locator('[data-minimap]')).toBeVisible();
  });

  test('keeps every touch target at 44px or more in the champion bar', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Fold the page, show the map' })
      .click();
    const small = await page
      .getByRole('contentinfo')
      .getByRole('button')
      .evaluateAll(
        (els) =>
          els
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && (r.width < 43.5 || r.height < 43.5))
            .length,
      );
    expect(small).toBe(0);
  });
});
