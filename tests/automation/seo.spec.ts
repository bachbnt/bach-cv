/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

for (const [path, title] of [
  ['/about', 'About - Bach Bui'],
  ['/resume', 'Resume - Bach Bui'],
  ['/projects', 'Projects - Bach Bui'],
  ['/certificates', 'Certificates - Bach Bui'],
  ['/services', 'Services - Bach Bui'],
] as const) {
  test(`${path} has its own description, canonical link and social preview`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description?.length).toBeGreaterThan(30);
    // not the description of the whole site
    expect(description).not.toContain('Master of Science');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://bachbntdev.web.app${path}`,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `https://bachbntdev.web.app${path}`,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
  });
}

test('the site tells search engines who it is about', async ({ page }) => {
  await page.goto('/');
  const json = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const person = JSON.parse(json ?? '{}');
  expect(person['@type']).toBe('Person');
  expect(person.name).toBe('Bach Bui');
  expect(person.url).toBe('https://bachbntdev.web.app');
});

test('the tab title follows the language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await page.goto('/resume');
  await expect(page).toHaveTitle('Hồ sơ - Bach Bui');
  await page.goto('/');
  await expect(page).toHaveTitle(/Kỹ sư phần mềm Mobile/);
});
