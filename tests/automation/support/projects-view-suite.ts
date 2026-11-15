/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import type { SkinId } from '@/lib/skin/skins';
import { mockFirestore } from './firestore-mock';
import { projectsControls } from './projects-controls';
import { gotoSkin, useSkin } from './skin';

// The order and the filters of the Projects page, as a visitor meets them. Every skin draws its own controls, but they are named the same way
// (`projects-controls.ts`): a search box, ONE button for the filters and ONE for the order, each opening a menu; the groups `Type`, `Platform`,
// `Status`, `Technology` with chips named `Mobile, 4`, `Clear filters` and the line `4 of 10 projects`. So ONE suite holds them all: a skin
// calls `defineProjectsViewTests` with how to read its list. The rules themselves (what each order is, "and" between filters, "or" inside one,
// what the owner's `site/live` settings do) are `tests/unit/lib/derive/project-view.test.ts`.

export interface ProjectsViewTarget {
  skin: SkinId;
  /** the names of the first `count` projects of the list, in the order shown (the featured cards above a list are not in it) */
  names: (page: Page, count: number) => Promise<string[]>;
  /** the order the skin opens in when the owner has not said: `manual` (the default of the site) or `featured` (Travel starts with the featured ones) */
  defaultSort?: 'manual' | 'featured';
}

// the seed has 10 visible projects; the owner's order is sort 10, 20 ... 110
const MANUAL = [
  'Beli Coffee',
  'DevCmd',
  'DevPad',
  'P&C Dashboard',
  'FinHub MCP',
  'Yoga Lasyn',
  'bachbntdev',
  'VenusAI',
  'Com Chay Rop',
  'JP Marugoto',
];

// the same with the four featured ones first, in rank order (VenusAI 1, Yoga Lasyn 2, DevPad 3, DevCmd 4)
const FEATURED_FIRST = [
  'VenusAI',
  'Yoga Lasyn',
  'DevPad',
  'DevCmd',
  'Beli Coffee',
  'P&C Dashboard',
  'FinHub MCP',
  'bachbntdev',
  'Com Chay Rop',
  'JP Marugoto',
];

const toolbar = (page: Page) =>
  page.getByRole('group', { name: 'Filter projects' });

