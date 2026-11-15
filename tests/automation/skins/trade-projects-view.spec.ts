/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { projectsControls } from '../support/projects-controls';
import { gotoSkin, useSkin } from '../support/skin';

// The order and the filters of the Projects page in the Trade skin: the screener has its own controls (the headers of the table sort, the
// menu of the Filters button has lists of checkboxes) and the same rules as every skin (`tests/unit/lib/derive/project-view.test.ts`). The
// suite the other skins share does not fit the screener, so here are the checks that do.

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
const en = projectsControls('en');

/** Opens the menu of the filters and picks a checkbox in one of its lists (the name of a choice ends with the number of projects it leaves). */
async function pick(page: Page, list: string, choice: RegExp) {
  const menu = await en.openFilters(page);
  await menu
    .getByRole('group', { name: list })
    .getByRole('button', { name: choice })
    .click();
  await en.closeMenus(page);
}

test.describe('the order', () => {
  test('opens with the featured ones first, and the menu has the six orders of every skin', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await en.expectSort(page, 'featured');
    const menu = await en.openSort(page);
    await expect(menu.getByRole('radio')).toHaveText(
      Object.values(en.words.orders),
    );
    await page.keyboard.press('Escape');
    expect((await names(page)).slice(0, 4)).toEqual([
      'VenusAI',
      'Yoga Lasyn',
      'DevPad',
      'DevCmd',
    ]);
  });

  test('an order of the menu sorts the column it stands for, with the Started column as the date', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await en.chooseSort(page, 'latest');
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Started' }),
    ).toHaveAttribute('aria-sort', 'descending');
    await expect
      .poll(async () => (await names(page)).slice(0, 3))
      .toEqual(['JP Marugoto', 'DevPad', 'FinHub MCP']);
    // the column has the period of the project, and nothing for one with no month
    const jp = rows(page).filter({ hasText: 'JP Marugoto' });
    await expect(jp).toContainText('Nov 2026');
    await en.chooseSort(page, 'oldest');
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Started' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    await expect
      .poll(async () => (await names(page)).slice(0, 2))
      .toEqual(['Beli Coffee', 'Yoga Lasyn']);
    await en.chooseSort(page, 'manual');
    await expect
      .poll(async () => (await names(page)).slice(0, 3))
      .toEqual(['Beli Coffee', 'DevCmd', 'DevPad']);
  });

  test("a click on a header that is one of the orders moves the menu, and one that is not is the table's alone", async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: 'Sort by Name' }).click();
    await en.expectSort(page, 'name');
    await page.getByRole('button', { name: 'Sort by Technologies' }).click();
    await page.getByRole('button', { name: 'Sort by Technologies' }).click();
    // technologies going down is "Most technologies"
    await en.expectSort(page, 'technologies');
    // the kind is a column of the table only: no order of the menu says it, so the button says it is the table's
    await page.getByRole('button', { name: 'Sort by Kind' }).click();
    await expect(en.sortButton(page)).toContainText('Table order');
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Kind' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    // choosing an order of the menu takes the table's own sort away
    await en.chooseSort(page, 'name');
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Kind' }),
    ).toHaveAttribute('aria-sort', 'none');
  });
});

test.describe('the filters', () => {
  test('platform and status are chips in one menu, with the number of projects each choice leaves', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const menu = await en.openFilters(page);
    await expect(menu.getByRole('button', { name: 'Mobile, 4' })).toBeVisible();
    await menu.getByRole('button', { name: /^Desktop/ }).click();
    await expect(page.getByText('2 of 10 projects')).toBeVisible();
    expect((await names(page)).sort()).toEqual(['DevCmd', 'DevPad']);
    await expect(
      page.getByRole('button', { name: 'Filters, 1', exact: true }),
    ).toBeVisible();
    await en.closeMenus(page);

    await pick(page, 'Status', /^Finished/);
    // desktop and finished: nothing
    await expect(page.getByText('0 of 10 projects')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await expect(page.getByText('10 of 10 projects')).toBeVisible();
  });

  test('the choice is in the address and kept for the next visit, and Esc clears the filters', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects?foo=1');
    await en.chooseSort(page, 'latest');
    await pick(page, 'Platform', /^Mobile/);
    await expect
      .poll(() => new URL(page.url()).searchParams.get('platform'))
      .toBe('mobile');
    expect(new URL(page.url()).searchParams.get('sort')).toBe('latest');
    expect(new URL(page.url()).searchParams.get('foo')).toBe('1');

    await gotoSkin(page, '/projects');
    await en.expectSort(page, 'latest');
    await expect(page.getByText('4 of 10 projects')).toBeVisible();

    await page.getByRole('searchbox').focus();
    await page.keyboard.press('Escape');
    await expect(page.getByText('10 of 10 projects')).toBeVisible();
  });
});

test.describe('the owner decides in site/live, projects', () => {
  test('a force fixes the order (the headers are only names) and the platform (no list for it)', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        projects: {
          sort: { force: 'oldest' },
          filters: { platform: { force: ['mobile'] } },
        },
      },
    });
    await gotoSkin(page, '/projects?sort=name&platform=web');
    await expect(page.getByText('4 of 10 projects')).toBeVisible();
    await expect(en.sortButton(page)).toHaveCount(0);
    const menu = await en.openFilters(page);
    await expect(menu.getByRole('group', { name: 'Platform' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Sort by/ })).toHaveCount(0);
    expect((await names(page)).slice(0, 2)).toEqual([
      'Beli Coffee',
      'Yoga Lasyn',
    ]);
    // the others are still there
    await expect(menu.getByRole('group', { name: 'Status' })).toBeVisible();
  });

  test('off leaves orders out and enabled: false takes a filter away; a default opens the page filtered', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        projects: {
          sort: { off: ['name', 'technologies'], default: 'latest' },
          filters: {
            status: { enabled: false },
            search: { enabled: false },
            platform: { default: ['web'], off: ['ai'] },
          },
        },
      },
    });
    await gotoSkin(page, '/projects');
    await en.expectSort(page, 'latest');
    const sort = await en.openSort(page);
    await expect(sort.getByRole('radio')).toHaveText([
      'My order',
      'Newest first',
      'Oldest first',
      'Featured first',
    ]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    // web by default: Com Chay Rop, JP Marugoto (bachbntdev is web and AI)
    await expect(page.getByText('3 of 10 projects')).toBeVisible();
    const menu = await en.openFilters(page);
    await expect(menu.getByRole('group', { name: 'Status' })).toHaveCount(0);
    await expect(menu.getByRole('button', { name: /^AI/ })).toHaveCount(0);
  });

  test('Vietnamese', async ({ page }) => {
    const vi = projectsControls('vi');
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await expect(vi.sortButton(page)).toBeVisible();
    const menu = await vi.openFilters(page);
    await menu
      .getByRole('group', { name: 'Nền tảng' })
      .getByRole('button', { name: /^Di động/ })
      .click();
    await expect(page.getByText('4 / 10 dự án')).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Sắp xếp theo Bắt đầu' }),
    ).toBeVisible();
  });
});
