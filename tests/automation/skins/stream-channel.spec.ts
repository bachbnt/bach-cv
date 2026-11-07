/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'stream');
  await mockFirestore(page);
  await mockImages(page);
});

/** Answers the reads of one collection with an empty result or a failure. */
async function intercept(
  page: Page,
  collection: string,
  answer: 'empty' | 'error',
) {
  await page.route('**/firestore.googleapis.com/**', (route) => {
    const request = route.request();
    const mine =
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes(`"collectionId":"${collection}"`);
    if (!mine) return route.fallback();
    return answer === 'error'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        })
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-01-01T00:00:00Z' }]),
        });
  });
}

const noSideScroll = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

test.describe('About, the channel page', () => {
  test('has the header of a channel: banner, photo, name, tags and the two buttons', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Bach Bui' }),
    ).toBeVisible();
    await expect(page.getByText('Software Engineer').first()).toBeVisible();
    await expect(
      page.getByRole('img', { name: /Portrait of Bach Bui/ }),
    ).toBeVisible();
    // the banner in the header and the featured picture in the panel: the two covers of Standard
    await expect(
      page.getByRole('img', { name: /Photo of Bach Bui/ }),
    ).toHaveCount(2);
    for (const tag of ['Mobile', 'Web', 'AI'])
      await expect(page.getByText(tag, { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Download CV' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
  });

  test('the About panel has the description, the links and the details', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Description' }),
    ).toBeVisible();
    await expect(page.getByText(/I hold a Master of Science/)).toBeVisible();

    const links = page.getByRole('region', { name: 'Links' });
    await expect(
      links.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:bachbnt@gmail.com');
    await expect(
      links.getByRole('link', { name: /\(\+84\) 384560623/ }),
    ).toBeVisible();
    for (const group of ['Professional', 'Messaging', 'Social'])
      await expect(
        links.getByRole('heading', { level: 3, name: group }),
      ).toBeVisible();
    await expect(links.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/bachbnt/',
    );

    const details = page.getByRole('region', { name: 'Details' });
    await expect(details.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await expect(
      details.locator('dt', { hasText: 'Since' }).locator('xpath=..'),
    ).toContainText(/20\d\d/);
    await expect(details.getByText(/^\d+ years?$/)).toBeVisible();
    await expect(details.getByText('English, Tiếng Việt')).toBeVisible();
  });

  test('Copy puts the email on the clipboard and says so', async ({ page }) => {
    await gotoSkin(page, '/about');
    await page.getByRole('button', { name: /^Copy/ }).click();
    await expect(page.getByRole('button', { name: /^Copied/ })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
  });

  test('the tabs really switch what is on the page, by click and by keyboard', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const about = page.getByRole('tab', { name: 'About' });
    const core = page.getByRole('tab', { name: 'Core stack' });
    await expect(about).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText(
      'I hold a Master of Science',
    );

    await core.click();
    await expect(core).toHaveAttribute('aria-selected', 'true');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Core stack' }),
    ).toBeVisible();
    await expect(page.getByText(/I hold a Master of Science/)).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'See all skills' }),
    ).toHaveAttribute('href', '/resume#skills');
    await expect(page.getByText(/^Used at FPT/).first()).toBeVisible();

    await about.focus();
    await page.keyboard.press('ArrowRight');
    await expect(core).toBeFocused();
    await page.keyboard.press('Home');
    await expect(about).toHaveAttribute('aria-selected', 'true');
    await expect(core).toHaveAttribute('tabindex', '-1');
  });

  test('is in Vietnamese, words and all', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/about');
    await expect(page.getByRole('tab', { name: 'Giới thiệu' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      page.getByRole('heading', { level: 2, name: 'Mô tả' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Liên kết' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Chi tiết' }),
    ).toBeVisible();
    await expect(page.getByText('Số năm làm phần mềm')).toBeVisible();
    await page.getByRole('tab', { name: 'Công nghệ chính' }).click();
    await expect(page.getByText(/^Đã dùng tại FPT/).first()).toBeVisible();
  });

  test('the chat switch takes the Ask BB Bot buttons and card away', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Bach Bui' }),
    ).toBeVisible();
    await expect(page.getByText('Not sure where to look?')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /BB Bot/ })).toHaveCount(0);
  });

  test('says so when the contact details are missing or cannot be read', async ({
    page,
  }) => {
    await intercept(page, 'contacts', 'empty');
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { name: 'No contact details yet' }),
    ).toBeVisible();
  });

  test('the core stack says there is nothing to show yet', async ({ page }) => {
    await intercept(page, 'skills', 'empty');
    await gotoSkin(page, '/about');
    await page.getByRole('tab', { name: 'Core stack' }).click();
    await expect(
      page.getByRole('heading', { name: 'No core stack to show yet' }),
    ).toBeVisible();
  });

  test('the core stack fails with Try again, and loads when it is tried', async ({
    page,
  }) => {
    await intercept(page, 'skills', 'error');
    await gotoSkin(page, '/about');
    await page.getByRole('tab', { name: 'Core stack' }).click();
    const alert = page.locator('[data-state="error"]');
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "The core stack couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText(/^Used at FPT/).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test('has no horizontal scroll on either tab', async ({ page }) => {
      await gotoSkin(page, '/about');
      await expect(
        page.getByRole('heading', { level: 1, name: 'Bach Bui' }),
      ).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(await noSideScroll(page)).toBe(true);
      await page.getByRole('tab', { name: 'Core stack' }).click();
      await expect(page.getByText(/^Used at FPT/).first()).toBeVisible();
      expect(await noSideScroll(page)).toBe(true);
    });

    test('keeps the tabs touchable (44px)', async ({ page }) => {
      await gotoSkin(page, '/about');
      const box = await page.getByRole('tab', { name: 'About' }).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  });
});

