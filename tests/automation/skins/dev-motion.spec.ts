/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';
import { trackViewTransitions } from '../support/view-transitions';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

const tabs = (page: Page) =>
  page.locator('nav[aria-label="Main"] a[data-slot="dev-tab"]');

test.describe('motion in the Dev skin', () => {
  test('a page change fades the page out and the next one in, and the green line goes to the new tab', async ({
    page,
  }) => {
    const watch = await trackViewTransitions(page);
    await gotoSkin(page, '/');
    // exactly one element carries the name, inside the open tab
    const named = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('nav a[data-slot="dev-tab"] > span')]
          .filter(
            (el) =>
              getComputedStyle(el).getPropertyValue('view-transition-name') ===
              'dv-tabline',
          )
          .map((el) => el.parentElement?.getAttribute('href')),
      );
    expect(await named()).toEqual(['/']);

    await tabs(page).filter({ hasText: 'projects' }).first().click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect.poll(named).toEqual(['/projects']);
    await expect.poll(watch.started).toBeGreaterThan(0);
    // our own keyframes play (a selector that does not match leaves the browser's default fade), and the tab line is a group that glides
    await expect
      .poll(async () => (await watch.animations()).map((a) => a.keyframes))
      .toEqual(expect.arrayContaining(['vt-out', 'vt-in']));
    expect((await watch.animations()).map((a) => a.pseudo)).toContain(
      '::view-transition-group(dv-tabline)',
    );
  });

  test('the sync icon of the status bar turns while the page reads data, and stops after', async ({
    page,
  }) => {
    // every read waits a moment, so there is a time in which something is being fetched
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fallback();
    });
    await page.goto('/projects');
    const sync = page.locator('[data-fetching] svg');
    await expect(sync).toBeVisible();
    expect(
      await sync.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('spin');
    await expect(page.locator('[data-fetching]')).toHaveCount(0, {
      timeout: 15_000,
    });
  });

  test('the photos of About zoom a little and the frame takes the accent colour under the mouse', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const frame = page.locator('.group\\/photo').first();
    const picture = frame.locator('img');
    await expect(picture).toBeVisible();
    const border = () =>
      frame.evaluate((el) => getComputedStyle(el).borderTopColor);
    const before = await border();
    await frame.hover();
    await expect
      .poll(async () =>
        picture.evaluate((el) => Number(getComputedStyle(el).scale)),
      )
      .toBeGreaterThan(1.04);
    await expect.poll(border).not.toBe(before);
  });

  test('the moving list of technologies has a pause button that works without a mouse', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const marquee = page.locator('section[aria-label="Technologies"] > div');
    await expect(marquee).toBeVisible();
    const state = () =>
      marquee.evaluate((el) => getComputedStyle(el).animationPlayState);
    // a list that is scrolled out of view waits by itself: look at it on screen
    await marquee.scrollIntoViewIfNeeded();
    await expect.poll(state).toBe('running');
    await page
      .getByRole('button', { name: 'Pause the moving list of technologies' })
      .focus();
    await page.keyboard.press('Enter');
    await expect.poll(state).toBe('paused');
    await page.keyboard.press('Enter');
    await expect.poll(state).toBe('running');
  });

  test('the bottom panel rises when it opens', async ({ page }) => {
    await gotoSkin(page, '/');
    const panel = page.locator('[data-slot="dev-panel"]');
    await expect(panel).toBeHidden();
    await page.getByRole('button', { name: 'Output', exact: true }).click();
    await expect(panel).toBeVisible();
    expect(
      await panel.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('dv-panelin');
  });

  test('the problem count does not nudge on load', async ({ page }) => {
    await gotoSkin(page, '/');
    const counter = page
      .getByRole('button', { name: /^Problems \(/ })
      .locator('span')
      .first();
    await expect(counter).toBeVisible();
    await expect(counter).not.toHaveClass(/dv-bump/);
  });

  test('the problem count nudges when a problem is added', async ({ page }) => {
    // set before the page opens, so no cached answer can stand in for the failed read
    await page.route('**/firestore.googleapis.com/**', (route) =>
      route.request().url().includes(':runQuery') &&
      (route.request().postData() ?? '').includes('"collectionId":"projects"')
        ? route.fulfill({ status: 500, body: '{}' })
        : route.fallback(),
    );
    await gotoSkin(page, '/projects');
    // a failed read is tried again a few times before it counts as a problem
    await expect(
      page.getByRole('button', { name: /^Problems \([1-9]/ }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page
        .getByRole('button', { name: /^Problems \(/ })
        .locator('span')
        .first(),
    ).toHaveClass(/dv-bump/);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('a page change plays no animation', async ({ page }) => {
      const watch = await trackViewTransitions(page);
      await gotoSkin(page, '/');
      await tabs(page).filter({ hasText: 'projects' }).first().click();
      await expect(page).toHaveURL(/\/projects$/);
      await expect.poll(watch.started).toBeGreaterThan(0);
      await expect
        .poll(async () => (await watch.animations()).length)
        .toBeGreaterThan(0);
      for (const animation of await watch.animations())
        expect(animation.duration).toBe(0);
    });
  });

  test.describe('endless loops', () => {
    /** The play states of the animations that never end, inside `target` (also those of its pseudo-elements). */
    const loops = (target: Locator) =>
      target.evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
          .map((a) => a.playState),
      );
    const allOf = (states: string[], state: string) =>
      states.length > 0 && states.every((value) => value === state);
    /** Puts the tab in the background (or back): the page only reads `visibilityState`. */
    const setTab = (page: Page, state: 'hidden' | 'visible') =>
      page.evaluate((value) => {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          get: () => value,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      }, state);

    test('the marquee, the fill bars, the caret and the dots of the chat button run in a visible tab and wait in a background one', async ({
      page,
    }) => {
      await gotoSkin(page, '/');
      const loopRoots = [
        page.locator('section[aria-label="Technologies"] > div'),
        page.locator('[data-reveal]:has(span[class*="dv-fill"])'),
        page.locator('h1 .dv-caret'),
        page.locator('[data-slot="dev-chat-fab"]'),
      ];
      // a loop that is off screen waits too: bring each one into view before looking at it
      const running = async (root: Locator) => {
        await root.scrollIntoViewIfNeeded();
        await expect
          .poll(async () => allOf(await loops(root), 'running'))
          .toBe(true);
      };
      for (const root of loopRoots) await running(root);
      await setTab(page, 'hidden');
      await expect(page.locator('.dv-root')).toHaveAttribute('data-hidden', '');
      for (const root of loopRoots)
        expect(allOf(await loops(root), 'paused')).toBe(true);
      await setTab(page, 'visible');
      await expect(page.locator('.dv-root')).not.toHaveAttribute(
        'data-hidden',
        '',
      );
      for (const root of loopRoots) await running(root);
    });

    test('a loop that is scrolled out of view waits, and goes on when it is scrolled back', async ({
      page,
    }) => {
      await gotoSkin(page, '/');
      const bars = page.locator('[data-reveal]:has(span[class*="dv-fill"])');
      await expect(bars).toBeAttached();
      await bars.scrollIntoViewIfNeeded();
      await expect(bars).not.toHaveAttribute('data-off', '');
      await expect
        .poll(async () => allOf(await loops(bars), 'running'))
        .toBe(true);
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      );
      await expect(bars).toHaveAttribute('data-off', '');
      expect(allOf(await loops(bars), 'paused')).toBe(true);
      await bars.scrollIntoViewIfNeeded();
      await expect(bars).not.toHaveAttribute('data-off', '');
      await expect
        .poll(async () => allOf(await loops(bars), 'running'))
        .toBe(true);
    });

    test('a skeleton shimmers while it is on screen and waits in a background tab', async ({
      page,
    }) => {
      // the reads wait until the test lets them go, so the skeleton stays
      let release = () => {};
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route('**/firestore.googleapis.com/**', async (route) => {
        await held;
        await route.fallback();
      });
      await page.goto('/projects');
      const skeleton = page.locator(
        'main [aria-hidden="true"].overflow-hidden',
      );
      await expect(skeleton.first()).toBeVisible();
      await expect
        .poll(async () => allOf(await loops(skeleton.first()), 'running'))
        .toBe(true);
      await setTab(page, 'hidden');
      expect(allOf(await loops(skeleton.first()), 'paused')).toBe(true);
      await setTab(page, 'visible');
      release();
    });

    test.describe('with reduced motion', () => {
      test.use({ reducedMotion: 'reduce' });

      test('none of them runs', async ({ page }) => {
        await gotoSkin(page, '/');
        await expect(page.locator('h1 .dv-caret')).toBeAttached();
        for (const root of [
          page.locator('section[aria-label="Technologies"]'),
          page.locator('[data-reveal]:has(span[class*="dv-fill"])'),
          page.locator('h1 .dv-caret'),
          page.locator('[data-slot="dev-chat-fab"]'),
        ])
          expect(await loops(root)).toEqual([]);
      });
    });
  });

  test('the chat header says online while the chat can be reached', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await expect(
      page.getByRole('dialog').getByText('Online', { exact: true }),
    ).toBeVisible();
  });
});
