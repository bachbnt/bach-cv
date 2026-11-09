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

const slot = (page: Page, key: string) =>
  page.getByRole('contentinfo').getByRole('button', {
    name: new RegExp(`^Key skill ${key}: `),
  });

/** Where the champion is on the minimap, in percent. */
const where = (page: Page) =>
  page.locator('.mb-me').evaluate((el) => ({
    x: parseFloat((el as HTMLElement).style.left),
    y: parseFloat((el as HTMLElement).style.top),
  }));

/** The map with the page folded away, and the pointer over a spot of it. */
async function openMap(page: Page, path = '/') {
  await gotoSkin(page, path);
  await expect(slot(page, 'Q')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.mouse.move(900, 330);
}

test.describe('the night arena', () => {
  const background = (page: Page) =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--mb-bg')
        .trim(),
    );

  test('is what a visitor who follows a light system sees, and the day is only for a visitor who chose Light', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await gotoSkin(page, '/');
    expect(await background(page)).toBe('#07141a');
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect.poll(() => background(page)).toBe('#f1e9d3');
  });
});

test.describe('casting the key skills', () => {
  test('Q throws a bolt toward the pointer, puts the slot on cooldown and opens the card of the skill', async ({
    page,
  }) => {
    await openMap(page);
    await page.keyboard.press('q');
    await expect(page.locator('.mb-fx-bolt')).toHaveCount(1);
    await expect(slot(page, 'Q')).toHaveAttribute('data-cooling', '');
    await expect(
      page.getByRole('group', { name: /^Key skill Q: / }),
    ).toBeVisible();
    await expect(page.locator('.mb-cd').first()).toBeVisible();
  });

  test('a skill on cooldown is not cast again, and its card still opens and folds', async ({
    page,
  }) => {
    await openMap(page);
    await page.keyboard.press('q');
    await page.keyboard.press('q');
    await expect(
      page.getByRole('group', { name: /^Key skill Q: / }),
    ).toBeHidden();
    await page.keyboard.press('q');
    await expect(
      page.getByRole('group', { name: /^Key skill Q: / }),
    ).toBeVisible();
    expect(await page.locator('.mb-fx-bolt').count()).toBeLessThanOrEqual(1);
  });

  test('W is a ring around the champion, R a wave, E a dash that walks the champion toward the pointer', async ({
    page,
  }) => {
    await openMap(page);
    await page.keyboard.press('w');
    await expect(page.locator('.mb-fx-aura').first()).toBeVisible();
    await page.keyboard.press('r');
    await expect(page.locator('.mb-fx-nova').first()).toBeVisible();
    const before = await where(page);
    await page.keyboard.press('e');
    await expect(page.locator('.mb-fx-trail')).toHaveCount(1);
    await expect
      .poll(async () => {
        const now = await where(page);
        return Math.hypot(now.x - before.x, now.y - before.y);
      })
      .toBeGreaterThan(1);
  });

  test('a click on the slot casts too, and with reduced motion nothing is drawn but the cooldown runs', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openMap(page);
    await slot(page, 'Q').click();
    await expect(slot(page, 'Q')).toHaveAttribute('data-cooling', '');
    await expect(page.locator('.mb-fx-bolt')).toHaveCount(0);
  });

  test('the keys dialog lists the cast and the ping keys', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('?');
    const dialog = page.getByRole('dialog', { name: 'Keyboard' });
    await expect(dialog).toContainText('Cast a key skill');
    await expect(dialog).toContainText('Ping wheel');
    await expect(dialog).toContainText('Alert ping');
  });
});

test.describe('pinging', () => {
  test('Alt and click marks the spot with an alert and does not walk', async ({
    page,
  }) => {
    await openMap(page);
    const before = await where(page);
    await page.keyboard.down('Alt');
    await page.mouse.click(900, 330);
    await page.keyboard.up('Alt');
    await expect(page.locator('.mb-pm[data-ping="alert"]')).toHaveCount(1);
    await page.waitForTimeout(400);
    expect(await where(page)).toEqual(before);
  });

  test('V opens the wheel with the four pings, the arrow keys reach them, and Esc closes it', async ({
    page,
  }) => {
    await openMap(page);
    await page.keyboard.press('v');
    const wheel = page.getByRole('menu', { name: 'Ping wheel' });
    await expect(wheel).toBeAttached();
    for (const name of ['Alert', 'On my way', 'Retreat', 'Need help'])
      await expect(wheel.getByRole('menuitem', { name })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(wheel.getByRole('menuitem', { name: 'Alert' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(wheel).toHaveCount(0);
  });

  test('Alert only leaves a marker on the spot', async ({ page }) => {
    await openMap(page);
    const before = await where(page);
    await page.keyboard.press('v');
    await page.getByRole('menuitem', { name: 'Alert' }).click();
    await expect(page.locator('.mb-pm[data-ping="alert"]')).toHaveCount(1);
    await expect(page.getByRole('menu', { name: 'Ping wheel' })).toHaveCount(0);
    expect(await where(page)).toEqual(before);
  });

  test('On my way marks the spot and walks the champion there', async ({
    page,
  }) => {
    await openMap(page);
    const before = await where(page);
    await page.keyboard.press('v');
    await page.getByRole('menuitem', { name: 'On my way' }).click();
    await expect(page.locator('.mb-pm[data-ping="onMyWay"]')).toHaveCount(1);
    await expect
      .poll(async () => {
        const now = await where(page);
        return Math.hypot(now.x - before.x, now.y - before.y);
      })
      .toBeGreaterThan(1);
  });

  test('Need help opens the BB Bot chat', async ({ page }) => {
    await openMap(page);
    await page.keyboard.press('v');
    await page.getByRole('menuitem', { name: 'Need help' }).click();
    await expect(page.locator('.mb-pm[data-ping="assist"]')).toHaveCount(1);
    await expect(page.getByRole('dialog', { name: /BB Bot/ })).toBeVisible();
  });

  test('Retreat recalls the champion to the fountain', async ({ page }) => {
    await openMap(page, '/projects');
    await page.keyboard.press('v');
    await page.getByRole('menuitem', { name: 'Retreat' }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
  });

  test('holding V and letting go over a ping chooses it', async ({ page }) => {
    await openMap(page);
    await page.mouse.move(700, 400);
    await page.keyboard.down('v');
    await expect(page.getByRole('menu', { name: 'Ping wheel' })).toBeAttached();
    // the right-hand slice is On my way
    await page.mouse.move(780, 400);
    await page.keyboard.up('v');
    await expect(page.locator('.mb-pm[data-ping="onMyWay"]')).toHaveCount(1);
    await expect(page.getByRole('menu', { name: 'Ping wheel' })).toHaveCount(0);
  });

  test('holding a finger on the map opens the wheel there, and the finger lifting does not walk', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 820, height: 760 },
    });
    const page = await context.newPage();
    await useSkin(page, 'moba');
    await mockFirestore(page);
    await gotoSkin(page, '/');
    await page.keyboard.press('Escape');
    const before = await where(page);
    const client = await context.newCDPSession(page);
    const point = { x: 520, y: 300, id: 1 };
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point],
    });
    await expect(page.getByRole('menu', { name: 'Ping wheel' })).toBeAttached();
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await page.waitForTimeout(300);
    expect(await where(page)).toEqual(before);
    await context.close();
  });

  test('Need help is off when the chat is switched off for the site', async ({
    page,
  }) => {
    await page.unrouteAll();
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await openMap(page);
    await page.keyboard.press('v');
    await expect(
      page.getByRole('menuitem', { name: 'Need help' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
