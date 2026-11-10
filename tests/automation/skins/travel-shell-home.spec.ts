/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { animationsSettled } from '../support/animations';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('the frame of the trip', () => {
  test('has a real link for every page, and the open one is marked', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const nav = page.getByRole('navigation', { name: 'Pages of the trip' });
    await expect(nav.getByRole('link')).toHaveCount(7);
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await nav.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
  });

  test('every page is reachable with the keyboard alone', async ({ page }) => {
    await gotoSkin(page, '/');
    const link = page
      .getByRole('navigation', { name: 'Pages of the trip' })
      .getByRole('link', { name: 'Certificates' });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/certificates$/);
  });

  test('keeps the header actions of Standard in the order Language, Skin, Theme', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const header = page.locator('header.tl-header');
    await expect(
      header.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    await expect(
      header.getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
    await expect(header.getByRole('button', { name: 'Connect' })).toBeVisible();
    const names = await header
      .getByRole('button')
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute('aria-label') ?? e.textContent ?? ''),
      );
    const at = (word: string) => names.findIndex((n) => n.includes(word));
    expect(at('Language')).toBeGreaterThan(-1);
    expect(at('Language')).toBeLessThan(at('Skin'));
    expect(at('Skin')).toBeLessThan(at('Theme'));
  });

  test('the Skin menu leaves the skin, the Language menu translates it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Language: English' }).click();
    await page.getByRole('menuitemradio', { name: 'Tiếng Việt' }).click();
    await expect(
      page.getByRole('navigation', { name: 'Các trang của chuyến đi' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Hồ sơ', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: /^Skin: Du lịch|^Giao diện: Du lịch|Skin: Du lịch/,
      })
      .click();
    await page.getByRole('menuitemradio', { name: /Chuẩn/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-skin',
      'travel',
    );
  });

  test('the Theme menu turns the map to night and back', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const night = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--tl-night')
        .trim(),
    );
    expect(night).toBe('1');
  });

  test('a page switched off is absent from the menu, and soon is marked', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'hidden', services: 'soon' } },
    });
    await gotoSkin(page, '/');
    const nav = page.getByRole('navigation', { name: 'Pages of the trip' });
    await expect(nav.getByRole('link', { name: 'Payment' })).toHaveCount(0);
    await expect(
      nav.getByRole('link', { name: 'Services, Soon' }),
    ).toBeVisible();
  });
});

