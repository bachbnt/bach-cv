/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { interceptCollection, mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { projectsControls } from '../support/projects-controls';
import { gotoSkin, useSkin } from '../support/skin';

// The Projects app of the Phone skin: the list and the open project side by side on a tablet, a screen of its own on a phone, the filters and the
// order in a popover (tablet) or a bottom sheet (phone). What the order and the filters do is `projects-view-suite.ts` (see `phone-projects-view.spec.ts`).

// a window of 1100x600 or more holds the foldable device, open by default (its inner screen is the tablet layout); under that the screen is the
// window, and from 900 px it is a tablet that fills it
const DEVICE = { width: 1280, height: 860 };
const TABLET_WINDOW = { width: 1024, height: 768 };
const PHONE = { width: 390, height: 844 };
const FOLD_KEY = 'bach-cv-phone-fold';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

const list = (page: Page) => page.getByRole('list', { name: 'All projects' });
const detail = (page: Page) =>
  page.getByRole('region', { name: 'Project details' });
const row = (page: Page, name: string) =>
  list(page).getByRole('button', { name, exact: true });
/** the screen of the device (the container of the layout): what sheets and popovers must stay inside */
const screen = (page: Page) => page.locator('[data-ph-screen]');

/** the box of `locator` and the box of the screen, for a test that says one is inside the other */
async function inside(page: Page, locator: Locator) {
  const [box, frame] = await Promise.all([
    locator.boundingBox(),
    screen(page).boundingBox(),
  ]);
  if (!box || !frame) throw new Error('nothing to measure');
  const slack = 1;
  return (
    box.x >= frame.x - slack &&
    box.y >= frame.y - slack &&
    box.x + box.width <= frame.x + frame.width + slack &&
    box.y + box.height <= frame.y + frame.height + slack
  );
}

test.describe('on the open device', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DEVICE);
  });

  test('shows the list and the open project side by side, and a tap on a row changes the project', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    // the featured projects come first, and the first one is open
    await expect(row(page, 'VenusAI')).toHaveAttribute('aria-current', 'true');
    await expect(
      detail(page).getByRole('heading', { level: 2, name: 'VenusAI' }),
    ).toBeVisible();
    await expect(detail(page).getByText('Featured')).toBeVisible();
    await expect(
      detail(page).getByRole('link', { name: /App Store/ }),
    ).toHaveAttribute('href', /apps\.apple\.com/);
    await expect(
      detail(page)
        .getByRole('list', { name: 'Technologies' })
        .getByText('Flutter'),
    ).toBeVisible();
    // no "back to the list" where the list is already there
    await expect(
      page.getByRole('button', { name: 'Back to the list' }),
    ).toHaveCount(0);

    await row(page, 'DevPad').click();
    await expect(row(page, 'DevPad')).toHaveAttribute('aria-current', 'true');
    await expect(row(page, 'VenusAI')).not.toHaveAttribute('aria-current');
    await expect(
      detail(page).getByRole('heading', { level: 2, name: 'DevPad' }),
    ).toBeVisible();
  });

  test('the open project is the first one left when the filters take it away', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const controls = projectsControls('en');
    await controls.openFilters(page);
    await controls
      .filtersMenu(page)
      .getByRole('group', { name: 'Platform' })
      .getByRole('button', { name: /^Desktop/ })
      .click();
    await expect(page.getByText('2 of 10 projects')).toBeVisible();
    await expect(detail(page).getByRole('heading', { level: 2 })).toHaveText(
      /DevPad|DevCmd/,
    );
  });

  test('the popover of the filters closes with Escape, gives focus back, and does not cover the open project', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const controls = projectsControls('en');
    await controls.filtersButton(page).click();
    const menu = controls.filtersMenu(page);
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    const pane = await detail(page).boundingBox();
    expect(box && pane && box.x + box.width <= pane.x).toBe(true);
    // the count and the way back stay in view above the buttons while the popover is open
    await expect(page.getByText('10 of 10 projects')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(controls.filtersButton(page)).toBeFocused();

    await controls.sortButton(page).click();
    await expect(controls.sortMenu(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(controls.sortMenu(page)).toHaveCount(0);
    await expect(controls.sortButton(page)).toBeFocused();
  });

  test('a filter shows as a chip under the buttons that takes it away', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects?platform=mobile&tech=flutter');
    const chips = page.getByRole('group', { name: 'Active filters' });
    await expect(chips.getByRole('button')).toHaveCount(2);
    await expect(
      projectsControls('en').filtersButton(page),
    ).toHaveAccessibleName('Filters, 2');
    await chips.getByRole('button', { name: 'Remove filter Mobile' }).click();
    await expect(chips.getByRole('button')).toHaveCount(1);
    await expect(page.getByText('3 of 10 projects')).toBeVisible();
    await chips.getByRole('button', { name: /Flutter/ }).click();
    await expect(chips).toHaveCount(0);
    await expect(page.getByText('10 of 10 projects')).toBeVisible();
  });

  test('the screenshots open in the viewer at the picture that was tapped, and Escape closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const second = detail(page).getByRole('button', {
      name: 'VenusAI screenshot 2',
    });
    await second.scrollIntoViewIfNeeded();
    await second.click();
    const viewer = page.getByRole('dialog');
    await expect(viewer).toBeVisible();
    await expect(
      viewer.getByText('Freelance · screenshot 2 of 7'),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewer).toHaveCount(0);

    await detail(page).getByRole('button', { name: '7 screenshots' }).click();
    await expect(
      page.getByRole('dialog').getByText('Freelance · screenshot 1 of 7'),
    ).toBeVisible();
  });
});

