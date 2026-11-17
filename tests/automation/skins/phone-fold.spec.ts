/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { trackViewTransitions } from '../support/view-transitions';
import { deviceScale } from '@/skins/phone/shell/fold-mode';

// The foldable device of the Phone skin: a window of 1100 x 600 or more holds a device that is open (the inner screen, the tablet layout,
// a crease) or folded (the cover screen, the phone layout); any other window is the screen itself. The layout follows the screen.

const FOLD_KEY = 'bach-cv-phone-fold';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

const screen = (page: Page) => page.locator('[data-ph-screen]');
const rig = (page: Page) => page.locator('.ph-rig');
const foldButton = (page: Page) =>
  page.getByRole('button', { name: 'Fold', exact: true });
const rail = (page: Page) => page.getByRole('navigation', { name: 'Main' });
/** The width the layout has, which a scaled device does not change (a box on the page is smaller than that when the device is scaled to fit). */
const width = (page: Page) =>
  screen(page).evaluate((element) => (element as HTMLElement).offsetWidth);
/** The size of the folded screen (a half) and of the inner one (two halves, one continuous display). */
const FOLDED_WIDTH = 560;
const OPEN_WIDTH = 1120;

/** Waits for a swing to end: the layout has changed and the device is at rest. */
const atRest = (page: Page) =>
  expect(rig(page)).toHaveAttribute('data-phase', 'idle');

/** Folds or unfolds with the button and waits until the device is at rest in its new state (the change begins a frame or two after the click). */
const toggleFold = async (page: Page) => {
  const was = await foldButton(page).getAttribute('aria-pressed');
  await foldButton(page).click();
  await expect(foldButton(page)).toHaveAttribute(
    'aria-pressed',
    was === 'true' ? 'false' : 'true',
  );
  await atRest(page);
};

test.describe('the device', () => {
  test('is open at first: the tablet layout with the rail and a crease down the middle of the screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    await expect(screen(page)).toHaveAttribute('data-mode', 'device');
    await expect(screen(page)).toHaveAttribute('data-hinge', '');
    await expect(rail(page).getByRole('link')).toHaveCount(7);
    expect(await width(page)).toBe(OPEN_WIDTH);
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.ph-crease')).toBeVisible();
    // the camera is drawn in the device only
    const camera = await page
      .locator('.ph-display')
      .evaluate((element) => getComputedStyle(element, '::before').content);
    expect(camera).toBe('""');
    // the window is large enough for the device at its own size: nothing is scaled
    const box = await screen(page).boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(OPEN_WIDTH);
    expect(Math.round(box?.height ?? 0)).toBe(792);
  });

  test('the open device is one slab with one continuous display: nothing crosses the middle of the screen, and the left edge has no button', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    const state = await page.evaluate(() => {
      const display = document.querySelector<HTMLElement>('.ph-display');
      const body = document.querySelector<HTMLElement>('.ph-open-body');
      if (!display || !body) throw new Error('no device');
      const middle = display.getBoundingClientRect();
      // what is drawn over the display at its middle, away from the crease overlay: only the screen's own layers
      const at = document.elementsFromPoint(
        middle.x + middle.width / 2 - 40,
        middle.y + middle.height / 2,
      );
      return {
        spine: document.querySelectorAll(
          '.ph-spine, .ph-hinge, .ph-lock, .ph-screw',
        ).length,
        displayWidth: display.offsetWidth,
        bodyWidth: body.offsetWidth,
        // the left edge of the open slab and of the cover: no key, no nub
        leftEdgeDetails: document.querySelectorAll(
          '.ph-sim, .ph-volume[style*="left"]',
        ).length,
        belowDisplay: at.some((element) =>
          element.classList.contains('ph-band'),
        ),
        keysOnTheRight: [
          ...document.querySelectorAll(
            '.ph-open-body .ph-volume, .ph-open-body .ph-power',
          ),
        ].every(
          (key) => (key as HTMLElement).offsetLeft > body.offsetWidth - 20,
        ),
        seams: document.querySelectorAll('.ph-open-body .ph-seam').length,
      };
    });
    expect(state.spine).toBe(0);
    expect(state.displayWidth).toBe(OPEN_WIDTH);
    expect(state.bodyWidth).toBe(1140);
    expect(state.leftEdgeDetails).toBe(0);
    expect(state.keysOnTheRight).toBe(true);
    expect(state.seams).toBe(1);
    // the grip is only a hit area: it draws nothing
    const grip = await page
      .locator('.ph-grip')
      .evaluate((element) => getComputedStyle(element, '::after').content);
    expect(['none', 'normal']).toContain(grip);
  });

  test('folds into the phone layout and opens into the tablet layout again', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    await toggleFold(page);
    await expect(rail(page)).toBeHidden();
    await expect(screen(page)).not.toHaveAttribute('data-hinge');
    expect(await width(page)).toBe(FOLDED_WIDTH);
    await expect(page.getByText('Cover screen, phone layout')).toBeVisible();

    await foldButton(page).click();
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
    await atRest(page);
    await expect(rail(page).getByRole('link')).toHaveCount(7);
    await expect(screen(page)).toHaveAttribute('data-hinge', '');
    expect(await width(page)).toBe(OPEN_WIDTH);
  });

  /** Records what the rig goes through (the phase, the state the screen is laid out for, and the layout width at that moment) while a fold plays. */
  const recordFold = (page: Page) =>
    page.evaluate(() => {
      const rig = document.querySelector<HTMLElement>('.ph-rig');
      const screen = document.querySelector<HTMLElement>('[data-ph-screen]');
      if (!rig || !screen) throw new Error('no device');
      const steps: {
        phase: string;
        fold: string;
        width: number;
        hinge: boolean;
      }[] = [];
      const note = () => {
        const last = steps[steps.length - 1];
        const step = {
          phase: rig.dataset.phase ?? '',
          fold: rig.dataset.fold ?? '',
          width: screen.offsetWidth,
          hinge: screen.hasAttribute('data-hinge'),
        };
        if (!last || last.phase !== step.phase || last.fold !== step.fold)
          steps.push(step);
      };
      new MutationObserver(note).observe(rig, { attributes: true });
      (window as unknown as { __steps: typeof steps }).__steps = steps;
    });
  const recorded = (page: Page) =>
    page.evaluate(
      () =>
        (
          window as unknown as {
            __steps: {
              phase: string;
              fold: string;
              width: number;
              hinge: boolean;
            }[];
          }
        ).__steps,
    );

  test('unfolds in steps: it slides in the phone layout, the cover half swings over toward the viewer, and the layout becomes the tablet one as it lands', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(
      (key) => localStorage.setItem(key, 'folded'),
      FOLD_KEY,
    );
    await gotoSkin(page, '/projects');
    await recordFold(page);
    await toggleFold(page);
    const steps = await recorded(page);
    expect(steps.map((step) => step.phase)).toEqual([
      'sliding',
      'swinging',
      'landing',
      'idle',
    ]);
    // while it slides and while the cover half swings over, the screen is still the cover screen, with no crease
    for (const step of steps.slice(0, 2))
      expect(step).toMatchObject({
        fold: 'folded',
        width: FOLDED_WIDTH,
        hinge: false,
      });
    expect(steps[0]).toMatchObject({
      fold: 'folded',
      width: FOLDED_WIDTH,
      hinge: false,
    });
    // the layout changes in one step, when the half lands
    expect(steps[2]).toMatchObject({
      fold: 'open',
      width: OPEN_WIDTH,
      hinge: true,
    });
    expect(steps[3]).toMatchObject({ fold: 'open', width: OPEN_WIDTH });
  });

  test('folds in three steps: the left half closes over the open layout, the layout becomes the phone one at the vertical, then the device slides back to the middle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    await recordFold(page);
    await toggleFold(page);
    const steps = await recorded(page);
    expect(steps.map((step) => step.phase)).toEqual([
      'folding',
      'closing',
      'returning',
      'idle',
    ]);
    // the layout is the open one while the half starts to close (the screen dims), and changes once, at the start of closing, and stays
    expect(steps[0]).toMatchObject({ fold: 'open', width: OPEN_WIDTH });
    for (const step of steps.slice(1))
      expect(step).toMatchObject({
        fold: 'folded',
        width: FOLDED_WIDTH,
        hinge: false,
      });
  });

  test('the folded device is exactly one half of the open one: the same size, corners, bezel and buttons, and the screen of a half', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    const half = (selector: string) =>
      page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);
        const key = element.querySelector('.ph-volume');
        return {
          width: (element as HTMLElement).offsetWidth,
          height: (element as HTMLElement).offsetHeight,
          radius: style.borderRadius,
          // the buttons stay on the same edge of the same half
          keyFromRight:
            (element as HTMLElement).offsetWidth -
            ((key as HTMLElement).offsetLeft +
              (key as HTMLElement).offsetWidth),
          keyTop: (key as HTMLElement).offsetTop,
          details: element.querySelectorAll('i').length,
        };
      });
    const open = await half('.ph-half-r');
    await toggleFold(page);
    const folded = await half('.ph-cover');
    expect(folded).toEqual(open);
    // large corners on the outer side, almost square ones on the side of the hinge
    expect(open.radius).toBe('8px 44px 44px 8px');
    expect(open.width).toBe(580);
    expect(open.height).toBe(812);
    // the cover screen is the screen of a half: the inner screen is two of them, in one continuous display
    expect(OPEN_WIDTH).toBe(2 * FOLDED_WIDTH);
    expect(
      await page
        .locator('.ph-display')
        .evaluate((element) => (element as HTMLElement).offsetHeight),
    ).toBe(792);
    // the outlines coincide: the cover on the page is the right half when open
    const cover = await page.locator('.ph-cover').boundingBox();
    await toggleFold(page);
    const right = await page.locator('.ph-half-r').boundingBox();
    expect(Math.round(cover?.width ?? 0)).toBe(Math.round(right?.width ?? 1));
    expect(Math.round(cover?.height ?? 0)).toBe(Math.round(right?.height ?? 1));
  });

  test('remembers the fold for the next visit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    await toggleFold(page);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), FOLD_KEY),
    ).toBe('folded');
    await page.reload();
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await width(page)).toBe(FOLDED_WIDTH);
  });

  test('folds and opens with the F key, but not while typing in a field or while a dialog is open', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    await page.keyboard.press('f');
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'true');
    await atRest(page);
    await page.keyboard.press('F');
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
    await atRest(page);

    // a field
    const search = page.getByRole('searchbox').first();
    await search.focus();
    await page.keyboard.type('ff');
    await expect(search).toHaveValue('ff');
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
    await search.blur();

    // a dialog
    await page.getByRole('button', { name: 'Quick settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await page.keyboard.press('f');
    await page.keyboard.press('Escape');
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('folds with a drag on the free left edge of the device, to the right, and opens with a drag to the left', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    const drag = async (dx: number) => {
      const box = await page.locator('.ph-grip').boundingBox();
      if (!box) throw new Error('no grip');
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx / 2, y, { steps: 4 });
      await page.mouse.move(x + dx, y, { steps: 4 });
      await page.mouse.up();
    };
    await drag(120);
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'true');
    await atRest(page);
    await drag(-120);
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
    await atRest(page);
  });

  test('scales to fit the smallest window that holds it (1100 x 600) and the layout keeps its width, open and folded', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 600 });
    await gotoSkin(page, '/resume');
    await expect(screen(page)).toHaveAttribute('data-mode', 'device');
    // the screen is laid out at its own size and drawn smaller
    expect(await width(page)).toBe(OPEN_WIDTH);
    const box = await screen(page).boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(1100 - 24);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(600);
    expect(box?.width ?? 0).toBeLessThan(OPEN_WIDTH);
    await expect(rail(page).getByRole('link')).toHaveCount(7);
    await toggleFold(page);
    expect(await width(page)).toBe(FOLDED_WIDTH);
    const noSideways = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
    expect(noSideways).toBe(true);
  });

  test('puts the Fold button in the top left corner of the window, off the device', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoSkin(page, '/about');
    const button = await foldButton(page).boundingBox();
    const device = await screen(page).boundingBox();
    expect(button?.x ?? 99).toBeLessThan(40);
    expect(button?.y ?? 99).toBeLessThan(40);
    expect((button?.x ?? 0) + (button?.width ?? 0)).toBeLessThan(
      device?.x ?? 0,
    );
  });

  test('swaps at once when the visitor asked for less motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    await foldButton(page).click();
    // no swing: the very next state is the folded one, at rest
    await expect(rig(page)).toHaveAttribute('data-phase', 'idle');
    await expect(rig(page)).toHaveAttribute('data-fold', 'folded');
    expect(await width(page)).toBe(FOLDED_WIDTH);
    await foldButton(page).click();
    await expect(rig(page)).toHaveAttribute('data-phase', 'idle');
    await expect(rig(page)).toHaveAttribute('data-fold', 'open');
    expect(await width(page)).toBe(OPEN_WIDTH);
  });
});

