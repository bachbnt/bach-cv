/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Browser, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import {
  holdData,
  settled,
  shiftBetween,
  type Box,
} from '../support/layout-shift';
import { useSkin as chooseSkin } from '../support/skin';
import type { SkinId } from '@/lib/skin/skins';

// A skeleton mirrors the loaded structure, and this measures it: the data of every page is held, the page is read with its skeleton, the data
// is let in and the page is read again. Each skin is read at three widths (and the folded device of Phone), page by page.

const SKINS: SkinId[] = [
  'standard',
  'dev',
  'trade',
  'academic',
  'travel',
  'phone',
];
const PAGES = [
  '/',
  '/projects',
  '/resume',
  '/about',
  '/certificates',
  '/services',
  '/payment',
];
const SIZES = [
  { width: 1440, height: 900 },
  { width: 800, height: 900 },
  { width: 390, height: 844 },
];

/** Pages whose lists have the size of the seed, so the whole place of the skeleton must have the height of the loaded blocks. */
const SAME_HEIGHT = ['/about', '/certificates', '/services', '/payment'];

/**
 * The loaded counterparts of the marked parts of a Projects skeleton (`data-skeleton="toolbar"`, `"item"`: the first repeated unit): their boxes
 * must be those of the skeleton's. Phone marks its loaded blocks with `data-projects-part` and also has `detail` (the card of the open project, only
 * where the screen is a tablet: a skeleton that does not mark it has none to compare).
 */
const UNITS: Partial<
  Record<SkinId, { toolbar: string; item: string; detail?: string }>
> = {
  standard: {
    toolbar: 'div.flex.flex-wrap:has(> input)',
    item: 'section article',
  },
  dev: {
    toolbar: 'div.mt-1.flex:has(input)',
    item: '[data-slot="dev-project"]',
  },
  travel: {
    toolbar: 'div.flex.flex-wrap:has(> input.h-8)',
    item: 'li.snap-start',
  },
  academic: {
    toolbar: '[role="group"]:has(input)',
    item: 'main li:has(article)',
  },
  phone: {
    toolbar: '[data-projects-part="toolbar"]',
    item: '[data-projects-part="item"]',
    detail: '[data-projects-part="detail"]',
  },
  trade: {
    toolbar: 'div.flex.flex-wrap.items-center.border-b:has([role="searchbox"])',
    item: '[data-testid="project-grid"] [role="table"] [role="none"] > div',
  },
};

/** The pages whose skeleton stands for a list of the seed's typical length: every place a skeleton holds must have the height of what takes it (each by itself). */
const TYPICAL = ['/', '/projects', '/resume'];

/** The first role of the Resume skeleton (`data-skeleton="item"`) and its loaded counterpart: the first row is the open one. */
const ROLES: Partial<Record<SkinId, string>> = {
  standard: 'section article',
};

/** A place may differ from the loaded one by the larger of 24 px and 8 %. */
const within = (skeleton: number, loaded: number) =>
  Math.abs(skeleton - loaded) <= Math.max(24, loaded * 0.08);

/** The narrowest phone the skeletons are measured at. */
const NARROW = { width: 320, height: 640 };

const near = (a: number, b: number, tolerance = 4) =>
  Math.abs(a - b) <= Math.max(tolerance, Math.abs(b) * 0.08);

async function openHeld(
  browser: Browser,
  skin: SkinId,
  size: (typeof SIZES)[number],
  path: string,
  folded = false,
) {
  const context = await browser.newContext({ viewport: size });
  const page = await context.newPage();
  await page.addInitScript((fold) => {
    window.localStorage.setItem('bach-cv-theme', 'dark');
    window.localStorage.setItem('bach-cv-phone-fold', fold ? 'folded' : 'open');
  }, folded);
  await chooseSkin(page, skin);
  await mockFirestore(page);
  await mockImages(page);
  const hold = await holdData(page);
  await page.goto(path);
  await page
    .locator('html[data-skin-ready], html:not([data-skin])')
    .first()
    .waitFor({ state: 'attached' });
  await page
    .locator('[aria-busy="true"]')
    .first()
    .waitFor({ state: 'attached' });
  return { context, page, hold };
}

/** The box of the first element that matches, or `null` at once when there is none (the page does not mark it). */
const box = async (page: Page, selector: string): Promise<Box | null> => {
  const element = page.locator(selector).first();
  if ((await element.count()) === 0) return null;
  const b = await element.boundingBox({ timeout: 2000 });
  return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
};

