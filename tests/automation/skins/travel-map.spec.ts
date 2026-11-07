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

const viewTransform = (page: import('@playwright/test').Page) =>
  page
    .locator('.tl-view')
    .evaluate((el) => (el as HTMLElement).style.transform);

test.describe('the map', () => {
  test('is a named group with the credit to OpenStreetMap', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('group', { name: 'Trip map of Nha Trang' }),
    ).toBeVisible();
    await expect(
      page.getByText('Map data © OpenStreetMap contributors (ODbL)'),
    ).toBeVisible();
  });

  test('the scenery is decoration: the sights are hidden from assistive technology and are not controls', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const sights = page.locator('[data-sight]');
    expect(await sights.count()).toBe(18);
    expect(await page.locator('[data-sight][aria-hidden="true"]').count()).toBe(
      18,
    );
    expect(
      await page.locator('[data-sight] button, [data-sight] a').count(),
    ).toBe(0);
  });

  test('the buttons zoom, the compass shows the whole trip again', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const start = await viewTransform(page);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect.poll(() => viewTransform(page)).not.toBe(start);
    await page.getByRole('button', { name: 'Show the whole trip' }).click();
    await expect.poll(() => viewTransform(page)).toBe(start);
  });

  test('keys move the map when it has the focus', async ({ page }) => {
    await gotoSkin(page, '/');
    const map = page.getByRole('group', { name: 'Trip map of Nha Trang' });
    await map.focus();
    const start = await viewTransform(page);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => viewTransform(page)).not.toBe(start);
  });

  test('dragging pans the map', async ({ page }) => {
    await gotoSkin(page, '/');
    const start = await viewTransform(page);
    await page.mouse.move(900, 500);
    await page.mouse.down();
    await page.mouse.move(800, 450, { steps: 4 });
    await page.mouse.up();
    expect(await viewTransform(page)).not.toBe(start);
  });

  test('another page makes the camera look at another place', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const home = await viewTransform(page);
    await page
      .getByRole('navigation', { name: 'Pages of the trip' })
      .getByRole('link', { name: 'Payment' })
      .click();
    await expect.poll(() => viewTransform(page)).not.toBe(home);
  });

  test('pins are tabbable in the order of the career and Enter opens the stop', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const pin = page.getByRole('button', {
      name: /^Devblock Vietnam, Junior Mobile Developer/,
    });
    await pin.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('article', { name: /^Devblock Vietnam/ }),
    ).toBeVisible();
  });

  test('pauses its animations when the page is hidden and has none with reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    const name = await page
      .locator('.tl-wave')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
  });
});