test.describe('a window without room for the device', () => {
  for (const [w, h] of [
    [1099, 800],
    [1440, 599],
    [390, 844],
  ] as const)
    test(`${w} x ${h} is the screen itself: no device, no Fold button, no F key`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await gotoSkin(page, '/about');
      await expect(screen(page)).toHaveAttribute('data-mode', 'full-bleed');
      await expect(screen(page)).not.toHaveAttribute('data-hinge');
      await expect(foldButton(page)).toHaveCount(0);
      await expect(page.locator('.ph-cover')).toHaveCount(0);
      // the visitor's own phone or tablet is the device: no camera is drawn, and the clock is whole
      const content = await page
        .locator('.ph-display')
        .evaluate((element) => getComputedStyle(element, '::before').content);
      expect(['none', 'normal']).toContain(content);
      const clock = page
        .locator('[data-ph-screen]')
        .getByText(/\d{1,2}:\d{2}/)
        .first();
      await expect(clock).toBeVisible();
      const time = await clock.boundingBox();
      expect(time?.x ?? 0).toBeGreaterThanOrEqual(0);
      expect((time?.x ?? 0) + (time?.width ?? 0)).toBeLessThan(w / 2);
      expect(await width(page)).toBe(w);
      await page.keyboard.press('f');
      expect(await width(page)).toBe(w);
    });

  test('a tablet window (1024 x 768) is exactly as tall as the window and scrolls inside the screen, not the document', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await gotoSkin(page, '/resume');
    const box = await screen(page).boundingBox();
    expect(Math.round(box?.height ?? 0)).toBe(768);
    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    expect(documentHeight).toBeLessThanOrEqual(768);
  });

  test('a tablet window (1024 px) gets the tablet layout and a phone window (390 px) the phone layout', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await gotoSkin(page, '/projects');
    await expect(rail(page).getByRole('link')).toHaveCount(7);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(rail(page)).toBeHidden();
  });

  test('the device comes back, in the fold that was left, when the window grows', async ({
    page,
  }) => {
    await page.addInitScript(
      (key) => localStorage.setItem(key, 'folded'),
      FOLD_KEY,
    );
    await page.setViewportSize({ width: 900, height: 800 });
    await gotoSkin(page, '/about');
    await expect(screen(page)).toHaveAttribute('data-mode', 'full-bleed');
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(screen(page)).toHaveAttribute('data-mode', 'device');
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await width(page)).toBe(FOLDED_WIDTH);
  });
});

