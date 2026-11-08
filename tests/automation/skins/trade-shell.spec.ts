/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

/** The first visit to a page compiles it in the dev server, which is slow when the machine is busy. */
const SLOW = { timeout: 30_000 };

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const main = (page: Page) => page.getByRole('navigation', { name: 'Main' });
const watchlist = (page: Page) =>
  page.getByRole('complementary', { name: 'Watchlist' });

const PAGES = [
  {
    path: '/',
    heading: 'I lead mobile teams and build the AI tooling they ship with.',
  },
  { path: '/about', heading: 'About' },
  { path: '/resume', heading: 'Resume' },
  { path: '/projects', heading: 'Projects' },
  { path: '/certificates', heading: 'Certificates' },
  { path: '/services', heading: 'Services' },
  { path: '/payment', heading: 'Payment' },
] as const;

test.describe('the terminal', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} shows the terminal with its page`, async ({ page }) => {
      await gotoSkin(page, path);
      await expect(page.locator('html')).toHaveAttribute('data-skin', 'trade');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page.getByTestId('tv-chart')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });
  }

  test('the toolbar has the logo, the symbol button, Layout, full screen and the menus', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const bar = page.getByRole('banner');
    const home = bar.getByRole('link', { name: 'Bach Bui, home' });
    await expect(home).toBeVisible();
    const symbol = bar.getByRole('button', { name: 'Search the site' });
    await expect(symbol).toContainText('Bach Bui');
    await expect(symbol).toContainText('Software Engineer');
    for (const name of [
      'Choose what the terminal shows',
      'Enter full screen',
      /^Language/,
      'Theme',
      /^Skin/,
      'Download CV',
    ])
      await expect(bar.getByRole('button', { name })).toBeVisible();
    await home.click();
    await expect(page).toHaveURL(/\/$/, SLOW);
  });

  test('the toolbar changes the language and the theme, and leaves the skin', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: /^Language/ }).click();
    await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
    await expect(page.getByRole('button', { name: /^Ngôn ngữ/ })).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Chính' })
        .getByRole('link', { name: 'Trang chủ' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Mình dẫn dắt các nhóm mobile',
    );
    await expect(
      page.getByRole('button', { name: 'Chọn những gì terminal hiển thị' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Sáng' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Tối' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('button', { name: /^Skin/ }).click();
    await page.getByRole('menuitemradio', { name: /^Chuẩn/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', /.+/);
    await expect(
      page.getByRole('link', { name: 'Bach Bui, trang chủ' }),
    ).toBeVisible();
  });

  test('the palette follows the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await gotoSkin(page, '/');
    const bg = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await bg()).toBe('rgb(255, 255, 255)');
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();
    await expect.poll(bg).toBe('rgb(19, 23, 34)');
  });

  test('a page change fades the panel and leaves the terminal where it is', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const toolbar = page.getByRole('banner');
    const before = await toolbar.boundingBox();
    await main(page).getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/projects$/, SLOW);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
    expect(await toolbar.boundingBox()).toEqual(before);
  });
});

test.describe('the watchlist', () => {
  test('Pages is the navigation: a row for every page, the open one marked and flagged', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const nav = main(page);
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
    await nav.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/, SLOW);
    await expect(nav.getByRole('link', { name: 'Resume' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.locator('[aria-current] svg')).toHaveCount(1);
    await nav.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/$/, SLOW);
  });

  test('the row of the page that was just opened flashes once', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await main(page).getByRole('link', { name: 'About' }).click();
    const flash = main(page)
      .locator('[aria-current] > span[aria-hidden]')
      .first();
    await expect(flash).toHaveCSS('animation-name', 'tv-flash');
  });

  test('the arrow keys move down the rows and Enter opens one', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const nav = main(page);
    await nav.getByRole('link', { name: 'Home' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(nav.getByRole('link', { name: 'Projects' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(nav.getByRole('link', { name: 'Resume' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(nav.getByRole('link', { name: 'Projects' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(nav.getByRole('link', { name: 'Certificates' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/certificates$/, SLOW);
  });

  test('the rows show real counts once a page has read them', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const nav = main(page);
    await expect(nav.getByRole('link', { name: 'Resume' })).toContainText('4');
    await expect(nav.getByRole('link', { name: 'Home' })).toContainText('7');
    await expect(nav.getByRole('link', { name: 'Projects' })).toContainText(
      '9',
    );
    await expect(nav.getByRole('link', { name: 'Certificates' })).toContainText(
      '3',
    );
  });

  test('a page that is coming soon is marked and is not a link; a hidden page is absent and shows 404', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'soon', certificates: 'hidden' } },
    });
    await gotoSkin(page, '/');
    const nav = main(page);
    await expect(nav.getByRole('link')).toHaveCount(5);
    await expect(nav.getByText('Payment')).toBeVisible();
    await expect(nav.getByText('Soon')).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Payment' })).toHaveCount(0);
    await expect(nav.getByText('Certificates')).toHaveCount(0);
    await page.goto('/certificates');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
    await page.goto('/payment');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
  });

  test('Skills groups the listed skills with the years used and a legend of the roles', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const aside = watchlist(page);
    await aside.getByRole('tab', { name: 'Skills' }).click();
    const panel = aside.getByRole('tabpanel');
    // the names of the areas are the ones of the Resume skills (one change reaches every skin)
    for (const area of [
      'Mobile',
      'Frontend and backend',
      'AI and automation',
      'Tools and process',
    ])
      await expect(panel.getByRole('region', { name: area })).toBeVisible();
    // MoMo and FPT list Kotlin; Git is listed by no role, so it has no number
    const kotlin = panel.getByRole('button', { name: /Kotlin/ });
    await expect(kotlin).toContainText(/\d(\.\d)? y/);
    await expect(panel.getByRole('button', { name: /^Git/ })).not.toContainText(
      /\d/,
    );
    await kotlin.hover();
    const legend = panel.getByRole('status');
    await expect(legend).toContainText(/Kotlin: \d(\.\d)? y in 2 roles/);
    await expect(legend).toContainText('Team Lead, FPT');
    await expect(legend).toContainText('Senior Mobile App Developer, MoMo');
    // the pointer must not stay over a row the list scrolls under it
    await page.mouse.move(0, 0);
    await panel.getByRole('button', { name: /^Git/ }).focus();
    await expect(legend).toContainText('No role lists it yet.');
  });

  test('the sparkline of a technology counts its roles in each year', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const aside = watchlist(page);
    await aside.getByRole('tab', { name: 'Skills' }).click();
    const kotlinSpark = aside
      .getByRole('tabpanel')
      .getByRole('button', { name: /Kotlin/ })
      .locator('svg');
    await expect(kotlinSpark).toBeVisible();
    await expect(kotlinSpark).toHaveAttribute('aria-hidden', 'true');
    await expect(kotlinSpark.locator('path')).toHaveCount(2);
  });

  test('Roles is a timeline of the jobs and a press opens that job on Resume', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const aside = watchlist(page);
    await aside.getByRole('tab', { name: 'Roles' }).click();
    const panel = aside.getByRole('tabpanel');
    await expect(panel.getByRole('button')).toHaveCount(4);
    await expect(panel.getByText('Current')).toBeVisible();
    await panel.getByRole('button', { name: /MoMo/ }).click();
    await expect(page).toHaveURL(/\/resume$/, SLOW);
    await expect(page.locator('[data-job="momo"]')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('the tabs work with the arrow keys', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('tab', { name: 'Pages' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('tab', { name: 'Skills', selected: true }),
    ).toBeFocused();
  });

  test('the Details widget has the facts and the rights line of Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const details = page.getByRole('region', { name: 'Details' });
    await expect(details.getByText('years in software')).toBeVisible();
    await expect(details.getByText('Team Lead')).toBeVisible();
    await expect(details.getByText('FPT Software')).toBeVisible();
    await expect(details.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await expect(details.getByText(/All rights reserved\./)).toBeVisible();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    const aside = page.getByRole('complementary', {
      name: 'Danh sách theo dõi',
    });
    await expect(aside.getByRole('tab', { name: 'Kỹ năng' })).toBeVisible();
    await expect(aside.getByRole('tab', { name: 'Vai trò' })).toBeVisible();
    await aside.getByRole('tab', { name: 'Kỹ năng' }).click();
    await expect(aside.getByRole('region', { name: 'Công cụ' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Chi tiết' })).toBeVisible();
  });
});

test.describe('the ticker tape', () => {
  const tape = (page: Page) =>
    page.getByRole('region', { name: /^Ticker tape/ });

  test('shows the pages with their counts and the skills with the years used', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const strip = tape(page);
    await expect(
      strip.getByRole('link', { name: /^Projects 9$/ }),
    ).toBeVisible();
    await expect(strip.getByRole('link', { name: /^Resume 4$/ })).toBeVisible();
    const kotlin = strip.getByText('Kotlin').first();
    await expect(kotlin).toBeVisible();
    await expect(
      strip.getByTitle(/^Years used: \d(\.\d)? y$/).first(),
    ).toBeVisible();
    // a moving link cannot be pressed steadily: stop the tape first, as a visitor would
    await strip
      .getByRole('button', { name: 'Pause the moving list of technologies' })
      .click();
    await strip
      .getByRole('link', { name: /^Resume/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/resume$/, SLOW);
  });

  test('moves slowly, and the button stops it and starts it again', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const strip = tape(page);
    const belt = strip.locator('[data-paused], .flex.w-max').first();
    await expect(belt).toHaveCSS('animation-name', 'tv-tape');
    await expect(belt).toHaveCSS('animation-play-state', 'running');
    const pause = strip.getByRole('button', {
      name: 'Pause the moving list of technologies',
    });
    await pause.press('Enter');
    await expect(
      strip.getByRole('button', {
        name: 'Play the moving list of technologies',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(belt).toHaveCSS('animation-play-state', 'paused');
    await strip
      .getByRole('button', { name: 'Play the moving list of technologies' })
      .click();
    await page.mouse.move(700, 600);
    await expect(belt).toHaveCSS('animation-play-state', 'running');
  });

  test('stops while the pointer or the keyboard is on it', async ({ page }) => {
    await gotoSkin(page, '/');
    const strip = tape(page);
    const belt = strip.locator('.w-max').first();
    await strip.hover();
    await expect(belt).toHaveCSS('animation-play-state', 'paused');
    await page.mouse.move(700, 600);
    await expect(belt).toHaveCSS('animation-play-state', 'running');
    await strip.getByRole('link').first().focus();
    await expect(belt).toHaveCSS('animation-play-state', 'paused');
  });

  test('the second copy of the list is hidden from assistive technology and cannot be focused', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const copies = tape(page).locator('ul');
    await expect(copies).toHaveCount(2);
    await expect(copies.nth(1)).toHaveAttribute('aria-hidden', 'true');
    await expect(copies.nth(1)).toHaveAttribute('inert', '');
  });

  test('is a static row that wraps for reduced motion, with no stop button', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    const strip = tape(page);
    await expect(strip.getByText('Kotlin').first()).toBeVisible();
    await expect(strip.getByRole('button')).toBeHidden();
    await expect(
      strip.locator('.w-max, .motion-reduce\\:w-auto').first(),
    ).toHaveCSS('animation-name', 'none');
    await expect(strip.locator('ul').nth(1)).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe('the symbol search', () => {
  const dialog = (page: Page) => page.getByRole('dialog', { name: 'Search' });
  const box = (page: Page) =>
    page.getByRole('combobox', { name: 'Search the whole site' });

  test('opens from the symbol button, Ctrl+K and /, and Esc closes it and gives the focus back', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const symbol = page.getByRole('button', { name: 'Search the site' });
    await symbol.click();
    await expect(dialog(page)).toBeVisible();
    await expect(box(page)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(symbol).toBeFocused();

    await page.keyboard.press('Control+k');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();

    await page.locator('body').click({ position: { x: 5, y: 300 } });
    await page.keyboard.press('/');
    await expect(dialog(page)).toBeVisible();
    // a slash typed into the search is text, not another opening
    await page.keyboard.type('a/b');
    await expect(box(page)).toHaveValue('a/b');
  });

  test('a slash typed into a field of the page does not open it', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const field = page.getByRole('textbox').first();
    await field.click();
    await page.keyboard.type('a/b');
    await expect(dialog(page)).toBeHidden();
  });

  test('with nothing typed it lists the pages, grouped, with a badge for the kind', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    const list = page.getByRole('listbox', { name: 'Search results' });
    await expect(list.getByRole('group', { name: 'Pages' })).toBeVisible();
    await expect(list.getByRole('option')).toHaveCount(7);
    await expect(list.getByRole('option').first()).toContainText('Page');
  });

  test('searches pages, projects, roles, skills, certificates, services and education and groups them', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await box(page).fill('mobile');
    const list = page.getByRole('listbox', { name: 'Search results' });
    await expect(list.getByRole('group', { name: 'Roles' })).toBeVisible();
    await expect(list.getByRole('group', { name: 'Skills' })).toBeVisible();
    await expect(
      list.getByRole('option', { name: /Senior Mobile App Developer, MoMo/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('status').filter({ hasText: 'results' }),
    ).toBeVisible();

    await box(page).fill('claude certified');
    await expect(
      list.getByRole('group', { name: 'Certificates' }).getByRole('option'),
    ).toHaveCount(1);
    await box(page).fill('app development');
    await expect(list.getByRole('group', { name: 'Services' })).toBeVisible();
    await box(page).fill('bachelor');
    await expect(list.getByRole('group', { name: 'Education' })).toBeVisible();
  });

  test('the arrow keys move through the results, wrapping at the ends', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await box(page).fill('mobile');
    const options = page.getByRole('option');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await expect(box(page)).toHaveAttribute('aria-activedescendant', /.+/);
    await page.keyboard.press('ArrowDown');
    await expect(options.first()).toHaveAttribute('aria-selected', 'false');
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowUp');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowUp');
    await expect(options.last()).toHaveAttribute('aria-selected', 'true');
  });

  test('Enter opens the chosen result: a project goes to Projects', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await box(page).fill('venus');
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(/\/projects$/, SLOW);
  });

  test('a role opens that job on the Resume page', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await box(page).fill('devblock');
    await page.getByRole('option', { name: /Junior Mobile Developer/ }).click();
    await expect(page).toHaveURL(/\/resume$/, SLOW);
    await expect(page.locator('[data-job="devblock-vietnam"]')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('a certificate goes to Certificates and a page goes to its route', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await box(page).fill('google project');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/certificates$/, SLOW);
    await page.keyboard.press('Control+k');
    await box(page).fill('payment');
    await page.getByRole('option', { name: /^Payment/ }).click();
    await expect(page).toHaveURL(/\/payment$/, SLOW);
  });

  test('says when nothing matches, and finds Vietnamese without the accents', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await box(page).fill('zzzz');
    await expect(
      page.getByRole('status').filter({ hasText: 'Nothing found for "zzzz"' }),
    ).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(0);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: /^Language/ }).click();
    await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
    await page.keyboard.press('Control+k');
    await expect(
      page.getByRole('combobox', { name: 'Tìm trong toàn bộ trang' }),
    ).toBeFocused();
    await page.getByRole('combobox').fill('ho so');
    await expect(page.getByRole('option', { name: /Hồ sơ/ })).toBeVisible();
  });

  test('remembers what was picked, for as long as the terminal is open', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('group', { name: 'Recent' })).toHaveCount(0);
    await box(page).fill('services');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/services$/, SLOW);
    await page.keyboard.press('Control+k');
    const recent = page.getByRole('group', { name: 'Recent' });
    await expect(recent.getByRole('option')).toHaveText([/Services/]);
    // the field starts empty every time
    await expect(box(page)).toHaveValue('');
    expect(
      await page.evaluate(() => JSON.stringify({ ...localStorage })),
    ).not.toContain('Services');
  });

  test('says when some of the content could not be loaded, and tries again', async ({
    page,
  }) => {
    let failing = true;
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      const request = route.request();
      if (
        failing &&
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"education"')
      )
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        });
      return route.fallback();
    });
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    await expect(
      page.getByText('Some of the content could not be loaded.'),
    ).toBeVisible();
    failing = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByText('Some of the content could not be loaded.'),
    ).toBeHidden();
  });
});

test.describe('the layout', () => {
  const LAYOUT = 'bach-cv-trade-layout';

  test('the Layout menu turns the watchlist and the page panel off and on, and the choice is kept', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const menu = page.getByRole('button', {
      name: 'Choose what the terminal shows',
    });
    await menu.click();
    await page.getByRole('menuitemcheckbox', { name: 'Watchlist' }).click();
    await page.keyboard.press('Escape');
    await expect(watchlist(page)).toHaveCount(0);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), LAYOUT),
    ).toContain('"watchlist":false');

    await page.reload();
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    await expect(watchlist(page)).toHaveCount(0);
    await menu.click();
    await expect(
      page.getByRole('menuitemcheckbox', { name: 'Watchlist' }),
    ).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('menuitemcheckbox', { name: 'Watchlist' }).click();
    await page.keyboard.press('Escape');
    await expect(watchlist(page)).toBeVisible();

    await menu.click();
    await page.getByRole('menuitemcheckbox', { name: 'Page panel' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
    await expect(page.getByText('The page panel is hidden.')).toBeVisible();
    await page.getByRole('button', { name: 'Show the page panel' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('opening a page while the panel is hidden brings the panel back', async ({
    page,
  }) => {
    await page.addInitScript(
      ([key]) =>
        localStorage.setItem(
          key,
          JSON.stringify({ watchlist: true, panel: false, tools: true }),
        ),
      [LAYOUT],
    );
    await gotoSkin(page, '/');
    await expect(page.getByText('The page panel is hidden.')).toBeVisible();
    await main(page).getByRole('link', { name: 'Projects' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
  });

  test('a damaged saved layout falls back to showing everything', async ({
    page,
  }) => {
    await page.addInitScript(
      ([key]) => localStorage.setItem(key, '{"watchlist":"maybe"'),
      [LAYOUT],
    );
    await gotoSkin(page, '/');
    await expect(watchlist(page)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('the tool rail can be turned off', async ({ page }) => {
    await gotoSkin(page, '/');
    const chart = page.getByTestId('tv-chart');
    const wide = (await chart.boundingBox())!.width;
    await page
      .getByRole('button', { name: 'Choose what the terminal shows' })
      .click();
    await page.getByRole('menuitemcheckbox', { name: 'Tool rail' }).click();
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await chart.boundingBox())!.width)
      .toBeGreaterThan(wide + 40);
  });

  test('full screen: the button is there, and is grey where the browser has none', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, 'fullscreenEnabled', { value: false });
    });
    await gotoSkin(page, '/');
    const button = page.getByRole('button', {
      name: 'Full screen is not available in this browser',
    });
    await expect(button).toBeDisabled();
  });
});

test.describe('windows', () => {
  test('Download CV opens the CV window of Standard and Esc closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Download CV' })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Connect lists the email and the links of Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Connect' }).click();
    const win = page.locator('[data-slot="popover-content"]').filter({
      hasText: "Let's connect",
    });
    await expect(
      win.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    for (const name of ['LinkedIn', 'GitHub', 'Telegram', 'Facebook'])
      await expect(
        win.getByRole('link', { name: new RegExp(name) }),
      ).toBeVisible();
    await expect(win.getByRole('link', { name: /GitLab|Skype/ })).toHaveCount(
      0,
    );
    await expect(win.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    // the group of a link is its tag, in one flat list
    await expect(
      win.getByText('Professional', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      win.getByText('Messaging', { exact: true }).first(),
    ).toBeVisible();
    await expect(win.getByRole('heading')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });

  test('the chat in the rail is the real BB Bot chat', async ({ page }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'I lead a team of ten.' },
    }));
    await gotoSkin(page, '/');
    const open = page.getByRole('button', { name: 'Open chat' });
    await open.click();
    const panel = page.getByRole('dialog', { name: /BB Bot/ });
    await expect(panel).toBeVisible();
    await panel.getByRole('textbox').fill('What do you do?');
    await panel.getByRole('button', { name: 'Send chat message' }).click();
    await expect(panel.getByText('I lead a team of ten.')).toBeVisible();
    expect(received).toHaveLength(1);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(open).toBeFocused();
    // the conversation stays while the page is open
    await open.click();
    await expect(panel.getByText('I lead a team of ten.')).toBeVisible();
  });

  test('the switches of site/live take the buttons away', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': {
        features: { chat: false, cvDownload: false, connectMenu: false },
      },
    });
    await gotoSkin(page, '/');
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Skin/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Search the site' }),
    ).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('has no side rails, the chart comes first and nothing scrolls sideways', async ({
    page,
  }) => {
    for (const path of [
      '/',
      '/projects',
      '/resume',
      '/about',
      '/services',
      '/payment',
      '/certificates',
    ]) {
      await gotoSkin(page, path);
      await expect(page.getByTestId('tv-chart')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForTimeout(400);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    const chart = (await page.getByTestId('tv-chart').boundingBox())!;
    const main = (await page.getByRole('main').boundingBox())!;
    expect(chart.y).toBeLessThan(main.y);
  });

  test('the page comes before the watchlist, which comes before the bar of the main pages', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const body = (await page.getByRole('main').boundingBox())!;
    const list = (await watchlist(page).boundingBox())!;
    expect(list.y).toBeGreaterThan(body.y);
    await expect(
      page.getByRole('button', { name: 'Choose what the terminal shows' }),
    ).toBeHidden();
  });

  test('the menus, the CV button and the bottom bar are within reach with touch-sized targets', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    for (const name of [/^Language/, 'Theme', /^Skin/, 'Download CV']) {
      await expect(page.getByRole('button', { name }).first()).toBeVisible();
    }
    const bar = page.getByRole('navigation', { name: 'Quick links' });
    await expect(bar.getByRole('link')).toHaveCount(4);
    await bar.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/projects$/, SLOW);
    await expect(bar.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('the search opens full-screen and a result opens its page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Search the site' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search' });
    await expect(dialog).toBeVisible();
    const size = (await dialog.boundingBox())!;
    expect(size.width).toBeGreaterThanOrEqual(388);
    expect(size.height).toBeGreaterThanOrEqual(798);
    await page.getByRole('combobox').fill('resume');
    await page.getByRole('option').first().click();
    await expect(page).toHaveURL(/\/resume$/, SLOW);
  });

  test('the Skin menu still leaves the skin', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: /^Skin/ }).click();
    await page.getByRole('menuitemradio', { name: /^Standard/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-skin',
      /.+/,
      SLOW,
    );
  });

  test('the chat and Connect are in the row under the watchlist', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await expect(page.getByRole('dialog', { name: /BB Bot/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Connect' }).click();
    await expect(page.getByText("Let's connect")).toBeVisible();
  });
});
