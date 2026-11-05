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
  // the other names people search for
  expect(person.alternateName).toEqual(
    expect.arrayContaining([
      'Bùi Ngô Tôn Bách',
      'Bách Bùi',
      'Tôn Bách',
      'Bách Dev',
    ]),
  );
});

test('the other names are in the page title, the description and, in plain sight, the footer of every page', async ({
  page,
}) => {
  for (const path of ['/', '/about', '/projects']) {
    await page.goto(path);
    const footer = page.getByTestId('alternate-names');
    await expect(footer).toContainText('Bùi Ngô Tôn Bách');
    await expect(footer).toContainText('Tôn Bách');
    await expect(footer).toContainText('Bách Dev');
    await expect(footer).toContainText('Bách Bùi');
  }
  await page.goto('/');
  await expect(page).toHaveTitle(/Bùi Ngô Tôn Bách/);
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute('content');
  for (const name of ['Bùi Ngô Tôn Bách', 'Bách Bùi', 'Tôn Bách', 'Bách Dev'])
    expect(description).toContain(name);
});

test('the tab title follows the language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await page.goto('/resume');
  await expect(page).toHaveTitle('Hồ sơ - Bach Bui');
  await page.goto('/');
  await expect(page).toHaveTitle(
    'Bùi Ngô Tôn Bách (Bach Bui) - Kỹ sư phần mềm',
  );
});