test.describe('what opens over the screen stays inside it', () => {
  const inside = async (page: Page, target: ReturnType<Page['locator']>) => {
    const outer = await screen(page).boundingBox();
    const box = await target.boundingBox();
    if (!outer || !box) throw new Error('nothing to measure');
    expect(box.x).toBeGreaterThanOrEqual(outer.x - 1);
    expect(box.y).toBeGreaterThanOrEqual(outer.y - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
  };

  for (const folded of [false, true])
    test(`the quick settings in the ${folded ? 'folded' : 'open'} device cover the screen and not the window`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSkin(page, '/projects');
      if (folded) {
        await toggleFold(page);
      }
      await page.getByRole('button', { name: 'Quick settings' }).click();
      const shade = page.getByRole('dialog', { name: 'Settings' });
      await expect(shade).toBeVisible();
      // the shade arrives with a short slide: measure it once it has stopped
      await page.waitForTimeout(450);
      await inside(page, shade);
      await page.keyboard.press('Escape');
      await expect(shade).toHaveCount(0);
    });

  for (const folded of [false, true])
    test(`a sheet of an app in the ${folded ? 'folded' : 'open'} device stays inside the screen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSkin(page, '/projects');
      if (folded) {
        await toggleFold(page);
      }
      await page
        .getByRole('button', { name: 'Sort', exact: false })
        .first()
        .click();
      const popup = page
        .locator('[role="dialog"], [data-slot="popover-content"]')
        .first();
      await expect(popup).toBeVisible();
      await page.waitForTimeout(450);
      await inside(page, popup);
    });
});

test.describe('the system gestures and chrome', () => {
  test('a drag up on the home bar goes to the home screen, and a tap does too', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/about');
    const bar = page.getByRole('link', { name: 'Go to the home screen' });
    const box = await bar.boundingBox();
    if (!box) throw new Error('no home bar');
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 40, { steps: 4 });
    await page.mouse.move(x, y - 90, { steps: 4 });
    await page.mouse.up();
    await expect(page).toHaveURL(/\/$/);

    await gotoSkin(page, '/about');
    await page.getByRole('link', { name: 'Go to the home screen' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('the small title of an app shows in the bar once the large one has scrolled away', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    const small = page.locator('[data-ph-bar-title]');
    await expect(small).toHaveAttribute('data-ph-bar-title', 'hidden');
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 500);
    await expect(small).toHaveAttribute('data-ph-bar-title', 'shown');
    await expect(small).toHaveText('Resume');
    await page.mouse.wheel(0, -2000);
    await expect(small).toHaveAttribute('data-ph-bar-title', 'hidden');
  });

  test('the small title works inside the scrolling screen of a device too', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/resume');
    await toggleFold(page);
    const small = page.locator('[data-ph-bar-title]');
    await expect(small).toHaveAttribute('data-ph-bar-title', 'hidden');
    const box = await screen(page).boundingBox();
    await page.mouse.move((box?.x ?? 0) + 200, (box?.y ?? 0) + 400);
    await page.mouse.wheel(0, 300);
    await expect(small).toHaveAttribute('data-ph-bar-title', 'shown');
  });

  test('an app grows out of its icon in 360 ms, the home screen recedes behind it and the page comes in after the window has grown; closing is the other way round', async ({
    page,
  }) => {
    const views = await trackViewTransitions(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    await page
      .getByRole('link', { name: 'Resume', exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect.poll(() => views.started()).toBeGreaterThan(0);
    const named = async (pseudo: string, keyframes?: string) =>
      (await views.animations()).filter(
        (a) =>
          a.pseudo.includes(pseudo) &&
          (keyframes === undefined || a.keyframes === keyframes),
      );
    const morph = () => named('::view-transition-group(ph-app-resume)');
    await expect.poll(async () => (await morph()).length).toBeGreaterThan(0);
    // the window: 360 ms; the icon and the blank window cross over at the start, while the group is small
    expect((await morph())[0].duration).toBe(360);
    for (const side of ['old', 'new'])
      for (const animation of await named(
        `::view-transition-${side}(ph-app-resume)`,
      ))
        expect(animation.duration).toBe(100);
    // the home screen recedes, the page of the app waits 100 ms for the window and then comes in, so it never shows before the window is there
    const [recede] = await named('::view-transition-old(', 'ph-vt-recede');
    expect(recede?.duration).toBe(280);
    const [arrive] = await named('::view-transition-new(', 'ph-vt-app-in');
    expect(arrive?.delay).toBe(100);
    expect(arrive.delay + arrive.duration).toBeLessThanOrEqual(400);
    // and back: the page of the app goes out at once, the home screen returns, the window shrinks into the icon
    await page.getByRole('link', { name: 'Home', exact: true }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(async () => (await morph()).length).toBeGreaterThan(1);
    expect(
      (await named('::view-transition-old(', 'ph-vt-app-out'))[0]?.duration,
    ).toBe(100);
    expect(
      (await named('::view-transition-new(', 'ph-vt-return'))[0]?.duration,
    ).toBe(280);
  });

  test('the status bar shows the time and the quick settings button opens the shade by a tap', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    await expect(page.locator('[data-ph-screen]')).toContainText(
      /\d{1,2}:\d{2}/,
    );
    await page.getByRole('button', { name: 'Quick settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    // the handle closes it
    await page.getByRole('button', { name: 'Close quick settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);
  });
});

test.describe('the app bar', () => {
  const bar = (page: Page) => page.locator('[data-ph-app-bar]');

  const SITES = [
    ['the open device', { width: 1440, height: 900 }, 'open'],
    ['the folded device', { width: 1440, height: 900 }, 'folded'],
    ['a window of a phone', { width: 390, height: 844 }, 'open'],
  ] as const;

  for (const [label, size, fold] of SITES)
    test.describe(`on ${label}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [FOLD_KEY, fold],
        );
        await page.setViewportSize(size);
        await gotoSkin(page, '/projects');
        await expect(bar(page)).toBeVisible();
      });

      test('lies fully under the status bar, its buttons are inside it and nothing covers them, and the page starts under it', async ({
        page,
      }) => {
        const geometry = await page.evaluate(() => {
          const rect = (element: Element | null) => {
            if (!element) throw new Error('missing element');
            const { top, bottom } = element.getBoundingClientRect();
            return { top, bottom };
          };
          const bar = document.querySelector('[data-ph-app-bar]');
          const screen = document.querySelector('[data-ph-screen]');
          const status = document.querySelector('[aria-haspopup=dialog]');
          const buttons = [...(bar?.querySelectorAll('a, button') ?? [])];
          return {
            bar: rect(bar),
            screen: rect(screen),
            status: rect(status),
            h1: rect(document.querySelector('h1')),
            buttons: buttons.map(rect),
            // what is on top at the first pixel row of each button, where the strip of the status bar once cut them
            covered: buttons.filter((button) => {
              const { left, width, top } = button.getBoundingClientRect();
              const hit = document.elementFromPoint(left + width / 2, top + 2);
              return !hit || !(button === hit || button.contains(hit));
            }).length,
          };
        });
        // the bar starts where the status bar ends
        expect(geometry.bar.top).toBeGreaterThanOrEqual(
          geometry.status.bottom - 1,
        );
        for (const box of geometry.buttons) {
          expect(box.top).toBeGreaterThanOrEqual(geometry.bar.top - 1);
          expect(box.bottom).toBeLessThanOrEqual(geometry.bar.bottom + 1);
        }
        expect(geometry.covered).toBe(0);
        // the first content is below the bar, not under it
        expect(geometry.h1.top).toBeGreaterThanOrEqual(geometry.bar.bottom - 1);
      });

      test('has the same glass at every width: a veil of the page colour and no blur', async ({
        page,
      }) => {
        const style = await bar(page).evaluate((element) => {
          const css = getComputedStyle(element);
          return { filter: css.backdropFilter, image: css.backgroundImage };
        });
        expect(['none', '']).toContain(style.filter);
        expect(style.image).toContain('linear-gradient');
      });

      test('shows one title at a time: the large one while it is below the bar, the small one once it is gone', async ({
        page,
      }) => {
        const small = page.locator('[data-ph-bar-title]');
        const large = page.getByRole('heading', { level: 1 });
        await expect(small).toHaveAttribute('data-ph-bar-title', 'hidden');
        await expect(large).toHaveCSS('opacity', '1');
        await page.evaluate(() => {
          const screen = document.querySelector('[data-ph-screen]');
          const scroller = [...(screen?.querySelectorAll('div') ?? [])].find(
            (div) => getComputedStyle(div).overflowY === 'auto',
          );
          (scroller ?? document.scrollingElement)?.scrollTo(0, 400);
        });
        await expect(small).toHaveAttribute('data-ph-bar-title', 'shown');
        // it fades out as the small one comes in
        await expect(large).toHaveCSS('opacity', '0');
      });
    });
  /** Whether the bar is in view: its foot is below the top of the screen by more than the status bar's own height. */
  const shown = async (page: Page) => {
    const box = await bar(page).boundingBox();
    // in a window of its own the screen scrolls with the document, so the top of what is seen is the top of the window
    const device = (await screen(page).getAttribute('data-mode')) === 'device';
    const top = device ? ((await screen(page).boundingBox())?.y ?? 0) : 0;
    return (box?.y ?? -999) + (box?.height ?? 0) - top > 20;
  };

  test('slides away when the page scrolls down and comes back when it scrolls up, in the window of a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/projects');
    expect(await shown(page)).toBe(true);
    await page.mouse.move(200, 500);
    // a few px are not a direction, and nothing hides in the first 64 px
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(400);
    expect(await shown(page)).toBe(true);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => shown(page)).toBe(false);
    // the screen says where the sticky panes have to start: the status bar only
    const vars = () =>
      page.evaluate(() => {
        const body = document.querySelector('[data-ph-body]');
        if (!body) throw new Error('no body');
        const style = getComputedStyle(body);
        return {
          shown: style.getPropertyValue('--ph-bar-shown').trim(),
          top: style.getPropertyValue('--ph-bar-top').trim(),
          bars: style.getPropertyValue('--ph-bars').trim(),
        };
      });
    const hidden = await vars();
    expect(hidden.shown).toBe(hidden.top);
    await page.mouse.wheel(0, -120);
    await expect.poll(() => shown(page)).toBe(true);
    const back = await vars();
    expect(back.shown).toBe(back.bars);
    // at the very top it is there
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => shown(page)).toBe(false);
    await page.mouse.wheel(0, -5000);
    await expect.poll(() => shown(page)).toBe(true);
  });

  test('slides away and back inside the scrolling screen of the device too', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/resume');
    await toggleFold(page);
    const box = await screen(page).boundingBox();
    await page.mouse.move((box?.x ?? 0) + 280, (box?.y ?? 0) + 450);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => shown(page)).toBe(false);
    await page.mouse.wheel(0, -120);
    await expect.poll(() => shown(page)).toBe(true);
  });

  test('stays in view while the keyboard focus is in it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/projects');
    await page.mouse.move(200, 500);
    await page.mouse.wheel(0, 900);
    await expect.poll(() => shown(page)).toBe(false);
    await page.getByRole('button', { name: 'Connect' }).first().focus();
    await expect.poll(() => shown(page)).toBe(true);
  });

  test('is there again after a sheet opens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/projects');
    await page.mouse.move(200, 500);
    await page.mouse.wheel(0, 900);
    await expect.poll(() => shown(page)).toBe(false);
    await page.getByRole('button', { name: 'Quick settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await expect.poll(() => shown(page)).toBe(true);
  });
});

