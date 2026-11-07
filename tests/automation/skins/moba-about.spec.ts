/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8')) as {
  site: { profile: { specialties: unknown[] } };
};

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'moba');
  await mockFirestore(page);
  await mockImages(page);
});

const core = (page: Page) => page.locator('#core');
const cards = (page: Page) => core(page).locator('[data-skill]');

/** Answers the reads of one collection with `answer`, or waits `ms` before every read. */
async function intercept(
  page: Page,
  collection: string,
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
      (request.postData() ?? '').includes(`"collectionId":"${collection}"`);
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

test.describe('About in the Moba skin', () => {
  test('has the title, the profile summary and the specialties as chips', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    await expect(
      page.getByText(
        'I hold a Master of Science and chose software engineering',
      ),
    ).toBeVisible();
    const chips = page
      .getByRole('main')
      .locator('ul[class*="flex-wrap"] li')
      .filter({ hasText: /^(Software Engineer|Mobile|Web|AI)$/ });
    await expect(chips).toHaveText([
      'Software Engineer',
      'Mobile',
      'Web',
      'AI',
    ]);
  });

  test('only the visible specialties show', async ({ page }) => {
    const specialties = (
      seed.site.profile.specialties as { name: string }[]
    ).map((s) => (s.name === 'Web' ? { ...s, visible: false } : s));
    await mockFirestore(page, {
      'site/profile': { ...seed.site.profile, specialties },
    });
    await gotoSkin(page, '/about');
    await expect(
      page.getByText('Mobile', { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText('Web', { exact: true })).toHaveCount(0);
    await expect(page.getByText('AI', { exact: true })).toHaveCount(1);
  });

  test('has the portrait and the two covers with the Standard alt texts', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('img', { name: /^Portrait of / }),
    ).toBeVisible();
    await expect(page.getByRole('img', { name: /^Photo of / })).toHaveCount(2);
    for (const image of await page
      .getByRole('img', { name: /^Photo of / })
      .all())
      await expect(image).toBeVisible();
  });

  test('the photos keep their frame: portrait taller than each cover, covers one above the other', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/about');
    const frames = page.locator('.mb-photo');
    await expect(frames).toHaveCount(3);
    const boxes = await frames.evaluateAll((nodes) =>
      nodes.map((n) => n.getBoundingClientRect().toJSON()),
    );
    expect(boxes[0].height).toBeGreaterThan(boxes[1].height * 1.8);
    expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 1);
    expect(Math.abs(boxes[1].height - boxes[2].height)).toBeLessThan(2);
  });

  test('the core stack has every highlighted skill in rank order with where it was used; the first four wear Q W E R', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      core(page).getByRole('heading', { level: 2, name: 'Core stack' }),
    ).toBeVisible();
    await expect(
      core(page).getByText('What I use every day in my current role.'),
    ).toBeVisible();
    await expect(cards(page)).toHaveCount(5);
    await expect(cards(page).locator('h4')).toHaveText([
      'Kotlin',
      'KMM',
      'Jetpack Compose',
      'Python',
      'Claude Code',
    ]);
    await expect(cards(page).nth(0)).toContainText('Used at FPT · MoMo');
    await expect(cards(page).nth(4)).toContainText('Used at FPT');
    await expect(cards(page).locator('kbd')).toHaveText(['Q', 'W', 'E', 'R']);
  });

  test('See all skills links to the skills of Resume and opens them', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const link = core(page).getByRole('link', { name: 'See all skills' });
    await expect(link).toHaveAttribute('href', '/resume#skills');
    await link.click();
    await expect(page).toHaveURL(/\/resume#skills$/);
    await expect(page.locator('#skills')).toBeVisible();
    // the skills are in the visible part of the panel
    await expect
      .poll(async () => {
        const box = await page.locator('#skills').boundingBox();
        const main = await page.getByRole('main').boundingBox();
        return box && main
          ? box.y < main.y + main.height - 60 && box.y + box.height > main.y
          : false;
      })
      .toBe(true);
  });

  test('ends with the contact band: the email, the place and the chat card', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', /^mailto:/);
    await expect(page.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Chat with BB Bot' }),
    ).toBeVisible();
  });

  test('the chat switch of site/live removes the chat card', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Chat with BB Bot' }),
    ).toHaveCount(0);
  });
});

