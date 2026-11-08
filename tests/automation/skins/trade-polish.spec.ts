/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await page.addInitScript(() => {
    if (!localStorage.getItem('bach-cv-trade-chart'))
      localStorage.setItem(
        'bach-cv-trade-chart',
        JSON.stringify({ interval: 'week' }),
      );
  });
  await mockFirestore(page);
  await mockImages(page);
});

const chart = (page: Page) => page.getByTestId('tv-chart');
const candles = (page: Page) =>
  page.locator('[data-series="candles"]').first().innerHTML();

const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toBeAttached();
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
};

/** The names of the CSS animations running on (or under) an element. */
const animations = (locator: Locator) =>
  locator.evaluate((el) =>
    el
      .getAnimations({ subtree: true })
      .map((a) => (a as CSSAnimation).animationName),
  );

/** Puts the browser in keyboard mode (any key does) and focuses the control, so `:focus-visible` applies as if it had been tabbed to. */
const keyboardFocus = async (page: Page, control: Locator) => {
  await page.keyboard.press('Tab');
  await control.focus();
  await expect(control).toBeFocused();
};

const style = (locator: Locator, props: string[]) =>
  locator.evaluate((el, names) => {
    const s = getComputedStyle(el);
    return Object.fromEntries(names.map((n) => [n, s.getPropertyValue(n)]));
  }, props);

test.describe('the live tick of the chart', () => {
  test('waits while the tab is in the background and goes on when it is back', async ({
    page,
  }) => {
    await ready(page, '/about');
    const first = await candles(page);
    await expect.poll(() => candles(page), { timeout: 15_000 }).not.toBe(first);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    // a tick that was already due may land first
    await page.waitForTimeout(300);
    const held = await candles(page);
    await page.waitForTimeout(4500);
    expect(await candles(page)).toBe(held);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => candles(page), { timeout: 15_000 }).not.toBe(held);
  });

  test('waits while the chart is scrolled out of view on a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await ready(page, '/about');
    const first = await candles(page);
    await expect.poll(() => candles(page), { timeout: 15_000 }).not.toBe(first);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() =>
        chart(page).evaluate((el) => el.getBoundingClientRect().bottom < 0),
      )
      .toBe(true);
    await page.waitForTimeout(500);
    const held = await candles(page);
    await page.waitForTimeout(4500);
    expect(await candles(page)).toBe(held);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => candles(page), { timeout: 15_000 }).not.toBe(held);
  });

  test('the endless loops of the page pause in a background tab', async ({
    page,
  }) => {
    await ready(page);
    const dot = page.locator('.tv-live').first();
    await expect(dot).toBeAttached();
    expect(
      (await style(dot, ['animation-play-state']))['animation-play-state'],
    ).toBe('running');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('.tv-root')).toHaveAttribute('data-hidden', '');
    expect(
      (await style(dot, ['animation-play-state']))['animation-play-state'],
    ).toBe('paused');
  });
});

test.describe('the BB Bot panel', () => {
  test('slides in when it docks in the watchlist column', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.locator('#tv-chat-trigger').click();
    const panel = page.getByRole('dialog', { name: /BB Bot/ });
    await expect(panel).toBeVisible();
    // `tv-rise` used to beat the slide, which never played
    expect(await animations(panel)).toContain('tv-slide-r');
  });
});

test.describe('the focus ring', () => {
  test('is one inset ring, in dialogs too, and keeps the round shape of a round control', async ({
    page,
  }) => {
    await ready(page);
    await page.getByTestId('tv-indicators-button').click();
    const dialog = page.getByRole('dialog', { name: 'Indicators' });
    await expect(dialog).toBeVisible();
    // the dialog is in <body>, outside the terminal: it has the ring of the skin, not the 3px outset ring of Standard
    const close = dialog.getByRole('button', { name: 'Close' });
    await keyboardFocus(page, close);
    const ring = await style(close, [
      'outline-width',
      'outline-style',
      'outline-offset',
    ]);
    expect(ring).toEqual({
      'outline-width': '2px',
      'outline-style': 'solid',
      'outline-offset': '-2px',
    });
    // an inset ring cannot be cut by the overflow-hidden panel: it is inside the box of the control, which is inside the dialog
    const inside = await close.evaluate((el) => {
      const a = el.getBoundingClientRect();
      const b = el.closest('[data-slot="tv-dialog"]')!.getBoundingClientRect();
      return (
        a.left >= b.left &&
        a.right <= b.right &&
        a.top >= b.top &&
        a.bottom <= b.bottom
      );
    });
    expect(inside).toBe(true);
    // a switch inside the scrolling list
    const toggle = dialog.locator('[role="switch"]').first();
    await keyboardFocus(page, toggle);
    expect((await style(toggle, ['outline-offset']))['outline-offset']).toBe(
      '-2px',
    );
  });

  test('does not turn a round chip into a rectangle', async ({ page }) => {
    await gotoSkin(page, '/projects');
    const chip = page.getByRole('button', { name: 'Featured only' }).first();
    await expect(chip).toBeVisible();
    const radius = async () =>
      (await style(chip, ['border-top-left-radius']))['border-top-left-radius'];
    const before = await radius();
    await keyboardFocus(page, chip);
    expect((await style(chip, ['outline-width']))['outline-width']).toBe('2px');
    expect(await radius()).toBe(before);
    expect(parseFloat(before)).toBeGreaterThan(10);
  });
});