test.describe('the system screens', () => {
  test('a path that is not a page is a video that is not available', async ({
    page,
  }) => {
    await gotoSkin(page, '/no-such-page');
    await expect(page.getByText('Video unavailable')).toBeVisible();
    await expect(
      page.getByText("This video isn't available any more."),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to home' }),
    ).toHaveAttribute('href', '/');
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('Go back returns to the page the visitor came from', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'About' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await page.evaluate(() => history.pushState({}, '', '/no-such-page'));
    await page.reload();
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('a page that is coming soon is a Premiere with no date and no countdown', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'soon' } },
    });
    await gotoSkin(page, '/payment');
    await expect(page.getByText('Premieres soon')).toBeVisible();
    await expect(page.getByText('Premiere', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await expect(page.getByText('Soon', { exact: true }).last()).toBeVisible();
    // nothing in the player counts down: it has no digit at all
    const player = page.locator('.sm-stage');
    await expect(player).not.toHaveText(/\d/);
    await expect(
      page.getByRole('link', { name: 'Back to home' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('the Premiere and the buffering wheel stop for reduced motion', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await useSkin(page, 'stream');
    await mockFirestore(page, {
      'site/live': {
        pages: { payment: 'soon' },
      },
    });
    await gotoSkin(page, '/payment');
    await expect(page.getByText('Premieres soon')).toBeVisible();
    const running = await page.evaluate(
      () =>
        [...document.querySelectorAll('.sm-root *')].filter(
          (el) => getComputedStyle(el).animationName !== 'none',
        ).length,
    );
    expect(running).toBe(0);
    await context.close();
  });

  test('maintenance is a player that stopped to buffer, with the message and the email', async ({
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
    await expect(page.getByText('Maintenance', { exact: true })).toBeVisible();
    await expect(page.getByText('Moving to a new server.')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:bachbnt@gmail.com');
    await expect(page.getByText('Need me sooner? Email me')).toBeVisible();
  });

  test.describe('on a phone, in the light theme', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test('the player stays dark and nothing scrolls sideways', async ({
      page,
    }) => {
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-theme', 'light'),
      );
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await mockFirestore(page, {
        'site/live': {
          pages: { payment: 'soon' },
          maintenance: { enabled: false },
        },
      });
      await gotoSkin(page, '/payment');
      await expect(page.getByText('Premieres soon')).toBeVisible();
      expect(await noSideScroll(page)).toBe(true);
      const bg = await page
        .locator('.sm-stage')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).not.toBe('rgb(255, 255, 255)');
      await gotoSkin(page, '/no-such-page');
      expect(await noSideScroll(page)).toBe(true);
    });
  });
});

test.describe('the states, as the panels of a video site', () => {
  test('the loading skeleton is grey pictures that shimmer, and is announced once', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return route.fallback();
    });
    await gotoSkin(page, '/about');
    await page.getByRole('tab', { name: 'Core stack' }).click();
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    const shimmer = await loading
      .locator('[aria-hidden="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').animationName);
    expect(shimmer).toBe('sm-shimmer');
  });

  test('the loading skeleton stands still for reduced motion', async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await useSkin(page, 'stream');
    await mockFirestore(page);
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return route.fallback();
    });
    await gotoSkin(page, '/about');
    await page.getByRole('tab', { name: 'Core stack' }).click();
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    const shimmer = await loading
      .locator('[aria-hidden="true"]')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').animationName);
    expect(shimmer).toBe('none');
    await context.close();
  });
});

test.describe('Projects, the chapters under the reel of a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('list every project, mark the open one and go to the one that is tapped', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      document.documentElement.style.setProperty('--sm-reel-time', '600s'),
    );
    await gotoSkin(page, '/projects');
    const chapters = page.getByRole('list', { name: 'All projects' });
    await expect(chapters.getByRole('listitem')).toHaveCount(9);
    await expect(chapters.getByRole('button').first()).toHaveAttribute(
      'aria-current',
      'true',
    );
    const third = chapters.getByRole('button').nth(2);
    const name = (await third.innerText()).replace(/^[\d:\s]+/, '');
    await third.click();
    await expect(page.getByText('3 of 9')).toBeVisible();
    await expect(third).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });
});

test.describe('Projects, on a wide screen', () => {
  test('the chapters are for a phone: the reel has its buttons beside it', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('button', { name: 'Next project' }),
    ).toBeVisible();
    await expect(page.getByRole('list', { name: 'All projects' })).toHaveCount(
      0,
    );
  });
});
