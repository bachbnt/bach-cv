/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { animationsSettled } from '../support/animations';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

const cards = (page: Page) => page.getByTestId('project');
const card = (page: Page, name: string) =>
  cards(page).filter({ has: page.getByRole('heading', { name, exact: true }) });

/** Answers the reads of the projects with `answer`, or waits before every read. */
async function intercept(
  page: Page,
  answer: 'empty' | 'error' | { delay: number },
) {
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    if (typeof answer === 'object') {
      await new Promise((resolve) => setTimeout(resolve, answer.delay));
      return route.fallback();
    }
    const mine =
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes('"collectionId":"projects"');
    if (!mine) return route.fallback();
    return answer === 'error'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        })
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-01-01T00:00:00Z' }]),
        });
  });
}

test.describe('the postcards', () => {
  test('every visible project is a postcard, the featured ones first in rank order', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    await expect(
      page.getByText('Postcards from the sights I built'),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Tools I build for myself, and apps and sites I shipped for clients.',
      ),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(9);
    await expect
      .poll(async () =>
        (await page.getByRole('heading', { level: 2 }).allTextContents()).slice(
          0,
          4,
        ),
      )
      .toEqual(['VenusAI', 'Yoga Lasyn', 'DevPad', 'DevCmd']);
    // only the four featured ones wear the tag, and a project with `visible: false` is not there
    await expect(cards(page).filter({ hasText: 'Featured' })).toHaveCount(4);
    await expect(
      page.getByRole('heading', { name: 'Good Morning Coffee & Tea' }),
    ).toHaveCount(0);
  });

  test('a postcard tells every datum of the project', async ({ page }) => {
    await gotoSkin(page, '/projects');
    const venus = card(page, 'VenusAI');
    await expect(venus.getByText('Freelance', { exact: true })).toBeVisible();
    await expect(venus.getByText('Featured', { exact: true })).toBeVisible();
    await expect(venus).toContainText(
      'An app that creates AI avatars, built with Flutter and Firebase.',
    );
    await expect(
      venus.getByRole('img', { name: 'VenusAI cover' }),
    ).toBeVisible();
    const tech = venus.getByRole('list', { name: 'Technologies' });
    await expect(tech.getByRole('listitem')).toHaveText([
      'Flutter',
      'Firebase',
    ]);
    const store = venus.getByRole('link', { name: 'App Store' });
    await expect(store).toHaveAttribute('href', /apps\.apple\.com/);
    await expect(store).toHaveAttribute('target', '_blank');
    await expect(store).toHaveAttribute('rel', /noopener/);
    await expect(
      venus.getByRole('button', { name: '7 screenshots' }),
    ).toBeVisible();

    // the period is the postmark; links keep their kinds as names
    const devcmd = card(page, 'DevCmd');
    await expect(devcmd).toContainText('Feb 2024 – Present');
    await expect(devcmd.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      /github\.com/,
    );
    await expect(devcmd.getByRole('link', { name: 'Releases' })).toBeVisible();

    // a project with no gallery has no screenshots button, one with no period has no postmark
    const beli = card(page, 'Beli Coffee');
    await expect(beli.getByRole('button', { name: /screenshot/ })).toHaveCount(
      0,
    );
    await expect(beli).not.toContainText('Postmark');
  });

  test('a project without a cover gets a drawn view with its initials', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'projects' && id === 'finhub'
        ? { ...doc, cover: '' }
        : doc,
    );
    await gotoSkin(page, '/projects');
    const finhub = card(page, 'FinHub MCP');
    await expect(finhub.getByText('FM', { exact: true })).toBeVisible();
    await expect(finhub.getByRole('img')).toHaveCount(0);
    // the screenshots still open from the drawn view
    await expect(
      finhub.getByRole('button', { name: '7 screenshots' }),
    ).toBeVisible();
  });

  test('the photo keeps its ratio before and after the picture loads', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(card(page, 'Beli Coffee')).toBeVisible();
    await animationsSettled(page);
    const photo = card(page, 'Beli Coffee')
      .locator('div.relative > div')
      .first();
    const box = await photo.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.width / box!.height - 1.6)).toBeLessThan(0.05);
  });

  test('the kind chips filter the postcards, as in Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const group = page.getByRole('group', { name: 'Filter projects' });
    await expect(group.getByRole('button')).toHaveText([
      'All',
      'Personal',
      'Freelance',
    ]);
    await expect(group.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await group.getByRole('button', { name: 'Freelance' }).click();
    await expect(
      group.getByRole('button', { name: 'Freelance' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'FinHub MCP' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('heading', { name: 'Beli Coffee' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Com Chay Rop' }),
    ).toBeVisible();
    await group.getByRole('button', { name: 'Personal' }).click();
    await expect(
      page.getByRole('heading', { name: 'FinHub MCP' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Beli Coffee' }),
    ).toHaveCount(0);
    await group.getByRole('button', { name: 'All' }).click();
    await expect(cards(page)).toHaveCount(9);
  });

  test('a project that is not featured has no tag and keeps its screenshots', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'projects' ? { ...doc, highlight: null } : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(cards(page).filter({ hasText: 'Featured' })).toHaveCount(0);
    await expect(
      card(page, 'DevCmd').getByRole('button', { name: '7 screenshots' }),
    ).toBeVisible();
  });

  test('a long summary is cut to three lines, with Read more to show it all', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const devpad = card(page, 'DevPad');
    const summary = devpad.locator('p').first();
    const toggle = devpad.getByRole('button', { name: 'Read more' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const lines = () =>
      summary.evaluate((el) => getComputedStyle(el).webkitLineClamp);
    expect(await lines()).toBe('3');
    await toggle.click();
    const less = devpad.getByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    expect(await lines()).toBe('none');
    await less.click();
    expect(await lines()).toBe('3');
    // a short summary has no button
    await expect(
      card(page, 'Yoga Lasyn').getByRole('button', { name: 'Read more' }),
    ).toHaveCount(0);
  });

  test('the arrows move the strip sideways', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    await expect(cards(page).first()).toBeVisible();
    await animationsSettled(page);
    const strip = page.getByRole('list', { name: 'Postcards' });
    const left = () => strip.evaluate((el) => el.scrollLeft);
    expect(await left()).toBe(0);
    await page
      .getByRole('button', { name: 'Scroll the postcards right' })
      .click();
    await expect.poll(left).toBeGreaterThan(100);
    await page
      .getByRole('button', { name: 'Scroll the postcards left' })
      .click();
    await expect.poll(left).toBe(0);
  });
});

test.describe('the screenshots', () => {
  test('the photo opens the Standard viewer, which steps and closes with Escape', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const opener = page.getByRole('button', { name: '6 screenshots' }).first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('1 of 6', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('2 of 6', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('the keyboard reaches the filter, the photo and the links', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const venus = card(page, 'VenusAI');
    const photo = venus.getByRole('button', { name: '7 screenshots' });
    await photo.focus();
    await expect(photo).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(photo).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(venus.getByRole('link', { name: 'App Store' })).toBeFocused();
    const all = page
      .getByRole('group', { name: 'Filter projects' })
      .getByRole('button', { name: 'Personal' });
    await all.focus();
    await page.keyboard.press('Space');
    await expect(all).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('data states', () => {
  test('a skeleton shows while the projects are on their way, then the postcards', async ({
    page,
  }) => {
    await intercept(page, { delay: 1500 });
    await gotoSkin(page, '/projects');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(cards(page).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says there is nothing to show yet, with a way forward', async ({
    page,
  }) => {
    await intercept(page, 'empty');
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'No projects to show yet' }),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
    await expect(
      page.getByRole('group', { name: 'Filter projects' }),
    ).toHaveCount(0);
  });

  test('says it could not load, and Try again loads the postcards', async ({
    page,
  }) => {
    await intercept(page, 'error');
    await gotoSkin(page, '/projects');
    const alert = page
      .getByRole('alert')
      .filter({ hasText: "couldn't be loaded" });
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Projects couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(cards(page).first()).toBeVisible({ timeout: 15_000 });
  });

  test('a page switched to soon shows Coming soon, a hidden one the 404', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { pages: { projects: 'soon' } } });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(0);

    await mockFirestore(page, {
      'site/live': { pages: { projects: 'hidden' } },
    });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
  });
});

test.describe('layout and motion', () => {
  for (const width of [360, 390]) {
    test(`at ${width} px nothing scrolls sideways and the postcards fit the sheet`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/projects');
      await expect(cards(page).first()).toBeVisible();
      await animationsSettled(page);
      const overflow = await page.evaluate(() => {
        const panel = document.querySelector('.tl-panel > div');
        return {
          page: document.documentElement.scrollWidth - window.innerWidth,
          panel: panel ? panel.scrollWidth - panel.clientWidth : 0,
        };
      });
      expect(overflow.page).toBeLessThanOrEqual(0);
      expect(overflow.panel).toBeLessThanOrEqual(0);
      // on a phone the postcards are a column that fills the sheet
      const box = await cards(page).first().boundingBox();
      expect(box!.width).toBeGreaterThan(width - 60);
    });
  }

  test('on a wide screen the postcards are a strip along the bottom of the map', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    const first = await cards(page).nth(0).boundingBox();
    const second = await cards(page).nth(1).boundingBox();
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(40);
    expect(second!.x).toBeGreaterThan(first!.x + 200);
    const panel = await page.locator('.tl-panel').boundingBox();
    expect(panel!.y + panel!.height).toBeGreaterThan(850);
  });

  test('with reduced motion the postcards do not animate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/projects');
    const style = await cards(page)
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { transition: s.transitionDuration, animation: s.animationName };
      });
    expect(style.transition).toBe('0s');
    expect(style.animation).toBe('none');
  });

  test('a postcard leans, and straightens under the keyboard focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/projects');
    const first = cards(page).first();
    const matrix = () => first.evaluate((el) => getComputedStyle(el).transform);
    expect(await matrix()).not.toBe('none');
    await first.getByRole('button', { name: '7 screenshots' }).focus();
    await expect.poll(matrix).toMatch(/^matrix\(1, 0, 0, 1, 0, -?\d/);
  });
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('the controls are at least 44 px tall', async ({ page }) => {
    await gotoSkin(page, '/projects');
    const heights = async (locator: ReturnType<Page['locator']>) =>
      locator.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().height)),
      );
    const chips = page
      .getByRole('group', { name: 'Filter projects' })
      .getByRole('button');
    for (const height of await heights(chips))
      expect(height).toBeGreaterThanOrEqual(44);
    const links = card(page, 'DevPad').getByRole('link');
    for (const height of await heights(links))
      expect(height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('the page, the chips, the tags, the links and the buttons are translated', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dự án');
    await expect(
      page.getByText('Những tấm bưu thiếp từ các nơi tôi đã xây dựng'),
    ).toBeVisible();
    const group = page.getByRole('group', { name: 'Lọc dự án' });
    await expect(group.getByRole('button', { name: 'Cá nhân' })).toBeVisible();
    await expect(group.getByRole('button', { name: 'Tất cả' })).toBeVisible();
    await expect(
      page.getByText('Nổi bật', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem website' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /ảnh chụp màn hình$/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Công nghệ' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Cuộn bưu thiếp sang phải' }),
    ).toBeAttached();
    await expect(card(page, 'DevCmd')).toContainText('Thg 2 2024 – Nay');
  });
});
