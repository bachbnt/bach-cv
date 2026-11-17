/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import {
  MAX_VOLUME,
  START_VOLUME,
  stepsHeld,
} from '@/skins/phone/shell/volume';

// The hardware keys of the device: the volume rocker and the power button on the right edge are real buttons. Power turns the screen off, wakes it to a
// lock screen and, with a swipe up or a click on its hint, unlocks it; the volume keys step a level and show a HUD. All of it is decoration: nothing real is changed.

const FOLD_KEY = 'bach-cv-phone-fold';
const SIZES = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
] as const;

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

const screen = (page: Page) => page.locator('[data-ph-screen]');
const power = (page: Page) => page.getByRole('button', { name: 'Power' });
const up = (page: Page) => page.getByRole('button', { name: 'Volume up' });
const down = (page: Page) => page.getByRole('button', { name: 'Volume down' });
const hud = (page: Page) => page.locator('[data-ph-hud]');
const black = (page: Page) => page.locator('[data-ph-screen-off]');
const lock = (page: Page) => page.locator('[data-ph-lock]');
const foldButton = (page: Page) =>
  page.getByRole('button', { name: 'Fold', exact: true });

/** Opens the skin in a device that is open or folded. */
async function openDevice(
  page: Page,
  size: { width: number; height: number },
  fold: 'open' | 'folded',
  path = '/about',
) {
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [FOLD_KEY, fold],
  );
  await page.setViewportSize(size);
  await gotoSkin(page, path);
  await expect(screen(page)).toHaveAttribute('data-mode', 'device');
  await expect(power(page)).toBeVisible();
}

/** Installs a fake clock and freezes it once the page is up, so that only `runFor` moves the time. */
async function frozenClock(page: Page, start: () => Promise<void>) {
  const origin = Date.parse('2026-06-01T10:00:00Z');
  await page.clock.install({ time: origin });
  await start();
  await page.clock.pauseAt(origin + 120_000);
}

/** Turns the screen off with the power key and waits for the black glass. */
async function screenOff(page: Page) {
  await power(page).click();
  await expect(black(page)).toHaveAttribute('data-ph-screen-off', 'off');
  await expect
    .poll(() =>
      black(page).evaluate((element) => getComputedStyle(element).opacity),
    )
    .toBe('1');
}

/** The state of the screen, read from what is drawn. */
const stateOf = (page: Page) =>
  page.evaluate(() => {
    const off = document
      .querySelector('[data-ph-screen-off]')
      ?.getAttribute('data-ph-screen-off');
    const locked = document
      .querySelector('[data-ph-lock]')
      ?.getAttribute('data-ph-lock');
    return off === 'off' ? 'off' : locked === 'locked' ? 'locked' : 'on';
  });

/** A mouse drag up from the middle of the display, like a swipe. */
async function swipeUp(page: Page) {
  const box = await page.locator('.ph-display').boundingBox();
  if (!box) throw new Error('no display');
  const x = box.x + box.width / 2;
  const y = box.y + box.height * 0.7;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 40, { steps: 4 });
  await page.mouse.move(x, y - 140, { steps: 4 });
  await page.mouse.up();
}

/** Where the focus is: inside the screen of the page, on the lock screen's button, or elsewhere. */
const focusIn = (page: Page) =>
  page.evaluate(() => {
    const active = document.activeElement;
    if (!active) return 'none';
    if (active.closest('[data-ph-lock]')) return 'lock';
    if (active.closest('[data-ph-screen]')) return 'page';
    return active.tagName.toLowerCase();
  });

