/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test('Resume lists the visible roles newest first with the current pill and the key project', async ({
  page,
}) => {
  await page.goto('/resume');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resume');

  const jobs = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { level: 3 }) });
  await expect(
    page.getByRole('heading', { name: 'FPT Software Current' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'MoMo (M_Service)' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Devblock Vietnam' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Freelancer' })).toHaveCount(
    0,
  );
  await expect(page.getByText('Jan 2026 – Present')).toBeVisible();
  await expect(page.getByText('Key project')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: '9PP - Yamato Transport' }),
  ).toBeVisible();
  expect(await jobs.count()).toBeGreaterThan(3);
});

test('responsibilities open for the current role and toggle for the others', async ({
  page,
}) => {
  await page.goto('/resume');
  const toggles = page.getByRole('button', { name: /responsibilities/i });
  await expect(page.locator('[aria-expanded="true"]')).toHaveCount(1);
  await toggles.nth(1).click();
  await expect(page.locator('[aria-expanded="true"]')).toHaveCount(2);
  await expect(
    page.getByText('Architected and developed a cross-platform payment'),
  ).toBeVisible();
});

test('skills are grouped by area and only listed skills are chips', async ({
  page,
}) => {
  await page.goto('/resume');
  const skills = page.locator('#skills');
  await expect(
    skills.getByRole('heading', { name: 'AI and automation' }),
  ).toBeVisible();
  await expect(
    skills.getByRole('heading', { name: 'Tools and process' }),
  ).toBeVisible();
  await expect(skills.getByRole('button', { name: 'Kotlin' })).toBeVisible();
  await expect(skills.getByRole('button', { name: 'Matplotlib' })).toHaveCount(
    0,
  );
});

test('a skill chip shows where it was used on hover and on keyboard focus', async ({
  page,
}) => {
  await page.goto('/resume');
  const chip = page.locator('#skills').getByRole('button', { name: 'Kotlin' });
  await chip.hover();
  await expect(page.getByRole('tooltip')).toHaveText(
    'Used at FPT, MoMo. First used 2022.',
  );
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);

  await chip.focus();
  await expect(page.getByRole('tooltip')).toContainText('Used at FPT, MoMo');
  await expect(chip).toHaveAttribute('aria-describedby', 'skill-tip');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);

  const unused = page
    .locator('#skills')
    .getByRole('button', { name: 'Git', exact: true });
  await unused.focus();
  await expect(page.getByRole('tooltip')).toHaveText(
    'No specific role or project listed for this yet.',
  );
});

test.describe('on a touch device', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('tap shows the tip, tap again hides it, tapping elsewhere closes it', async ({
    page,
  }) => {
    await page.goto('/resume');
    const chip = page
      .locator('#skills')
      .getByRole('button', { name: 'Kotlin' });
    await chip.scrollIntoViewIfNeeded();
    await chip.tap();
    await expect(page.getByRole('tooltip')).toContainText('Used at FPT, MoMo');
    await page.waitForTimeout(450);
    await chip.tap();
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await chip.tap();
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    await page.getByRole('heading', { name: 'All skills by area' }).tap();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('there is no horizontal scroll', async ({ page }) => {
    await page.goto('/resume');
    await expect(
      page.getByRole('heading', { name: 'Education' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});

test('education shows the thesis with its technologies and link', async ({
  page,
}) => {
  await page.goto('/resume');
  const master = page
    .getByRole('article')
    .filter({ hasText: 'Master of Science' });
  await expect(master).toContainText('Dec 2020 – Jun 2023');
  await expect(master).toContainText(
    'Stock Price Trend Prediction using Machine Learning',
  );
  await expect(master.getByText('Matplotlib')).toBeVisible();
  await expect(
    master.getByRole('link', { name: 'Read the thesis' }),
  ).toHaveAttribute('href', 'http://ir.vnulib.edu.vn/handle/VNUHCM/31347');
  const bachelor = page
    .getByRole('article')
    .filter({ hasText: 'Bachelor of Science' });
  await expect(
    master.getByRole('link', { name: 'Source code' }),
  ).toHaveAttribute('href', 'https://github.com/bachbnt/stock-prediction-msc');
  // no thesis link in the data: only the source link shows
  await expect(
    bachelor.getByRole('link', { name: 'Read the thesis' }),
  ).toHaveCount(0);
  await expect(
    bachelor.getByRole('link', { name: 'Source code' }),
  ).toHaveAttribute('href', 'https://github.com/bachbnt/pc-dashboard-bsc');
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('copy, dates and skill tips are translated', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hồ sơ');
    await expect(
      page.getByRole('heading', { name: 'Kinh nghiệm' }),
    ).toBeVisible();
    await expect(page.getByText('Thg 1 2026 – Nay')).toBeVisible();
    await expect(page.getByText('Dự án chính')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Học vấn' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Đọc luận văn' }),
    ).toBeVisible();

    const chip = page
      .locator('#skills')
      .getByRole('button', { name: 'Kotlin' });
    await chip.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Đã dùng tại FPT, MoMo. Dùng lần đầu năm 2022.',
    );
  });
});