test.describe('nothing is cut off', () => {
  const sizes = [
    [1100, 600],
    [1280, 720],
    [1366, 657],
    [1440, 700],
    [1536, 730],
    [1920, 940],
    [1440, 900],
  ] as const;

  for (const [w, h] of sizes)
    for (const folded of [false, true])
      test(`${w} x ${h}, ${folded ? 'folded' : 'open'}: the whole device, its buttons and its shadow are in the window, at the right scale, clear of the Fold button`, async ({
        page,
      }) => {
        await page.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [FOLD_KEY, folded ? 'folded' : 'open'],
        );
        await page.setViewportSize({ width: w, height: h });
        await gotoSkin(page, '/projects');
        const measured = await page.evaluate(() => {
          const rect = (selector: string) => {
            const element = document.querySelector(selector);
            if (!element) throw new Error(selector);
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, width, height };
          };
          const stage = document.querySelector<HTMLElement>('.ph-stage');
          return {
            scale: Number(stage?.style.getPropertyValue('--ph-scale')),
            rig: rect('.ph-rig'),
            // the visible body: the cover when folded, the whole slab when open
            body: rect(
              document.querySelector('.ph-rig')?.getAttribute('data-fold') ===
                'open'
                ? '.ph-open-body'
                : '.ph-cover',
            ),
            keys: rect(
              document.querySelector('.ph-rig')?.getAttribute('data-fold') ===
                'open'
                ? '.ph-open-body .ph-power'
                : '.ph-cover .ph-power',
            ),
            fold: rect('button[aria-pressed]'),
            window: { w: innerWidth, h: innerHeight },
          };
        });
        expect(measured.scale).toBeCloseTo(deviceScale(w, h), 3);
        const { body, keys, window: win } = measured;
        expect(body.x).toBeGreaterThanOrEqual(0);
        expect(body.y).toBeGreaterThanOrEqual(0);
        expect(body.x + body.width).toBeLessThanOrEqual(win.w);
        // the floor shadow has room below the device
        expect(body.y + body.height).toBeLessThanOrEqual(win.h - 20);
        expect(keys.x + keys.width).toBeLessThanOrEqual(win.w);
        // the Fold button is off the device
        const fold = measured.fold;
        const apart =
          fold.x + fold.width <= body.x ||
          fold.y + fold.height <= body.y ||
          fold.x >= body.x + body.width ||
          fold.y >= body.y + body.height;
        expect(apart).toBe(true);
      });

  test('the scale follows the size of the window as it is resized', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    const scale = () =>
      page.evaluate(() =>
        Number(
          document
            .querySelector<HTMLElement>('.ph-stage')
            ?.style.getPropertyValue('--ph-scale'),
        ),
      );
    expect(await scale()).toBe(1);
    await page.setViewportSize({ width: 1100, height: 600 });
    await expect.poll(scale).toBeCloseTo(deviceScale(1100, 600), 3);
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect.poll(scale).toBeCloseTo(deviceScale(1280, 720), 3);
  });

  for (const [w, h, path] of [
    [390, 844, '/resume'],
    [390, 844, '/projects'],
    [390, 844, '/payment'],
    [1440, 900, '/resume'],
  ] as const)
    test(`the end of ${path} can be scrolled above the home bar at ${w} x ${h}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await gotoSkin(page, path);
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        const scroller = document.querySelector<HTMLElement>(
          '[data-ph-body] > div:nth-child(2)',
        );
        if (scroller && scroller.scrollHeight > scroller.clientHeight)
          scroller.scrollTop = scroller.scrollHeight;
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(300);
      const gap = await page.evaluate(() => {
        const content = document.querySelector('main > div:last-child');
        const home = document.querySelector(
          'a[aria-label="Go to the home screen"]',
        );
        if (!content || !home) throw new Error('no content');
        return (
          home.getBoundingClientRect().top -
          content.getBoundingClientRect().bottom
        );
      });
      expect(gap).toBeGreaterThanOrEqual(0);
    });

  test('the clock and the glyphs are out of the rounded corners of the screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    const inside = (
      box: { x: number; y: number; width: number; height: number },
      area: { x: number; y: number; width: number; height: number },
      radius: number,
    ) =>
      [
        [box.x, box.y, 1, 1],
        [box.x + box.width, box.y, -1, 1],
        [box.x, box.y + box.height, 1, -1],
        [box.x + box.width, box.y + box.height, -1, -1],
      ].every(([px, py]) => {
        // only a point in a corner square can be outside the rounded corner
        const cx = Math.min(
          Math.max(px, area.x + radius),
          area.x + area.width - radius,
        );
        const cy = Math.min(
          Math.max(py, area.y + radius),
          area.y + area.height - radius,
        );
        return Math.hypot(px - cx, py - cy) <= radius;
      });
    const display = await page.locator('.ph-display').boundingBox();
    const clock = await page
      .locator('[data-ph-screen]')
      .getByText(/\d{1,2}:\d{2}/)
      .first()
      .boundingBox();
    const glyphs = await page
      .locator('[data-ph-screen] button[aria-label="Quick settings"] svg')
      .last()
      .boundingBox();
    if (!display || !clock || !glyphs) throw new Error('no boxes');
    expect(inside(clock, display, 34)).toBe(true);
    expect(inside(glyphs, display, 34)).toBe(true);
  });
});

test.describe('the top of the screen', () => {
  const contexts = [
    { name: '390 full-bleed', w: 390, h: 844, fold: 'open' },
    { name: '800 full-bleed', w: 800, h: 1000, fold: 'open' },
    { name: 'open device', w: 1440, h: 900, fold: 'open' },
    { name: 'folded device', w: 1440, h: 900, fold: 'folded' },
  ] as const;

  test('the veil behind the status bar is one material at every width and in both modes', async ({
    page,
  }) => {
    const seen: Record<string, string[]> = { '/': [], '/about': [] };
    for (const path of ['/', '/about'])
      for (const context of contexts) {
        await page.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [FOLD_KEY, context.fold],
        );
        await page.setViewportSize({ width: context.w, height: context.h });
        await gotoSkin(page, path);
        const strip = await page
          .locator('[data-ph-strip]')
          .evaluate((element) => {
            const style = getComputedStyle(element);
            return [
              style.backgroundImage,
              style.backdropFilter,
              style.maskImage,
              style.height,
            ].join(' | ');
          });
        seen[path].push(strip);
      }
    for (const path of Object.keys(seen)) {
      expect(new Set(seen[path]).size, path).toBe(1);
      const [image, blur, mask, height] = seen[path][0].split(' | ');
      expect(image).toContain('linear-gradient');
      expect(blur).toBe('none');
      expect(mask).toBe('none');
      // the bar and a tail for its soft end
      expect(height).toBe('52px');
    }
  });

  const positions = [0, 20, 40, 60, 80, 120];
  for (const context of contexts.filter((c) => c.w !== 800))
    test(`${context.name}: the large title never reads through the bar, and the bar's own title is not there while the large one is`, async ({
      page,
    }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, context.fold],
      );
      await page.setViewportSize({ width: context.w, height: context.h });
      await gotoSkin(page, '/resume');
      await page.waitForTimeout(500);
      for (const position of positions) {
        await page.evaluate((top) => {
          const scroller = [
            ...document.querySelectorAll<HTMLElement>('[data-ph-screen] *'),
          ].find(
            (element) =>
              getComputedStyle(element).overflowY === 'auto' &&
              element.scrollHeight > element.clientHeight,
          );
          if (scroller) scroller.scrollTop = top;
          else window.scrollTo(0, top);
        }, position);
        await page.waitForTimeout(250);
        const state = await page.evaluate(() => {
          const bar = document.querySelector<HTMLElement>('[data-ph-app-bar]');
          const h1 = document.querySelector<HTMLElement>('main h1');
          const title = document.querySelector<HTMLElement>(
            '[data-ph-bar-title]',
          );
          if (!bar || !h1 || !title) throw new Error('no bar');
          const scroller = [
            ...document.querySelectorAll<HTMLElement>('[data-ph-screen] *'),
          ].find(
            (element) =>
              getComputedStyle(element).overflowY === 'auto' &&
              element.scrollHeight > element.clientHeight,
          );
          const rootTop = scroller ? scroller.getBoundingClientRect().top : 0;
          // the bar in its own place, where its text is, whether or not it has slid away
          const barTop = rootTop + parseFloat(getComputedStyle(bar).top);
          const row = {
            top: barTop + 6,
            bottom: barTop + bar.offsetHeight - 6,
          };
          const box = h1.getBoundingClientRect();
          return {
            h1: Number(getComputedStyle(h1).opacity),
            title: Number(getComputedStyle(title).opacity),
            crosses: box.bottom > row.top && box.top < row.bottom,
            whole: box.top >= barTop + bar.offsetHeight,
          };
        });
        if (state.crosses)
          expect(state.h1, `h1 at ${position}`).toBeLessThanOrEqual(0.15);
        if (state.whole)
          expect(state.title, `bar title at ${position}`).toBeLessThanOrEqual(
            0.15,
          );
      }
    });
});

test.describe('the keyboard and the anchors keep clear of the bars', () => {
  const contexts = [
    { name: '390 full-bleed', w: 390, h: 844, fold: 'open' },
    { name: 'open device', w: 1440, h: 900, fold: 'open' },
    { name: 'folded device', w: 1440, h: 900, fold: 'folded' },
  ] as const;

  /** Where the bars end and the home bar begins on the page, and where the thing with the focus is: the same for the screen's own scroller and for a phone's document. */
  const measure = (page: Page) =>
    page.evaluate(() => {
      const scroller = [
        ...document.querySelectorAll<HTMLElement>('[data-ph-screen] *'),
      ].find(
        (element) =>
          getComputedStyle(element).overflowY === 'auto' &&
          element.scrollHeight > element.clientHeight,
      );
      const frame = scroller?.getBoundingClientRect();
      const scale = scroller ? frame!.height / scroller.clientHeight : 1;
      const padding = parseFloat(
        getComputedStyle(scroller ?? document.documentElement).scrollPaddingTop,
      );
      const home = document.querySelector(
        'a[aria-label="Go to the home screen"]',
      );
      const active = document.activeElement as HTMLElement | null;
      const box = active?.getBoundingClientRect();
      return {
        barsBottom: (frame?.top ?? 0) + padding * scale,
        homeTop: home?.getBoundingClientRect().top ?? Infinity,
        top: box?.top ?? 0,
        bottom: box?.bottom ?? 0,
        // what sits in the bars or beside the page is not under them
        exempt:
          !active ||
          active === document.body ||
          !active.closest('[data-ph-screen]') ||
          active === home ||
          !!active.closest('[data-ph-app-bar], nav, [role="dialog"]') ||
          active.getAttribute('aria-label') === 'Quick settings',
        atEnd: scroller
          ? scroller.scrollTop + scroller.clientHeight >=
            scroller.scrollHeight - 2
          : window.scrollY + innerHeight >=
            document.documentElement.scrollHeight - 2,
        element: active?.tagName ?? '',
      };
    });

  for (const context of contexts)
    for (const [path, tabs] of [
      ['/projects', 45],
      ['/resume', 35],
      ['/services', 45],
    ] as const)
      test(`${context.name}: after each Tab on ${path} the focused element is below the bars and above the home bar`, async ({
        page,
      }) => {
        await page.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [FOLD_KEY, context.fold],
        );
        await page.setViewportSize({ width: context.w, height: context.h });
        await gotoSkin(page, path);
        await page.waitForTimeout(700);
        let covered = 0;
        for (let i = 0; i < tabs; i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(60);
          const at = await measure(page);
          if (at.exempt) continue;
          // the whole reservation (the status bar and the app bar), whether or not the app bar has slid away
          if (at.top < at.barsBottom - 1 || at.bottom > at.homeTop + 1) {
            covered++;
          }
        }
        expect(covered).toBe(0);
      });

  for (const context of contexts)
    test(`${context.name}: an anchor lands right below the bars`, async ({
      page,
    }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, context.fold],
      );
      await page.setViewportSize({ width: context.w, height: context.h });
      await gotoSkin(page, '/resume');
      await page.waitForTimeout(600);
      for (const [path, hash] of [['/resume', 'skills']]) {
        // a fresh load, so that the page scrolls to the anchor itself
        await gotoSkin(page, '/about');
        await gotoSkin(page, `${path}#${hash}`);
        await page.waitForTimeout(900);
        const landed = await page.evaluate((id) => {
          const target = document.getElementById(id);
          const scroller = [
            ...document.querySelectorAll<HTMLElement>('[data-ph-screen] *'),
          ].find(
            (element) =>
              getComputedStyle(element).overflowY === 'auto' &&
              element.scrollHeight > element.clientHeight,
          );
          const frame = scroller?.getBoundingClientRect();
          const scale = scroller ? frame!.height / scroller.clientHeight : 1;
          const padding = parseFloat(
            getComputedStyle(scroller ?? document.documentElement)
              .scrollPaddingTop,
          );
          const barsBottom = (frame?.top ?? 0) + padding * scale;
          const gap =
            ((target?.getBoundingClientRect().top ?? 0) - barsBottom) / scale;
          const atEnd = scroller
            ? scroller.scrollTop + scroller.clientHeight >=
              scroller.scrollHeight - 2
            : window.scrollY + innerHeight >=
              document.documentElement.scrollHeight - 2;
          return { gap, atEnd };
        }, hash);
        // right under the bars, and not lower (a page that cannot scroll further is as far as it goes)
        expect(landed.gap, `${path}#${hash}`).toBeGreaterThanOrEqual(-1);
        if (!landed.atEnd)
          expect(landed.gap, `${path}#${hash}`).toBeLessThanOrEqual(24);
      }
    });
});

test.describe('the veil of the app bar', () => {
  test('is at least 88% of the page colour across the row of the bar, the same in every mode', async ({
    page,
  }) => {
    const seen: string[] = [];
    for (const [w, h, fold] of [
      [390, 844, 'open'],
      [800, 1000, 'open'],
      [1440, 900, 'open'],
      [1440, 900, 'folded'],
    ] as const) {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, fold],
      );
      await page.setViewportSize({ width: w, height: h });
      await gotoSkin(page, '/projects');
      const image = await page
        .locator('[data-ph-app-bar]')
        .evaluate((element) => getComputedStyle(element).backgroundImage);
      seen.push(image);
      // the alpha of the gradient at the vertical middle of the 44 px row and along its middle part
      const stops = [...image.matchAll(/\/ ([0-9.]+)\)\s+([0-9.]+)px/g)].map(
        (match) => ({ alpha: Number(match[1]), at: Number(match[2]) }),
      );
      const alphaAt = (y: number) => {
        for (let i = 1; i < stops.length; i++)
          if (y <= stops[i].at) {
            const from = stops[i - 1];
            const to = stops[i];
            return (
              from.alpha +
              ((to.alpha - from.alpha) * (y - from.at)) / (to.at - from.at)
            );
          }
        return stops[stops.length - 1].alpha;
      };
      expect(stops.length).toBeGreaterThanOrEqual(4);
      for (const y of [10, 22, 34])
        expect(alphaAt(y)).toBeGreaterThanOrEqual(0.87);
    }
    expect(new Set(seen).size).toBe(1);
  });
});

