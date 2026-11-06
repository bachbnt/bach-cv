/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
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
    expect(await state()).toBe('running');
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