/** One page, read with its skeleton and again with its data: the structure, the places, the first units. */
async function checkPage(
  browser: Browser,
  skin: SkinId,
  size: (typeof SIZES)[number],
  path: string,
  folded = false,
) {
  const { context, page, hold } = await openHeld(
    browser,
    skin,
    size,
    path,
    folded,
  );
  const where = `${skin} ${size.width} ${path}`;
  const busy = page.locator('[aria-busy="true"]').first();
  await expect(busy, where).toHaveAttribute('role', 'status');
  await expect(busy, where).toHaveAttribute('aria-label', /.+/);

  const before = await settled(page);
  const marked = {
    toolbar: await box(page, '[data-skeleton="toolbar"]'),
    item: await box(page, '[data-skeleton="item"]'),
    detail: await box(page, '[data-skeleton="detail"]'),
  };
  hold.release();
  await expect(page.locator('[aria-busy="true"]'), where).toHaveCount(0);
  const after = await settled(page);
  const shift = shiftBetween(before, after);

  expect(before.shapes.length, `${where}: blank shapes`).toBeGreaterThanOrEqual(
    3,
  );
  expect(shift.slotDw, `${where}: width of the place`).toBeLessThanOrEqual(4);
  // the skeleton keeps the page chrome (headings, tabs, buttons) where it will be: nothing above the data moves
  if (SAME_HEIGHT.includes(path))
    expect(shift.slotDh, `${where}: height of the place`).toBeLessThanOrEqual(
      Math.max(
        24,
        Math.round(
          Math.max(...Object.values(after.slots).map((s) => s.h)) * 0.08,
        ),
      ),
    );

  if (TYPICAL.includes(path))
    for (const [key, slot] of Object.entries(after.slots)) {
      const held = before.slots[key];
      if (!held) continue;
      expect(
        within(held.h, slot.h),
        `${where}: place ${key} is ${held.h} px with the skeleton and ${slot.h} px with the data`,
      ).toBe(true);
    }

  const role = ROLES[skin];
  if (path === '/resume' && role) {
    const skeleton = marked.item;
    expect(
      skeleton,
      `${where}: the skeleton marks its first role`,
    ).not.toBeNull();
    const loaded = await box(page, role);
    expect(loaded, `${where}: the loaded first role`).not.toBeNull();
    if (skeleton && loaded) {
      expect(near(skeleton.x, loaded.x), `${where} role: x`).toBe(true);
      expect(
        near(skeleton.w, loaded.w),
        `${where} role: width ${skeleton.w} / ${loaded.w}`,
      ).toBe(true);
      expect(
        near(skeleton.h, loaded.h, 8),
        `${where} role: height ${skeleton.h} / ${loaded.h}`,
      ).toBe(true);
    }
  }

  const units = UNITS[skin];
  if (path === '/projects' && units) {
    for (const part of ['toolbar', 'item', 'detail'] as const) {
      const skeleton = marked[part];
      const selector = units[part];
      if (!selector || (part === 'detail' && !skeleton)) continue;
      expect(
        skeleton,
        `${where}: the skeleton marks its ${part}`,
      ).not.toBeNull();
      const loaded = await box(page, selector);
      expect(loaded, `${where}: the loaded ${part}`).not.toBeNull();
      if (skeleton && loaded) {
        // a row of the loaded page shows more or fewer lines of text than a typical one: the width and the place must be the same
        expect(
          near(skeleton.x, loaded.x),
          `${where} ${part}: x ${skeleton.x} / ${loaded.x}`,
        ).toBe(true);
        expect(
          near(skeleton.w, loaded.w),
          `${where} ${part}: width ${skeleton.w} / ${loaded.w}`,
        ).toBe(true);
        // a postcard of Travel is 371 to 494 px tall at 320 px (the average, 426, is the skeleton's 430): the first one of the seed is the
        // shortest, so its height is the one case that is compared at 16 % instead of 8 % (the whole strip is still held to the 8 % of a place)
        const spread =
          skin === 'travel' && size.width === NARROW.width && part === 'item'
            ? 2
            : 1;
        expect(
          near(skeleton.h, loaded.h, 8 * spread) ||
            Math.abs(skeleton.h - loaded.h) <= loaded.h * 0.08 * spread,
          `${where} ${part}: height ${skeleton.h} / ${loaded.h}`,
        ).toBe(true);
      }
    }
  }
  await context.close();
}

for (const skin of SKINS)
  for (const size of SIZES)
    for (const folded of skin === 'phone' && size.width === 1440
      ? [false, true]
      : [false])
      test(`${skin} ${size.width}${folded ? ' folded' : ''}: the skeleton of every page has the structure of the loaded one`, async ({
        browser,
      }) => {
        test.setTimeout(300_000);
        for (const path of PAGES)
          await checkPage(browser, skin, size, path, folded);
      });

// the narrowest phone: the lines of text wrap more, and the skeleton of Home, Projects and Resume still holds the places the data will take
for (const skin of SKINS)
  test(`${skin} 320: the skeleton of Home, Projects and Resume has the places of the loaded ones`, async ({
    browser,
  }) => {
    test.setTimeout(240_000);
    for (const path of TYPICAL) await checkPage(browser, skin, NARROW, path);
  });

for (const skin of SKINS)
  test(`${skin}: no shimmer or pulse runs under reduced motion`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: SIZES[0],
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await chooseSkin(page, skin);
    await mockFirestore(page);
    await mockImages(page);
    await holdData(page);
    await page.goto('/projects');
    await page
      .locator('[aria-busy="true"]')
      .first()
      .waitFor({ state: 'attached' });
    expect((await settled(page)).running).toBe(0);
    await context.close();
  });