test.describe('the scrollbar cue and the panes of an open device', () => {
  test('a scrollbar thumb is there only while the page scrolls, in the window of a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-scrolling');
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 300);
    await expect(html).toHaveAttribute('data-scrolling', '');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            getComputedStyle(
              document.documentElement,
              '::-webkit-scrollbar-thumb',
            ).backgroundColor,
        ),
      )
      .not.toMatch(/^rgba\(0, 0, 0, 0\)$|^transparent$/);
    await page.waitForTimeout(1300);
    await expect(html).not.toHaveAttribute('data-scrolling');
  });

  test('the scroller of the device has it too, and nothing else about the layout changes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/resume');
    await toggleFold(page);
    const box = await screen(page).boundingBox();
    await page.mouse.move((box?.x ?? 0) + 280, (box?.y ?? 0) + 450);
    const widthBefore = await width(page);
    await page.mouse.wheel(0, 300);
    const scrolling = page.locator('[data-ph-screen] [data-scrolling]');
    await expect(scrolling).toHaveCount(1);
    expect(await width(page)).toBe(widthBefore);
    await page.waitForTimeout(1300);
    await expect(scrolling).toHaveCount(0);
  });

  test('in an open device the left pane is as wide as the crease asks: it falls in the gap between the panes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    await expect(screen(page)).toHaveAttribute('data-hinge', '');
    await page.waitForTimeout(500);
    const measured = await page.evaluate(() => {
      const body = document.querySelector('[data-ph-body]');
      const screen = document.querySelector<HTMLElement>('[data-ph-screen]');
      if (!body || !screen) throw new Error('no screen');
      const probe = document.createElement('div');
      probe.style.cssText = 'width: var(--ph-pane-left); height: 1px';
      body.appendChild(probe);
      const gap = document.createElement('div');
      gap.style.cssText = 'width: var(--ph-pane-gap); height: 1px';
      body.appendChild(gap);
      const result = {
        left: probe.offsetWidth,
        gap: gap.offsetWidth,
        screen: screen.offsetWidth,
        rail: parseFloat(getComputedStyle(body).getPropertyValue('--ph-rail')),
      };
      probe.remove();
      gap.remove();
      return result;
    });
    // 2rem of margin, the rail, the left pane and half of the gap come to half of the screen
    expect(measured.gap).toBe(24);
    expect(32 + measured.rail + measured.left + measured.gap / 2).toBe(
      measured.screen / 2,
    );
  });
});

test.describe('the home bar and the status bar', () => {
  // the device is scaled to fit the window and is taller than the window when the window is small: the bars are at the foot and the head of the SCREEN, whatever the scale
  const WINDOWS = [
    { width: 1100, height: 600 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];
  for (const size of WINDOWS) {
    for (const folded of [false, true]) {
      test(`${size.width}x${size.height}, ${folded ? 'folded' : 'open'}: the pill is at the foot of the screen and the status bar at its head, scrolled or not`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        await gotoSkin(page, '/projects');
        await expect(screen(page)).toHaveAttribute('data-mode', 'device');
        if (folded) await toggleFold(page);
        await expect(
          page.getByRole('link', { name: /home/i }).first(),
        ).toBeVisible();
        const measure = () =>
          page.evaluate(() => {
            const screen =
              document.querySelector<HTMLElement>('[data-ph-screen]');
            const pill = document.querySelector<HTMLElement>(
              '[data-ph-body] a[href="/"][draggable="false"]',
            );
            const clock = document.querySelector<HTMLElement>(
              '[data-ph-body] button',
            );
            const scroller = document.querySelector<HTMLElement>(
              '[data-ph-body] > div:nth-child(2)',
            );
            if (!screen || !pill || !pill.parentElement || !clock || !scroller)
              throw new Error('no screen');
            const box = screen.getBoundingClientRect();
            // the scale of the device: what is drawn over what the layout has
            const scale = box.height / screen.offsetHeight;
            const veil = pill.parentElement.getBoundingClientRect();
            return {
              scale,
              pillBottom:
                (box.bottom - pill.getBoundingClientRect().bottom) / scale,
              veilBottom: (box.bottom - veil.bottom) / scale,
              scrollerBottom:
                (box.bottom - scroller.getBoundingClientRect().bottom) / scale,
              clockTop: (clock.getBoundingClientRect().top - box.top) / scale,
              scrolled: scroller.scrollTop,
              room: scroller.scrollHeight - scroller.clientHeight,
            };
          });
        const check = (at: Awaited<ReturnType<typeof measure>>) => {
          // the pill sits in the 36 px of the bar, on its top half: its foot is within a few px of that, never up in the page
          expect(at.veilBottom).toBeGreaterThanOrEqual(-1);
          expect(at.veilBottom).toBeLessThanOrEqual(1);
          expect(at.pillBottom).toBeGreaterThanOrEqual(-1);
          expect(at.pillBottom).toBeLessThanOrEqual(4);
          // nothing of the page lies below the bar
          expect(at.scrollerBottom).toBeGreaterThanOrEqual(-1);
          expect(at.scrollerBottom).toBeLessThanOrEqual(1);
          expect(at.clockTop).toBeGreaterThanOrEqual(-1);
          expect(at.clockTop).toBeLessThanOrEqual(12);
        };
        check(await measure());
        // to the end of the page, where a drifting bar would show
        await page.evaluate(() => {
          const scroller = document.querySelector<HTMLElement>(
            '[data-ph-body] > div:nth-child(2)',
          );
          if (scroller) scroller.scrollTop = scroller.scrollHeight;
        });
        await page.waitForTimeout(400);
        const end = await measure();
        expect(end.scrolled).toBeGreaterThan(0);
        check(end);
      });
    }
  }
});

test.describe('the quick settings shade of the device', () => {
  const SIZES = [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ];
  for (const size of SIZES)
    for (const folded of [false, true])
      test(`${size.width}x${size.height}, ${folded ? 'folded: it is as wide as the screen' : 'open: it is the whole right half, from the crease to the right edge'}`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        await gotoSkin(page, '/projects');
        await expect(screen(page)).toHaveAttribute('data-mode', 'device');
        if (folded) await toggleFold(page);
        await page.getByRole('button', { name: 'Quick settings' }).click();
        const shade = page.getByRole('dialog', { name: 'Settings' });
        await expect(shade).toBeVisible();
        // it drops from the top, with no travel to the side: measure it once it has stopped
        await page.waitForTimeout(600);
        const at = await page.evaluate(() => {
          const display = document
            .querySelector<HTMLElement>('.ph-display')
            ?.getBoundingClientRect();
          const screen =
            document.querySelector<HTMLElement>('[data-ph-screen]');
          const popup = document.querySelector<HTMLElement>(
            '[role="dialog"][aria-modal]',
          );
          if (!display || !screen || !popup) throw new Error('no shade');
          const box = popup.getBoundingClientRect();
          // the scale of the device: what is drawn over what the layout has
          const scale =
            screen.getBoundingClientRect().height / screen.offsetHeight;
          return {
            scale,
            crease: (display.left + display.width / 2 - box.left) / scale,
            left: (box.left - display.left) / scale,
            right: (display.right - box.right) / scale,
            top: (box.top - display.top) / scale,
            width: box.width / scale,
            screen: screen.offsetWidth,
            tiles: popup.querySelectorAll('button[aria-controls], a, button')
              .length,
          };
        });
        expect(at.right).toBeGreaterThanOrEqual(-2);
        expect(at.right).toBeLessThanOrEqual(2);
        expect(at.top).toBeGreaterThanOrEqual(-2);
        expect(at.top).toBeLessThanOrEqual(2);
        if (folded) {
          expect(at.left).toBeGreaterThanOrEqual(-2);
          expect(at.left).toBeLessThanOrEqual(2);
          expect(Math.abs(at.width - at.screen)).toBeLessThanOrEqual(2);
        } else {
          expect(at.crease).toBeGreaterThanOrEqual(-2);
          expect(at.crease).toBeLessThanOrEqual(2);
          expect(Math.abs(at.width - at.screen / 2)).toBeLessThanOrEqual(2);
        }
        // a tap outside it closes it (the left half is still there, under the scrim), and so does Esc
        await page.keyboard.press('Escape');
        await expect(shade).toHaveCount(0);
      });
});

