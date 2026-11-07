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

const rows = (page: Page) => page.getByTestId('project');
const names = (page: Page) =>
  rows(page).evaluateAll((els) =>
    els.map((el) => el.querySelector('h3')?.textContent?.trim()),
  );
const FEATURED = ['VenusAI', 'Yoga Lasyn', 'DevPad', 'DevCmd'];

test.describe('the table', () => {
  test('lists every project with the featured ones first by rank, and the fields of the Standard card', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(rows(page)).toHaveCount(9);
    expect((await names(page)).slice(0, 4)).toEqual(FEATURED);
    await expect(page.getByText('9 of 9 projects')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
    const row = rows(page).filter({ hasText: 'DevPad' });
    await expect(row.getByText('Personal').first()).toBeVisible();
    await expect(row.getByText('Featured #3').first()).toBeVisible();
    await expect(
      row.getByRole('list', { name: 'Technologies' }).first(),
    ).toContainText('Swift');
    await expect(
      row.getByRole('link', { name: 'GitHub' }).first(),
    ).toHaveAttribute('target', '_blank');
    await expect(
      row.getByRole('link', { name: 'Releases' }).first(),
    ).toBeVisible();
    await expect(
      row.getByRole('button', { name: '12 screenshots' }).first(),
    ).toBeVisible();
  });

  test('sorts by a header with a click or the keyboard and says it with aria-sort', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const head = page.getByRole('columnheader', { name: 'Sort by Name' });
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Featured' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    await page.getByRole('button', { name: 'Sort by Name' }).click();
    await expect(head).toHaveAttribute('aria-sort', 'ascending');
    expect((await names(page))[0]).toBe('bachbntdev');
    await page.getByRole('button', { name: 'Sort by Name' }).focus();
    await page.keyboard.press('Enter');
    await expect(head).toHaveAttribute('aria-sort', 'descending');
    expect((await names(page))[0]).toBe('Yoga Lasyn');
    await page.keyboard.press('Enter');
    await expect(head).toHaveAttribute('aria-sort', 'none');
    await page.getByRole('button', { name: 'Sort by Screenshots' }).click();
    await page.getByRole('button', { name: 'Sort by Screenshots' }).click();
    expect((await names(page))[0]).toBe('DevPad');
  });

  test('the column chooser hides a column and always keeps the name', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Links' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Columns' }).click();
    await expect(page.getByRole('checkbox', { name: /^Name/ })).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Links' }).uncheck();
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Links' }),
    ).toHaveCount(0);
    await page.keyboard.press('Escape');
    // a hidden column stays reachable in the details of the row
    await rows(page)
      .filter({ hasText: 'DevPad' })
      .getByRole('button', { name: 'DevPad' })
      .click();
    await expect(
      rows(page)
        .filter({ hasText: 'DevPad' })
        .getByRole('link', { name: 'GitHub' }),
    ).toBeVisible();
  });

  test('a row opens to the summary, all the technologies, the links and the screenshots window', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const row = rows(page).filter({ hasText: 'VenusAI' });
    const toggle = row.getByRole('button', { name: 'VenusAI' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(row.getByText('An app that creates AI avatars')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(row.getByText('An app that creates AI avatars')).toBeVisible();
    await row.getByRole('button', { name: '7 screenshots' }).last().click();
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win.getByText('1 of 7')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(win.getByText('2 of 7')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });

  test('the arrow keys move between rows, Enter opens one, / filters and Esc clears', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const first = rows(page).nth(0).getByRole('button', { name: 'VenusAI' });
    await first.focus();
    await page.keyboard.press('ArrowDown');
    const second = rows(page)
      .nth(1)
      .getByRole('button', { name: 'Yoga Lasyn' });
    await expect(second).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('End');
    await expect(rows(page).last().getByRole('button').first()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();

    await page.keyboard.press('/');
    const filter = page.getByRole('searchbox', { name: /Filter by name/ });
    await expect(filter).toBeFocused();
    await page.keyboard.type('devp');
    await expect(rows(page)).toHaveCount(1);
    await expect(page.getByText('1 of 9 projects')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(rows(page)).toHaveCount(9);
    await expect(filter).toHaveValue('');
  });
});

test.describe('filters', () => {
  test('kind chips, featured only and a technology narrow the list, and Clear filters undoes them', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const kinds = page.getByRole('group', { name: 'Filter projects' });
    await kinds.getByRole('button', { name: 'Personal' }).click();
    await expect(
      kinds.getByRole('button', { name: 'Personal' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(rows(page)).toHaveCount(4);
    await page.getByRole('button', { name: 'Featured only' }).click();
    expect(await names(page)).toEqual(['DevPad', 'DevCmd']);
    await kinds.getByRole('button', { name: 'All', exact: true }).click();
    await expect(rows(page)).toHaveCount(4);
    await page.getByRole('button', { name: 'Featured only' }).click();
    await page.getByRole('button', { name: /^Technologies/ }).click();
    await page.getByRole('checkbox', { name: /^MCP/ }).check();
    await page.keyboard.press('Escape');
    expect(await names(page)).toEqual(['DevCmd', 'FinHub MCP']);
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(rows(page)).toHaveCount(9);
  });

  test('says when nothing matches, with a way back', async ({ page }) => {
    await gotoSkin(page, '/projects');
    await page
      .getByRole('searchbox', { name: /Filter by name/ })
      .fill('zzzzzz');
    await expect(
      page.getByRole('heading', { name: 'No project matches' }),
    ).toBeVisible();
    await expect(rows(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Clear filters' }).last().click();
    await expect(rows(page)).toHaveCount(9);
  });
});

test.describe('views', () => {
  test('cards show the cover, kind, rank, summary, tags and links of every project', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: 'Cards' }).click();
    await expect(page.getByRole('button', { name: 'Cards' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(rows(page)).toHaveCount(9);
    const card = rows(page).filter({ hasText: 'DevCmd' });
    await expect(card.getByText('Featured #4')).toBeVisible();
    await expect(card.getByText('A command-line tool')).toBeVisible();
    await expect(card.getByRole('link', { name: 'Releases' })).toBeVisible();
    await card.getByRole('button', { name: '7 screenshots' }).click();
    await expect(page.getByRole('dialog', { name: 'DevCmd' })).toBeVisible();
  });

  test('the heatmap has a tile for each project, says what area and colour mean, and a tile opens the project', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: 'Heatmap' }).click();
    await expect(page.getByText('Area: number of technologies')).toBeVisible();
    await expect(page.getByText('Colour: kind')).toBeVisible();
    await expect(rows(page)).toHaveCount(9);
    const tile = page.getByRole('button', {
      name: /^DevPad, Personal, 4 technologies$/,
    });
    await expect(tile).toHaveAttribute('aria-pressed', 'false');
    await tile.click();
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    const open = page.getByRole('region', { name: 'Selected project' });
    await expect(open.getByRole('heading', { name: 'DevPad' })).toBeVisible();
    await expect(open.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await open.getByRole('button', { name: '12 screenshots' }).click();
    await expect(page.getByRole('dialog', { name: 'DevPad' })).toBeVisible();
  });

  test('tile areas follow the number of technologies', async ({ page }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: 'Heatmap' }).click();
    const area = async (name: RegExp) => {
      const box = (await page.getByRole('button', { name }).boundingBox())!;
      return box.width * box.height;
    };
    await expect(rows(page)).toHaveCount(9);
    await expect
      .poll(() => area(/^bachbntdev/))
      .toBeGreaterThan(await area(/^VenusAI/));
  });

  test('a filter re-lays the heatmap out', async ({ page }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: 'Heatmap' }).click();
    await page.getByRole('button', { name: 'Featured only' }).click();
    await expect(rows(page)).toHaveCount(4);
  });
});