test.describe('About in the Moba skin: states, switches and language', () => {
  test('the core stack shows a loading screen, then the cards', async ({
    page,
  }) => {
    await intercept(page, 'skills', { delay: 1500 });
    await gotoSkin(page, '/about');
    const loading = core(page).getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(cards(page)).toHaveCount(5, { timeout: 15_000 });
  });

  test('says there is no core stack when no skill is highlighted', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'skills' ? { ...doc, highlight: null } : doc,
    );
    await gotoSkin(page, '/about');
    const notice = core(page).locator('[data-state="empty"]');
    await expect(notice).toBeVisible();
    await expect(notice.getByRole('heading')).toHaveText(/core stack/i);
    // the link to all the skills stays
    await expect(
      core(page).getByRole('link', { name: 'See all skills' }),
    ).toBeVisible();
  });

  test('says the core stack could not load, and Try again loads it', async ({
    page,
  }) => {
    await intercept(page, 'skills', 'error');
    await gotoSkin(page, '/about');
    const alert = core(page).locator('[data-state="error"]');
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "The core stack couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(cards(page)).toHaveCount(5, { timeout: 15_000 });
  });

  test('a page that is soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { about: 'soon' } } });
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { level: 1, name: /Coming soon/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Core stack' })).toHaveCount(
      0,
    );
  });

  test('a hidden page shows the 404', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { about: 'hidden' } } });
    await gotoSkin(page, '/about');
    await expect(page.getByText('404', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Core stack' })).toHaveCount(
      0,
    );
  });

  test('is in Vietnamese: the title, the summary, the core stack, the link and the alt texts', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Giới thiệu',
    );
    await expect(
      page.getByText('Mình có nền tảng học vấn là Thạc sĩ Khoa học'),
    ).toBeVisible();
    await expect(
      core(page).getByRole('heading', { level: 2, name: 'Công nghệ chính' }),
    ).toBeVisible();
    await expect(
      core(page).getByRole('link', { name: 'Xem tất cả kỹ năng' }),
    ).toBeVisible();
    await expect(cards(page).nth(0)).toContainText('Đã dùng tại FPT · MoMo');
    await expect(
      page.getByRole('img', { name: /^Ảnh chân dung của / }),
    ).toBeVisible();
    await expect(page.getByRole('img', { name: /^Ảnh của / })).toHaveCount(2);
  });
});

test.describe('About in the Moba skin: phone', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('nothing is wider than the screen, in English and in Vietnamese', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(cards(page)).toHaveCount(5);
    const overflow = () =>
      page.evaluate(() => {
        const wide = [
          ...document.querySelectorAll<HTMLElement>('.mb-panel-scroll *'),
        ].filter(
          (el) => el.getBoundingClientRect().right > window.innerWidth + 1,
        );
        return {
          doc: document.documentElement.scrollWidth <= window.innerWidth,
          wide: wide.length,
        };
      });
    await expect.poll(overflow).toEqual({ doc: true, wide: 0 });
    await page.evaluate(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await page.reload();
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    await expect(cards(page)).toHaveCount(5);
    await expect.poll(overflow).toEqual({ doc: true, wide: 0 });
  });

  test('the photos stack under the text', async ({ page }) => {
    await gotoSkin(page, '/about');
    const frames = page.locator('.mb-photo');
    await expect(frames).toHaveCount(3);
    const title = await page.getByRole('heading', { level: 1 }).boundingBox();
    const first = await frames.first().boundingBox();
    expect(first!.y).toBeGreaterThan(title!.y);
  });
});
