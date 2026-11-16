/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

// The pages of Home, About and Resume in the Phone skin that depend on the screen: the launcher, the master and detail of the roles
// (a tablet, a phone and an unfolded device) and the addresses that scroll to a part of Resume.

const APPS = [
  ['/about', 'About'],
  ['/resume', 'Resume'],
  ['/projects', 'Projects'],
  ['/certificates', 'Certificates'],
  ['/services', 'Services'],
  ['/payment', 'Payment'],
] as const;

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('the launcher', () => {
  test('is a grid of tiles, each a link to its page that keeps its whole name', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    const grid = page.getByRole('list').filter({
      has: page.getByRole('link', { name: 'About', exact: true }),
    });
    await expect(grid.getByRole('link')).toHaveCount(APPS.length);
    for (const [href, name] of APPS) {
      const app = grid.getByRole('link', { name, exact: true });
      await expect(app).toHaveAttribute('href', href);
      await expect(app).toHaveAttribute('title', name);
    }
  });

  test('has labels of one line at 320 px and no sideways scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await gotoSkin(page, '/');
    await page.waitForTimeout(400);
    const lines = await page
      .getByRole('link', { name: 'Certificates', exact: true })
      .locator('span')
      .last()
      .evaluate((el) => el.getBoundingClientRect().height <= 16);
    expect(lines).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });
});

const FOLD_KEY = 'bach-cv-phone-fold';

