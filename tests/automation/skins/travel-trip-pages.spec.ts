/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('Resume, the route', () => {
  test('lists every role and the school as a stop, the current one open', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const list = page.getByRole('list', { name: 'Stops of the trip' });
    await expect(list.getByRole('button')).toHaveCount(5);
    await expect(
      list.getByRole('button', { name: /FPT Software/ }),
    ).toHaveAttribute('aria-current', 'true');
    const card = page.getByRole('article', { name: /^FPT Software/ });
    await expect(card.getByText('Destination · Current')).toBeVisible();
    await expect(card.getByText('Current', { exact: true })).toBeVisible();
    await expect(card.getByText('Team Lead')).toBeVisible();
    await expect(card.getByText('Key project')).toBeVisible();
  });

  test('picking a stop opens its card, and the responsibilities are things to see', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await page
      .getByRole('list', { name: 'Stops of the trip' })
      .getByRole('button', { name: /Devblock Vietnam/ })
      .click();
    const card = page.getByRole('article', { name: /^Devblock Vietnam/ });
    await expect(card.getByText('Junior Mobile Developer')).toBeVisible();
    await card.getByRole('button', { name: 'Show responsibilities' }).click();
    await expect(
      card.getByRole('button', { name: 'Hide responsibilities' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(card.getByRole('listitem').first()).toBeVisible();
    await card.getByRole('button', { name: 'Next stop' }).click();
    await expect(
      page.getByRole('article', { name: /^University of Science/ }),
    ).toHaveCount(0);
    await expect(page.getByRole('article', { name: /^MoMo/ })).toBeVisible();
  });

  test('the school stop shows both degrees and the thesis links', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await page
      .getByRole('list', { name: 'Stops of the trip' })
      .getByRole('button', { name: /University of Science/ })
      .click();
    const card = page.getByRole('article', { name: /^University of Science/ });
    await expect(
      card.getByRole('region', { name: 'Bachelor of Science' }),
    ).toBeVisible();
    await expect(
      card.getByRole('region', { name: 'Master of Science' }),
    ).toBeVisible();
    await expect(
      card.getByRole('link', { name: 'Read the thesis' }),
    ).toHaveAttribute('href', /vnulib/);
    await expect(card.getByRole('link', { name: 'Source code' })).toHaveCount(
      2,
    );
  });

  test('has the skills as a packing list with where each was used', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(page.locator('#skills')).toBeVisible();
    await page
      .locator('#skills')
      .getByRole('button', { name: 'Kotlin' })
      .first()
      .click();
    await expect(page.locator('#skills').getByRole('status')).toContainText(
      'Used at',
    );
  });

  test('the side trip sits on its own spur, apart from the main road', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const pin = (name: RegExp) =>
      page
        .locator('.tl-pin-btn')
        .filter({ has: page.locator(`xpath=self::*[@aria-label]`) })
        .and(page.getByRole('button', { name }));
    const side = await pin(/^American Code Lab/).boundingBox();
    const main = await pin(/^MoMo/).boundingBox();
    expect(side).not.toBeNull();
    expect(main).not.toBeNull();
    // the spur leads inland: up and to the left of the main road in this view, never on top of the main pin
    expect(
      Math.hypot(
        (side?.x ?? 0) - (main?.x ?? 0),
        (side?.y ?? 0) - (main?.y ?? 0),
      ),
    ).toBeGreaterThan(40);
  });

  test('says in Vietnamese what it says in English', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Hồ sơ' }),
    ).toBeVisible();
    await expect(page.getByText('Lịch trình')).toBeVisible();
  });
});

test.describe('About, the traveller', () => {
  test('tells the profile and the core stack, with the link to all skills', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { level: 1, name: 'About' }),
    ).toBeVisible();
    await expect(page.getByText(/I hold a Master of Science/)).toBeVisible();
    for (const name of ['Software Engineer', 'Mobile', 'Web', 'AI'])
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'See all skills' }),
    ).toHaveAttribute('href', '/resume#skills');
    await expect(page.getByRole('img', { name: /^Portrait of/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kotlin' })).toBeVisible();
  });
});
