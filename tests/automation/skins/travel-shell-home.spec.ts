/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('the frame of the trip', () => {
  test('has a real link for every page, and the open one is marked', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const nav = page.getByRole('navigation', { name: 'Pages of the trip' });
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await nav.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
  });

  test('every page is reachable with the keyboard alone', async ({ page }) => {
    await gotoSkin(page, '/');
    const link = page
      .getByRole('navigation', { name: 'Pages of the trip' })
      .getByRole('link', { name: 'Certificates' });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/certificates$/);
  });

  test('keeps the header actions of Standard in the order Language, Skin, Theme', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const header = page.locator('header.tl-header');
    await expect(
      header.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    await expect(
      header.getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
    await expect(header.getByRole('button', { name: 'Connect' })).toBeVisible();
    const names = await header
      .getByRole('button')
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute('aria-label') ?? e.textContent ?? ''),
      );
    const at = (word: string) => names.findIndex((n) => n.includes(word));
    expect(at('Language')).toBeGreaterThan(-1);
    expect(at('Language')).toBeLessThan(at('Skin'));
    expect(at('Skin')).toBeLessThan(at('Theme'));
  });

  test('the Skin menu leaves the skin, the Language menu translates it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Language: English' }).click();
    await page.getByRole('menuitemradio', { name: 'Tiếng Việt' }).click();
    await expect(
      page.getByRole('navigation', { name: 'Các trang của chuyến đi' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Hồ sơ', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: /^Skin: Du lịch|^Giao diện: Du lịch|Skin: Du lịch/,
      })
      .click();
    await page.getByRole('menuitemradio', { name: /Chuẩn/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-skin',
      'travel',
    );
  });

  test('the Theme menu turns the map to night and back', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const night = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--tl-night')
        .trim(),
    );
    expect(night).toBe('1');
  });

  test('a page switched off is absent from the menu, and soon is marked', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'hidden', services: 'soon' } },
    });
    await gotoSkin(page, '/');
    const nav = page.getByRole('navigation', { name: 'Pages of the trip' });
    await expect(nav.getByRole('link', { name: 'Payment' })).toHaveCount(0);
    await expect(
      nav.getByRole('link', { name: 'Services, Soon' }),
    ).toBeVisible();
  });
});

test.describe('Home, the trip overview', () => {
  test('tells what Standard tells', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { level: 1, name: /I lead mobile teams/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "What I've built at FPT" }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "Where I've worked" }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Full resume' }),
    ).toHaveAttribute('href', '/resume');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'All projects' }),
    ).toHaveAttribute('href', '/projects');
    await expect(
      page.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Technologies' }),
    ).toBeVisible();
  });

  test('draws the real roles as pins, the current one is the destination', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const pins = page.locator('.tl-pin-btn');
    await expect(pins).toHaveCount(5);
    await expect(pins.filter({ hasText: 'FPT Software' })).toHaveAttribute(
      'aria-label',
      /FPT Software, Team Lead/,
    );
    await expect(page.getByText('You are here')).toBeVisible();
  });

  test('a pin opens the Resume page on that stop', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', {
        name: /^MoMo \(M_Service\), Senior Mobile App Developer/,
      })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      page.getByRole('article', { name: /^MoMo \(M_Service\)/ }),
    ).toBeVisible();
  });

  test('the trip can be started and stopped', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Start the trip' }).click();
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'The traveller is riding to' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Stop the trip' }).click();
    await expect(
      page.getByRole('button', { name: 'Start the trip' }),
    ).toBeVisible();
  });

  test('is in order on a phone: a sheet over the map, no horizontal scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await gotoSkin(page, '/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const handle = page.getByRole('button', { name: 'Show the whole panel' });
    await handle.click();
    await expect(
      page.getByRole('button', { name: 'Show more of the map' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('the cards over the map', () => {
  for (const width of [800, 1024, 1440]) {
    for (const path of ['/', '/resume', '/about']) {
      test(`${path} fits its card at ${width}px, with nothing cut at the right`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoSkin(page, path);
        const body = page.locator('.tl-panel .tl-scroll');
        await expect(body).toBeVisible();
        // a grid column that grows to its widest child pushes the text out of the card
        const [scroll, client] = await body.evaluate((el) => [
          el.scrollWidth,
          el.clientWidth,
        ]);
        expect(scroll).toBeLessThanOrEqual(client);
      });
    }
  }
});