for (const size of SIZES)
  for (const fold of ['open', 'folded'] as const)
    test.describe(`${size.width}x${size.height}, ${fold}`, () => {
      test('the keys are buttons with names, on the right edge of the right half, with a hit area of 44 px or more', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        const display = await page.locator('.ph-display').boundingBox();
        const scale = await screen(page).evaluate(
          (element) =>
            element.getBoundingClientRect().height /
            (element as HTMLElement).offsetHeight,
        );
        if (!display) throw new Error('no display');
        for (const key of [up(page), down(page), power(page)]) {
          await expect(key).toBeVisible();
          const box = await key.boundingBox();
          if (!box) throw new Error('no key');
          // just beyond the right edge of the display (the right edge of the right half), and not higher or lower than it
          const gap = (box.x - (display.x + display.width)) / scale;
          expect(gap).toBeGreaterThanOrEqual(-2);
          expect(gap).toBeLessThanOrEqual(16);
          expect(box.y).toBeGreaterThan(display.y);
          expect(box.y + box.height).toBeLessThan(display.y + display.height);
          // the hit area is an invisible `::before` of the key
          const hit = await key.evaluate((element) =>
            parseFloat(getComputedStyle(element, '::before').height),
          );
          expect(hit).toBeGreaterThanOrEqual(44);
        }
      });

      test('the keys come right after the Fold control in the tab order, and the key that has the focus shows it', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        await foldButton(page).focus();
        const order: (string | null | undefined)[] = [];
        for (let i = 0; i < 3; i++) {
          await page.keyboard.press('Tab');
          order.push(
            await page.evaluate(() =>
              document.activeElement?.getAttribute('aria-label'),
            ),
          );
        }
        expect(order).toEqual(['Volume up', 'Volume down', 'Power']);
        const outline = await power(page).evaluate(
          (element) => getComputedStyle(element).outlineStyle,
        );
        expect(outline).not.toBe('none');
      });

      test('a press sinks the key into the frame, and the key comes back', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        const box = await power(page).boundingBox();
        if (!box) throw new Error('no key');
        const transform = () =>
          power(page).evaluate(
            (element) => getComputedStyle(element).transform,
          );
        expect(await transform()).toBe('none');
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await expect
          .poll(transform)
          .toMatch(/^matrix\(1, 0, 0, 1, -1\.5, 0\)$/);
        // drag away so that the release is not a click
        await page.mouse.move(box.x - 200, box.y);
        await page.mouse.up();
        await expect.poll(transform).toBe('none');
        expect(await stateOf(page)).toBe('on');
      });

      test('power turns the screen off (black, what is in it inert), and power again shows the lock screen with the clock of the status bar', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        await expect(screen(page)).not.toHaveAttribute('inert');
        await screenOff(page);
        await expect(screen(page)).toHaveAttribute('inert', '');
        // nothing of the page can take the focus: only the black screen is there
        await page.keyboard.press('Tab');
        expect(await focusIn(page)).not.toBe('page');
        await power(page).click();
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
        await expect(black(page)).toHaveAttribute('data-ph-screen-off', 'on');
        await expect(screen(page)).toHaveAttribute('inert', '');
        // the large clock is the time of the status bar, in the same words
        const clocks = await page.evaluate(() => {
          const bar = document
            .querySelector('[data-ph-screen] button[aria-haspopup="dialog"]')
            ?.parentElement?.querySelector('.tabular-nums');
          const large = document.querySelector('[data-ph-lock] p');
          return [bar?.textContent, large?.textContent];
        });
        expect(clocks[1]).toBeTruthy();
        expect(clocks[1]).toBe(clocks[0]);
        // and the date, and the hint
        await expect(
          lock(page).getByRole('button', { name: 'Swipe up to unlock' }),
        ).toBeVisible();
        await expect(lock(page)).toContainText(/\w+day|\d/);
      });

      test('a swipe up (a mouse drag) unlocks it and puts the focus in the page', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        await screenOff(page);
        await power(page).click();
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
        // the focus is on the one button of the lock screen, and Tab stays there
        await expect.poll(() => focusIn(page)).toBe('lock');
        await page.keyboard.press('Tab');
        expect(await focusIn(page)).not.toBe('page');
        await swipeUp(page);
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'away');
        await expect(screen(page)).not.toHaveAttribute('inert');
        await expect.poll(() => focusIn(page)).toBe('page');
        expect(await stateOf(page)).toBe('on');
      });

      test('Enter on the hint unlocks it, a click on the black screen wakes it, and Esc does nothing', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        await screenOff(page);
        // a click on the black screen wakes it to the lock screen
        await black(page).click();
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
        await page.keyboard.press('Escape');
        expect(await stateOf(page)).toBe('locked');
        await page.keyboard.press('Enter');
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'away');
        await expect.poll(() => focusIn(page)).toBe('page');
        // Enter on the black screen (it has the focus once it is reached by Tab) wakes it too
        await screenOff(page);
        await black(page).focus();
        await page.keyboard.press('Space');
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
      });

      test('the quick settings cannot be opened from a dark or locked screen, and an open one closes when the screen goes off', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        await page.getByRole('button', { name: 'Quick settings' }).click();
        await expect(
          page.getByRole('dialog', { name: 'Settings' }),
        ).toBeVisible();
        // the key is behind the modal shade for readers: press it as a hand does
        await page.locator('button[aria-label="Power"]').click({ force: true });
        await expect(black(page)).toHaveAttribute('data-ph-screen-off', 'off');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        // a click where the status bar is lands on the black glass: it wakes the screen, it does not open the shade
        const box = await page.locator('.ph-display').boundingBox();
        if (!box) throw new Error('no display');
        await page.mouse.click(box.x + box.width - 60, box.y + 20);
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
        await page.mouse.click(box.x + box.width - 60, box.y + 20);
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await swipeUp(page);
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'away');
        await page.getByRole('button', { name: 'Quick settings' }).click();
        await expect(
          page.getByRole('dialog', { name: 'Settings' }),
        ).toBeVisible();
      });

      test('folding while the screen is off keeps it off, and the fold control works while it is locked', async ({
        page,
      }) => {
        await openDevice(page, size, fold);
        await screenOff(page);
        await foldButton(page).click();
        await expect(foldButton(page)).toHaveAttribute(
          'aria-pressed',
          fold === 'open' ? 'true' : 'false',
        );
        await expect(page.locator('.ph-rig')).toHaveAttribute(
          'data-phase',
          'idle',
        );
        expect(await stateOf(page)).toBe('off');
        // the keys are still there, on the new screen, and wake it
        await power(page).click();
        await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
        await foldButton(page).click();
        await expect(page.locator('.ph-rig')).toHaveAttribute(
          'data-phase',
          'idle',
        );
        expect(await stateOf(page)).toBe('locked');
      });
    });