test.describe('the device', () => {
  test('folded: the screen is the phone layout, with the launcher under the widgets and Resume a list then a role', async ({
    page,
  }) => {
    await page.addInitScript(
      (key) => localStorage.setItem(key, 'folded'),
      FOLD_KEY,
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/');
    const years = await page
      .getByRole('heading', { name: 'In software' })
      .boundingBox();
    const apps = await page
      .getByRole('link', { name: 'About', exact: true })
      .boundingBox();
    if (!years || !apps) throw new Error('the home screen is not there');
    expect(apps.y).toBeGreaterThan(years.y);

    await gotoSkin(page, '/resume');
    await expect(page.locator('#ph-role-detail')).toBeHidden();
    await page.locator('[id^="role-"]').nth(1).click();
    await expect(page.locator('#ph-role-detail')).toBeVisible();
    await expect(page.locator('[id^="role-"]').first()).toBeHidden();
  });
});

/** The panes of an open device: the crease lies in the gap between them and the right one reaches the same margin (2rem) as the left one. */
const WINDOWS = [
  [1440, 900],
  [1280, 720],
] as const;

test.describe('the panes of an open device', () => {
  for (const [width, height] of WINDOWS) {
    const panes = async (
      page: Page,
      path: string,
      left: (page: Page) => Locator,
      right: (page: Page) => Locator,
    ) => {
      await page.setViewportSize({ width, height });
      await gotoSkin(page, path);
      await expect(page.locator('[data-ph-screen][data-hinge]')).toBeVisible();
      const screen = await page.locator('[data-ph-screen]').boundingBox();
      const a = await left(page).boundingBox();
      const b = await right(page).boundingBox();
      if (!screen || !a || !b) throw new Error('the panes are not there');
      const middle = screen.x + screen.width / 2;
      // the screen is scaled in a small window: 2rem is 32 px of the device
      const margin = 32 * (screen.width / 1120);
      expect(a.x + a.width).toBeLessThanOrEqual(middle);
      expect(b.x).toBeGreaterThanOrEqual(middle);
      expect(screen.x + screen.width - (b.x + b.width)).toBeLessThanOrEqual(
        margin + 2,
      );
    };

    test(`Resume at ${width}x${height}: the roles are the left pane and the role the right one`, async ({
      page,
    }) => {
      await panes(
        page,
        '/resume',
        (p) => p.locator('[id^="role-"]').first(),
        (p) => p.locator('#ph-role-detail'),
      );
    });

    test(`Home at ${width}x${height}: the widgets are the left pane and the apps the right one`, async ({
      page,
    }) => {
      await panes(
        page,
        '/',
        (p) => p.getByRole('heading', { name: 'In software' }),
        (p) =>
          p.locator('section').filter({
            has: p.getByRole('link', { name: 'About', exact: true }),
          }),
      );
    });

    test(`About at ${width}x${height}: the owner is the left pane and the facts the right one`, async ({
      page,
    }) => {
      await panes(
        page,
        '/about',
        (p) => p.getByText('Bach Bui').first(),
        (p) => p.locator('dl').first(),
      );
    });
  }
});

/** Where the heading of the open role is, and where the bars end (`--ph-bars` is read from a probe, in the px of the screen as drawn: a device in a small window is scaled). */
const roleAgainstBars = (page: Page) =>
  page.evaluate(() => {
    const screen = document.querySelector('[data-ph-screen]');
    const main = document.querySelector('#ph-main');
    const heading = document.querySelector('#ph-role-detail h3');
    if (!screen || !main || !heading) throw new Error('the role is not there');
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;visibility:hidden;width:1px;height:var(--ph-bars)';
    main.appendChild(probe);
    const bars = probe.getBoundingClientRect().height;
    probe.remove();
    // on a phone's window the bars stick to the top of the window while the screen scrolls past them
    const barsBottom = Math.max(screen.getBoundingClientRect().top, 0) + bars;
    const box = heading.getBoundingClientRect();
    return {
      barsBottom,
      top: box.top,
      bottom: box.bottom,
      height: window.innerHeight,
    };
  });

const HOME_SCREENS = [
  ['a phone', 390, 844, 'open'],
  ['a narrow phone', 320, 700, 'open'],
  ['the folded device', 1440, 900, 'folded'],
  ['the open device', 1440, 900, 'open'],
] as const;

/** The glass card (`backdrop-blur`) that holds an element of the home screen. */
const glassOf = (locator: Locator) =>
  locator.locator('xpath=ancestor::*[contains(@class,"backdrop-blur-xl")][1]');

test.describe('the cards of the home screen', () => {
  for (const [name, width, height, fold] of HOME_SCREENS) {
    const show = async (page: Page) => {
      await page.addInitScript(
        ([key, state]) => localStorage.setItem(key, state),
        [FOLD_KEY, fold],
      );
      await page.setViewportSize({ width, height });
    };

    test(`on ${name} the two stat widgets are the same width and height, their titles and large numbers are at the same height, and nothing overflows`, async ({
      page,
    }) => {
      await show(page);
      await gotoSkin(page, '/');
      const years = glassOf(page.getByRole('heading', { name: 'In software' }));
      const projects = glassOf(
        page.getByRole('heading', { name: 'Projects', exact: true }),
      );
      await expect(years).toBeVisible();
      const a = await years.boundingBox();
      const b = await projects.boundingBox();
      if (!a || !b) throw new Error('the widgets are not there');
      expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
      // the titles and the large numbers share their height: the centre of the number, and its size
      const yOf = async (locator: Locator) => {
        const box = await locator.boundingBox();
        if (!box) throw new Error('not there');
        return box.y + box.height / 2;
      };
      const titles = [
        page.getByRole('heading', { name: 'In software' }),
        page.getByRole('heading', { name: 'Projects', exact: true }),
      ];
      const numbers = [years, projects].map((widget) =>
        widget.locator('p').first(),
      );
      expect(
        Math.abs((await yOf(titles[0])) - (await yOf(titles[1]))),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs((await yOf(numbers[0])) - (await yOf(numbers[1]))),
      ).toBeLessThanOrEqual(1);
      const sizes = await Promise.all(
        numbers.map((n) =>
          n.evaluate((el) => {
            const style = getComputedStyle(el);
            return `${style.fontSize}/${style.lineHeight}`;
          }),
        ),
      );
      expect(sizes[0]).toBe(sizes[1]);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });

    test(`on ${name} the apps, the dock and the card of the text have the same corners`, async ({
      page,
    }) => {
      await show(page);
      await gotoSkin(page, '/');
      const corners = (locator: Locator) =>
        glassOf(locator).evaluate(
          (el) => getComputedStyle(el).borderTopLeftRadius,
        );
      const apps = await corners(
        page.getByRole('link', { name: 'About', exact: true }),
      );
      const dock = await corners(
        page.getByRole('button', { name: 'Ask BB Bot', exact: true }).first(),
      );
      const text = await corners(
        page.getByRole('button', { name: 'Download CV' }).first(),
      );
      expect(apps).toBe('24px');
      expect(dock).toBe(apps);
      expect(text).toBe(apps);
    });
  }

  test('the years ring has an arc for every year of the career: 7 here, one circle for 1 year and for 25', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    const ring = page.getByTestId('years-ring');
    await expect(ring.locator('path')).toHaveCount(7);
    await expect(ring.locator('circle')).toHaveCount(0);

    // the first role began in March 2020: a year after it, and twenty-five
    for (const [now, circles, arcs] of [
      ['2021-03-15', 1, 0],
      ['2045-03-15', 1, 0],
      ['2030-03-15', 0, 10],
    ] as const) {
      await page.clock.setFixedTime(new Date(`${now}T12:00:00`));
      await page.reload();
      await page
        .locator('html[data-skin-ready]')
        .waitFor({ state: 'attached' });
      await expect(ring.locator('circle')).toHaveCount(circles);
      await expect(ring.locator('path')).toHaveCount(arcs);
    }
  });
});

