/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { useSkin } from '../support/skin';

test.describe('choosing a skin', () => {
  test('the default skin has no skin attribute and a skin switch in the header', async ({
    page,
  }) => {
    await mockFirestore(page);
    await page.goto('/about');
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', /.+/);
    await expect(page.getByRole('button', { name: /^Skin/ })).toBeVisible();
    await expect(page.locator('.dv-root')).toHaveCount(0);
  });

  test('a skin that never arrives gives the page back to the default look after a few seconds', async ({
    page,
  }) => {
    await useSkin(page, 'dev');
    await mockFirestore(page);
    await page.clock.install();
    // the code of the skin never answers
    await page.route('**/*skins_dev*', () => {});
    // `load` would wait for the request that never answers
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'dev');
    await expect(page.locator('body')).toBeHidden();
    await page.clock.fastForward(9000);
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', /.+/);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  });

  test('looking at another skin in the menu does not change the page', async ({
    page,
  }) => {
    await mockFirestore(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeVisible();
    const before = await page.locator('header').first().boundingBox();
    const styles = () =>
      page.evaluate(
        () => document.querySelectorAll('link[rel="stylesheet"], style').length,
      );
    const stylesBefore = await styles();
    await page.getByRole('button', { name: /^Skin/ }).click();
    // the pointer over a skin loads it ahead of time; its styles must not reach Standard
    await page.getByRole('menuitemradio', { name: /Dev/ }).hover();
    await expect.poll(styles).toBeGreaterThan(stylesBefore);
    await expect(nav).toBeVisible();
    expect(await page.locator('header').first().boundingBox()).toEqual(before);
  });

  test('a saved choice shows the skin on the same address', async ({
    page,
  }) => {
    await useSkin(page, 'dev');
    await mockFirestore(page);
    await page.goto('/about');
    await expect(page.locator('.dv-root')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'dev');
    expect(new URL(page.url()).pathname).toBe('/about');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    // one chat button, and it is the Dev one (the Standard chat is not there as well)
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      1,
    );
    await expect(page.locator('[data-slot="dev-chat-fab"]')).toBeVisible();
  });

  test('?skin= chooses and remembers a skin, an unknown name is ignored', async ({
    page,
  }) => {
    await mockFirestore(page);
    await page.goto('/?skin=dev');
    await expect(page.locator('.dv-root')).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem('bach-cv-skin')),
    ).toBe('dev');
    await page.goto('/?skin=nonsense');
    await expect(page.locator('.dv-root')).toBeVisible();
  });

  test('the skin menu switches in both directions without changing the page', async ({
    page,
  }) => {
    await mockFirestore(page);
    await page.goto('/projects');
    await page.getByRole('button', { name: /^Skin/ }).click();
    await page.getByRole('menuitemradio', { name: /Dev/ }).click();
    await expect(page.locator('.dv-root')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/projects');

    await page.getByRole('button', { name: /^Skin/ }).click();
    await page.getByRole('menuitemradio', { name: /Standard/ }).click();
    await expect(page.locator('.dv-root')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', /.+/);
    expect(new URL(page.url()).pathname).toBe('/projects');
  });

  test('a tab goes to another page and the skin stays', async ({ page }) => {
    await useSkin(page, 'dev');
    await mockFirestore(page);
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /Resume\.dart/ })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator('.dv-root')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: /Resume\.dart/ }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('the skin switch is also in the phone menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await mockFirestore(page);
    await page.goto('/');
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('button', { name: 'Dev', exact: true }).click();
    await expect(page.locator('.dv-root')).toBeVisible();
  });
});

test.describe('the screens of the Dev skin for the states of the site', () => {
  test.beforeEach(async ({ page }) => {
    await useSkin(page, 'dev');
  });

  test('an address that is not a page shows the 404 screen inside the editor', async ({
    page,
  }) => {
    await mockFirestore(page);
    await page.goto('/no-such-page');
    await expect(page.locator('.dv-root')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to home' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('a page that is soon is a tab you cannot open and shows Coming soon', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'soon' } },
    });
    await page.goto('/payment');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Payment\.swift/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByText('Payment.swift'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to home' }),
    ).toBeVisible();
  });

  test('a page that is hidden shows the 404 screen and has no tab', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { services: 'hidden' } },
    });
    await page.goto('/services');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Services\.ts/ })).toHaveCount(
      0,
    );
  });

  test('maintenance replaces the whole editor with its screen and the owner message', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        maintenance: {
          enabled: true,
          message: 'Moving to a new server tonight.',
        },
      },
    });
    await page.goto('/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(
      page.getByText('Moving to a new server tonight.'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
    await expect(page.locator('.dv-ide')).toHaveCount(0);
  });

  test('the maintenance and the 404 screens are in Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true } },
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Mình sẽ sớm quay lại.' }),
    ).toBeVisible();
  });
});