test.describe('the screen and the status simulation', () => {
  test('the glyphs stand still while the screen is off, and go on when it is on again', async ({
    page,
  }) => {
    await frozenClock(page, () => openDevice(page, SIZES[0], 'open'));
    const level = () =>
      page.evaluate(() =>
        Number(
          document
            .querySelector('[data-ph-battery]')
            ?.getAttribute('data-level'),
        ),
      );
    await page.clock.runFor(3000);
    const before = await level();
    expect(before).toBeLessThan(100);
    await screenOff(page);
    await page.clock.runFor(60_000);
    // the lock screen shows the same battery, which has not moved in a minute of fake time
    await power(page).click();
    await expect(lock(page)).toHaveAttribute('data-ph-lock', 'locked');
    expect(await level()).toBe(before);
    await page.clock.runFor(10_000);
    expect(await level()).toBeLessThan(before);
  });
});

test.describe('the volume keys', () => {
  test('a press shows the HUD with the right level, says it once, and the HUD goes 1.4 s after the last press', async ({
    page,
  }) => {
    await frozenClock(page, () => openDevice(page, SIZES[0], 'open'));
    const said = page.locator('[data-ph-volume-said]');
    await expect(hud(page)).toHaveAttribute('data-ph-hud', 'hidden');
    // nothing is said until a key is pressed
    await expect(said).toHaveText('');
    await up(page).click();
    await expect(hud(page)).toHaveAttribute('data-ph-hud', 'shown');
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME + 1),
    );
    await expect(said).toHaveText(
      `Volume ${START_VOLUME + 1} of ${MAX_VOLUME}`,
    );
    await down(page).click();
    await down(page).click();
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME - 1),
    );
    await expect(said).toHaveText(
      `Volume ${START_VOLUME - 1} of ${MAX_VOLUME}`,
    );
    // it stays while the last press is younger than 1.4 s, and goes after
    await page.clock.runFor(1300);
    await expect(hud(page)).toHaveAttribute('data-ph-hud', 'shown');
    await page.clock.runFor(200);
    await expect(hud(page)).toHaveAttribute('data-ph-hud', 'hidden');
    // the level is kept
    await up(page).click();
    await expect(hud(page)).toHaveAttribute('data-level', String(START_VOLUME));
  });

  test('a key that is held repeats: after 400 ms, then every 150 ms', async ({
    page,
  }) => {
    await frozenClock(page, () => openDevice(page, SIZES[0], 'open'));
    const box = await up(page).boundingBox();
    if (!box) throw new Error('no key');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME + 1),
    );
    await page.clock.runFor(350);
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME + 1),
    );
    await page.clock.runFor(100);
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME + 2),
    );
    await page.clock.runFor(450);
    // 900 ms in all: the press, the first repeat at 400 and one every 150 ms after
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME + stepsHeld(900)),
    );
    await page.mouse.up();
    const level = await hud(page).getAttribute('data-level');
    await page.clock.runFor(500);
    // let go: no more steps
    await expect(hud(page)).toHaveAttribute('data-level', String(level));
  });

  test('the arrow keys on a focused key step the volume, Enter steps it once, and the end of the range shakes the HUD', async ({
    page,
  }) => {
    await openDevice(page, SIZES[0], 'open');
    await up(page).focus();
    await page.keyboard.press('ArrowUp');
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME + 1),
    );
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME - 1),
    );
    await down(page).focus();
    await page.keyboard.press('Enter');
    await expect(hud(page)).toHaveAttribute(
      'data-level',
      String(START_VOLUME - 2),
    );
    // up to the top: the HUD does not shake on the way, only when a press changes nothing
    const shaking = () =>
      page.evaluate(() =>
        document.querySelector('.ph-hud-shake')
          ? getComputedStyle(document.querySelector('.ph-hud-shake') as Element)
              .animationName
          : 'none',
      );
    for (let i = 0; i < MAX_VOLUME; i++) await up(page).click();
    await expect(hud(page)).toHaveAttribute('data-level', String(MAX_VOLUME));
    await up(page).click();
    await expect.poll(shaking).toBe('ph-hud-shake');
    // and at the bottom
    for (let i = 0; i < MAX_VOLUME + 1; i++) await down(page).click();
    await expect(hud(page)).toHaveAttribute('data-level', '0');
    await down(page).click();
    await expect.poll(shaking).toBe('ph-hud-shake');
  });

  test('with reduced motion the HUD does not slide and the pill does not shake', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDevice(page, SIZES[0], 'open');
    for (let i = 0; i < MAX_VOLUME; i++) await up(page).click();
    await up(page).click();
    const motion = await page.evaluate(() => {
      const outer = document.querySelector('[data-ph-hud]');
      const pill = outer?.firstElementChild;
      return [
        outer ? getComputedStyle(outer).transitionDuration : '',
        pill ? getComputedStyle(pill).animationName : '',
      ];
    });
    expect(motion).toEqual(['0s', 'none']);
  });

  test('the volume keys do nothing while the screen is off', async ({
    page,
  }) => {
    await openDevice(page, SIZES[0], 'open');
    await screenOff(page);
    await up(page).click();
    await expect(hud(page)).toHaveAttribute('data-ph-hud', 'hidden');
  });
});

test.describe('a window of its own', () => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 800, height: 900 },
  ])
    test(`${size.width}x${size.height} has no keys: the visitor's own device has them`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await gotoSkin(page, '/about');
      await expect(screen(page)).toHaveAttribute('data-mode', 'full-bleed');
      await expect(page.locator('.ph-keys')).toHaveCount(0);
      await expect(power(page)).toHaveCount(0);
      await expect(page.locator('[data-ph-lock]')).toHaveCount(0);
    });
});
