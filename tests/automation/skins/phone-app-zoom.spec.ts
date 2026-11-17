/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { clampInside, ZOOM_MS } from '@/skins/phone/shell/app-zoom';

// An app opens by zooming out of its icon and closes by zooming back into it: the page itself (not a blank sheet) is scaled and cut to a box that grows from the icon to
// the window, with the corners of the icon growing to those of the display, over a picture of the home screen that recedes. The animations are the Web Animations API on the
// real elements, so they are paused and seeked here (`document.getAnimations()`), and the box that the clip lets through is read from the style at each point of the way.

const FOLD_KEY = 'bach-cv-phone-fold';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

const CONTEXTS = [
  { name: 'open device 1440x900', width: 1440, height: 900, fold: 'open' },
  { name: 'folded device 1440x900', width: 1440, height: 900, fold: 'folded' },
  {
    name: 'scaled open device 1280x720',
    width: 1280,
    height: 720,
    fold: 'open',
  },
  { name: 'smallest device 1100x600', width: 1100, height: 600, fold: 'open' },
  { name: 'big device 1920x1080', width: 1920, height: 1080, fold: 'open' },
  { name: 'window 390x844', width: 390, height: 844, fold: 'open' },
  { name: 'window 320x700', width: 320, height: 700, fold: 'open' },
  { name: 'window 800x900', width: 800, height: 900, fold: 'open' },
  { name: 'tablet window 1024x768', width: 1024, height: 768, fold: 'open' },
] as const;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Opens the home screen in a context, with the route of the app warmed (a development server compiles it on the first visit, which a slow animation would wait for). */
async function home(
  page: Page,
  context: (typeof CONTEXTS)[number],
  app: string,
) {
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [FOLD_KEY, context.fold],
  );
  await page.setViewportSize({ width: context.width, height: context.height });
  await gotoSkin(page, `/${app.toLowerCase()}`);
  await page.waitForTimeout(500);
  await gotoSkin(page, '/');
  await page.waitForTimeout(600);
}

const tileOf = (page: Page, app: string) =>
  page.locator(`[data-ph-app="${app.toLowerCase()}"] > :first-child`);

/** Waits until the animations of the zoom are on the page, pauses them all, and puts them at `progress` (0 to 1) of their 360 ms. */
async function seek(page: Page, progress: number) {
  await page.waitForFunction((ms) => {
    const screen = document.querySelector('[data-ph-screen]');
    return document.getAnimations().some((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return (
        target &&
        screen?.contains(target) &&
        Number(animation.effect?.getComputedTiming().duration) === ms
      );
    });
  }, ZOOM_MS);
  await page.evaluate((p) => {
    const screen = document.querySelector('[data-ph-screen]');
    for (const animation of document.getAnimations()) {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      if (!target || !screen?.contains(target)) continue;
      animation.pause();
      animation.currentTime = p * 360;
    }
  }, progress);
}

/** The box that the zoom lets through (what the clip leaves), in px of the page, and the corners of that box in px of the layout. */
function visible(page: Page, direction: 'open' | 'close') {
  return page.evaluate((way) => {
    const target =
      way === 'open'
        ? document.querySelector<HTMLElement>('[data-ph-scroller]')
        : document.querySelector<HTMLElement>('[data-ph-ghost]');
    if (!target) throw new Error('nothing zooms');
    const rect = target.getBoundingClientRect();
    const scale = target.offsetWidth ? rect.width / target.offsetWidth : 1;
    const clip = getComputedStyle(target).clipPath;
    const match = clip.match(/inset\(([^)]*)\)/);
    if (!match) throw new Error(`no inset in ${clip}`);
    const [edges, rounding = ''] = match[1].split('round');
    // the shorthand of CSS: one value is all four sides (or corners), two are the opposite pairs, three have the last pair twice
    const four = (values: number[]) =>
      values.length === 1
        ? [values[0], values[0], values[0], values[0]]
        : values.length === 2
          ? [values[0], values[1], values[0], values[1]]
          : values.length === 3
            ? [values[0], values[1], values[2], values[1]]
            : values.length === 4
              ? values
              : [0, 0, 0, 0];
    const numbers = (text: string) =>
      text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((value) => parseFloat(value));
    const [top, right, bottom, left] = four(numbers(edges));
    const corners = four(numbers(rounding));
    return {
      box: {
        x: rect.left + left * scale,
        y: rect.top + top * scale,
        width: rect.width - (left + right) * scale,
        height: rect.height - (top + bottom) * scale,
      },
      corners,
      scale,
    };
  }, direction);
}

