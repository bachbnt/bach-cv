/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore, interceptCollection } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

/** The three states every block that reads data has (loading, empty, error with Try again), in the Trade skin. */
const BLOCKS = [
  {
    path: '/projects',
    collection: 'projects',
    empty: 'No projects to show yet',
    error: "Projects couldn't be loaded",
    content: 'VenusAI',
  },
  {
    path: '/resume',
    collection: 'experience',
    empty: 'No experience to show yet',
    error: "Experience couldn't be loaded",
    content: 'Own delivery of the FPT-scope functions',
  },
  {
    path: '/certificates',
    collection: 'certificates',
    empty: 'No certificates to show yet',
    error: "Certificates couldn't be loaded",
    content: 'Claude Certified Architect - Professional',
  },
  {
    path: '/about',
    collection: 'education',
    empty: 'No education to show yet',
    error: "Education couldn't be loaded",
    content: 'Master of Science',
  },
  {
    path: '/services',
    collection: 'services',
    empty: 'No services to show yet',
    error: "Services couldn't be loaded",
    content: 'App Development',
  },
] as const;

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
});

for (const block of BLOCKS) {
  test.describe(`${block.path} in the Trade skin`, () => {
    // (the chart's flags carry the names of the degrees in a hidden tip, so the content is looked for in the page panel)
    test('shows a skeleton while the data is on its way, then the content', async ({
      page,
    }) => {
      await interceptCollection(page, block.collection, { delay: 1500 });
      await gotoSkin(page, block.path);
      const loading = page.getByRole('status', { name: 'Loading' }).first();
      await expect(loading).toBeVisible();
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await expect(
        page.getByRole('main').getByText(block.content).first(),
      ).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(
        0,
      );
    });

    test('says there is nothing to show yet, with a way forward where Standard has one', async ({
      page,
    }) => {
      await interceptCollection(page, block.collection, 'empty');
      await gotoSkin(page, block.path);
      const notice = page.locator('[data-state="empty"]').first();
      await expect(notice).toBeVisible();
      await expect(
        notice.getByRole('heading', { name: block.empty }),
      ).toBeVisible();
      await expect(notice.getByRole('link')).toHaveCount(1);
    });

    test('says it could not load, and Try again loads it', async ({ page }) => {
      await interceptCollection(page, block.collection, 'error');
      await gotoSkin(page, block.path);
      const alert = page.locator('[data-state="error"]').first();
      // a failed read is tried once more before it counts as an error
      await expect(alert).toBeVisible({ timeout: 20_000 });
      await expect(
        alert.getByRole('heading', { name: block.error }),
      ).toBeVisible();
      await page.unroute('**/firestore.googleapis.com/**');
      await mockFirestore(page);
      await alert.getByRole('button', { name: 'Try again' }).click();
      await expect(
        page.getByRole('main').getByText(block.content).first(),
      ).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('[data-state="error"]')).toHaveCount(0);
    });
  });
}

test('the Vietnamese states use the Standard words', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await interceptCollection(page, 'projects', 'empty');
  await gotoSkin(page, '/projects');
  await expect(
    page.locator('[data-state="empty"]').getByRole('heading', {
      name: 'Chưa có dự án nào để hiển thị',
    }),
  ).toBeVisible();
});

test('the contact band says when the contacts cannot load', async ({
  page,
}) => {
  await interceptCollection(page, 'contacts', 'error');
  await gotoSkin(page, '/about');
  await expect(page.locator('[data-state="error"]').first()).toBeVisible({
    timeout: 20_000,
  });
});

test('an unknown path shows the 404 inside the terminal, with the way home', async ({
  page,
}) => {
  await gotoSkin(page, '/nothing-here');
  await expect(
    page.getByRole('heading', { name: "This page doesn't exist." }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Main' }).locator('[aria-current]'),
  ).toHaveCount(0);
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Back to home' })
    .click();
  await expect(page).toHaveURL(/\/$/);
});

test('the maintenance screen replaces the terminal and shows the way to reach me', async ({
  page,
}) => {
  await mockFirestore(page, {
    'site/live': { maintenance: { enabled: true, message: 'Back at noon.' } },
  });
  await gotoSkin(page, '/');
  await expect(
    page.getByRole('heading', { name: "We'll be back soon." }),
  ).toBeVisible();
  await expect(page.getByText('Back at noon.')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'bachbnt@gmail.com' }),
  ).toBeVisible();
  await expect(page.getByTestId('tv-chart')).toHaveCount(0);
});