test.describe('the same bars on the cover screen and on the inner one', () => {
  const CONTEXTS = [
    { name: 'folded device (560)', w: 1440, h: 900, fold: 'folded' },
    { name: 'open device (1120)', w: 1440, h: 900, fold: 'open' },
    { name: '390 full-bleed', w: 390, h: 844, fold: 'open' },
    { name: '800 full-bleed', w: 800, h: 900, fold: 'open' },
  ] as const;

  test('the status bar and the app bar are the same size, the same type and the same gaps at every width and in both folds', async ({
    page,
  }) => {
    const seen: Record<string, unknown>[] = [];
    for (const context of CONTEXTS) {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, context.fold],
      );
      await page.setViewportSize({ width: context.w, height: context.h });
      await gotoSkin(page, '/projects');
      await page.waitForTimeout(400);
      seen.push(
        await page.evaluate(() => {
          const size = (element: Element | null) => {
            if (!(element instanceof HTMLElement)) throw new Error('no box');
            return [element.offsetWidth, element.offsetHeight];
          };
          const before = (element: Element | null) => {
            if (!element) throw new Error('no box');
            const style = getComputedStyle(element, '::before');
            return [style.width, style.height];
          };
          const font = (element: Element | null) =>
            element ? getComputedStyle(element).fontSize : '';
          const bar = document.querySelector('[data-ph-app-bar]');
          const back = bar?.querySelector('a[href="/"]') ?? null;
          const buttons = [
            ...(bar?.querySelectorAll<HTMLElement>('[data-ph-tip]') ?? []),
          ];
          const status = document.querySelector(
            'button[aria-haspopup="dialog"]',
          );
          const clock = status?.parentElement?.querySelector('.tabular-nums');
          const screen =
            document.querySelector<HTMLElement>('[data-ph-screen]');
          const scale = screen
            ? screen.getBoundingClientRect().height / screen.offsetHeight
            : 1;
          const x = (element: Element) =>
            Math.round((element.getBoundingClientRect().left / scale) * 2) / 2;
          return {
            appBar: size(bar)[1],
            statusRow: size(status)[1],
            pill: [size(back)[1], ...before(back).slice(1)],
            roundButtons: buttons.map((button) => [
              ...size(button),
              ...before(button),
              getComputedStyle(button.querySelector('svg') as Element).width,
            ]),
            // the gaps between the round buttons, and the word of the way back is there
            gaps: buttons
              .slice(1)
              .map((button, index) => x(button) - x(buttons[index])),
            wordShown: !!back?.querySelector('span:not(.sr-only)'),
            clockFont: font(clock ?? null),
            titleFont: font(bar?.querySelector('[data-ph-bar-title]') ?? null),
            backFont: font(back),
            osFont: font(clock?.nextElementSibling ?? null),
            osShown: !!clock?.nextElementSibling,
          };
        }),
      );
    }
    for (const look of seen.slice(1)) expect(look).toEqual(seen[0]);
    expect(seen[0]).toMatchObject({
      appBar: 44,
      pill: [44, '36px'],
      wordShown: true,
      osShown: true,
    });
  });
});

test.describe('the quick settings shade is the same on both screens of the device', () => {
  const SIZES = [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ];
  const look = (page: Page) =>
    page.evaluate(() => {
      const popup = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-modal]',
      );
      if (!popup) throw new Error('no shade');
      const size = (element: Element): number[] => {
        if (!(element instanceof HTMLElement)) return [0, 0];
        return [element.offsetWidth, element.offsetHeight];
      };
      const row = popup.querySelector('[aria-hidden="true"]');
      const handle = popup.querySelector<HTMLElement>('button[aria-label]');
      const style = getComputedStyle(popup);
      return {
        popup: size(popup),
        radius: [style.borderBottomLeftRadius, style.borderTopLeftRadius],
        tiles: [...popup.querySelectorAll('.grid-flow-col > *')].map(size),
        grids: [...popup.querySelectorAll('.grid-flow-col')].map(
          (grid) =>
            getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        ),
        row: row ? size(row) : null,
        rowFont: row ? getComputedStyle(row).fontSize : null,
        handle: handle ? size(handle) : null,
        // where the handle sits in the shade: the middle of its width and the distance from the foot
        handleAt: handle
          ? [
              Math.round(
                (handle.getBoundingClientRect().left +
                  handle.getBoundingClientRect().width / 2 -
                  popup.getBoundingClientRect().left) /
                  (popup.getBoundingClientRect().width / popup.offsetWidth),
              ),
              popup.offsetHeight - handle.offsetTop - handle.offsetHeight,
            ]
          : null,
        gap: style.rowGap,
      };
    });

  for (const size of SIZES)
    test(`${size.width}x${size.height}: width, height, tiles, grid, status row, handle and radius are equal folded and open`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await gotoSkin(page, '/projects');
      await expect(screen(page)).toHaveAttribute('data-mode', 'device');
      const shade = page.getByRole('dialog', { name: 'Settings' });
      const open = async () => {
        await page.getByRole('button', { name: 'Quick settings' }).click();
        await expect(shade).toBeVisible();
        await page.waitForTimeout(600);
        const seen = await look(page);
        await page.keyboard.press('Escape');
        await expect(shade).toHaveCount(0);
        return seen;
      };
      const inner = await open();
      await toggleFold(page);
      const cover = await open();
      expect(cover).toEqual(inner);
      expect(cover.popup[0]).toBe(FOLDED_WIDTH);
      expect(cover.grids.every((columns) => columns === 3)).toBe(true);
    });

  test('a shade that is open when the device folds or unfolds closes cleanly, and the next one is the same', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    const shade = page.getByRole('dialog', { name: 'Settings' });
    const settings = page.getByRole('button', { name: 'Quick settings' });
    await settings.click();
    await expect(shade).toBeVisible();
    await page.waitForTimeout(500);
    const before = await look(page);
    // the Fold button is outside the screen: a click on it, and it goes through even with the shade open
    await page.locator('button[aria-pressed]').first().click({ force: true });
    await expect(shade).toHaveCount(0);
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'true');
    await atRest(page);
    await settings.click();
    await expect(shade).toBeVisible();
    await page.waitForTimeout(500);
    const cover = await look(page);
    expect(cover).toEqual(before);
    await page.keyboard.press('Escape');
    await expect(shade).toHaveCount(0);
    // and back
    await settings.click();
    await expect(shade).toBeVisible();
    await page.locator('button[aria-pressed]').first().click({ force: true });
    await expect(shade).toHaveCount(0);
    await expect(foldButton(page)).toHaveAttribute('aria-pressed', 'false');
    await atRest(page);
    expect(await width(page)).toBe(OPEN_WIDTH);
  });
});

test.describe('the app bar half way: no page between the status bar and the bar, and it never stays there', () => {
  const CONTEXTS = [
    { name: 'folded device', w: 1440, h: 900, fold: 'folded' },
    { name: 'open device', w: 1440, h: 900, fold: 'open' },
    { name: '390 full-bleed', w: 390, h: 844, fold: 'open' },
  ] as const;
  /** how far the bar has slid up: in place, three parts of the way, out of sight (its own 44 px and the 40 px of the status bar it starts under) */
  const HEIGHT = 84;

  for (const context of CONTEXTS) {
    test(`${context.name}: at every point of the slide the veil reaches from the top of the screen to the foot of the bar`, async ({
      page,
    }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, context.fold],
      );
      await page.setViewportSize({ width: context.w, height: context.h });
      await gotoSkin(page, '/certificates');
      await page.waitForTimeout(1200);
      // a coloured face of a certificate under the bars
      await page.evaluate(() => {
        const scroller = document.querySelector<HTMLElement>(
          '[data-ph-body] > div:nth-child(2)',
        );
        if (scroller && scroller.scrollHeight > scroller.clientHeight)
          scroller.scrollTop = 380;
        else window.scrollTo(0, 380);
      });
      await page.waitForTimeout(900);
      for (const y of [0, -10, -21, -42, -63, -74, -84]) {
        const at = await page.evaluate(
          ([move, height]) => {
            const bar =
              document.querySelector<HTMLElement>('[data-ph-app-bar]');
            const screen =
              document.querySelector<HTMLElement>('[data-ph-screen]');
            if (!bar || !screen) throw new Error('no bar');
            // the same variables, the same way as `use-bar-hide.ts` writes them
            const o = Math.min(1, Math.max(0, 1 + move / (height * 0.6)));
            bar.style.setProperty('--ph-bar-y', `${move}px`);
            bar.style.setProperty('--ph-bar-o', String(o));
            bar.style.setProperty(
              '--ph-bar-t',
              String(Math.min(1, Math.max(0, (move + height) / 16))),
            );
            const box = bar.getBoundingClientRect();
            // in a device the top of the screen is where it is drawn; in a window it is the top of the window
            const device = screen.dataset.mode === 'device';
            const top = device ? screen.getBoundingClientRect().top : 0;
            const scale = device
              ? screen.getBoundingClientRect().height / screen.offsetHeight
              : 1;
            const before = getComputedStyle(bar, '::before');
            const alpha = (colour: string) =>
              Number(colour.match(/\/ ([0-9.]+)\)/)?.[1] ?? 1);
            return {
              scale,
              // where the veil reaches up to and down to, from the top of the screen, in layout px
              up: (box.top - top) / scale + parseFloat(before.top),
              down: (box.bottom - top) / scale,
              own: alpha(before.backgroundColor),
              barOpacity: Number(getComputedStyle(bar).opacity),
              barBg: getComputedStyle(bar).backgroundImage,
            };
          },
          [y, HEIGHT],
        );
        // the layer behind the bar starts at or above the top of the screen, and the bar is never faded: only its content is
        expect(at.up, `veil top at ${y}`).toBeLessThanOrEqual(0.5);
        expect(at.barOpacity, `bar opacity at ${y}`).toBe(1);
        expect(at.own, `veil alpha at ${y}`).toBeGreaterThanOrEqual(0.87);
        expect(at.barBg).toContain('linear-gradient');
        // and it goes down to the foot of the bar, which is below the top of the screen until the bar is out of sight
        expect(at.down, `foot of the bar at ${y}`).toBeCloseTo(HEIGHT + y, 0);
      }
    });

    test(`${context.name}: a bar that is left half way settles in place or out of sight`, async ({
      page,
    }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, context.fold],
      );
      await page.setViewportSize({ width: context.w, height: context.h });
      await gotoSkin(page, '/certificates');
      await page.waitForTimeout(1200);
      await page.mouse.move(context.w / 2, context.h / 2);
      const barY = () =>
        page.evaluate(() =>
          parseFloat(
            document
              .querySelector<HTMLElement>('[data-ph-app-bar]')
              ?.style.getPropertyValue('--ph-bar-y') || '0',
          ),
        );
      const hidden = () =>
        page.evaluate(() =>
          document.querySelector('[data-ph-screen]')?.getAttribute('data-bar'),
        );
      // far down: the bar is out of sight
      await page.mouse.wheel(0, 300);
      await expect.poll(barY).toBe(-HEIGHT);
      // up a little: part of the way, then it comes in place (the last move was up), whatever the share
      await page.mouse.wheel(0, -30);
      await page.waitForTimeout(60);
      expect(await barY()).toBeGreaterThan(-HEIGHT);
      expect(await barY()).toBeLessThan(0);
      await expect.poll(barY, { timeout: 2000 }).toBe(0);
      expect(await hidden()).toBe('shown');
      // down a little: still more than half there, so it stays; down more: less than half, so it goes
      await page.mouse.wheel(0, 20);
      await page.waitForTimeout(60);
      expect(await barY()).toBeLessThan(0);
      await expect.poll(barY, { timeout: 2000 }).toBe(0);
      await page.mouse.wheel(0, 70);
      await page.waitForTimeout(60);
      await expect.poll(barY, { timeout: 2000 }).toBe(-HEIGHT);
      expect(await hidden()).toBe('hidden');
    });
  }

  test('390 full-bleed: a finger that is held still does not let the bar settle until it is lifted', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/certificates');
    await page.waitForTimeout(1200);
    await page.mouse.move(195, 400);
    const barY = () =>
      page.evaluate(() =>
        parseFloat(
          document
            .querySelector<HTMLElement>('[data-ph-app-bar]')
            ?.style.getPropertyValue('--ph-bar-y') || '0',
        ),
      );
    await page.mouse.wheel(0, 300);
    await expect.poll(barY).toBe(-HEIGHT);
    const touch = (type: string) =>
      page.evaluate((name) => document.dispatchEvent(new Event(name)), type);
    await touch('touchstart');
    await page.mouse.wheel(0, -30);
    // no scroll events, the finger is down: the bar stays where it is, long after the settling time
    await page.waitForTimeout(500);
    const held = await barY();
    expect(held).toBeGreaterThan(-HEIGHT);
    expect(held).toBeLessThan(0);
    await page.waitForTimeout(500);
    expect(await barY()).toBe(held);
    await touch('touchend');
    await expect.poll(barY, { timeout: 2000 }).toBe(0);
  });
});

