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

  test('the years in software are green and count up when they come into view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoSkin(page, '/');
    const years = page.getByTestId('desk-count').first();
    const value = Number(await years.getAttribute('data-value'));
    expect(value).toBeGreaterThan(0);
    // below the fold on a phone, it counts when it is seen and ends on the real number in the green of an up value
    const shown = () =>
      years.evaluate((el) => el.firstElementChild!.textContent);
    await years.scrollIntoViewIfNeeded();
    await expect.poll(shown).toBe(String(value));
    expect(await years.evaluate((el) => getComputedStyle(el).color)).toBe(
      await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.className = 'text-tv-up-ink';
        document.body.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      }),
    );
  });

  test('the Layout menu is in the bar with the two parts a phone has, and the tape follows it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const tape = page.getByRole('region', { name: /ticker|technolog|tape/i });
    await expect(tape.first()).toBeVisible();
    await page
      .getByRole('button', { name: 'Choose what the terminal shows' })
      .click();
    await expect(page.getByRole('menuitemcheckbox')).toHaveText([
      'Tool rail',
      'Ticker tape',
    ]);
    await expect(page.getByTestId('tv-reset-layout')).toBeVisible();
    await page.getByRole('menuitemcheckbox', { name: 'Ticker tape' }).click();
    await expect(tape).toHaveCount(0);
    // the watchlist stays a sheet and the page stays on screen: Reset layout brings the tape back
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Choose what the terminal shows' })
      .click();
    await page.getByTestId('tv-reset-layout').click();
    await expect(tape.first()).toBeVisible();
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

for (const size of [
  { width: 375, height: 667 },
  { width: 320, height: 568 },
]) {
  test.describe(`the marks of the chart at ${size.width} px`, () => {
    test.use({ viewport: size, hasTouch: true });

    /** The part of the page that starts at `selector`, measured against the bottom of the toolbar that sticks to the top. */
    const under = (page: Page, selector: string) =>
      page.evaluate((css) => {
        const el = document.querySelector(css);
        const bar = document.querySelector('[data-tv-toolbar]');
        if (!el || !bar) return null;
        return Math.round(
          el.getBoundingClientRect().top - bar.getBoundingClientRect().bottom,
        );
      }, selector);

    /** The row of the degree called `name`, measured against the bottom of the toolbar. */
    const underDegree = (page: Page, name: string) =>
      page.evaluate((title) => {
        const row = [...document.querySelectorAll('[data-testid=degree]')].find(
          (r) => r.querySelector('h3')?.textContent === title,
        );
        const bar = document.querySelector('[data-tv-toolbar]');
        if (!row || !bar) return null;
        return Math.round(
          row.getBoundingClientRect().top - bar.getBoundingClientRect().bottom,
        );
      }, name);

    test('each mark opens its own job or its own degree, which stops under the toolbar and not behind it', async ({
      page,
    }) => {
      await gotoSkin(page, '/');
      await expect(page.locator('button.tv-chart-flag')).toHaveCount(6);
      const labels = await page
        .locator('button.tv-chart-flag')
        .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')!));
      for (let i = 0; i < labels.length; i += 1) {
        await gotoSkin(page, '/');
        await expect(page.locator('button.tv-chart-flag')).toHaveCount(6);
        await page.waitForTimeout(1200);
        const label = labels[i];
        // a plain click is refused when another control lies over the centre of the mark: the hit area of a neighbour used to
        await page.getByRole('button', { name: label }).click();
        await expect(page).toHaveURL(/\/resume$/);
        const degree = /(Bachelor|Master) of Science/.exec(label)?.[0];
        if (degree) {
          // the row of THAT degree, not the start of the education
          await expect(
            page.locator('[data-testid=degree]', { hasText: degree }),
          ).toBeVisible();
        } else {
          const company = /at (.+?)\. Show/.exec(label)![1];
          const row = page.locator('[data-job][data-active="true"]');
          await expect(row).toHaveCount(1);
          await expect(row).toContainText(company);
        }
        // it ends up just under the toolbar: not behind it (a negative number) and not left far below the screen
        await expect
          .poll(
            async () => {
              const v = degree
                ? await underDegree(page, degree)
                : await under(page, '[data-job][data-active="true"]');
              return v !== null && v >= 0 && v < 48;
            },
            { timeout: 8000 },
          )
          .toBe(true);
      }
    });

    test('the hit areas of two marks never lie over each other', async ({
      page,
    }) => {
      await gotoSkin(page, '/');
      await expect(page.locator('button.tv-chart-flag')).toHaveCount(6);
      await page.waitForTimeout(1500);
      const overlaps = await page.evaluate(() => {
        const areas = [
          ...document.querySelectorAll('button.tv-chart-flag'),
        ].map((el) => {
          const r = el.getBoundingClientRect();
          const after = getComputedStyle(el, '::after');
          const x = parseFloat(after.left);
          const w = parseFloat(after.width);
          const y = parseFloat(after.top);
          const h = parseFloat(after.height);
          return {
            left: r.left + x,
            right: r.left + x + w,
            top: r.top + y,
            bottom: r.top + y + h,
          };
        });
        let count = 0;
        for (let i = 0; i < areas.length; i += 1)
          for (let j = i + 1; j < areas.length; j += 1) {
            const a = areas[i];
            const b = areas[j];
            if (
              a.left < b.right - 0.5 &&
              a.right > b.left + 0.5 &&
              a.top < b.bottom &&
              a.bottom > b.top
            )
              count += 1;
          }
        return count;
      });
      expect(overlaps).toBe(0);
    });
  });
}

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
