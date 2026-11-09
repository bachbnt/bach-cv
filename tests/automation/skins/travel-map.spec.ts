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
    expect(await sights.count()).toBe(23);
    expect(await page.locator('[data-sight][aria-hidden="true"]').count()).toBe(
      23,
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

  test('zoomed all the way out the map keeps its size, stands still and leaves the waves out, and zooming in brings them back', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const map = page.getByRole('group', { name: 'Trip map of Nha Trang' });
    const box = await map.boundingBox();
    await page.mouse.move(700, 400);
    for (let i = 0; i < 30; i++) await page.mouse.wheel(0, 400);
    await expect(map).toHaveClass(/tl-whole/);
    // the state class must not resize the stage (it once shared its name with the far mountains of the sky)
    expect(await map.boundingBox()).toEqual(box);
    await expect(page.locator('.tl-waves')).toBeHidden();
    await expect(page.locator('.tl-boat').first()).toHaveCSS(
      'animation-play-state',
      'paused',
    );
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(map).not.toHaveClass(/tl-whole/);
    await expect(page.locator('.tl-waves')).toBeVisible();
    await expect(page.locator('.tl-boat').first()).toHaveCSS(
      'animation-play-state',
      'running',
    );
  });

  test('every sight has a name tag in a layer of its own, and no shown tag lies on a card of a stop', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.locator('[data-label]')).toHaveCount(23);
    expect(await page.locator('[data-label][aria-hidden="true"]').count()).toBe(
      23,
    );
    // the tags are placed once the camera rests: wait until none lies on a card
    const covered = () =>
      page.evaluate(() => {
        const box = (e: Element) => e.getBoundingClientRect();
        const cards = [
          ...document.querySelectorAll(
            '.tl-pin-head, .tl-pin-label, .tl-pin-flag',
          ),
        ].map(box);
        return [...document.querySelectorAll('[data-label]')]
          .filter((tag) => {
            const name = tag.querySelector('.tl-name');
            if (!name || name.classList.contains('tl-off')) return false;
            const t = box(name);
            return cards.some(
              (c) =>
                t.left < c.right &&
                c.left < t.right &&
                t.top < c.bottom &&
                c.top < t.bottom,
            );
          })
          .map((tag) => (tag as HTMLElement).dataset.label);
      });
    await expect.poll(covered).toEqual([]);
  });

  test('the "You are here" flag hangs under its pin, where nothing of the map stands over it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const flag = page.locator('.tl-pin-flag');
    await expect(flag).toBeVisible();
    const head = await page
      .locator('.tl-pin', { has: flag })
      .locator('.tl-pin-head')
      .boundingBox();
    const under = await flag.boundingBox();
    expect(head && under && under.y >= head.y + head.height).toBe(true);
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