test.describe('Home, the trip overview', () => {
  test('tells what Standard tells', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { level: 1, name: /I lead mobile teams/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "What I've built at FPT" }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "Where I've worked" }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Full resume' }),
    ).toHaveAttribute('href', '/resume');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'All projects' }),
    ).toHaveAttribute('href', '/projects');
    await expect(
      page.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Technologies' }),
    ).toBeVisible();
  });

  test('draws the real roles as pins, the current one is the destination', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const pins = page.locator('.tl-pin-btn');
    await expect(pins).toHaveCount(5);
    await expect(pins.filter({ hasText: 'FPT Software' })).toHaveAttribute(
      'aria-label',
      /FPT Software, Team Lead/,
    );
    await expect(page.getByText('You are here')).toBeVisible();
  });

  test('a pin opens the Resume page on that stop', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', {
        name: /^MoMo \(M_Service\), Senior Mobile App Developer/,
      })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      page.getByRole('article', { name: /^MoMo \(M_Service\)/ }),
    ).toBeVisible();
  });

  test('the trip can be started and stopped', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Start the trip' }).click();
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'The traveller is riding to' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Stop the trip' }).click();
    await expect(
      page.getByRole('button', { name: 'Start the trip' }),
    ).toBeVisible();
  });

  test('is in order on a phone: a sheet over the map, no horizontal scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await gotoSkin(page, '/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const handle = page.getByRole('button', { name: 'Show the whole panel' });
    await handle.click();
    await expect(
      page.getByRole('button', { name: 'Show more of the map' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Home, where I have worked', () => {
  const stops = (page: Page) =>
    page.getByRole('list', { name: 'Stops of the trip' }).getByRole('button');

  test('lists the latest roles of Standard and leaves the school to the Resume page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(stops(page)).toHaveCount(4);
    // newest first, as Standard lists them
    await expect(stops(page).first()).toContainText('FPT Software');
    await expect(stops(page).nth(1)).toContainText('MoMo');
    await expect(
      page.getByRole('list', { name: 'Stops of the trip' }),
    ).not.toContainText(/University/);
    await expect(
      page.getByRole('link', { name: 'Full resume' }),
    ).toHaveAttribute('href', '/resume');
  });
});

test.describe('the contact band and the rights line', () => {
  for (const path of ['/', '/about']) {
    test(`${path} ends with the contact band of Standard`, async ({ page }) => {
      await gotoSkin(page, path);
      const band = page.getByRole('region', {
        name: 'Have a role or a project in mind?',
      });
      await expect(band.getByRole('link', { name: /@/ })).toHaveAttribute(
        'href',
        /^mailto:/,
      );
      await expect(band.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
      await expect(band.getByText('384560623')).toBeVisible();
      await expect(
        band.getByRole('button', { name: 'Chat with BB Bot' }),
      ).toBeVisible();
    });
  }

  test('the chat switch takes the BB Bot card off the About band', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/about');
    const band = page.getByRole('region', {
      name: 'Have a role or a project in mind?',
    });
    await expect(band.getByRole('link', { name: /@/ })).toBeVisible();
    await expect(band.getByRole('button')).toHaveCount(0);
  });

  test('every page card ends with the year, the name and the rights', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const year = new Date().getFullYear();
    const line = page.getByText(`© ${year}`);
    await expect(line).toContainText('All rights reserved.');
    await expect(line).toContainText('Bach Bui');
  });

  for (const width of [320, 390]) {
    test(`on a phone at ${width} px the rights line and the map credit end the sheet, whole and inside it`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/about');
      const line = page.getByText(/^© \d{4}/);
      await line.scrollIntoViewIfNeeded();
      await animationsSettled(page);
      const credit = page
        .locator('.tl-panel')
        .getByText(/Map data © OpenStreetMap contributors/);
      // the sheet covers the map's own line, so the credit is said at the end of the sheet instead
      await expect(page.locator('.tl-credits')).toBeHidden();
      const panel = (await page.locator('.tl-panel').boundingBox())!;
      for (const el of [line, credit]) {
        await expect(el).toBeVisible();
        const box = (await el.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(panel.x);
        expect(box.x + box.width).toBeLessThanOrEqual(panel.x + panel.width);
        expect(box.y + box.height).toBeLessThanOrEqual(panel.y + panel.height);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
      ).toBeLessThanOrEqual(0);
    });
  }

  test('on a wide screen the card and the map credit do not overlap', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    await animationsSettled(page);
    const credits = page.locator('.tl-credits');
    await expect(credits).toBeVisible();
    const card = (await page.locator('.tl-panel').boundingBox())!;
    const credit = (await credits.boundingBox())!;
    expect(card.y + card.height).toBeLessThanOrEqual(credit.y);
  });
});

test.describe('the cards over the map', () => {
  for (const width of [800, 1024, 1440]) {
    for (const path of ['/', '/resume', '/about']) {
      test(`${path} fits its card at ${width}px, with nothing cut at the right`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoSkin(page, path);
        const body = page.locator('.tl-panel .tl-scroll');
        await expect(body).toBeVisible();
        // a grid column that grows to its widest child pushes the text out of the card
        const [scroll, client] = await body.evaluate((el) => [
          el.scrollWidth,
          el.clientWidth,
        ]);
        expect(scroll).toBeLessThanOrEqual(client);
      });
    }
  }
});

test.describe('the words of every page', () => {
  for (const lang of ['en', 'vi']) {
    for (const path of [
      '/',
      '/resume',
      '/projects',
      '/certificates',
      '/services',
      '/payment',
      '/about',
    ]) {
      test(`${path} leaves no {slot} of the copy unfilled in ${lang}`, async ({
        page,
      }) => {
        await page.addInitScript(
          (code) => localStorage.setItem('bach-cv-lang', code),
          lang,
        );
        await gotoSkin(page, path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        // a sentence with the years in it must say them (`useYearsText`), as Standard does
        await expect(page.locator('body')).not.toContainText(/\{[a-zA-Z]+\}/);
      });
    }
  }
});

test.describe('the header on a phone', () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const width of [320, 360, 390]) {
    test(`at ${width} px its controls are round, all inside the screen, and as big as a finger needs`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/');
      const boxes = await page
        .locator('header.tl-header button')
        .evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return { w: r.width, h: r.height, right: r.right };
          }),
        );
      expect(boxes).toHaveLength(6);
      for (const box of boxes) {
        // a circle: a touch screen's least height must not turn it into an oval, and the row must not squeeze it
        expect(Math.abs(box.w - box.h)).toBeLessThan(0.5);
        // 44 px, or 40 px under 360 px where six of them and the logo would not fit
        expect(box.w).toBeGreaterThanOrEqual(width >= 360 ? 44 : 40);
        expect(box.right).toBeLessThanOrEqual(width);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
      ).toBeLessThanOrEqual(0);
    });
  }
});
