/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));
const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('with no saved choice the site follows the system setting, before the first paint', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await isDark(page)).toBe(true);
  await expect(page.getByRole('button', { name: 'Theme' })).toBeVisible();

  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => isDark(page)).toBe(false);
});

test('the header menu switches the theme and the choice is remembered', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const light = await background(page);

  await page.getByRole('button', { name: 'Theme' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await expect.poll(() => isDark(page)).toBe(true);
  expect(await background(page)).not.toBe(light);
  expect(await page.evaluate(() => localStorage.getItem('bach-cv-theme'))).toBe(
    'dark',
  );

  // the choice wins over the system setting and survives a reload without a flash of the other theme
  await page.reload();
  expect(await isDark(page)).toBe(true);

  await page.getByRole('button', { name: 'Theme' }).click();
  await page.getByRole('menuitemradio', { name: 'System' }).click();
  await expect.poll(() => isDark(page)).toBe(false);
  expect(
    await page.evaluate(() => localStorage.getItem('bach-cv-theme')),
  ).toBeNull();
});

test('the theme control is also in the phone menu and is named in Vietnamese', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mở menu' }).click();
  const group = page.getByRole('group', { name: 'Giao diện' });
  await expect(group).toBeVisible();
  await group.getByRole('button', { name: 'Tối' }).click();
  await expect.poll(() => isDark(page)).toBe(true);
  await expect(group.getByRole('button', { name: 'Tối' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('the CV sheet stays white paper in dark mode, with dark ink', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-theme', 'dark'));
  await page.goto('/');
  await page
    .getByRole('button', { name: /download cv/i })
    .first()
    .click();
  const sheet = page.locator('.theme-light').first();
  await expect(sheet).toBeVisible({ timeout: 15000 });
  expect(
    await sheet.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe('rgb(255, 255, 255)');
  const heading = sheet.locator('h2, h3').first();
  const ink = await heading.evaluate((el) => getComputedStyle(el).color);
  // dark ink, not the light text of the dark theme
  const [r] = ink.match(/\d+/g)!.map(Number);
  expect(r).toBeLessThan(100);
});

test('the dark theme does not leave dark text on a dark surface (cards, tags, dialogs)', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-theme', 'dark'));
  for (const path of ['/', '/about', '/resume', '/projects', '/certificates']) {
    await page.goto(path);
    await page.waitForTimeout(1200);
    const bad = await page.evaluate(() => {
      const lum = (c: string) => {
        const m = c.match(/[\d.]+/g)?.map(Number) ?? [];
        // colour-mix() comes back as `color(srgb 0.7 0.6 0.4)`, with channels from 0 to 1
        const scale = c.startsWith('color(') ? 1 : 255;
        const [r, g, b] = m.slice(0, 3).map((v) => {
          const s = v / scale;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return { l: 0.2126 * r + 0.7152 * g + 0.0722 * b, a: m[3] ?? 1 };
      };
      // the colour a text element really sits on: the first ancestor with an opaque background
      const surface = (el: Element | null): number => {
        for (; el; el = el.parentElement) {
          const bg = lum(getComputedStyle(el).backgroundColor);
          if (bg.a > 0.9) return bg.l;
        }
        return 1;
      };
      const found: string[] = [];
      for (const el of document.querySelectorAll('h1, h2, h3, p, li, span')) {
        if (!el.textContent?.trim() || el.children.length > 0) continue;
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.opacity === '0') continue;
        if ((el as HTMLElement).offsetParent === null) continue;
        const fg = lum(s.color).l;
        const bg = surface(el);
        const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
        if (ratio < 2.5)
          found.push(`${el.tagName} "${el.textContent.trim().slice(0, 30)}"`);
      }
      return found;
    });
    expect(bad, `low-contrast text on ${path}`).toEqual([]);
  }
});

test('the button shows the choice: a screen for System, a sun for Light, a moon for Dark, from the first paint', async ({
  page,
}) => {
  const icon = async () =>
    page.evaluate(() => {
      const trigger = [...document.querySelectorAll('button')].find(
        (b) => b.getAttribute('aria-label') === 'Theme',
      );
      const shown = [...(trigger?.querySelectorAll('svg') ?? [])].filter(
        (svg) => getComputedStyle(svg).display !== 'none',
      );
      return shown.map((svg) => svg.getAttribute('class') ?? '');
    });
  // open the menu, pick an item, and wait for the menu to close before the next step
  const choose = async (name: string) => {
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('menuitemradio', { name }).click();
    await expect(page.getByRole('menu')).toBeHidden();
  };
  const only = (names: string[], kind: string) =>
    names.length === 1 && names[0].includes(`lucide-${kind}`);

  // no saved choice: System, even while the OS is dark
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(only(await icon(), 'monitor')).toBe(true);

  await choose('Light');
  expect(only(await icon(), 'sun')).toBe(true);
  await page.reload();
  expect(only(await icon(), 'sun')).toBe(true);

  await choose('Dark');
  expect(only(await icon(), 'moon')).toBe(true);

  await choose('System');
  expect(only(await icon(), 'monitor')).toBe(true);
  expect(await isDark(page)).toBe(true);
});

test('the language button shows the current language code, and its menu closes after a choice', async ({
  page,
}) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Language: English' });
  await expect(button).toBeVisible();
  // the code of the current language is always visible, next to the icon
  await expect(button).toContainText('EN');
  await expect(button.locator('svg')).toHaveCount(1);

  await button.click();
  await page.getByRole('menuitemradio', { name: 'Tiếng Việt' }).click();
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  const vi = page.getByRole('button', { name: 'Ngôn ngữ: Tiếng Việt' });
  await expect(vi).toBeVisible();
  await expect(vi).toContainText('VI');
});
