/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.describe('maintenance switch', () => {
  test('replaces the whole site with the maintenance screen and the owner message', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        maintenance: {
          enabled: true,
          message: 'Moving to a new server tonight.',
        },
      },
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(
      page.getByText('Moving to a new server tonight.'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    // nothing of the site is left: no menu, no hero, no chat button
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: /BB Bot/i })).toHaveCount(0);
  });

  test('covers every page, not only Home', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true } },
    });
    await page.goto('/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(
      page.getByText('The site is being updated right now.'),
    ).toBeVisible(); // the default wording
  });

  test('speaks Vietnamese and uses the Vietnamese message when there is one', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await mockFirestore(page, {
      'site/live': {
        maintenance: {
          enabled: true,
          message: 'Moving tonight.',
          l10n: { vi: { message: 'Mình chuyển máy chủ tối nay.' } },
        },
      },
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Mình sẽ sớm quay lại.' }),
    ).toBeVisible();
    await expect(page.getByText('Mình chuyển máy chủ tối nay.')).toBeVisible();
  });

  test('is off by default: the site shows', async ({ page }) => {
    await mockFirestore(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'I lead mobile teams',
    );
  });
});

test.describe('the Home page switch', () => {
  test('soon shows Coming soon instead of the Home content', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { pages: { home: 'soon' } } });
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
    ).toHaveCount(0);
  });

  test('hidden shows the 404 screen', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { home: 'hidden' } } });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
  });
});
