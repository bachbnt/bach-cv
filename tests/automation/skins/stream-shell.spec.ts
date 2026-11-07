/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

const PATHS = [
  '/',
  '/projects',
  '/resume',
  '/about',
  '/services',
  '/payment',
  '/certificates',
];

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'stream');
  await mockFirestore(page);
});

const noSideScroll = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

test.describe('the frame on a wide screen', () => {
  test('lists the seven pages, marks the open one and goes to another', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
    await nav.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(nav.getByRole('link', { name: 'Resume' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'stream');
  });

  test('marks a page that is soon and leaves out one that is hidden', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'soon', services: 'hidden' } },
    });
    await gotoSkin(page, '/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Services' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Payment' })).toHaveCount(0);
    await expect(nav.getByText('Payment')).toBeVisible();
    await expect(nav.getByText('Soon')).toBeVisible();
    await expect(nav.getByRole('link')).toHaveCount(5);
  });

  test('a soon page and a hidden page have their own screens', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'soon', services: 'hidden' } },
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
  });

  test('a path that is not a page shows the 404 inside the frame', async ({
    page,
  }) => {
    await gotoSkin(page, '/no-such-page');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('the burger folds the sidebar and brings it back', async ({ page }) => {
    await gotoSkin(page, '/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    const burger = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await burger.click();
    await expect(nav).toBeHidden();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await burger.click();
    await expect(nav).toBeVisible();
  });

  test('Download CV is in the sidebar and opens the CV window', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('button', { name: 'Download CV' })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the Download CV and Connect switches take their buttons away', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { features: { cvDownload: false, connectMenu: false } },
    });
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('link', { name: 'Home', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(0);
  });

  test('Connect has the same content as the Standard menu', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Connect' }).click();
    await expect(page.getByText("Let's connect")).toBeVisible();
    // the links of the menu only: a page can show the same link of its own
    const menu = page.locator('[data-slot="popover-content"]');
    await expect(
      menu.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    for (const name of ['LinkedIn', 'GitHub']) {
      await expect(
        menu.getByRole('link', { name: new RegExp(name) }),
      ).toBeVisible();
    }
    await expect(menu.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
  });
});

test.describe('the menus', () => {
  test('language and theme change the page and are always reachable', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: /^Language/ }).click();
    await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
    await expect(
      page.getByRole('link', { name: 'Trang chủ', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^Ngôn ngữ/ })).toBeVisible();
    await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Tối' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Sáng' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'stream');
  });

  test('the Skin menu goes back to Standard', async ({ page }) => {
    await gotoSkin(page, '/about');
    await page.getByRole('button', { name: /^Skin: Stream/ }).click();
    await expect(
      page.getByRole('menuitemradio', { name: /Stream/ }),
    ).toBeChecked();
    await page.getByRole('menuitemradio', { name: /Standard/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', /.+/);
    await expect(page.locator('.sm-root')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  });
});

test.describe('maintenance', () => {
  test('replaces the whole site with its screen and the owner message', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': {
        maintenance: { enabled: true, message: 'Moving to a new server.' },
      },
    });
    await page.goto('/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(page.getByText('Moving to a new server.')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
  });

  test('is in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true } },
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Mình sẽ sớm quay lại.' }),
    ).toBeVisible();
  });
});

test.describe('a tablet', () => {
  test.use({ viewport: { width: 900, height: 800 } });

  test('has no sidebar: the burger opens it as a drawer that goes away with a link', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const drawer = page.getByRole('dialog');
    await expect(
      drawer.getByRole('link', { name: 'Certificates' }),
    ).toBeVisible();
    await drawer.getByRole('link', { name: 'Certificates' }).click();
    await expect(page).toHaveURL(/\/certificates$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await noSideScroll(page)).toBe(true);
  });
});

test.describe('a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('has no horizontal scroll on any page', async ({ page }) => {
    for (const path of PATHS) {
      await gotoSkin(page, path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(await noSideScroll(page), path).toBe(true);
    }
  });

  test('has a bottom navigation with four tabs, and the rest in a Menu sheet', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveCount(4);
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await nav.getByRole('button', { name: 'Open menu' }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'Payment' })).toBeVisible();
    await expect(
      sheet.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    // the language, theme and Skin menus are in the sheet, so a phone can always leave the skin
    await expect(
      sheet.getByRole('button', { name: /^Language/ }),
    ).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'Theme' })).toBeVisible();
    await sheet.getByRole('button', { name: /^Skin/ }).click();
    await page.getByRole('menuitemradio', { name: /Standard/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', /.+/);
  });

  test('a link of the sheet closes it and opens the page', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'Payment' })
      .click();
    await expect(page).toHaveURL(/\/payment$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('light theme', () => {
  test('uses the light palette and keeps the page readable', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('bach-cv-theme', 'light'),
    );
    await gotoSkin(page, '/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    const colors = await page.evaluate(() => ({
      body: getComputedStyle(document.querySelector('.sm-root')!)
        .backgroundColor,
      ink: getComputedStyle(document.querySelector('.sm-root')!).color,
    }));
    expect(colors.body).toBe('rgb(255, 255, 255)');
    expect(colors.ink).toBe('rgb(15, 15, 15)');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('stops the pulsing dot and every animation of the skin', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.locator('.sm-root')).toBeVisible();
    const running = await page.evaluate(
      () =>
        [...document.querySelectorAll('.sm-root *')].filter(
          (el) => getComputedStyle(el).animationName !== 'none',
        ).length,
    );
    expect(running).toBe(0);
  });
});
