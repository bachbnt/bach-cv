/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { careerYears } from '../../../src/lib/derive/career-years';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('About as the page of a symbol', () => {
  test('has the name and headline, the description, the specialties and the photos', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', { name: 'About', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('Software Engineer').first()).toBeVisible();
    const description = page.getByRole('region', { name: 'Description' });
    await expect(description).toBeVisible();
    await expect(description.getByRole('listitem').first()).toBeVisible();
    const photos = page.getByRole('region', { name: 'Photos' });
    await expect(
      photos.getByRole('img', { name: /^Portrait of Bach Bui/ }),
    ).toBeVisible();
    await expect(
      photos.getByRole('img', { name: /^Photo of Bach Bui/ }),
    ).toHaveCount(2);
  });

  test('the key facts are the real ones: place, site languages, years, areas, first role and current role', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const facts = page.getByRole('region', { name: 'Key facts' });
    await expect(facts.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await expect(facts.getByText('English · Tiếng Việt')).toBeVisible();
    await expect(facts.getByText('Mobile', { exact: true })).toBeVisible();
    await expect(facts.getByText('AI and automation')).toBeVisible();
    await expect(facts.getByText('Current role')).toBeVisible();
    await expect(facts.getByText('Team Lead')).toBeVisible();
    await expect(
      facts.getByText('FPT Software', { exact: true }),
    ).toBeVisible();
    await expect(facts.getByText('First role')).toBeVisible();
    // the years are the number Standard states: from the earliest visible job in the seed
    const years = Number(
      await facts.getByTestId('desk-count').first().getAttribute('data-value'),
    );
    expect(years).toBe(careerYears(['2020-03'], new Date()));
  });

  test('the years count up from zero once, then stay', async ({ page }) => {
    await gotoSkin(page, '/about');
    const count = page.getByTestId('desk-count').first();
    const value = Number(await count.getAttribute('data-value'));
    await expect(count.locator('[aria-hidden="true"]')).toHaveText('0');
    await count.scrollIntoViewIfNeeded();
    await expect(count.locator('[aria-hidden="true"]')).toHaveText(
      String(value),
    );
    await expect(count).toHaveText(`${value}${value}`);
  });

  test('with reduced motion the facts and the timeline are shown at once', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/about');
    const count = page.getByTestId('desk-count').first();
    const value = await count.getAttribute('data-value');
    await expect(count.locator('[aria-hidden="true"]')).toHaveText(value ?? '');
    await expect(
      page.getByRole('heading', { name: 'Master of Science' }),
    ).toBeVisible();
  });

  test('the education is a dated timeline with the school and the major', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const timeline = page.getByRole('region', { name: 'Education' });
    const rows = timeline.getByRole('listitem');
    await expect(rows).toHaveCount(2);
    await expect(
      timeline.getByRole('heading', { name: 'Bachelor of Science' }),
    ).toBeVisible();
    await expect(timeline.getByText('Sep 2016 – Sep 2020')).toBeVisible();
    await expect(
      timeline.getByText('University of Science', { exact: false }).first(),
    ).toBeVisible();
    await expect(
      timeline.getByText('Physics and Informatics').first(),
    ).toBeVisible();
    await expect(timeline.getByText('Major:').first()).toBeVisible();
  });

  test('the core stack is a row of tiles with where each skill was used, and the link to all skills', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const stack = page.getByRole('region', { name: 'Core stack' });
    await expect(
      stack.getByRole('heading', { level: 3 }).first(),
    ).toBeVisible();
    await expect(stack.getByText(/Used at/).first()).toBeVisible();
    await page.getByRole('link', { name: 'See all skills' }).click();
    await expect(page).toHaveURL(/\/resume#skills$/);
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toBeInViewport();
  });

  test('the links are the Connect menu as a list: the email with Copy, the phone and the three groups', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoSkin(page, '/about');
    const links = page.locator('#contact');
    await expect(
      links.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeVisible();
    await expect(
      links.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:bachbnt@gmail.com');
    await expect(
      links.getByRole('link', { name: /384560623/ }),
    ).toHaveAttribute('href', /^tel:/);
    for (const group of ['Professional', 'Messaging', 'Social'])
      await expect(links.getByRole('heading', { name: group })).toBeVisible();
    await expect(links.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/bachbnt/',
    );
    await links.getByRole('button', { name: 'Copy' }).click();
    await expect(links.getByRole('status')).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
  });

  test('the Ask BB Bot card opens the real chat, and is gone when the chat is off', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Hello.' } }));
    await gotoSkin(page, '/about');
    const card = page.getByRole('region', { name: 'Not sure where to look?' });
    await card.getByRole('button', { name: 'Chat with BB Bot' }).click();
    await expect(page.getByRole('dialog', { name: /BB Bot/ })).toBeVisible();
  });

  test('has no Ask BB Bot card when the chat is off', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('region', { name: 'Description' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Not sure where to look?' }),
    ).toHaveCount(0);
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('region', { name: 'Thông tin chính' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Mô tả' })).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Học vấn' })
        .getByText('Cử nhân Khoa học'),
    ).toBeVisible();
    await expect(page.getByText('Kỹ sư phần mềm').first()).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Thông tin chính' })
        .getByText('Năm làm phần mềm'),
    ).toBeVisible();
  });

  test('has no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/about');
    await expect(page.getByRole('region', { name: 'Key facts' })).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
