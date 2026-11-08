/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const bar = (page: Page) =>
  page.getByRole('navigation', { name: 'Quick links' });
const panelTop = (page: Page) =>
  page.evaluate(
    () => document.querySelector('main')?.getBoundingClientRect().top ?? NaN,
  );

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the search takes the whole screen without stretching its rows, and has a way out', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Search the site' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('option').first()).toBeVisible();
    // a grid that is as tall as the screen would share the spare height between its rows: the field and the footer stay their own size
    const field = await page.getByRole('combobox').evaluate((el) => {
      const row = el.parentElement!.getBoundingClientRect();
      return row.height;
    });
    expect(field).toBeLessThanOrEqual(64);
    const footer = await dialog.evaluate((el) => {
      const last = el.lastElementChild!.getBoundingClientRect();
      return last.height;
    });
    expect(footer).toBeLessThanOrEqual(90);
    // there is no Esc key on a phone: the button closes it and the focus goes back
    const close = dialog.getByRole('button', { name: 'Close search' });
    const box = (await close.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Search the site' }),
    ).toBeFocused();
  });

  test('the bar has three pages and the watchlist, which opens as a sheet with every page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(bar(page).getByRole('link')).toHaveText([
      /Home/,
      /About/,
      /Resume/,
    ]);
    const button = bar(page).getByRole('button', { name: 'Watchlist' });
    await button.click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    const pages = sheet.getByRole('navigation', { name: 'Main' });
    for (const name of [
      'Home',
      'Projects',
      'Resume',
      'About',
      'Services',
      'Payment',
      'Certificates',
    ])
      await expect(
        pages.getByRole('link', { name: new RegExp(name) }),
      ).toBeVisible();
    await expect(sheet.getByRole('tab')).toHaveText([
      /Pages/,
      /Skills/,
      /Roles/,
    ]);
    // choosing a page goes there and closes the sheet
    await pages.getByRole('link', { name: /Certificates/ }).click();
    await expect(page).toHaveURL(/\/certificates$/);
    await expect(sheet).toBeHidden();
    // Esc and the close button put the focus back on the button
    await button.click();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(button).toBeFocused();
    await button.click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Close the watchlist' })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('a page chosen from the bar opens at its own top, not at the offset of the page before', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('main').getByRole('heading').first(),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 900));
    expect(await panelTop(page)).toBeLessThan(0);
    await bar(page).getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    // the top of the page is back, just under the toolbar that sticks to the top of the screen
    const under = () =>
      page.evaluate(
        () =>
          (document.querySelector('main')?.getBoundingClientRect().top ?? NaN) -
          (document.querySelector('[data-tv-toolbar]')?.getBoundingClientRect()
            .bottom ?? NaN),
      );
    await expect.poll(under).toBeGreaterThanOrEqual(-1);
    expect(await under()).toBeLessThan(40);
  });

  test('a page chosen while the chart is still in view leaves the screen where it is', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('main').getByRole('heading').first(),
    ).toBeVisible();
    await bar(page).getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe('on the wide terminal', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('has no bottom bar, keeps the watchlist beside the page, and a page change does not scroll the window', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(bar(page)).toBeHidden();
    await expect(
      page.getByRole('complementary', { name: 'Watchlist' }),
    ).toBeVisible();
    await page
      .getByRole('complementary', { name: 'Watchlist' })
      .getByRole('link', { name: /About/ })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
