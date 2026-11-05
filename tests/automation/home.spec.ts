/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import shell from '@/content/shell.json';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test('the home page renders the embedded shell and the layout', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveTitle(shell.seoTitle);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'I lead mobile teams',
  );
  await expect(
    page.getByRole('link', { name: `${shell.name}, home` }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: "Where I've worked" }),
  ).toBeVisible();
});

test('there is no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('the Home page lists the newest roles from Firestore', async ({
  page,
}) => {
  await page.goto('/');
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
});

test('the navigation follows site/live: a page that is soon is not a link, a hidden one is gone', async ({
  page,
}) => {
  await mockFirestore(page, {
    'site/live': { pages: { services: 'soon', payment: 'hidden' } },
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Projects' })).toBeVisible();
  await expect(nav.getByText('Services')).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Services' })).toHaveCount(0);
  await expect(nav.getByText('Payment')).toHaveCount(0);
});

test('the footer has the full copyright line, in the visitor language', async ({
  page,
}) => {
  await page.goto('/');
  const year = new Date().getFullYear();
  await expect(page.getByRole('contentinfo')).toHaveText(
    `© ${year} Bach Bui. All rights reserved.`,
  );

  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await page.reload();
  await expect(page.getByRole('contentinfo')).toHaveText(
    `© ${year} Bach Bui. Bảo lưu mọi quyền.`,
  );
});