test.describe('the phone bar', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  test('marks the open page with a bar that grows in, and no other', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const nav = page.getByRole('navigation', { name: 'Quick links' });
    const links = nav.getByRole('link');
    await expect(links.first()).toBeVisible();
    const scales = await links.evaluateAll((els) =>
      els.map((el) => ({
        current: el.getAttribute('aria-current') === 'page',
        scale: getComputedStyle(el, '::after').scale,
        height: el.getBoundingClientRect().height,
      })),
    );
    expect(scales.filter((s) => s.current)).toHaveLength(1);
    for (const s of scales) {
      expect(s.scale === '1' || s.scale === '1 1').toBe(s.current);
      expect(s.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('the watchlist tabs', () => {
  test('have one accent line that slides to the selected tab', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const aside = page.getByRole('complementary', { name: 'Watchlist' });
    const list = aside.getByRole('tablist');
    const line = list.locator('span').last();
    const under = async (tab: string) => {
      const t = (await list.getByRole('tab', { name: tab }).boundingBox())!;
      const l = (await line.boundingBox())!;
      return { dx: Math.abs(l.x - t.x), dw: Math.abs(l.width - t.width) };
    };
    await expect.poll(async () => (await under('Pages')).dx).toBeLessThan(2);
    expect((await under('Pages')).dw).toBeLessThan(2);
    await list.getByRole('tab', { name: 'Skills' }).click();
    // it animates (translate and width), then rests under the new tab
    await expect.poll(async () => (await under('Skills')).dx).toBeLessThan(2);
    expect((await under('Skills')).dw).toBeLessThan(2);
    expect(
      (await style(line, ['transition-property']))['transition-property'],
    ).toContain('translate');
    await list.getByRole('tab', { name: 'Roles' }).click();
    await expect.poll(async () => (await under('Roles')).dx).toBeLessThan(2);
  });
});

test.describe('the tip of a flag', () => {
  test('fades and slides in instead of appearing', async ({ page }) => {
    await ready(page);
    const flag = page.locator('[data-marker]').first();
    const tip = flag.locator('span[aria-hidden]').last();
    expect((await style(tip, ['opacity', 'visibility'])).opacity).toBe('0');
    expect(
      (await style(tip, ['transition-duration']))['transition-duration'],
    ).toBe('0.16s');
    await flag.hover();
    await expect
      .poll(async () => (await style(tip, ['opacity'])).opacity)
      .toBe('1');
    await expect(tip).toBeVisible();
    await page.mouse.move(5, 300);
    await expect
      .poll(async () => (await style(tip, ['opacity'])).opacity)
      .toBe('0');
  });
});

test.describe('the tip of a flag near an edge', () => {
  test('grows inward, so none of it is cut off by the chart', async ({
    page,
  }) => {
    await ready(page);
    const box = (await chart(page).boundingBox())!;
    const flags = page.locator('[data-marker]');
    const count = await flags.count();
    for (let k = 0; k < count; k++) {
      const flag = flags.nth(k);
      if (!(await flag.isVisible())) continue;
      // by keyboard: neighbouring flags can overlap the hit area of this one under a pointer
      await keyboardFocus(page, flag);
      const tip = flag.locator('span[aria-hidden]').last();
      await expect(tip).toBeVisible();
      await expect
        .poll(async () => (await style(tip, ['opacity'])).opacity)
        .toBe('1');
      const t = (await tip.boundingBox())!;
      expect(t.x, `flag ${k}`).toBeGreaterThanOrEqual(box.x - 1);
      expect(t.x + t.width, `flag ${k}`).toBeLessThanOrEqual(
        box.x + box.width + 1,
      );
    }
  });
});

test.describe('a copied value', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('turns the copy icon into a check that pops in, then back', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const links = page.locator('#contact');
    const copy = links.getByRole('button', { name: 'Copy' });
    await expect(copy.locator('svg')).toHaveCount(1);
    await copy.click();
    const copied = links.getByRole('button', { name: 'Copied' });
    await expect(copied).toBeVisible();
    expect(await animations(copied)).toContain('tv-check-pop');
    await expect(links.getByRole('button', { name: 'Copy' })).toBeVisible();
  });
});

test.describe('the symbol search', () => {
  test('marks the selected row with a bar on its left edge', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await page.keyboard.press('Control+k');
    const box = page.getByRole('combobox', { name: 'Search the whole site' });
    await expect(box).toBeFocused();
    await box.fill('res');
    const options = page.getByRole('option');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    const bar = (n: number) =>
      options.nth(n).evaluate((el) => getComputedStyle(el, '::before').scale);
    // the bar grows in over 100 ms
    await expect.poll(() => bar(0)).toMatch(/^(1|1 1|100% 100%)$/);
    expect(await bar(1)).toMatch(/^(0|1 0|100% 0%)$/);
    expect(await bar(2)).toMatch(/^(0|1 0|100% 0%)$/);
  });

  test('opens like the other windows of the skin: a fade and a scale, not the zoom of Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await page.getByRole('button', { name: 'Search the site' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search' });
    await expect(dialog).toBeVisible();
    const css = await style(dialog, [
      'transition-property',
      'transition-duration',
      'animation-name',
    ]);
    expect(css['transition-property']).toContain('scale');
    expect(css['transition-duration']).toContain('0.16s');
    expect(css['animation-name']).toBe('none');
  });
});