test('while the skin is on its way the page shows a loading line, not a blank page', async ({
  page,
}) => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/*', async (route) => {
    if (/\/_next\/static\/.*skins_trade/i.test(route.request().url()))
      await gate;
    return route.fallback();
  });
  await page.goto('/projects', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'trade');
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-skin-ready',
    /.*/,
  );
  expect(
    await page.evaluate(() => getComputedStyle(document.body).visibility),
  ).toBe('hidden');
  release();
  await page.locator('html[data-skin-ready]').waitFor({ timeout: 20_000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('the system screens in the look of the terminal', () => {
  test('the 404 is "Symbol not found": the Standard words, the path that was not found, candles that draw, and both ways out', async ({
    page,
  }) => {
    await gotoSkin(page, '/nothing-here');
    const main = page.getByRole('main');
    await expect(main.getByText('Symbol not found')).toBeVisible();
    await expect(
      main.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(main.getByText('/nothing-here')).toBeVisible();
    await expect(
      main.getByText('The link may be broken or the page may have moved.', {
        exact: false,
      }),
    ).toBeVisible();
    await expect(main.locator('svg[aria-hidden="true"] g').first()).toHaveCSS(
      'animation-name',
      'tv-candle-draw',
    );
    await expect(main.getByRole('button', { name: 'Go back' })).toBeVisible();
    await expect(
      main.getByRole('link', { name: 'Back to home' }),
    ).toBeVisible();
  });

  test('Go back returns to the page before', async ({ page }) => {
    await gotoSkin(page, '/about');
    await page.goto('/nothing-here');
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Go back' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('the candles stand still for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/nothing-here');
    await expect(
      page.getByRole('main').locator('svg[aria-hidden="true"] g').first(),
    ).toHaveCSS('animation-name', 'none');
  });

  test('a page that is coming soon is "Pre-market", with the Standard words and no date or countdown', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        pages: {
          home: 'on',
          about: 'on',
          resume: 'on',
          projects: 'on',
          certificates: 'on',
          services: 'on',
          payment: 'soon',
        },
      },
    });
    await gotoSkin(page, '/payment');
    const main = page.getByRole('main');
    await expect(main.getByText('Pre-market')).toBeVisible();
    await expect(
      main.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
    await expect(main.getByText('Soon', { exact: true })).toBeVisible();
    await expect(
      main.getByRole('link', { name: 'Back to home' }),
    ).toBeVisible();
    await expect(main.getByRole('button', { name: 'Go back' })).toBeVisible();
    expect(await main.innerText()).not.toMatch(
      /\d{1,2}:\d{2}|\b20\d\d\b|days?\b/i,
    );
  });

  test('maintenance is "Market closed", with the real message, the email and candles that draw', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true, message: 'Back at noon.' } },
    });
    await gotoSkin(page, '/');
    await expect(page.getByText('Market closed')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(page.getByText('Back at noon.')).toBeVisible();
    await expect(page.getByText('Need me sooner? Email me')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:bachbnt@gmail.com');
    await expect(page.locator('svg[aria-hidden="true"] g').first()).toHaveCSS(
      'animation-name',
      'tv-candle-draw',
    );
  });

  test('speaks Vietnamese on the 404 screen', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/nothing-here');
    await expect(page.getByText('Không tìm thấy mã')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Trang này không tồn tại.' }),
    ).toBeVisible();
  });

  test('speaks Vietnamese on the maintenance screen', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true, message: '' } },
    });
    await gotoSkin(page, '/');
    await expect(page.getByText('Thị trường đóng cửa')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Mình sẽ sớm quay lại.' }),
    ).toBeVisible();
  });

  test('loading is a chart of grid lines and bars that breathe, and a line sweeping along the top; both stand still for reduced motion', async ({
    page,
  }) => {
    await interceptCollection(page, 'payments', { delay: 2500 });
    await gotoSkin(page, '/payment');
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    expect(await loading.locator('span').count()).toBeGreaterThan(10);
    await expect(loading.locator('span[class*="tv-bar"]').first()).toHaveCSS(
      'animation-name',
      'tv-bar',
    );
    await expect(loading.locator('span[class*="tv-load"]').first()).toHaveCSS(
      'animation-name',
      'tv-load',
    );
  });

  test('loading stands still for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await interceptCollection(page, 'payments', { delay: 2500 });
    await gotoSkin(page, '/payment');
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    await expect(loading.locator('span[class*="tv-bar"]').first()).toHaveCSS(
      'animation-name',
      'none',
    );
  });

  test('empty is "No data for this symbol" and an error is the widget error, in both languages', async ({
    page,
  }) => {
    await interceptCollection(page, 'services', 'empty');
    await gotoSkin(page, '/services');
    const notice = page.locator('[data-state="empty"]').first();
    await expect(notice.getByText('No data for this symbol')).toBeVisible();
    await expect(
      notice.getByRole('heading', { name: 'No services to show yet' }),
    ).toBeVisible();
  });

  test('an error says "Widget error" and Try again is a button', async ({
    page,
  }) => {
    await interceptCollection(page, 'services', 'error');
    await gotoSkin(page, '/services');
    const alert = page.locator('[data-state="error"]').first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(alert.getByText('Widget error')).toBeVisible();
    await expect(
      alert.getByRole('button', { name: 'Try again' }),
    ).toBeVisible();
  });

  test('the empty and error words are Vietnamese in the Vietnamese site', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await interceptCollection(page, 'services', 'empty');
    await gotoSkin(page, '/services');
    await expect(
      page
        .locator('[data-state="empty"]')
        .getByText('Không có dữ liệu cho mã này'),
    ).toBeVisible();
  });
});