test.describe('on the open device (the hinge and the screen)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DEVICE);
  });

  for (const [size, lang] of [
    [{ width: 1440, height: 900 }, 'en'],
    [{ width: 1280, height: 720 }, 'en'],
    [{ width: 1440, height: 900 }, 'vi'],
  ] as const)
    test(`the list and the open project are two panes with the crease in the gap and the same margins at both ends (${size.width}x${size.height}, ${lang})`, async ({
      page,
    }) => {
      await page.addInitScript(
        (code) => localStorage.setItem('bach-cv-lang', code),
        lang,
      );
      await page.setViewportSize(size);
      await gotoSkin(page, '/projects');
      await expect(page.locator('[data-ph-screen][data-hinge]')).toHaveCount(1);
      const card = page.locator('aside');
      await expect(card).toBeVisible();
      const frame = await screen(page).boundingBox();
      // a device in a small window is scaled: the margins of 2rem are scaled with it
      const scale = await screen(page).evaluate(
        (element) =>
          element.getBoundingClientRect().width / element.clientWidth,
      );
      const rail = await page.getByRole('navigation').first().boundingBox();
      const left = await page
        .getByRole('list', {
          name: lang === 'vi' ? 'Tất cả dự án' : 'All projects',
        })
        .boundingBox();
      const right = await card.boundingBox();
      if (!frame || !rail || !left || !right)
        throw new Error('nothing to measure');
      const margin = 32 * scale;
      const crease = frame.x + frame.width / 2;
      expect(left.x + left.width).toBeLessThan(crease);
      expect(right.x).toBeGreaterThan(crease);
      // the margins: the list starts 2rem after the rail, the project ends 2rem before the edge of the screen
      expect(Math.abs(left.x - (rail.x + rail.width) - margin)).toBeLessThan(3);
      expect(
        Math.abs(frame.x + frame.width - (right.x + right.width) - margin),
      ).toBeLessThan(3);
    });

  test('the open project is a card that ends above the home bar, wherever the page is scrolled to', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const card = page.locator('aside');
    await expect(card).toBeVisible();
    const home = page.getByRole('link', { name: 'Go to the home screen' });
    for (const top of [0, 500, 1200]) {
      await list(page).evaluate((element, to) => {
        for (
          let parent = element.parentElement;
          parent && parent !== document.body;
          parent = parent.parentElement
        ) {
          const { overflowY } = getComputedStyle(parent);
          if (overflowY === 'auto' || overflowY === 'scroll') {
            parent.scrollTo(0, to);
            return;
          }
        }
      }, top);
      // once the page has scrolled the card is docked under the bars: its foot is clear of the home bar
      if (top > 0) {
        await expect
          .poll(async () => {
            const box = await card.boundingBox();
            const pill = await home.boundingBox();
            return box && pill ? pill.y - (box.y + box.height) : -1;
          })
          .toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('the popovers of the filters and of the order open inside the screen, not over the window', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const controls = projectsControls('en');
    await controls.filtersButton(page).click();
    await expect(controls.filtersMenu(page)).toBeVisible();
    await expect
      .poll(() => inside(page, controls.filtersMenu(page)))
      .toBe(true);
    await page.keyboard.press('Escape');
    await controls.sortButton(page).click();
    await expect(controls.sortMenu(page)).toBeVisible();
    await expect.poll(() => inside(page, controls.sortMenu(page))).toBe(true);
  });
});