test.describe('the chips of the technologies', () => {
  for (const [name, width, height] of [
    ['a phone', 390, 844],
    ['the open device', 1440, 900],
  ] as const)
    test(`on ${name} they are tinted by the area of the skill: one colour for an area, another for another`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await gotoSkin(page, '/');
      const chips = page.locator('[data-slot="ph-chip"][data-hue]');
      await expect(chips.first()).toBeVisible();
      const found = await chips.evaluateAll((all) =>
        all.map((chip) => [
          chip.getAttribute('data-hue') ?? '',
          getComputedStyle(chip).backgroundColor,
          getComputedStyle(chip).color,
        ]),
      );
      const fills = new Map<string, Set<string>>();
      for (const [hue, fill] of found)
        fills.set(hue, (fills.get(hue) ?? new Set()).add(fill));
      // at least two areas, each with one fill, and different fills for different areas
      expect(fills.size).toBeGreaterThanOrEqual(2);
      for (const [hue, set] of fills) expect(set.size, hue).toBe(1);
      const all = [...fills.values()].map((set) => [...set][0]);
      expect(new Set(all).size).toBe(all.length);
      // the text is in the chip as well as the colour, and the chips are the same size whatever the hue
      const heights = await chips.evaluateAll((list) =>
        list.map((chip) => Math.round(chip.getBoundingClientRect().height)),
      );
      expect(new Set(heights).size).toBe(1);
    });
});

test.describe('the role under the bars', () => {
  const SCREENS = [
    ['a phone', 390, 844, 'open'],
    ['the folded device', 1440, 900, 'folded'],
    ['the open device', 1440, 900, 'open'],
  ] as const;

  for (const [name, width, height, fold] of SCREENS) {
    const show = async (page: Page) => {
      await page.addInitScript(
        ([key, state]) => localStorage.setItem(key, state),
        [FOLD_KEY, fold],
      );
      await page.setViewportSize({ width, height });
    };

    const below = async (page: Page) => {
      const {
        barsBottom,
        top,
        bottom,
        height: window,
      } = await roleAgainstBars(page);
      expect(top).toBeGreaterThanOrEqual(barsBottom);
      expect(bottom).toBeLessThanOrEqual(window);
    };

    test(`on ${name} the address #role-<id> lands the role below the bars`, async ({
      page,
    }) => {
      await show(page);
      await gotoSkin(page, '/resume');
      const id = await page
        .locator('[id^="role-"]')
        .nth(1)
        .evaluate((el) => el.id);
      // a new page load: going to an address that differs only by its hash is not a navigation
      await gotoSkin(page, '/about');
      await gotoSkin(page, `/resume#${id}`);
      await expect(page.locator('#ph-role-detail')).toBeVisible();
      await page.waitForTimeout(800);
      await below(page);
    });

    test(`on ${name} a tap on a role lands the role below the bars`, async ({
      page,
    }) => {
      await show(page);
      await gotoSkin(page, '/resume');
      await page.locator('[id^="role-"]').nth(1).click();
      await expect(page.locator('#ph-role-detail')).toBeVisible();
      await page.waitForTimeout(800);
      await below(page);
    });
  }
});

test.describe('Resume, the roles and the role', () => {
  test('are a list with the role beside it on a tablet', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await gotoSkin(page, '/resume');
    const roles = page.locator('[id^="role-"]');
    await expect(roles.first()).toBeVisible();
    await expect(page.locator('#ph-role-detail')).toBeVisible();
    await roles.nth(1).click();
    await expect(roles.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('#ph-role-detail')).toBeVisible();
  });

  test('are a list, then the role on a screen of its own, on a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    await expect(page.locator('#ph-role-detail')).toBeHidden();
    await page.locator('[id^="role-"]').nth(1).click();
    await expect(page.locator('#ph-role-detail')).toBeVisible();
    await expect(page.locator('[id^="role-"]').first()).toBeHidden();
    await page.getByRole('button', { name: 'All roles' }).click();
    await expect(page.locator('#ph-role-detail')).toBeHidden();
    await expect(page.locator('[id^="role-"]').nth(1)).toBeFocused();
  });

  test('open the role of #role-<id> and scroll to #skills', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    const id = await page
      .locator('[id^="role-"]')
      .nth(1)
      .evaluate((el) => el.id);
    // a new page load: going to an address that differs only by its hash is not a navigation
    await gotoSkin(page, '/about');
    await gotoSkin(page, `/resume#${id}`);
    await expect(page.locator('#ph-role-detail')).toBeVisible();

    await gotoSkin(page, '/about');
    await gotoSkin(page, '/resume#skills');
    await expect(page.locator('#skills')).toBeInViewport();
  });
});