test.describe('the motion of the bars costs little', () => {
  const CONTEXTS = [
    { w: 1440, h: 900, fold: 'open' },
    { w: 1440, h: 900, fold: 'folded' },
    { w: 390, h: 844, fold: 'open' },
  ] as const;
  for (const context of CONTEXTS)
    test(`${context.w}x${context.h} ${context.fold}: one layer is promoted, it moves by transform and opacity only, and nothing under the bars is blurred`, async ({
      page,
    }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [FOLD_KEY, context.fold],
      );
      await page.setViewportSize({ width: context.w, height: context.h });
      await gotoSkin(page, '/certificates');
      await page.waitForTimeout(800);
      const at = await page.evaluate(() => {
        const screen = document.querySelector('[data-ph-screen]');
        const bar = document.querySelector<HTMLElement>('[data-ph-app-bar]');
        if (!screen || !bar) throw new Error('no screen');
        const all = [...screen.querySelectorAll<HTMLElement>('*')];
        // the one move the bar makes by itself (the settling) has a transition: read it as it will be
        bar.dataset.snap = '';
        const moving = getComputedStyle(bar);
        const veil = (pseudo: string) => {
          const style = getComputedStyle(bar, pseudo);
          return [
            style.transitionDuration,
            style.animationName,
            style.willChange,
          ];
        };
        return {
          promoted: all
            .filter(
              (element) => getComputedStyle(element).willChange !== 'auto',
            )
            .map((element) => element === bar),
          transition: moving.transitionProperty,
          willChange: moving.willChange,
          blurred: all.filter(
            (element) => getComputedStyle(element).backdropFilter !== 'none',
          ).length,
          filtered: all.filter(
            (element) => getComputedStyle(element).filter !== 'none',
          ).length,
          before: veil('::before'),
          after: veil('::after'),
        };
      });
      // the bar is the only element that is promoted in advance (a promoted layer is memory: the page must not have many)
      expect(at.promoted).toEqual([true]);
      expect(at.willChange).toBe('transform, opacity');
      expect(at.transition).toBe('transform, opacity');
      // the veil is a static layer that goes with the bar: it never animates by itself
      expect(at.before).toEqual(['0s', 'none', 'auto']);
      expect(at.after).toEqual(['0s', 'none', 'auto']);
      expect(at.blurred).toBe(0);
      expect(at.filtered).toBe(0);
    });
});

test.describe('the hinge edges while a fold plays', () => {
  // The two halves are ONE hinged object: the hinge side of every piece is square, and the rims of the swinging half and of the half that stays meet at the axis,
  // at the same height and with an overlap of a px, at every angle. The swing is paused at an angle and the browser's own projection says where the rims are.
  const ANGLES = [120, 135, 150, 165];

  /** Pauses every animation and sets the swing of the left half to `angle` degrees: it grows with the time when it opens and falls with it when it folds. */
  const atAngle = (page: Page, angle: number, folding: boolean) =>
    page.evaluate(
      ([target, reverse]) => {
        const half = document.querySelector<HTMLElement>('.ph-half-l');
        if (!half) throw new Error('no half');
        const animations = document.getAnimations();
        animations.forEach((animation) => animation.pause());
        const set = (time: number) =>
          animations.forEach((animation) => {
            try {
              animation.currentTime = time;
            } catch {
              /* an animation that cannot be set stays where it is */
            }
          });
        const read = () =>
          (Math.acos(
            Math.max(
              -1,
              Math.min(1, new DOMMatrix(getComputedStyle(half).transform).m11),
            ),
          ) *
            180) /
          Math.PI;
        let low = 0;
        let high = 380;
        for (let i = 0; i < 24; i++) {
          const middle = (low + high) / 2;
          set(middle);
          if (read() < target !== reverse) low = middle;
          else high = middle;
        }
        set((low + high) / 2);
        return read();
      },
      [angle, folding] as const,
    );

  /** Where the rim of the swinging face and the rim of the half that stays end, at the top and at the bottom of the hinge, as the browser draws them. */
  const rims = (page: Page) =>
    page.evaluate(() => {
      const probe = (parent: Element, left: number, top: string) => {
        const mark = document.createElement('i');
        mark.style.cssText = `position:absolute;left:${left}px;top:${top};width:1px;height:1px;pointer-events:none`;
        parent.appendChild(mark);
        const box = mark.getBoundingClientRect();
        mark.remove();
        return { x: box.left, y: box.top };
      };
      const stays = document.querySelector('.ph-half-r');
      const back = document.querySelector('.ph-face-back');
      const rigBox = document.querySelector('.ph-rig')?.getBoundingClientRect();
      if (!stays || !back || !rigBox) throw new Error('no halves');
      const scale = rigBox.width / 1140;
      // the axis is 10 px in from the edge of the half that stays; the inner face of the swinging half has it 10 px in from its right edge
      const style = (element: Element) => getComputedStyle(element);
      return {
        scale,
        top: [probe(back, 571, '0px'), probe(stays, 10, '0px')],
        bottom: [probe(back, 571, '811px'), probe(stays, 10, '811px')],
        radii: {
          stays: [
            style(stays).borderTopLeftRadius,
            style(stays).borderBottomLeftRadius,
          ],
          back: [
            style(back).borderTopRightRadius,
            style(back).borderBottomRightRadius,
          ],
          front: [
            style(document.querySelector('.ph-face-front') as Element)
              .borderTopLeftRadius,
            style(document.querySelector('.ph-face-front') as Element)
              .borderBottomLeftRadius,
          ],
        },
        clip: style(back).clipPath,
      };
    });

  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ])
    for (const folding of [false, true])
      test(`${size.width}x${size.height}, ${folding ? 'folding' : 'unfolding'}: the rims meet at the hinge at every angle, with a square hinge side`, async ({
        page,
      }) => {
        await page.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [FOLD_KEY, folding ? 'open' : 'folded'],
        );
        await page.setViewportSize(size);
        for (const angle of ANGLES) {
          await gotoSkin(page, '/about');
          await expect(rig(page)).toHaveAttribute('data-phase', 'idle');
          await foldButton(page).click();
          await page.waitForFunction(() =>
            /swinging|landing|folding|closing/.test(
              document.querySelector('.ph-rig')?.getAttribute('data-phase') ??
                '',
            ),
          );
          const got = await atAngle(page, angle, folding);
          expect(Math.abs(got - angle)).toBeLessThan(1);
          const at = await rims(page);
          for (const [index, place] of ['top', 'bottom'].entries()) {
            const [swinging, staying] = place === 'top' ? at.top : at.bottom;
            // the same height (a step needs depth, and the rims meet at the axis), and no gap or overlap of more than a few px across the hinge
            expect(
              Math.abs(swinging.y - staying.y) / at.scale,
              `${place} rims at ${angle} degrees`,
            ).toBeLessThan(0.6);
            expect(
              Math.abs(swinging.x - staying.x) / at.scale,
              `${place} hinge at ${angle} degrees (${index})`,
            ).toBeLessThan(3);
          }
          // the hinge side is square on every piece, and the swinging half is cut 1 px past the axis (an overlap of a px, never a gap)
          expect(at.radii.stays).toEqual(['0px', '0px']);
          expect(at.radii.back).toEqual(['0px', '0px']);
          expect(at.radii.front).toEqual(['0px', '0px']);
          expect(at.clip).toBe('inset(0px 9px 0px 0px)');
        }
      });
});