test.describe('on the folded device (the cover screen)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(key, 'folded');
    }, FOLD_KEY);
    await page.setViewportSize(DEVICE);
  });

  test('is the phone layout: a list, then a screen of its own, and the sheets stay inside the cover screen', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(list(page)).toBeVisible();
    await expect(detail(page)).toHaveCount(0);
    const controls = projectsControls('en');
    await controls.filtersButton(page).click();
    await expect(controls.filtersMenu(page)).toBeVisible();
    await expect
      .poll(() => inside(page, controls.filtersMenu(page)))
      .toBe(true);
    await page.keyboard.press('Escape');
    await controls.sortButton(page).click();
    await expect(controls.sortMenu(page)).toBeVisible();
    await expect.poll(() => inside(page, controls.sortMenu(page))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(controls.sortMenu(page)).toHaveCount(0);

    await row(page, 'VenusAI').click();
    await expect(detail(page)).toBeVisible();
  });

  test('Back to the list comes back to where the screen was scrolled, in the scroller of the screen', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const target = row(page, 'JP Marugoto');
    await target.scrollIntoViewIfNeeded();
    // the scroller is whatever scrolls the list: the screen of the device, not the window
    const top = () =>
      target.evaluate((element) => {
        for (
          let parent = element.parentElement;
          parent && parent !== document.body;
          parent = parent.parentElement
        ) {
          const { overflowY } = getComputedStyle(parent);
          if (overflowY === 'auto' || overflowY === 'scroll')
            return parent.scrollTop;
        }
        return document.scrollingElement?.scrollTop ?? 0;
      });
    const before = await top();
    expect(before).toBeGreaterThan(300);
    await target.click();
    await expect(detail(page)).toBeFocused();
    await page.getByRole('button', { name: 'Back to the list' }).click();
    await expect(list(page)).toBeVisible();
    expect(Math.abs((await top()) - before)).toBeLessThan(4);
    await expect(target).toBeFocused();
  });
});

test.describe('on a tablet window', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET_WINDOW);
  });

  test('is a tablet that fills the window: the list and the open project side by side, the popover inside the window', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(
      detail(page).getByRole('heading', { level: 2, name: 'VenusAI' }),
    ).toBeVisible();
    const controls = projectsControls('en');
    await controls.filtersButton(page).click();
    const box = await controls.filtersMenu(page).boundingBox();
    const pane = await detail(page).boundingBox();
    expect(box && pane && box.x + box.width <= pane.x).toBe(true);
    expect(box && box.x >= 0 && box.y >= 0).toBe(true);
    expect(box && box.y + box.height <= TABLET_WINDOW.height).toBe(true);
  });
});