test.describe('the Indicators switches', () => {
  test('slide their thumb with a transition on the translate property', async ({
    page,
  }) => {
    await ready(page);
    await page.getByTestId('tv-indicators-button').click();
    const dialog = page.getByRole('dialog', { name: 'Indicators' });
    const thumb = dialog
      .locator('[role="switch"]')
      .first()
      .locator('span span')
      .first();
    expect(
      (await style(thumb, ['transition-property']))['transition-property'],
    ).toContain('translate');
  });
});

test.describe('a loop scrolled out of view', () => {
  test('waits, and goes on when it is scrolled back', async ({ page }) => {
    await gotoSkin(page, '/services');
    const arts = page.getByTestId('tv-service-art');
    await expect(arts.first()).toBeVisible();
    const last = arts.last();
    const states = (art: Locator) =>
      art.evaluate((el) =>
        el.getAnimations({ subtree: true }).map((a) => a.playState),
      );
    // the first drawing is in view and moves; the last is below the fold and waits
    await expect.poll(() => states(arts.first())).toContain('running');
    await expect(last).toHaveAttribute('data-off', '');
    const waiting = await states(last);
    expect(waiting.length).toBeGreaterThan(0);
    expect(waiting.every((state) => state === 'paused')).toBe(true);
    await last.scrollIntoViewIfNeeded();
    await expect(last).not.toHaveAttribute('data-off', '');
    await expect.poll(() => states(last)).toContain('running');
  });
});

test.describe('content that replaces a skeleton', () => {
  /** Records the fades the skin starts with a script (the content of a block arriving where its skeleton was). */
  const recordFades = (page: Page) =>
    page.addInitScript(() => {
      const fades: string[] = [];
      Object.assign(window, { fades });
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        const first = Array.isArray(keyframes) ? keyframes[0] : null;
        if (
          first &&
          'opacity' in first &&
          typeof options === 'object' &&
          options.duration === 240
        )
          fades.push(this.tagName);
        return animate.call(this, keyframes, options);
      };
    });
  const slow = (page: Page) =>
    page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return route.fallback();
    });
  const fades = (page: Page) =>
    page.evaluate(() => Reflect.get(window, 'fades') as string[]);

  test('fades in over the skeleton, with no change of layout', async ({
    page,
  }) => {
    await recordFades(page);
    await slow(page);
    await gotoSkin(page, '/about');
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect.poll(() => fades(page)).not.toEqual([]);
    // the wrapper has no box of its own: it never takes the place of the content in a flex or grid parent
    const display = await page
      .locator('main .contents')
      .first()
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('contents');
  });

  test('does not fade a block that had its data from the start', async ({
    page,
  }) => {
    await recordFades(page);
    const open = async (name: string, text: string) => {
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: new RegExp(name) })
        .first()
        .click();
      await expect(page.getByRole('main').getByText(text).first()).toBeVisible({
        timeout: 15_000,
      });
      await page.waitForTimeout(500);
    };
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('main').getByText('Master of Science').first(),
    ).toBeVisible({ timeout: 15_000 });
    await open('Services', 'App Development');
    await open('About', 'Master of Science');
    // both pages have been read once: the data is in the cache, so there is no skeleton to fade over any more
    const settled = (await fades(page)).length;
    expect(settled).toBeGreaterThan(0);
    await open('Services', 'App Development');
    await open('About', 'Master of Science');
    expect((await fades(page)).length).toBe(settled);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('appears without a fade', async ({ page }) => {
      await recordFades(page);
      await slow(page);
      await gotoSkin(page, '/about');
      await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(
        0,
        { timeout: 15_000 },
      );
      expect(await fades(page)).toEqual([]);
    });
  });
});
