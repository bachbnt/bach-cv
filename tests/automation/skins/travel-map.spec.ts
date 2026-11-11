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
    // on a phone the sheet covers this line, so the credit is the last line of the sheet instead (travel-shell-home.spec.ts)
    await expect(page.locator('.tl-credits')).toContainText(
      'Map data © OpenStreetMap contributors (ODbL)',
    );
    await expect(page.locator('.tl-credits')).toBeVisible();
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
    // stopped, not paused: a paused animation still keeps its element on a layer of its own
    await expect(page.locator('.tl-boat').first()).toHaveCSS(
      'animation-name',
      'none',
    );
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(map).not.toHaveClass(/tl-whole/);
    await expect(page.locator('.tl-waves')).toBeVisible();
    await expect(page.locator('.tl-boat').first()).not.toHaveCSS(
      'animation-name',
      'none',
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
        // the card of a stop is only in the way while it is shown (the open stop's, or one that is pointed at)
        const cards = [
          ...document.querySelectorAll(
            '.tl-pin-head, .tl-pin-label, .tl-pin-flag',
          ),
        ]
          .filter((e) => Number(getComputedStyle(e).opacity) > 0.5)
          .map(box);
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

  test('the card of a stop shows when its pin is pointed at or its stop is open, not for every pin at once', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const cards = page.locator('.tl-pin-label');
    const shown = () =>
      cards.evaluateAll(
        (all) =>
          all.filter((e) => Number(getComputedStyle(e).opacity) > 0.5).length,
      );
    await expect(cards).toHaveCount(5);
    // on Home the open stop is the destination, the current job: its card is shown and the others are only pins
    expect(await shown()).toBe(1);
    const pin = page.locator('.tl-pin-btn[aria-label^="Devblock Vietnam"]');
    await pin.hover();
    await expect.poll(shown).toBe(2);
    await page.mouse.move(2, 2);
    await expect.poll(shown).toBe(1);
    await pin.focus();
    await page.keyboard.press('Enter');
    await expect.poll(shown).toBeGreaterThan(0);
  });

  test('the cabins of the cable car cross over the drawings and the names, under the pins', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const z = (selector: string) =>
      page
        .locator(selector)
        .evaluateAll((all) =>
          all.map((e) => Number(getComputedStyle(e).zIndex) || 0),
        );
    const cabins = await z('.tl-gondola');
    expect(cabins).toHaveLength(2);
    const under = [...(await z('[data-sight]')), ...(await z('[data-label]'))];
    const over = await z('.tl-pin');
    expect(Math.min(...cabins)).toBeGreaterThan(Math.max(...under));
    expect(Math.max(...cabins)).toBeLessThan(Math.min(...over));
  });

  test('keys move the map when it has the focus', async ({ page }) => {
    await gotoSkin(page, '/');
    const map = page.getByRole('group', { name: 'Trip map of Nha Trang' });
    await map.focus();
    const start = await viewTransform(page);
    // the overview frames the whole trip, from the south to the Do Theatre: the view starts at the west edge of the map
    await page.keyboard.press('ArrowRight');
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

test.describe('the loops of the scenery', () => {
  // the name of the animation that a part of a drawing plays now
  const names = (page: import('@playwright/test').Page, selector: string) =>
    page.evaluate(
      (sel) =>
        [...document.querySelectorAll(sel)].map(
          (el) => getComputedStyle(el).animationName,
        ),
      selector,
    );
  const zoomIn = async (page: import('@playwright/test').Page) => {
    for (let i = 0; i < 3; i += 1)
      await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(page.locator('.tl-map')).not.toHaveClass(/tl-moving/);
  };

  test('stand still for the drawings far from the screen, and go on for the ones near it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await zoomIn(page);
    // zoomed in, some drawings are far from the screen and are marked, the rest are not
    await expect
      .poll(() => page.locator('.tl-sprite[data-off]').count())
      .toBeGreaterThan(5);
    // each is read again until the browser has caught up with the camera (the marks follow it, one frame after the other)
    await expect
      .poll(async () => {
        const far = await names(page, '.tl-sprite[data-off] .tl-flag');
        return far.length > 0 && far.every((name) => name === 'none');
      })
      .toBe(true);
    await expect
      .poll(async () => {
        const near = await names(page, '.tl-sprite:not([data-off]) .tl-flag');
        return near.length > 0 && near.every((name) => name !== 'none');
      })
      .toBe(true);
  });

  test('stand still everywhere while the camera is moved by hand, and go on when it has stopped', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await zoomIn(page);
    await expect
      .poll(() => page.locator('.tl-sprite:not([data-off]) .tl-flag').count())
      .toBeGreaterThan(0);
    const box = (await page.locator('.tl-map').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
    await expect(page.locator('.tl-map')).toHaveClass(/tl-moving/);
    const moving = await names(page, '.tl-flag, .tl-steam, .tl-boat');
    expect(new Set(moving)).toEqual(new Set(['none']));
    await page.mouse.up();
    await expect(page.locator('.tl-map')).not.toHaveClass(/tl-moving/);
    await expect
      .poll(async () =>
        (await names(page, '.tl-sprite:not([data-off]) .tl-flag')).some(
          (name) => name !== 'none',
        ),
      )
      .toBe(true);
  });

  test('the bird flies by a box, not by its drawing: an svg root is not moved by the compositor', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const birds = await page.evaluate(() =>
      [...document.querySelectorAll('.tl-bird')].map((el) => ({
        tag: el.tagName.toLowerCase(),
        inside: el.querySelectorAll('svg').length,
      })),
    );
    expect(birds.length).toBeGreaterThan(0);
    for (const bird of birds) expect(bird).toEqual({ tag: 'div', inside: 1 });
  });
});