/** The window the app opens in: the screen of a device, the viewport of a window. */
function windowOf(page: Page): Promise<Rect> {
  return page.evaluate(() => {
    const scroller = document.querySelector<HTMLElement>('[data-ph-scroller]');
    const screen = document.querySelector<HTMLElement>('[data-ph-screen]');
    if (!scroller || !screen) throw new Error('no screen');
    if (screen.dataset.mode === 'device') {
      const rect = scroller.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }
    return { x: 0, y: 0, width: innerWidth, height: innerHeight };
  });
}

const inside = (box: Rect, bounds: Rect, tolerance = 1) =>
  box.x >= bounds.x - tolerance &&
  box.y >= bounds.y - tolerance &&
  box.x + box.width <= bounds.x + bounds.width + tolerance &&
  box.y + box.height <= bounds.y + bounds.height + tolerance;

const PROGRESS = [0, 0.1, 0.25, 0.5, 0.75, 1];

for (const context of CONTEXTS)
  test.describe(context.name, () => {
    test('an app opens by zooming out of its icon: the box starts as the icon and ends as the screen, always inside it, with the corners of the icon growing to the display', async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await home(page, context, 'Projects');
      // an icon below the fold of a small window is scrolled to before it is clicked: the icon is measured where it is clicked
      const link = page
        .getByRole('link', { name: 'Projects', exact: true })
        .first();
      await link.scrollIntoViewIfNeeded();
      const icon = await tileOf(page, 'Projects').boundingBox();
      if (!icon) throw new Error('no icon');
      await link.click();
      await seek(page, 0);
      const win = await windowOf(page);
      const first = await visible(page, 'open');
      // the first frame is the icon: its place and its size, within a few px (the link is a little pressed when it is clicked), with its corners
      expect(Math.abs(first.box.x - icon.x)).toBeLessThan(4);
      expect(Math.abs(first.box.y - icon.y)).toBeLessThan(4);
      expect(Math.abs(first.box.width - icon.width)).toBeLessThan(4);
      expect(Math.abs(first.box.height - icon.height)).toBeLessThan(4);
      expect(first.corners[0]).toBeCloseTo(icon.width * 0.3, 0);
      // the content is at its FINAL size, only scaled: its layout box is the one it will have
      const laidOut = await page.evaluate(() => {
        const content = document.querySelector<HTMLElement>(
          '[data-ph-scroller] > [data-ph-zoom-content]',
        );
        return content ? [content.offsetWidth, content.offsetHeight] : null;
      });
      let before = 0;
      for (const p of PROGRESS) {
        await seek(page, p);
        const at = await visible(page, 'open');
        expect(
          inside(at.box, win),
          `box at ${p * 100}% inside the screen`,
        ).toBe(true);
        // it only grows
        expect(at.box.width).toBeGreaterThanOrEqual(before - 1);
        before = at.box.width;
        // never an overshoot: no corner is larger than half of the box
        for (const corner of at.corners)
          expect(corner).toBeLessThanOrEqual(
            Math.min(at.box.width, at.box.height) / 2 / at.scale + 0.5,
          );
      }
      // the last frame is the screen, with the corners of the display
      const last = await visible(page, 'open');
      expect(Math.abs(last.box.x - win.x)).toBeLessThan(1);
      expect(Math.abs(last.box.y - win.y)).toBeLessThan(1);
      expect(Math.abs(last.box.width - win.width)).toBeLessThan(1);
      expect(Math.abs(last.box.height - win.height)).toBeLessThan(1);
      const displayCorners = await page.evaluate(() => {
        const display = document.querySelector('.ph-display');
        // in a window of its own the screen is the window: square corners (the box of `.ph-display` is not drawn there)
        if (
          !display ||
          document.querySelector<HTMLElement>('[data-ph-screen]')?.dataset
            .mode !== 'device'
        )
          return [0, 0, 0, 0];
        const style = getComputedStyle(display);
        return [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius,
        ].map((value) => parseFloat(value));
      });
      expect(last.corners.map((value) => Math.round(value))).toEqual(
        displayCorners.map((value) => Math.round(value)),
      );
      expect(
        await page.evaluate(() => {
          const content = document.querySelector<HTMLElement>(
            '[data-ph-scroller] > [data-ph-zoom-content]',
          );
          return content ? [content.offsetWidth, content.offsetHeight] : null;
        }),
      ).toEqual(laidOut);
    });

    test('while it zooms there is one page for readers (the pictures are hidden and inert), and when it is over nothing is left of it and the focus is in the page', async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await home(page, context, 'Resume');
      await page
        .getByRole('link', { name: 'Resume', exact: true })
        .first()
        .click();
      await seek(page, 0.4);
      const ghost = page.locator('[data-ph-ghost]');
      await expect(ghost).toHaveCount(1);
      await expect(ghost).toHaveAttribute('aria-hidden', 'true');
      await expect(ghost).toHaveAttribute('inert', '');
      // one heading of the page, one app bar: the picture has no names of the page's own
      await expect(
        page.getByRole('heading', { name: 'Resume', level: 1 }),
      ).toHaveCount(1);
      await expect(page.locator('[data-ph-app-bar]')).toHaveCount(1);
      // let it play out
      await page.evaluate(() => {
        for (const animation of document.getAnimations()) {
          if (animation.playState === 'paused') animation.play();
        }
      });
      await expect(page.locator('[data-ph-ghost]')).toHaveCount(0);
      await expect(page.locator('[data-ph-zoom]')).toHaveCount(0);
      const after = await page.evaluate(() => {
        const scroller =
          document.querySelector<HTMLElement>('[data-ph-scroller]');
        const content = scroller?.querySelector<HTMLElement>(
          ':scope > [data-ph-zoom-content]',
        );
        return {
          clip: scroller ? getComputedStyle(scroller).clipPath : '',
          transform: content?.style.transform ?? '',
          opacity: content?.style.opacity ?? '',
          animations: document.getAnimations().filter((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            return (
              target &&
              document.querySelector('[data-ph-screen]')?.contains(target) &&
              Number(a.effect?.getComputedTiming().duration) === 360
            );
          }).length,
          focus: !!document.activeElement?.closest('[data-ph-screen]'),
        };
      });
      expect(after).toEqual({
        clip: 'none',
        transform: '',
        opacity: '',
        animations: 0,
        focus: true,
      });
    });

    test('an app closes by zooming back into its icon: the box starts as the screen and ends as the icon, always inside the screen', async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await home(page, context, 'Projects');
      await page
        .getByRole('link', { name: 'Projects', exact: true })
        .first()
        .click();
      await expect(page.locator('[data-ph-zoom]')).toHaveCount(0, {
        timeout: 8000,
      });
      await page.waitForTimeout(400);
      await page
        .locator('[data-ph-app-bar]')
        .getByRole('link', { name: 'Home' })
        .click();
      await seek(page, 0);
      const win = await windowOf(page);
      const first = await visible(page, 'close');
      expect(Math.abs(first.box.width - win.width)).toBeLessThan(1);
      expect(Math.abs(first.box.height - win.height)).toBeLessThan(1);
      for (const p of PROGRESS) {
        await seek(page, p);
        const at = await visible(page, 'close');
        expect(
          inside(at.box, win),
          `box at ${p * 100}% inside the screen`,
        ).toBe(true);
      }
      const last = await visible(page, 'close');
      // the icon it goes into is the one the home screen has when it has come back
      await page.evaluate(() => {
        for (const animation of document.getAnimations()) animation.finish();
      });
      await expect(page.locator('[data-ph-ghost]')).toHaveCount(0);
      const tile = await tileOf(page, 'Projects').boundingBox();
      if (!tile) throw new Error('no icon');
      // an icon that is below the fold of the home screen (a small window) is zoomed into at the edge of the window
      const icon = clampInside(tile, win);
      expect(Math.abs(last.box.x - icon.x)).toBeLessThan(2);
      expect(Math.abs(last.box.y - icon.y)).toBeLessThan(2);
      expect(Math.abs(last.box.width - icon.width)).toBeLessThan(2);
      expect(Math.abs(last.box.height - icon.height)).toBeLessThan(2);
      // the focus is back on the icon that was closed into
      await expect(page.locator('[data-ph-app="projects"]')).toBeFocused();
    });
  });