export function defineProjectsViewTests(target: ProjectsViewTarget) {
  const en = projectsControls('en');
  /** Opens a path in the skin: Standard has no `data-skin-ready` to wait for. */
  const open = async (page: Page, path: string) => {
    if (target.skin === 'standard') await page.goto(path);
    else await gotoSkin(page, path);
  };
  const names = target.names;
  const first = target.defaultSort ?? 'manual';
  /** the names of the first `count` projects, A to Z: the filters are about which ones are there, the orders are tested apart */
  const which = async (page: Page, count: number) =>
    (await names(page, count)).sort();

  test.describe('the order and the filters of Projects', () => {
    test.beforeEach(async ({ page }) => {
      await mockFirestore(page);
      await useSkin(page, target.skin);
    });

    test('opens in the owner order, with a search box, a Filters button, a Sort button and the count', async ({
      page,
    }) => {
      await open(page, '/projects');
      await expect(page.getByText('10 of 10 projects')).toBeVisible();
      expect(await names(page, 10)).toEqual(
        first === 'manual' ? MANUAL : FEATURED_FIRST,
      );
      const bar = toolbar(page);
      await expect(
        bar.getByRole('searchbox', { name: 'Search projects' }),
      ).toBeVisible();
      await expect(en.filtersButton(page)).toBeVisible();
      await en.expectSort(page, first);
      // the groups are in the menu, not on the page
      await expect(en.filtersMenu(page)).toHaveCount(0);
      const menu = await en.openFilters(page);
      for (const group of ['Type', 'Platform', 'Status', 'Technology'])
        await expect(menu.getByRole('group', { name: group })).toBeVisible();
      // nothing to clear yet
      await expect(
        page.getByRole('button', { name: 'Clear filters' }),
      ).toHaveCount(0);
    });

    test('the order is picked from a menu and the page follows', async ({
      page,
    }) => {
      await open(page, '/projects');
      const menu = await en.openSort(page);
      await expect(menu.getByRole('radio')).toHaveText(
        Object.values(en.words.orders),
      );
      await expect(
        menu.getByRole('radio', { name: en.words.orders[first] }),
      ).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('Escape');

      await en.chooseSort(page, 'latest');
      await en.expectSort(page, 'latest');
      // by start month, newest first; a project with no month (bachbntdev here) is last
      await expect
        .poll(async () => (await names(page, 10)).slice(0, 3))
        .toEqual(['JP Marugoto', 'DevPad', 'FinHub MCP']);
      expect((await names(page, 10)).at(-1)).toBe('bachbntdev');

      await en.chooseSort(page, 'oldest');
      await expect
        .poll(async () => (await names(page, 10)).slice(0, 2))
        .toEqual(['Beli Coffee', 'Yoga Lasyn']);

      await en.chooseSort(page, 'name');
      await expect
        .poll(async () => (await names(page, 10)).slice(0, 3))
        .toEqual(['bachbntdev', 'Beli Coffee', 'Com Chay Rop']);

      await en.chooseSort(page, 'featured');
      // the ranks first: VenusAI (1), Yoga Lasyn (2), DevPad (3), DevCmd (4), then the owner order
      await expect
        .poll(async () => (await names(page, 10)).slice(0, 5))
        .toEqual(['VenusAI', 'Yoga Lasyn', 'DevPad', 'DevCmd', 'Beli Coffee']);

      await en.chooseSort(page, 'technologies');
      // bachbntdev lists 8
      await expect
        .poll(async () => (await names(page, 10))[0])
        .toBe('bachbntdev');
    });

    test('filters by platform ("or" inside), with the count of each choice, and narrows with the status ("and" between)', async ({
      page,
    }) => {
      await open(page, '/projects');
      const menu = await en.openFilters(page);
      const platform = menu.getByRole('group', { name: 'Platform' });
      // the count of a choice is in its name
      await expect(
        platform.getByRole('button', { name: 'Mobile, 4' }),
      ).toBeVisible();
      await platform.getByRole('button', { name: /^Desktop/ }).click();
      await expect(page.getByText('2 of 10 projects')).toBeVisible();
      expect(await which(page, 2)).toEqual(['DevCmd', 'DevPad']);
      await platform.getByRole('button', { name: /^AI/ }).click();
      // desktop or AI: DevCmd, DevPad, FinHub MCP, bachbntdev, VenusAI
      await expect(page.getByText('5 of 10 projects')).toBeVisible();

      // and "finished" narrows that to the one that is: VenusAI
      const status = menu.getByRole('group', { name: 'Status' });
      await status.getByRole('button', { name: /^Finished/ }).click();
      await expect(page.getByText('1 of 10 projects')).toBeVisible();
      expect(await which(page, 1)).toEqual(['VenusAI']);
      // desktop alone and finished: nothing
      await platform.getByRole('button', { name: /^AI/ }).click();
      await expect(page.getByText('0 of 10 projects')).toBeVisible();
      await expect(
        page.getByText('No project matches these filters.'),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Clear filters' }).first().click();
      await expect(page.getByText('10 of 10 projects')).toBeVisible();
      // the click outside closed the menu: open it again to see that nothing is chosen
      await expect(
        (await en.openFilters(page))
          .getByRole('group', { name: 'Platform' })
          .getByRole('button', { name: /^Desktop/ }),
      ).toHaveAttribute('aria-pressed', 'false');
    });

    test('the button of the filters says how many are on', async ({ page }) => {
      await open(page, '/projects');
      const menu = await en.openFilters(page);
      await menu
        .getByRole('group', { name: 'Platform' })
        .getByRole('button', { name: /^Mobile/ })
        .click();
      await menu
        .getByRole('group', { name: 'Status' })
        .getByRole('button', { name: /^Ongoing/ })
        .click();
      await expect(
        page.getByRole('button', { name: 'Filters, 2', exact: true }),
      ).toBeVisible();
    });

    test('two choices one right after the other both count', async ({
      page,
    }) => {
      await open(page, '/projects');
      const menu = await en.openFilters(page);
      // no waiting between them: a choice that is still on its way to the page must not be lost to the next
      await menu
        .getByRole('group', { name: 'Platform' })
        .getByRole('button', { name: /^AI/ })
        .click();
      await menu
        .getByRole('group', { name: 'Status' })
        .getByRole('button', { name: /^Finished/ })
        .click();
      // AI and finished: VenusAI
      await expect(page.getByText('1 of 10 projects')).toBeVisible();
      await expect(
        menu
          .getByRole('group', { name: 'Platform' })
          .getByRole('button', { name: /^AI/ }),
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(
        menu
          .getByRole('group', { name: 'Status' })
          .getByRole('button', { name: /^Finished/ }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('two clicks in the same filter one right after the other both count', async ({
      page,
    }) => {
      await open(page, '/projects');
      const tech = (await en.openFilters(page)).getByRole('group', {
        name: 'Technology',
      });
      await tech.getByRole('button', { name: /^Firebase/ }).click();
      await tech.getByRole('button', { name: /^Flutter/ }).click();
      // Firebase and Flutter both: Yoga Lasyn and VenusAI
      await expect(page.getByText('2 of 10 projects')).toBeVisible();
      await expect(
        tech.getByRole('button', { name: /^Firebase/ }),
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(
        tech.getByRole('button', { name: /^Flutter/ }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('the kind chips take one at a time, as they always did, with All', async ({
      page,
    }) => {
      await open(page, '/projects');
      const kind = (await en.openFilters(page)).getByRole('group', {
        name: 'Type',
      });
      await kind.getByRole('button', { name: /^Freelance/ }).click();
      await expect(page.getByText('5 of 10 projects')).toBeVisible();
      await kind.getByRole('button', { name: /^Personal/ }).click();
      await expect(page.getByText('5 of 10 projects')).toBeVisible();
      await expect(
        kind.getByRole('button', { name: /^Freelance/ }),
      ).toHaveAttribute('aria-pressed', 'false');
      await kind.getByRole('button', { name: 'All', exact: true }).click();
      await expect(page.getByText('10 of 10 projects')).toBeVisible();
    });

    test('technologies narrow the list and show the most used first, the rest behind More', async ({
      page,
    }) => {
      await open(page, '/projects');
      const tech = (await en.openFilters(page)).getByRole('group', {
        name: 'Technology',
      });
      const more = tech.getByRole('button', { name: 'More technologies' });
      await expect(more).toHaveAttribute('aria-expanded', 'false');
      const firstShown = await tech.getByRole('button').count();
      await more.click();
      await expect(
        tech.getByRole('button', { name: 'Fewer technologies' }),
      ).toHaveAttribute('aria-expanded', 'true');
      expect(await tech.getByRole('button').count()).toBeGreaterThan(
        firstShown,
      );
      await tech.getByRole('button', { name: /^Fewer/ }).click();

      await tech.getByRole('button', { name: /^Firebase/ }).click();
      await tech.getByRole('button', { name: /^Flutter/ }).click();
      // Firebase and Flutter both: Yoga Lasyn and VenusAI
      await expect(page.getByText('2 of 10 projects')).toBeVisible();
      expect(await which(page, 2)).toEqual(['VenusAI', 'Yoga Lasyn']);
    });

    test('the search box finds words of the name, the summary and the technologies, with no care for accents', async ({
      page,
    }) => {
      await open(page, '/projects');
      const box = toolbar(page).getByRole('searchbox', {
        name: 'Search projects',
      });
      await box.fill('marugoto');
      await expect(page.getByText('1 of 10 projects')).toBeVisible();
      expect(await which(page, 1)).toEqual(['JP Marugoto']);
      await box.fill('');
      await box.fill('swiftui');
      await expect(page.getByText('1 of 10 projects')).toBeVisible();
      expect(await which(page, 1)).toEqual(['DevPad']);
    });

    test('the choice is in the address, which can be sent, and the other keys of the address stay', async ({
      page,
    }) => {
      await open(page, '/projects?foo=1#all');
      await en.chooseSort(page, 'latest');
      const menu = await en.openFilters(page);
      await menu
        .getByRole('group', { name: 'Platform' })
        .getByRole('button', { name: /^Mobile/ })
        .click();
      await expect
        .poll(() => new URL(page.url()).searchParams.get('sort'))
        .toBe('latest');
      const url = new URL(page.url());
      expect(url.searchParams.get('platform')).toBe('mobile');
      expect(url.searchParams.get('foo')).toBe('1');
      expect(url.hash).toBe('#all');

      // another visitor opens the link: the page is already sorted and filtered
      const other = await page.context().newPage();
      await mockFirestore(other);
      await useSkin(other, target.skin);
      await open(other, url.toString());
      await expect(other.getByText('4 of 10 projects')).toBeVisible();
      await en.expectSort(other, 'latest');
      const otherMenu = await en.openFilters(other);
      await expect(
        otherMenu
          .getByRole('group', { name: 'Platform' })
          .getByRole('button', { name: /^Mobile/ }),
      ).toHaveAttribute('aria-pressed', 'true');
      await other.close();

      // back to the defaults: the address is clean again
      await en.chooseSort(page, first);
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await expect.poll(() => new URL(page.url()).search).toBe('?foo=1');
    });

    test('the last choice is kept in the browser and comes back on the next visit', async ({
      page,
    }) => {
      await open(page, '/projects');
      await en.chooseSort(page, 'name');
      const menu = await en.openFilters(page);
      await menu
        .getByRole('group', { name: 'Status' })
        .getByRole('button', { name: /^Ongoing/ })
        .click();
      await open(page, '/projects');
      await en.expectSort(page, 'name');
      const again = await en.openFilters(page);
      await expect(
        again
          .getByRole('group', { name: 'Status' })
          .getByRole('button', { name: /^Ongoing/ }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('Vietnamese', async ({ page }) => {
      const vi = projectsControls('vi');
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
      await open(page, '/projects');
      await expect(page.getByText('10 / 10 dự án')).toBeVisible();
      await expect(vi.sortButton(page)).toBeVisible();
      const menu = await vi.openFilters(page);
      await menu
        .getByRole('group', { name: 'Nền tảng' })
        .getByRole('button', { name: /^Di động/ })
        .click();
      await expect(page.getByText('4 / 10 dự án')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Xóa bộ lọc' }),
      ).toBeVisible();
    });
  });

  test.describe('the owner decides in site/live, projects', () => {
    test('a default is the start for a visitor who has not chosen, and the visitor can still change it', async ({
      page,
    }) => {
      await useSkin(page, target.skin);
      await mockFirestore(page, {
        'site/live': {
          projects: {
            sort: { default: 'name' },
            filters: { platform: { default: ['mobile'] } },
          },
        },
      });
      await open(page, '/projects');
      await expect(page.getByText('4 of 10 projects')).toBeVisible();
      await en.expectSort(page, 'name');
      // the defaults are not in the address
      expect(new URL(page.url()).search).toBe('');
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await expect(page.getByText('10 of 10 projects')).toBeVisible();
    });

    test('a force fixes the order and the filter and takes their controls away, whatever the address or the browser says', async ({
      page,
    }) => {
      await useSkin(page, target.skin);
      await page.addInitScript(() =>
        localStorage.setItem(
          'bach-cv-projects',
          JSON.stringify({ sort: 'name', platform: ['web'] }),
        ),
      );
      await mockFirestore(page, {
        'site/live': {
          projects: {
            sort: { force: 'latest' },
            filters: { platform: { force: ['mobile'] } },
          },
        },
      });
      await open(page, '/projects?sort=oldest&platform=ai');
      await expect(page.getByText('4 of 10 projects')).toBeVisible();
      await expect(en.sortButton(page)).toHaveCount(0);
      const menu = await en.openFilters(page);
      await expect(menu.getByRole('group', { name: 'Platform' })).toHaveCount(
        0,
      );
      // the other filters are still there (mobile and ongoing: none of the four is), and "Clear filters" does not touch what is forced
      await menu
        .getByRole('group', { name: 'Status' })
        .getByRole('button', { name: /^Ongoing/ })
        .click();
      await expect(page.getByText('0 of 10 projects')).toBeVisible();
      // with nothing left the note that says so has the way back too: take the first of the two
      await page.getByRole('button', { name: 'Clear filters' }).first().click();
      await expect(page.getByText('4 of 10 projects')).toBeVisible();
    });

    test('off leaves a choice out, and enabled: false takes a whole filter away', async ({
      page,
    }) => {
      await useSkin(page, target.skin);
      await mockFirestore(page, {
        'site/live': {
          projects: {
            sort: { off: ['name', 'technologies'] },
            filters: {
              platform: { off: ['ai'] },
              status: { enabled: false },
              search: { enabled: false },
            },
          },
        },
      });
      await open(page, '/projects');
      const sort = await en.openSort(page);
      await expect(sort.getByRole('radio')).toHaveText([
        'My order',
        'Newest first',
        'Oldest first',
        'Featured first',
      ]);
      await page.keyboard.press('Escape');
      const menu = await en.openFilters(page);
      await expect(
        menu
          .getByRole('group', { name: 'Platform' })
          .getByRole('button', { name: /^AI/ }),
      ).toHaveCount(0);
      await expect(menu.getByRole('group', { name: 'Status' })).toHaveCount(0);
      await expect(toolbar(page).getByRole('searchbox')).toHaveCount(0);
    });
  });
}