test.describe('on a phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PHONE);
  });

  test('a tap on a row opens the project as a screen of its own, and Back to the list comes back where the list was', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(detail(page)).toHaveCount(0);
    const target = row(page, 'JP Marugoto');
    await target.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(300);
    await target.click();
    await expect(
      detail(page).getByRole('heading', { level: 2, name: 'JP Marugoto' }),
    ).toBeVisible();
    await expect(list(page)).toHaveCount(0);
    await expect(detail(page)).toBeFocused();

    await page.getByRole('button', { name: 'Back to the list' }).click();
    await expect(list(page)).toBeVisible();
    expect(
      Math.abs((await page.evaluate(() => window.scrollY)) - before),
    ).toBeLessThan(4);
    await expect(target).toBeFocused();
  });

  test('the filters are a bottom sheet with the count on its button, and Escape closes it and gives focus back', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const controls = projectsControls('en');
    await controls.filtersButton(page).click();
    const sheet = controls.filtersMenu(page);
    await expect(sheet).toBeVisible();
    await sheet
      .getByRole('group', { name: 'Platform' })
      .getByRole('button', { name: /^Mobile/ })
      .click();
    await sheet
      .getByRole('group', { name: 'Status' })
      .getByRole('button', { name: /^Finished/ })
      .click();
    const show = sheet.getByRole('button', { name: 'Show 4 projects' });
    await expect(show).toBeVisible();
    await show.click();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByText('4 of 10 projects')).toBeVisible();
    await expect(controls.filtersButton(page)).toHaveAccessibleName(
      'Filters, 2',
    );
    await expect
      .poll(() => new URL(page.url()).search)
      .toContain('platform=mobile');

    await controls.filtersButton(page).click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(controls.filtersButton(page)).toBeFocused();
  });

  test('the order is a sheet of six radios; one tap picks it and closes the sheet, and the button says which is in use', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const controls = projectsControls('en');
    await controls.openSort(page);
    await expect(controls.sortMenu(page).getByRole('radio')).toHaveText(
      Object.values(controls.words.orders),
    );
    await page.keyboard.press('Escape');
    await controls.chooseSort(page, 'name');
    await controls.expectSort(page, 'name');
    await expect(row(page, 'bachbntdev')).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get('sort'))
      .toBe('name');
  });

  test('the search field is a real one: a Search key, a clear button only while there is text, and focus stays in the field', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const field = page.getByRole('searchbox', { name: 'Search projects' });
    await expect(field).toHaveAttribute('enterkeyhint', 'search');
    const clear = page.getByRole('button', { name: 'Clear search' });
    await expect(clear).toHaveCount(0);
    await field.fill('flutter');
    await expect(page.getByText('3 of 10 projects')).toBeVisible();
    await expect(clear).toBeVisible();
    const box = await clear.boundingBox();
    expect(box && box.width >= 40 && box.height >= 40).toBe(true);
    await clear.click();
    await expect(field).toHaveValue('');
    await expect(field).toBeFocused();
    await expect(clear).toHaveCount(0);
    await expect(page.getByText('10 of 10 projects')).toBeVisible();
  });

  test('the search field, Filters and Sort are one row, and the order in use is written under it', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const controls = projectsControls('en');
    const field = await page
      .getByRole('searchbox', { name: 'Search projects' })
      .boundingBox();
    const filters = await controls.filtersButton(page).boundingBox();
    const sort = await controls.sortButton(page).boundingBox();
    if (!field || !filters || !sort) throw new Error('nothing to measure');
    // the same row, round and at least 44 px
    expect(
      Math.abs(field.y + field.height / 2 - (filters.y + filters.height / 2)),
    ).toBeLessThan(2);
    expect(Math.abs(filters.y - sort.y)).toBeLessThan(2);
    expect(filters.width).toBeGreaterThanOrEqual(44);
    expect(sort.width).toBeGreaterThanOrEqual(44);
    expect(filters.x).toBeGreaterThan(field.x + field.width);
    // the order in use is readable beside the count, and follows the choice
    const counts = page.locator('p[aria-live="polite"]');
    await expect(counts).toContainText('10 of 10 projects');
    await expect(counts).toContainText('Featured first');
    await controls.chooseSort(page, 'name');
    await expect(counts).toContainText('Name A to Z');
  });

  test('nothing matching shows the Standard sentence and a way back', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('zzzz');
    await expect(
      page.getByText('No project matches these filters.'),
    ).toBeVisible();
    await page
      .getByRole('status')
      .getByRole('button', { name: 'Clear filters' })
      .click();
    await expect(page.getByText('10 of 10 projects')).toBeVisible();
  });

  for (const width of [320, 375])
    test(`has no horizontal scroll at ${width} px, in the list and in a project`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await gotoSkin(page, '/projects');
      const fits = () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        );
      expect(await fits()).toBe(true);
      await row(page, 'bachbntdev').click();
      await expect(detail(page)).toBeVisible();
      expect(await fits()).toBe(true);
    });

  test('Vietnamese: the words of the list, the sheet and the project', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    const controls = projectsControls('vi');
    await expect(page.getByText('10 / 10 dự án')).toBeVisible();
    await controls.filtersButton(page).click();
    await controls
      .filtersMenu(page)
      .getByRole('group', { name: 'Nền tảng' })
      .getByRole('button', { name: /^Di động/ })
      .click();
    await expect(
      page.getByRole('button', { name: 'Xem 4 dự án' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Xem 4 dự án' }).click();
    await expect(
      page.getByRole('button', { name: 'Bỏ bộ lọc Di động' }),
    ).toBeVisible();
    await page
      .getByRole('list', { name: 'Tất cả dự án' })
      .getByRole('button')
      .first()
      .click();
    await expect(
      page.getByRole('button', { name: 'Về danh sách' }),
    ).toBeVisible();
    await expect(page.getByText('Thời gian')).toBeVisible();
  });
});