test.describe('every app, every way back', () => {
  const APPS = [
    'About',
    'Resume',
    'Projects',
    'Certificates',
    'Services',
    'Payment',
  ];
  test('each of the six apps zooms out of its own icon inside the screen of an open device', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const context = CONTEXTS[0];
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [FOLD_KEY, context.fold],
    );
    await page.setViewportSize({
      width: context.width,
      height: context.height,
    });
    for (const app of APPS) {
      await gotoSkin(page, `/${app.toLowerCase()}`);
      await page.waitForTimeout(400);
      await gotoSkin(page, '/');
      await page.waitForTimeout(500);
      const icon = await tileOf(page, app).boundingBox();
      if (!icon) throw new Error(`no icon of ${app}`);
      await page.getByRole('link', { name: app, exact: true }).first().click();
      await seek(page, 0);
      const win = await windowOf(page);
      const first = await visible(page, 'open');
      expect(Math.abs(first.box.x - icon.x), app).toBeLessThan(4);
      expect(Math.abs(first.box.y - icon.y), app).toBeLessThan(4);
      await seek(page, 0.5);
      expect(inside((await visible(page, 'open')).box, win), app).toBe(true);
      await page.evaluate(() => {
        for (const animation of document.getAnimations()) animation.finish();
      });
      await expect(page.locator('[data-ph-ghost]')).toHaveCount(0);
    }
  });

  for (const way of [
    'the back link',
    'the home bar',
    'the browser back button',
  ] as const)
    test(`closes by zooming into the icon with ${way}`, async ({ page }) => {
      test.setTimeout(90_000);
      await home(page, CONTEXTS[5], 'Resume');
      await page
        .getByRole('link', { name: 'Resume', exact: true })
        .first()
        .click();
      await expect(page.locator('[data-ph-zoom]')).toHaveCount(0, {
        timeout: 8000,
      });
      await page.waitForTimeout(400);
      if (way === 'the back link')
        await page
          .locator('[data-ph-app-bar]')
          .getByRole('link', { name: 'Home' })
          .click();
      else if (way === 'the home bar')
        await page
          .getByRole('link', { name: 'Go to the home screen' })
          .click({ force: true });
      else await page.goBack();
      await page.waitForFunction(() =>
        document.querySelector('[data-ph-ghost]'),
      );
      await expect(page.locator('[data-ph-ghost]')).toHaveCount(1);
      await expect(page.locator('[data-ph-ghost]')).toHaveAttribute(
        'inert',
        '',
      );
    });

  test('a second change of page during the zoom ends it at once and leaves nothing half way', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await home(page, CONTEXTS[0], 'Projects');
    await page
      .getByRole('link', { name: 'Projects', exact: true })
      .first()
      .click();
    await seek(page, 0.2);
    // back, in the middle of the zoom
    await page
      .locator('[data-ph-app-bar]')
      .getByRole('link', { name: 'Home' })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('link', { name: 'Projects', exact: true }).first(),
    ).toBeVisible();
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) animation.finish();
    });
    await expect(page.locator('[data-ph-ghost]')).toHaveCount(0);
    await expect(page.locator('[data-ph-zoom]')).toHaveCount(0);
    const state = await page.evaluate(() => {
      const scroller =
        document.querySelector<HTMLElement>('[data-ph-scroller]');
      const content = scroller?.querySelector<HTMLElement>(
        ':scope > [data-ph-zoom-content]',
      );
      return {
        clip: scroller ? getComputedStyle(scroller).clipPath : '',
        opacity: content ? getComputedStyle(content).opacity : '',
        transform: content ? getComputedStyle(content).transform : '',
      };
    });
    expect(state).toEqual({ clip: 'none', opacity: '1', transform: 'none' });
  });

  test('a page that is not opened from an icon (the rail of a tablet) is a short fade, with no picture', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await home(page, CONTEXTS[0], 'Resume');
    await gotoSkin(page, '/projects');
    await page.waitForTimeout(500);
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Resume' })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator('[data-ph-ghost]')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'Resume', level: 1 }),
    ).toBeVisible();
  });

  test('a visitor who asked for less motion gets the page with a fade and no zoom', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await home(page, CONTEXTS[0], 'Projects');
    await page
      .getByRole('link', { name: 'Projects', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator('[data-ph-ghost]')).toHaveCount(0);
    await expect(page.locator('[data-ph-zoom]')).toHaveCount(0);
    const clip = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector('[data-ph-scroller]') as Element,
        ).clipPath,
    );
    expect(clip).toBe('none');
    await expect(
      page.getByRole('heading', { name: 'Projects', level: 1 }),
    ).toBeVisible();
  });
});
