/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'stream');
  await mockFirestore(page);
  await mockImages(page);
});

const timeline = (page: Page) =>
  page.getByRole('group', { name: 'Chapters' }).getByRole('button');
const roles = (page: Page) =>
  page.getByRole('region', { name: 'Experience' }).locator('article');
const role = (page: Page, company: RegExp) =>
  roles(page).filter({ has: page.getByRole('heading', { name: company }) });

test.describe('Resume, the full replay', () => {
  test('has the title, the intro and Download CV, and the roles as chapters of a timeline', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
    await expect(
      page.getByText('Seven years in software, now leading a team of 10.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Download CV' }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    // oldest to newest; the hidden roles are not chapters
    await expect(timeline(page)).toHaveCount(4);
    await expect(timeline(page).first()).toHaveAccessibleName(
      /Devblock Vietnam/,
    );
    await expect(timeline(page).last()).toHaveAccessibleName(/FPT Software/);
    // wider for a longer role
    const widths = await timeline(page).evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().width),
    );
    expect(widths[1]).toBeGreaterThan(widths[2]);
    // the red LIVE badge is next to the timeline, and in the title of the current chapter
    await expect(
      page.getByText('Current', { exact: true }).first(),
    ).toBeVisible();
    await timeline(page).last().hover();
    await expect(page.locator('[data-chapter-tip]').last()).toContainText(
      'FPT Software',
    );
  });

  test('lists the visible roles as a transcript, the newest first, with the red badge on the current one only', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(roles(page)).toHaveCount(4);
    await expect(
      roles(page)
        .first()
        .getByRole('heading', { name: /FPT Software/ }),
    ).toBeVisible();
    await expect(
      roles(page).first().getByText('Current', { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Experience' })
        .getByText('Current', { exact: true }),
    ).toHaveCount(1);
    await expect(page.getByText('Key project')).toBeVisible();
    await expect(page.getByText('9PP - Yamato Transport')).toBeVisible();
    await expect(page.getByText('MoMo (M_Service)').first()).toBeVisible();
    await expect(
      page.getByText('App Payment / App Platform Team'),
    ).toBeVisible();
    await expect(page.getByText('EasyGDS')).toHaveCount(0);
    await expect(page.getByText('Freelancer')).toHaveCount(0);
    // technologies of a role
    await expect(role(page, /MoMo/).getByText(/^#Kotlin$/)).toBeVisible();
  });

  test('the responsibilities of the first role start open; the others are shut and inert', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('button', { name: 'Hide responsibilities' }),
    ).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: 'Show responsibilities' }),
    ).toHaveCount(3);
    await expect(page.locator('main [inert]')).toHaveCount(3);
    await expect(
      roles(page)
        .first()
        .getByText(/Lead a team of 10 developers/),
    ).toBeVisible();
    await expect(
      role(page, /MoMo/).getByRole('button', { name: 'Show responsibilities' }),
    ).toHaveAttribute('aria-expanded', 'false');
    await role(page, /MoMo/)
      .getByRole('button', { name: 'Show responsibilities' })
      .click();
    await expect(page.locator('main [inert]')).toHaveCount(2);
    await expect(
      role(page, /MoMo/).getByText(/wearable devices/),
    ).toBeVisible();
    await role(page, /MoMo/)
      .getByRole('button', { name: 'Hide responsibilities' })
      .click();
    await expect(page.locator('main [inert]')).toHaveCount(3);
  });

  test('a chapter of the timeline scrolls to its role, opens it and moves the focus there', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await gotoSkin(page, '/resume');
    await expect(timeline(page)).toHaveCount(4);
    await timeline(page).first().click();
    const devblock = role(page, /Devblock/);
    await expect(
      devblock.getByRole('button', { name: 'Hide responsibilities' }),
    ).toBeVisible();
    await expect(
      devblock.getByRole('heading', { name: /Devblock/ }),
    ).toBeInViewport();
    await expect(
      devblock.getByRole('heading', { name: /Devblock/ }),
    ).toBeFocused();
    await expect(timeline(page).first()).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('the arrow keys move between the chapters and Enter opens one', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    // the chapter of the current role is in the tab order
    await expect(timeline(page).last()).toHaveAttribute('tabindex', '0');
    await timeline(page).last().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(timeline(page).nth(2)).toBeFocused();
    // moving the focus opens nothing
    await expect(
      page.getByRole('button', { name: 'Hide responsibilities' }),
    ).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(
      role(page, /American Code Lab/).getByRole('button', {
        name: 'Hide responsibilities',
      }),
    ).toBeVisible();
    await expect(
      role(page, /American Code Lab/).getByRole('heading', {
        name: /American Code Lab/,
      }),
    ).toBeFocused();
  });

  test('has the core stack pinned, the skills as hashtags by area with their tips, and the anchors', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(page.locator('#skills')).toBeAttached();
    await expect(page.locator('#experience')).toBeAttached();
    await expect(page.locator('#education')).toBeAttached();
    await expect(
      page.getByRole('heading', { name: 'Core stack' }),
    ).toBeVisible();
    await expect(page.getByText('Pinned')).toBeVisible();
    await expect(page.getByText('Used at FPT · MoMo').first()).toBeVisible();
    for (const area of [
      'AI and automation',
      'Mobile',
      'Frontend and backend',
      'Tools and process',
    ])
      await expect(page.getByRole('heading', { name: area })).toBeVisible();
    await page.getByRole('button', { name: 'Kotlin' }).hover();
    await expect(page.getByRole('tooltip')).toContainText('Used at');
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.getByRole('button', { name: 'Python' }).focus();
    await expect(page.getByRole('tooltip')).toContainText('Used at');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('has the education as a playlist, with the thesis, its technologies and its links', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const education = page.getByRole('region', { name: 'Education' });
    await expect(education.getByText('Playlist')).toBeVisible();
    await expect(
      education
        .getByRole('listitem')
        .filter({ has: page.getByRole('heading') }),
    ).toHaveCount(2);
    await expect(
      education.getByRole('heading', { name: 'Master of Science' }),
    ).toBeVisible();
    await expect(
      education.getByText('Stock Price Trend Prediction'),
    ).toBeVisible();
    await expect(education.getByText('Dec 2020 – Jun 2023')).toBeVisible();
    await expect(
      education.getByRole('link', { name: 'Read the thesis' }).first(),
    ).toHaveAttribute('target', '_blank');
    await expect(
      education.getByRole('link', { name: 'Source code' }).first(),
    ).toBeVisible();
    await expect(education.getByRole('img').first()).toBeVisible();
  });

  test('the jump chips go to the sections', async ({ page }) => {
    await gotoSkin(page, '/resume');
    await page.getByRole('link', { name: 'Education' }).click();
    await expect(page).toHaveURL(/#education$/);
    await expect(
      page.getByRole('heading', { name: 'Education', level: 2 }),
    ).toBeInViewport();
  });

  test('is in Vietnamese, words and all', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Hồ sơ' }),
    ).toBeVisible();
    await expect(page.getByRole('group', { name: 'Các chương' })).toBeVisible();
    await expect(
      page.getByText('Hiện tại', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Tải CV' }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Xem trách nhiệm công việc' }).first(),
    ).toBeVisible();
    await expect(page.getByText('Đã ghim')).toBeVisible();
    await expect(page.getByText('Danh sách phát')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'AI và tự động hóa' }),
    ).toBeVisible();
  });

  test('has no horizontal scroll on a phone, in either theme', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const theme of ['dark', 'light']) {
      await page.addInitScript(
        (t) => localStorage.setItem('bach-cv-theme', t),
        theme,
      );
      await gotoSkin(page, '/resume');
      await expect(timeline(page)).toHaveCount(4);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});