// The skeleton is drawn on the grid of the loaded page, so what the visitor looks at does not move when the data arrives.
test.describe('the loading skeleton', () => {
  type Box = { x: number; y: number; width: number; height: number };
  type Shapes = { search: Box; list: Box; row: Box; pane: Box | null };

  const box = async (locator: Locator): Promise<Box> => {
    const found = await locator.boundingBox();
    if (!found) throw new Error('nothing to measure');
    return found;
  };

  const shapes = async (page: Page, wide: boolean, loaded: boolean) => {
    const root = loaded ? page : page.locator('[aria-busy="true"]');
    const rows = loaded
      ? list(page).getByRole('listitem')
      : root.locator('ol > li');
    const result: Shapes = {
      search: await box(
        loaded
          ? page.getByRole('searchbox', { name: 'Search projects' })
          : root.locator('.h-12').first(),
      ),
      list: await box(loaded ? list(page) : root.locator('ol')),
      row: await box(rows.first()),
      pane: wide
        ? await box(
            loaded
              ? page.locator('aside')
              : page.locator('[data-skeleton="detail"]'),
          )
        : null,
    };
    return result;
  };

  const close = (
    a: Box,
    b: Box,
    name: string,
    keys: (keyof Box)[] = ['x', 'y', 'width', 'height'],
  ) => {
    for (const key of keys)
      expect(
        Math.abs(a[key] - b[key]),
        `${name}.${key}: ${a[key]} against ${b[key]}`,
      ).toBeLessThanOrEqual(4);
  };

  const cases = [
    { name: 'the open device', size: DEVICE, fold: 'open', wide: true },
    { name: 'the folded device', size: DEVICE, fold: 'folded', wide: false },
    { name: 'a phone (390 px)', size: PHONE, fold: 'open', wide: false },
  ] as const;

  for (const { name, size, fold, wide } of cases)
    test(`has the shapes of the loaded page in ${name}`, async ({ page }) => {
      await page.addInitScript((value) => {
        window.localStorage.setItem('bach-cv-phone-fold', value);
      }, fold);
      await page.setViewportSize(size);
      await interceptCollection(page, 'projects', { delay: 4000 });
      await page.goto('/projects');
      await page
        .locator('html[data-skin-ready]')
        .waitFor({ state: 'attached' });
      await expect(
        page.locator('[aria-busy="true"] ol > li').first(),
      ).toBeVisible();
      const skeleton = await shapes(page, wide, false);

      await expect(list(page)).toBeVisible({ timeout: 20_000 });
      // the reveal of the page fades the content in: measure once it has settled
      await page.waitForTimeout(500);
      const loaded = await shapes(page, wide, true);

      close(skeleton.search, loaded.search, 'search');
      // the list is as long as its rows (six against ten): only where it starts and how wide it is
      close(skeleton.list, loaded.list, 'list', ['x', 'y', 'width']);
      close(skeleton.row, loaded.row, 'first row');
      if (skeleton.pane && loaded.pane)
        close(skeleton.pane, loaded.pane, 'pane', ['x', 'y', 'width']);
    });
});