test.describe('motion', () => {
  test('sorting slides the rows, and not for a visitor who asked for less motion', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(rows(page)).toHaveCount(9);
    await page.waitForTimeout(1500);
    const sliding = () =>
      page.evaluate(() => {
        document
          .querySelector<HTMLButtonElement>(
            'button[aria-label="Sort by Name"]',
          )!
          .click();
        return [...document.querySelectorAll('[data-flip]')].filter((el) =>
          el.getAnimations().some((a) => a instanceof Animation && a.effect),
        ).length;
      });
    expect(await sliding()).toBeGreaterThan(0);
  });

  test('with reduced motion nothing animates', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/projects');
    await expect(rows(page)).toHaveCount(9);
    const count = await page.evaluate(() => {
      document
        .querySelector<HTMLButtonElement>('button[aria-label="Sort by Name"]')!
        .click();
      return [...document.querySelectorAll('[data-flip]')].filter(
        (el) => el.getAnimations().length > 0,
      ).length;
    });
    expect(count).toBe(0);
  });
});

test.describe('language and phone', () => {
  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dự án');
    await expect(page.getByText('9 / 9 dự án')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Bản đồ nhiệt' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sắp xếp theo Tên' }),
    ).toBeVisible();
    await expect(page.getByRole('group', { name: 'Lọc dự án' })).toBeVisible();
    await rows(page).first().getByRole('button', { name: 'VenusAI' }).click();
    await expect(page.getByText('Nổi bật #1').first()).toBeVisible();
  });

  for (const view of ['Table', 'Cards', 'Heatmap']) {
    test(`${view} does not scroll the page sideways at 390px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoSkin(page, '/projects');
      await page.getByRole('button', { name: view, exact: true }).click();
      await expect(rows(page)).toHaveCount(9);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('the table scrolls inside its own box at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/projects');
    const box = page.getByTestId('project-grid');
    expect(await box.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );
  });
});
