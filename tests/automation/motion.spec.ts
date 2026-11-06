/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { trackViewTransitions } from './support/view-transitions';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

const scaleOf = (matrix: string) =>
  matrix === 'none' ? 1 : Number(matrix.match(/matrix\(([^,]+)/)?.[1] ?? 1);
/** Tailwind's `scale-*` sets the `scale` property (`none` or `1.04`), not `transform`. */
const zoomOf = (value: string) => (value === 'none' ? 1 : Number(value));

/** Lets the page draw two frames, so a style that was going to change has changed. */
const afterTwoFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

test.describe('motion', () => {
  test('a page change fades the page out and the next one in, and the header stays', async ({
    page,
  }) => {
    const watch = await trackViewTransitions(page);
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Projects' })
      .click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
    await expect.poll(watch.started).toBeGreaterThan(0);
    // our own keyframes play (not the browser's default fade), and the header is a group of its own
    await expect
      .poll(async () => (await watch.animations()).map((a) => a.keyframes))
      .toEqual(expect.arrayContaining(['vt-out', 'vt-in']));
    expect((await watch.animations()).map((a) => a.pseudo)).toContain(
      '::view-transition-group(site-header)',
    );
  });

  test('a filter swaps its list in a view transition, and the cards still filter', async ({
    page,
  }) => {
    const watch = await trackViewTransitions(page);
    await page.goto('/projects');
    const group = page.getByRole('group', { name: 'Filter projects' });
    await expect(group.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const before = await watch.started();
    await group.getByRole('button', { name: 'Personal' }).click();
    await expect(
      group.getByRole('button', { name: 'Personal' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('heading', { name: 'FinHub MCP' }),
    ).toBeVisible();
    await expect.poll(watch.started).toBeGreaterThan(before);
    await expect
      .poll(async () => (await watch.animations()).map((a) => a.keyframes))
      .toEqual(expect.arrayContaining(['vt-in']));
    // the header is not part of a filter swap
    expect((await watch.animations()).map((a) => a.pseudo)).not.toContain(
      '::view-transition-group(site-header)',
    );
  });

  test('a line along the top grows with the scroll, in the colour of the page', async ({
    page,
  }) => {
    await page.goto('/resume');
    // the roles arrive after the page: wait for them, or the page is too short to scroll
    await expect(page.locator('a[data-row], article').first()).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollHeight - window.innerHeight,
        ),
      )
      .toBeGreaterThan(300);
    const bar = page.locator('.scroll-progress');
    await expect(bar).toHaveCSS('position', 'fixed');
    await expect
      .poll(async () =>
        scaleOf(await bar.evaluate((el) => getComputedStyle(el).transform)),
      )
      .toBeLessThan(0.05);
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect
      .poll(async () =>
        scaleOf(await bar.evaluate((el) => getComputedStyle(el).transform)),
      )
      .toBeGreaterThan(0.95);
  });

  test('a project cover zooms a little when the mouse is over it', async ({
    page,
  }) => {
    await page.goto('/projects');
    const card = page
      .locator('article')
      .filter({ has: page.getByRole('button', { name: /screenshots$/ }) })
      .first();
    const cover = card.locator('img').first();
    expect(
      zoomOf(await cover.evaluate((el) => getComputedStyle(el).scale)),
    ).toBe(1);
    await card.getByRole('button', { name: /screenshots$/ }).hover();
    await expect
      .poll(async () =>
        zoomOf(await cover.evaluate((el) => getComputedStyle(el).scale)),
      )
      .toBeGreaterThan(1.04);
  });

  test('the arrow of an outside link moves a little on hover', async ({
    page,
  }) => {
    await page.goto('/projects');
    const link = page.getByRole('link', { name: 'App Store' }).first();
    const arrow = link.locator('svg');
    const at = async () =>
      arrow.evaluate((el) => getComputedStyle(el).translate);
    expect(await at()).toBe('none');
    await link.hover();
    await expect.poll(at).not.toBe('none');
  });

  test('the picture of the dialog is a new one that fades in when it changes', async ({
    page,
  }) => {
    await page.goto('/projects');
    await page.getByRole('button', { name: '6 screenshots' }).first().click();
    const dialog = page.getByRole('dialog');
    const picture = dialog.locator('img[alt]').first();
    await expect(picture).toBeVisible();
    // the old picture is marked: a picture that fades in is a new element, so the mark is gone after the change
    await picture.evaluate((el) => el.setAttribute('data-old', ''));
    await dialog.getByRole('button', { name: 'Go to screenshot 2' }).click();
    await expect(dialog.getByText('2 of 6')).toBeVisible();
    await expect(dialog.locator('img[alt][data-old]')).toHaveCount(0);
    expect(
      await dialog
        .locator('img[alt]')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('enter');
  });

  test('the photos on About rise and zoom a little under the mouse', async ({
    page,
  }) => {
    await page.goto('/about');
    const frame = page.locator('.group\\/photo').first();
    const picture = frame.locator('img');
    await expect(picture).toBeVisible();
    expect(
      zoomOf(await picture.evaluate((el) => getComputedStyle(el).scale)),
    ).toBe(1);
    await frame.hover();
    await expect
      .poll(async () =>
        zoomOf(await picture.evaluate((el) => getComputedStyle(el).scale)),
      )
      .toBeGreaterThan(1.04);
    await expect
      .poll(() => frame.evaluate((el) => getComputedStyle(el).translate))
      .toBe('0px -3px');
  });

  test('the chips of About are pulled toward the mouse like a magnet and let go when it leaves', async ({
    page,
  }) => {
    await page.goto('/about');
    const chip = page.locator('[data-magnet]').first();
    await expect(chip).toBeVisible();
    const box = (await chip.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const shift = () =>
      chip.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          translate: style.translate,
          scale: Number(style.scale === 'none' ? 1 : style.scale),
        };
      });
    expect((await shift()).translate).toMatch(/^(none|0px(?: 0px)?)$/);

    // the mouse comes near, to the right of the chip: it moves right and grows a little
    await page.mouse.move(cx + box.width / 2 + 50, cy);
    await expect
      .poll(async () => parseFloat((await shift()).translate))
      .toBeGreaterThan(2);
    expect((await shift()).scale).toBeGreaterThan(1);
    // and it never travels far
    expect(parseFloat((await shift()).translate)).toBeLessThanOrEqual(12);

    // far away it lets go
    await page.mouse.move(cx, cy + 700);
    await expect
      .poll(async () => (await shift()).translate)
      .toMatch(/^(none|0px(?: 0px)?)$/);
  });

  test('the BB Bot button has a green dot, lifts on hover, and calls attention once if it is left alone', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/');
    const fab = page.locator('button.bb-fab');
    await expect(fab).toBeVisible();
    await expect(fab.locator('.current-dot')).toBeVisible();

    await fab.hover();
    await expect
      .poll(() => fab.evaluate((el) => getComputedStyle(el).translate))
      .toBe('0px -3px');

    await expect(fab).not.toHaveAttribute('data-nudge');
    await page.clock.fastForward(21_000);
    await expect(fab).toHaveAttribute('data-nudge', '');
    expect(
      await fab
        .locator('.bb-ring')
        .evaluate((el) => getComputedStyle(el).animationIterationCount),
    ).toBe('2');

    // opening it takes the dot away, and the nudge with it
    await fab.click();
    await expect(page.locator('button[aria-expanded="true"]')).toBeVisible();
    await expect(page.locator('button.bb-fab .current-dot')).toHaveCount(0);
    await expect(fab).not.toHaveAttribute('data-nudge');
  });

  test('the BB Bot button does not nudge when the chat was opened before', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/');
    const fab = page.locator('button.bb-fab');
    await fab.click();
    await expect(page.locator('button[aria-expanded="true"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(fab).toHaveAttribute('aria-expanded', 'false');
    await page.clock.fastForward(30_000);
    await expect(fab).not.toHaveAttribute('data-nudge');
  });

  test('the moving list of technologies has a pause button that works without a mouse', async ({
    page,
  }) => {
    await page.goto('/');
    const marquee = page.locator('section[aria-label="Technologies"] > div');
    await expect(marquee).toBeVisible();
    const state = () =>
      marquee.evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(await state()).toBe('running');
    const pause = page.getByRole('button', {
      name: 'Pause the moving list of technologies',
    });
    await pause.focus();
    await page.keyboard.press('Enter');
    await expect.poll(state).toBe('paused');
    await expect(
      page.getByRole('button', {
        name: 'Play the moving list of technologies',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect.poll(state).toBe('running');
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('a page change plays no animation', async ({ page }) => {
      const watch = await trackViewTransitions(page);
      await page.goto('/');
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Projects' })
        .click();
      await expect(page).toHaveURL(/\/projects$/);
      await expect.poll(watch.started).toBeGreaterThan(0);
      // the transition still starts, but every animation of it lasts 0
      await expect
        .poll(async () => (await watch.animations()).length)
        .toBeGreaterThan(0);
      for (const animation of await watch.animations())
        expect(animation.duration).toBe(0);
    });

    test('the chips of About do not move toward the mouse', async ({
      page,
    }) => {
      await page.goto('/about');
      const chip = page.locator('[data-magnet]').first();
      const box = (await chip.boundingBox())!;
      await page.mouse.move(box.x + box.width + 30, box.y + box.height / 2);
      await afterTwoFrames(page);
      // the pull never starts: nothing is written on the chip
      expect(
        await chip.evaluate((el) => el.style.getPropertyValue('--tx')),
      ).toBe('');
      expect(
        await chip.evaluate((el) => getComputedStyle(el).translate),
      ).toMatch(/^(none|0px(?: 0px)?)$/);
    });

    test('there is no progress line, no zoom and no arrow move', async ({
      page,
    }) => {
      await page.goto('/projects');
      await expect(page.locator('.scroll-progress')).toBeHidden();
      const card = page
        .locator('article')
        .filter({ has: page.getByRole('button', { name: /screenshots$/ }) })
        .first();
      const cover = card.locator('img').first();
      await card.getByRole('button', { name: /screenshots$/ }).hover();
      await afterTwoFrames(page);
      expect(
        zoomOf(await cover.evaluate((el) => getComputedStyle(el).scale)),
      ).toBe(1);
      // the arrow of an outside link stays where it is too
      const link = page.getByRole('link', { name: 'App Store' }).first();
      await link.hover();
      await afterTwoFrames(page);
      expect(
        await link
          .locator('svg')
          .evaluate((el) => getComputedStyle(el).translate),
      ).toBe('none');
    });
  });
});
