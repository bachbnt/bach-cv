/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'dev');
});

test.describe('Home in the Dev skin', () => {
  test('the hero, the pipeline and the sections render', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'I lead mobile teams',
    );
    await expect(
      page.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "Where I've worked" }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: "What I've built at FPT" }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Technologies' }),
    ).toBeVisible();
  });

  test('the Home page lists the newest roles from Firestore', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'FPT Software' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'MoMo (M_Service)' }),
    ).toBeVisible();
    await expect(page.getByText('Jan 2026 – Present')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Freelancer' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('link', { name: 'Full resume' }),
    ).toHaveAttribute('href', '/resume');
  });

  test('the contact band has the email and opens the chat', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', /^mailto:/);
    await expect(
      page.getByRole('button', { name: 'Chat with BB Bot' }),
    ).toBeVisible();
  });

  test('the Download CV button opens the CV window', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Download CV' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('the chat switch of site/live removes the chat buttons', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /BB Bot/ })).toHaveCount(0);
  });

  test('a page that is soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { home: 'soon' } } });
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { level: 1, name: /Coming soon/i }),
    ).toBeVisible();
  });

  test('there is no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test('is translated to Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Mình dẫn dắt',
    );
    await expect(
      page.getByRole('heading', { name: 'Nơi mình đã làm việc' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem hồ sơ đầy đủ' }),
    ).toBeVisible();
  });
});

test.describe('About in the Dev skin', () => {
  test('shows the profile, the specialties and the photos', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    await expect(page.getByText('I hold a Master of Science')).toBeVisible();
    for (const name of ['Software Engineer', 'Mobile', 'Web', 'AI'])
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: /Portrait of/ })).toBeVisible();
    await expect(page.getByRole('img', { name: /Photo of/ })).toHaveCount(2);
  });

  test('the core stack lists the highlighted skills in rank order', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(5);
    await expect(cards.nth(0)).toContainText('Kotlin');
    await expect(cards.nth(0)).toContainText('FPT');
    await expect(cards.nth(4)).toContainText('Claude Code');
    await expect(
      page.getByRole('link', { name: 'See all skills' }),
    ).toHaveAttribute('href', '/resume#skills');
  });

  test('there is no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { name: 'Core stack' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test('is translated to Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Giới thiệu',
    );
    await expect(
      page.getByRole('heading', { name: 'Công nghệ chính' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem tất cả kỹ năng' }),
    ).toBeVisible();
  });
});
