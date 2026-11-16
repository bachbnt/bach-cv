/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { mockImages } from './support/images';
import { gotoSkin, useSkin as chooseSkin } from './support/skin';
import type { SkinId } from '@/lib/skin/skins';

// The screens for an error. A page that throws gives its place to the screen of the skin that is on (inside the frame of the skin, and the
// same two ways out in each); one that cannot even be drawn (the root of the app throws) shows the last screen, plain markup with no skin.

/**
 * Makes the Projects page throw while it renders, and only it: the filters are sorted with `localeCompare`, and only the logic of that page
 * (`techOptions`, `sortProjects`) is on the stack of the call. The frame of a skin never sorts them, so it stays up.
 */
async function breakProjects(page: Page) {
  await page.addInitScript(() => {
    const original = String.prototype.localeCompare;
    String.prototype.localeCompare = function (...args) {
      if (/techOptions|sortProjects/.test(new Error().stack ?? ''))
        throw new Error('the page is broken on purpose');
      return Reflect.apply(original, this, args) as number;
    };
    // how many times the page has been loaded in this tab
    sessionStorage.setItem(
      'loads',
      String(Number(sessionStorage.getItem('loads') ?? 0) + 1),
    );
  });
}

const loads = (page: Page) =>
  page.evaluate(() => Number(sessionStorage.getItem('loads')));

const SKINS: {
  id: SkinId;
  title: string;
  retry: string;
  home: string;
  vi: { title: string; retry: string };
}[] = [
  {
    id: 'standard',
    title: 'This page broke',
    retry: 'Try again',
    home: 'Back to home',
    vi: { title: 'Trang này bị lỗi', retry: 'Thử lại' },
  },
  {
    id: 'dev',
    title: 'Render failed',
    retry: 'Retry',
    home: 'Home',
    vi: { title: 'Render thất bại', retry: 'Thử lại' },
  },
  {
    id: 'trade',
    title: 'This screen has no data',
    retry: 'Reconnect',
    home: 'Home',
    vi: { title: 'Màn hình này chưa có dữ liệu', retry: 'Kết nối lại' },
  },
  {
    id: 'academic',
    title: 'Page not finished',
    retry: 'Rewrite',
    home: 'First page',
    vi: { title: 'Trang chưa viết xong', retry: 'Viết lại' },
  },
  {
    id: 'travel',
    title: 'This trip did not take off',
    retry: 'Rebook',
    home: 'Terminal',
    vi: { title: 'Chuyến này chưa cất cánh', retry: 'Đặt lại' },
  },
];

async function open(page: Page, id: SkinId, path: string) {
  await chooseSkin(page, id);
  await mockFirestore(page);
  await mockImages(page);
  await breakProjects(page);
  if (id === 'standard') await page.goto(path);
  else await gotoSkin(page, path);
}

for (const skin of SKINS) {
  test.describe(`a page that throws, in the ${skin.id} skin`, () => {
    test('shows the screen of the skin, and leaving the page puts the site back', async ({
      page,
    }) => {
      await open(page, skin.id, '/projects');
      await expect(
        page.getByRole('heading', { name: skin.title }),
      ).toBeVisible();
      if (skin.id !== 'standard')
        await expect(page.locator('html')).toHaveAttribute(
          'data-skin',
          skin.id,
        );
      // the two ways out, and not the message of the error
      await expect(
        page.getByRole('button', { name: skin.retry, exact: true }),
      ).toBeVisible();
      // (the overlay of `next dev` says it, so look only at the screen itself)
      await expect(
        page.getByRole('heading', { name: skin.title }).locator('..'),
      ).not.toContainText('broken on purpose');

      // the first is the one on the screen (the watchlist of Trade has a Home row too, after it)
      await page
        .getByRole('link', { name: skin.home, exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole('heading', { name: skin.title })).toHaveCount(
        0,
      );
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('"try again" forgets what the browser kept and loads the page again', async ({
      page,
    }) => {
      await open(page, skin.id, '/projects');
      await page.evaluate(() =>
        localStorage.setItem('bach-cv-query', '{"kept":"by an old version"}'),
      );
      expect(await loads(page)).toBe(1);
      await page.getByRole('button', { name: skin.retry, exact: true }).click();
      await expect.poll(() => loads(page)).toBe(2);
      // the copy kept before was dropped on the way (the page writes a fresh one after it loads)
      await expect
        .poll(() =>
          page.evaluate(() =>
            (localStorage.getItem('bach-cv-query') ?? '').includes(
              'by an old version',
            ),
          ),
        )
        .toBe(false);
    });

    test('speaks Vietnamese, and fits a phone', async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
      await page.setViewportSize({ width: 375, height: 667 });
      await open(page, skin.id, '/projects');
      await expect(
        page.getByRole('heading', { name: skin.vi.title }),
      ).toBeVisible();
      const retry = page.getByRole('button', {
        name: skin.vi.retry,
        exact: true,
      });
      await expect(retry).toBeVisible();
      // the page does not scroll sideways
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    });
  });
}

test.describe('the last screen, when the root of the app throws', () => {
  /** A browser that does not allow its storage throws when the page only reads `window.localStorage`, which the root does at start. */
  async function breakRoot(page: Page) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      });
    });
    await mockFirestore(page);
    await mockImages(page);
  }

  test('is plain, in the language of the browser, with the same two ways out', async ({
    page,
  }) => {
    await breakRoot(page);
    await page.goto('/projects');
    await expect(
      page.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Try again', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to home' }),
    ).toHaveAttribute('href', '/');
    await expect(page.getByText('blocked')).toHaveCount(0);
  });

  test('follows the light or dark of the browser, and fits a phone', async ({
    page,
  }) => {
    await breakRoot(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/projects');
    const screen = page.getByRole('alert');
    await expect(screen).toBeVisible();
    expect(
      await screen.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(13, 14, 17)');
    await page.emulateMedia({ colorScheme: 'light' });
    expect(
      await screen.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(255, 255, 255)');
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });
});