test.describe('the swing of a fold, with the clock stopped', () => {
  // The screen is never black while the device folds or unfolds (a dark glass over it makes one continuous curve), the hinge side of a half keeps the cover's rounded
  // corner while the half lies over the other one, and the half that comes toward the viewer stays inside the window. Every step is read with the animations paused at a
  // time or an angle, and the clock of the page stopped, so that the phases do not move while the test looks.
  const ORIGIN = Date.parse('2026-06-01T10:00:00Z');
  /** where the layout is swapped, in ms into the swing (`PHASES`: the end of swinging when unfolding, of folding when folding) */
  const SWAP = { unfold: 120, fold: 160 };

  /** Opens the skin and starts a fold with the clock stopped; returns when the first phase of the swing is on (the slide of an unfold has played). */
  async function start(
    page: Page,
    size: { width: number; height: number },
    folding: boolean,
  ) {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [FOLD_KEY, folding ? 'open' : 'folded'],
    );
    await page.setViewportSize(size);
    await page.clock.install({ time: ORIGIN });
    await gotoSkin(page, '/about');
    await page.waitForTimeout(700);
    await page.clock.pauseAt(ORIGIN + 600_000);
    await foldButton(page).click();
    await page.waitForFunction(
      (phase) =>
        document.querySelector('.ph-rig')?.getAttribute('data-phase') === phase,
      folding ? 'folding' : 'swinging',
    );
  }

  /** Winds the stopped clock on to a later phase, one step at a time (each phase sets the timer of the next only once it has been drawn). */
  async function toPhase(
    page: Page,
    target: 'landing' | 'closing' | 'returning',
  ) {
    const steps: [number, string][] =
      target === 'landing'
        ? [[SWAP.unfold + 5, 'landing']]
        : target === 'closing'
          ? [[SWAP.fold + 5, 'closing']]
          : [
              [SWAP.fold + 5, 'closing'],
              [155, 'returning'],
            ];
    for (const [ms, phase] of steps) {
      await page.clock.runFor(ms);
      await page.waitForFunction(
        (name) =>
          document.querySelector('.ph-rig')?.getAttribute('data-phase') ===
          name,
        phase,
      );
    }
  }

  /** Pauses every animation and puts them at `time` ms of the swing (the ones of a view transition at the time since the swap). */
  const seek = (page: Page, time: number, swap: number) =>
    page.evaluate(
      ([at, swapAt]) => {
        const isTransition = (animation: Animation) =>
          (
            (animation.effect as KeyframeEffect | null)?.pseudoElement ?? ''
          ).startsWith('::view-transition');
        document.getAnimations().forEach((animation) => {
          animation.pause();
          try {
            animation.currentTime = isTransition(animation)
              ? Math.max(0, at - swapAt)
              : at;
          } catch {
            /* an animation that cannot be set stays where it is */
          }
        });
      },
      [time, swap] as const,
    );

  /** Pauses and seeks the swing to the time at which the left half is at `angle` degrees. */
  const seekAngle = (
    page: Page,
    angle: number,
    folding: boolean,
    swap: number,
  ) =>
    page.evaluate(
      ([target, reverse, swapAt]) => {
        const half = document.querySelector<HTMLElement>('.ph-half-l');
        if (!half) throw new Error('no half');
        const animations = document.getAnimations();
        animations.forEach((animation) => animation.pause());
        const isTransition = (animation: Animation) =>
          (
            (animation.effect as KeyframeEffect | null)?.pseudoElement ?? ''
          ).startsWith('::view-transition');
        const set = (time: number) =>
          animations.forEach((animation) => {
            try {
              animation.currentTime = isTransition(animation)
                ? Math.max(0, time - swapAt)
                : time;
            } catch {
              /* an animation that cannot be set stays where it is */
            }
          });
        const read = () =>
          (Math.acos(
            Math.max(
              -1,
              Math.min(1, new DOMMatrix(getComputedStyle(half).transform).m11),
            ),
          ) *
            180) /
          Math.PI;
        let low = 0;
        let high = 380;
        for (let i = 0; i < 26; i++) {
          const middle = (low + high) / 2;
          set(middle);
          if (read() < target !== reverse) low = middle;
          else high = middle;
        }
        // an angle of 0 is the very start of an unfold and the very end of a fold
        set(target === 0 ? (reverse ? 379 : 0) : (low + high) / 2);
        return read();
      },
      [angle, folding, swap] as const,
    );

  /** What the glass over the screen and the screen itself are at the moment. */
  const light = (page: Page) =>
    page.evaluate(() => ({
      dim: Number(
        getComputedStyle(document.querySelector('.ph-screen-dim') as Element)
          .opacity,
      ),
      screen: Number(
        getComputedStyle(document.querySelector('[data-ph-screen]') as Element)
          .opacity,
      ),
    }));

  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ])
    for (const folding of [false, true])
      test(`${size.width}x${size.height}, ${folding ? 'folding' : 'unfolding'}: the screen dims and lights continuously and is never black`, async ({
        page,
      }) => {
        test.setTimeout(120_000);
        const swap = folding ? SWAP.fold : SWAP.unfold;
        const step = 28;
        const curve: number[] = [];
        const screens: number[] = [];
        // the swing: from the start of the first phase, in steps of 5% of the whole motion (about 28 ms)
        await start(page, size, folding);
        for (let time = 0; time <= 380; time += step) {
          await seek(page, time, swap);
          const at = await light(page);
          curve.push(at.dim);
          screens.push(at.screen);
        }
        const swinging = [...curve];
        // the other step, the slide: the cover screen dims at the start of an unfold and lights again at the end of a fold
        let slide: number[] = [];
        if (folding) {
          await start(page, size, true);
          await toPhase(page, 'returning');
        } else {
          await start(page, size, false);
          // the slide is the step before the swing: start() has waited for the swing, the slide is played again from the start of a new unfold
          await page.reload();
          await page.waitForTimeout(700);
          await foldButton(page).click();
          await page.waitForFunction(
            () =>
              document.querySelector('.ph-rig')?.getAttribute('data-phase') ===
              'sliding',
          );
        }
        for (let time = 0; time <= 180; time += step) {
          await seek(page, time, 0);
          const at = await light(page);
          slide.push(at.dim);
          screens.push(at.screen);
        }
        await seek(page, 180, 0);
        slide = [...slide, (await light(page)).dim];
        // one curve, in the order of the motion
        const motion = folding
          ? [...swinging, ...slide]
          : [...slide, ...swinging];
        expect(motion[0]).toBeCloseTo(0, 2);
        expect(motion.at(-1)).toBeCloseTo(0, 2);
        // the screen itself is never taken away: only the glass over it changes
        for (const value of screens) expect(value).toBe(1);
        // never black, and at its dimmest (12% of the light) in the middle
        const dimmest = Math.max(...motion);
        expect(dimmest).toBeGreaterThan(0.85);
        expect(dimmest).toBeLessThanOrEqual(0.881);
        // no step of more than a fifth between two samples
        for (let i = 1; i < motion.length; i++)
          expect(
            Math.abs(motion[i] - motion[i - 1]),
            `step ${i} of ${motion.map((v) => v.toFixed(2)).join(' ')}`,
          ).toBeLessThanOrEqual(0.21);
      });

  test('the layout is swapped while the glass is at its dimmest, unfolding and folding', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    // unfolding: the swap is at the start of landing, 120 ms into the swing, and the glass is at its maximum until 35% of it
    await start(page, { width: 1440, height: 900 }, false);
    await toPhase(page, 'landing');
    await seek(page, SWAP.unfold, SWAP.unfold);
    expect((await light(page)).dim).toBeGreaterThan(0.87);
    // folding: the swap is at the start of closing, 160 ms into the swing, when the glass has reached its maximum
    await page.reload();
    await page.evaluate(() =>
      localStorage.setItem('bach-cv-phone-fold', 'open'),
    );
    await start(page, { width: 1440, height: 900 }, true);
    await toPhase(page, 'closing');
    await seek(page, SWAP.fold, SWAP.fold);
    expect((await light(page)).dim).toBeGreaterThan(0.87);
  });

  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ])
    for (const folding of [false, true])
      test(`${size.width}x${size.height}, ${folding ? 'folding' : 'unfolding'}: the hinge side keeps the cover's rounded corner at small angles and is square from the hinge-meeting angles on`, async ({
        page,
      }) => {
        test.setTimeout(120_000);
        const swap = folding ? SWAP.fold : SWAP.unfold;
        const radii = () =>
          page.evaluate(() => {
            const radius = (selector: string, corners: string[]) => {
              const style = getComputedStyle(
                document.querySelector(selector) as Element,
              );
              return corners.map((corner) =>
                parseFloat(style[corner as 'borderTopLeftRadius'] as string),
              );
            };
            return {
              stays: radius('.ph-half-r', [
                'borderTopLeftRadius',
                'borderBottomLeftRadius',
              ]),
              front: radius('.ph-face-front', [
                'borderTopLeftRadius',
                'borderBottomLeftRadius',
              ]),
              back: radius('.ph-face-back', [
                'borderTopRightRadius',
                'borderBottomRightRadius',
              ]),
              glass: parseFloat(
                getComputedStyle(
                  document.querySelector('.ph-half-r') as Element,
                  '::before',
                ).borderTopLeftRadius,
              ),
            };
          });
        let radiusAt = 100;
        const seen: Record<number, number> = {};
        for (const angle of [0, 10, 20, 30, 100, 120, 150, 165]) {
          await start(page, size, folding);
          // past the swap the layout is the other one: the clock goes on to it
          const later = folding ? angle <= 68 : angle >= 76;
          if (later) await page.clock.runFor(swap + 5);
          await seekAngle(page, angle, folding, swap);
          const at = await radii();
          if (angle <= 30) {
            // slightly rounded, like the cover screen (8 px for the slab, 4 for its glass)
            for (const value of [...at.stays, ...at.front, ...at.back])
              expect(
                value,
                `radius at ${angle} degrees`,
              ).toBeGreaterThanOrEqual(6);
            expect(at.glass).toBeGreaterThanOrEqual(3);
          } else {
            for (const value of [...at.stays, ...at.front, ...at.back])
              expect(value, `radius at ${angle} degrees`).toBeLessThan(0.1);
          }
          seen[angle] = at.stays[0];
          radiusAt = angle;
          await page.reload();
        }
        // from the cover's corner to square, never up again as the angle opens
        const order = Object.entries(seen).sort(
          (a, b) => Number(a[0]) - Number(b[0]),
        );
        for (let i = 1; i < order.length; i++)
          expect(order[i][1]).toBeLessThanOrEqual(order[i - 1][1]);
        expect(radiusAt).toBe(165);
      });

  for (const size of [
    { width: 1100, height: 600 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ])
    for (const folding of [false, true])
      test(`${size.width}x${size.height}, ${folding ? 'folding' : 'unfolding'}: the swinging half stays inside the window at every angle`, async ({
        page,
      }) => {
        test.setTimeout(180_000);
        const swap = folding ? SWAP.fold : SWAP.unfold;
        for (const angle of [90, 100, 110, 120, 130, 140, 150, 160, 170]) {
          await start(page, size, folding);
          if (folding ? angle <= 68 : angle >= 76)
            await page.clock.runFor(swap + 5);
          await seekAngle(page, angle, folding, swap);
          const box = await page.evaluate(() => {
            const boxes = ['.ph-half-l', '.ph-face-front', '.ph-face-back'].map(
              (selector) =>
                (
                  document.querySelector(selector) as Element
                ).getBoundingClientRect(),
            );
            return {
              top: Math.min(...boxes.map((b) => b.top)),
              bottom: Math.max(...boxes.map((b) => b.bottom)),
              left: Math.min(...boxes.map((b) => b.left)),
              height: innerHeight,
            };
          });
          // the projection of the near edge, with the pull-back of the device, is inside the window with room to spare: the corners are never cut
          expect(box.top, `top at ${angle} degrees`).toBeGreaterThanOrEqual(8);
          expect(
            box.height - box.bottom,
            `bottom at ${angle} degrees`,
          ).toBeGreaterThanOrEqual(8);
          expect(box.left, `left at ${angle} degrees`).toBeGreaterThanOrEqual(
            0,
          );
          await page.reload();
        }
      });
});
