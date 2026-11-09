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

test.describe('the places of the map', () => {
  test('the list of places in About flies the camera to a place and opens its card', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const list = page.getByRole('region', { name: 'Places of Nha Trang' });
    const start = await viewTransform(page);
    const chip = list.getByRole('button', { name: 'Po Nagar towers' });
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => viewTransform(page)).not.toBe(start);
    // the card on the map, and the same words for a screen reader below the list
    await expect(page.locator('.tl-info-card')).toContainText(
      'Cham temple towers',
    );
    await expect(list.getByRole('status')).toContainText('Po Nagar towers:');
    // on the top layer: a pin or the traveller standing over its words would hide them
    const z = (selector: string) =>
      page
        .locator(selector)
        .evaluateAll((all) =>
          all.map((e) => Number(getComputedStyle(e).zIndex) || 0),
        );
    const [card] = await z('.tl-info');
    expect(card).toBeGreaterThan(Math.max(...(await z('.tl-pin'))));
    expect(card).toBeGreaterThan(Math.max(...(await z('.tl-traveller'))));
    await page.keyboard.press('Escape');
    await expect(page.locator('.tl-info-card')).toHaveCount(0);
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  test('every sight is in the list, the best known first, and the list works with the keyboard', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const list = page.getByRole('region', { name: 'Places of Nha Trang' });
    await expect(list.getByRole('button')).toHaveCount(23);
    await list.getByRole('button').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.tl-info-card')).toBeVisible();
  });

  test('a sight pointed at shows its card, lifts, and gives its name tag way; the card goes with the pointer', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await page
      .getByRole('region', { name: 'Places of Nha Trang' })
      .getByRole('button', { name: 'Hon Chong' })
      .click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.tl-info-card')).toHaveCount(0);
    // the camera has flown to it: it is in the middle of the free part of the view
    const hit = page.locator('[data-hit="hon-chong"]');
    await expect(hit).toBeVisible();
    await hit.hover();
    await expect(page.locator('.tl-info-card')).toContainText(
      'Granite boulders',
    );
    await expect(page.locator('[data-sight="hon-chong"]')).toHaveAttribute(
      'data-hot',
      '',
    );
    await page.mouse.move(2, 2);
    await expect(page.locator('.tl-info-card')).toHaveCount(0);
    await expect(page.locator('[data-sight="hon-chong"]')).not.toHaveAttribute(
      'data-hot',
      '',
    );
  });

  test('the sights stay decoration: no control in them, hidden from assistive technology', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    expect(
      await page.locator('[data-sight] button, [data-sight] a').count(),
    ).toBe(0);
    expect(
      await page.locator('[data-sight]:not([aria-hidden="true"])').count(),
    ).toBe(0);
  });

  test('the names of the big mountain and of Hon Ro are written at the first view of the map', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    for (const id of ['dong-bo', 'hon-ro'])
      await expect(
        page.locator(`[data-label="${id}"] .tl-name`),
      ).not.toHaveClass(/tl-off/);
  });

  test('far out only the best known names are written, and more of them as the map is brought closer', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const fames = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-label]')]
          .filter(
            (tag) =>
              !tag.querySelector('.tl-name')?.classList.contains('tl-off'),
          )
          .map((tag) => Number((tag as HTMLElement).dataset.fame)),
      );
    await expect.poll(async () => Math.max(...(await fames()))).toBe(1);
    const far = (await fames()).length;
    for (let i = 0; i < 4; i++)
      await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect
      .poll(async () => Math.max(...(await fames())), { timeout: 10_000 })
      .toBeGreaterThan(1);
    expect((await fames()).length).toBeGreaterThan(far);
  });
});

test.describe('the stops', () => {
  test('the line says how to see a stop, until a pin has been pointed at, and not again on the next visit', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const hint = page.locator('.tl-hint');
    await expect(hint).toContainText('Point at a pin');
    await page.locator('.tl-pin-btn').first().hover();
    await expect(hint).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.tl-pin-btn').first()).toBeVisible();
    await expect(page.locator('.tl-hint')).toHaveCount(0);
  });

  test('the way to the open stop is lit from the stop before it', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const lit = page.locator('.tl-lit polyline').last();
    await expect(lit).toBeAttached();
    const now = await lit.getAttribute('points');
    expect(now?.split(' ').length).toBeGreaterThan(1);
    await page
      .getByRole('list', { name: 'Stops of the trip' })
      .getByRole('button', { name: /Devblock Vietnam/ })
      .click();
    await expect
      .poll(() =>
        page.locator('.tl-lit polyline').last().getAttribute('points'),
      )
      .not.toBe(now);
  });
});
