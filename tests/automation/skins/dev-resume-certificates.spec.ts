/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'dev');
  // the window scrolls smoothly; a test that scrolls then clicks needs the page to have arrived
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = '*{scroll-behavior:auto!important}';
      document.head.append(style);
    });
  });
});

/**
 * The status bar is fixed over the bottom of the window and a card slides in when it appears: bring the chip to the middle and
 * wait until its card has stopped moving, so the pointer is not moved from under it.
 */
const settle = async (chip: Locator) => {
  await chip.evaluate((node) => node.scrollIntoView({ block: 'center' }));
  await expect(chip.locator('xpath=ancestor::article')).toHaveAttribute(
    'data-in',
    '',
  );
  let last = '';
  await expect
    .poll(async () => {
      const now = JSON.stringify(await chip.boundingBox());
      const still = now === last;
      last = now;
      return still;
    })
    .toBe(true);
};

const height = (el: Locator) =>
  el.evaluate((node) => node.getBoundingClientRect().height);

test.describe('Resume', () => {
  test('lists the visible roles newest first with the current pill and the key project', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Resume',
    );
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
    const order = await page
      .locator("[data-slot='dev-job'] h3")
      .evaluateAll((items) => items.map((h) => h.textContent));
    expect(order[0]).toContain('FPT Software');
    await expect(page.getByText('Jan 2026 – Present')).toBeVisible();
    await expect(page.getByText('Key project')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: '9PP - Yamato Transport' }),
    ).toBeVisible();
    expect(await page.locator("[data-slot='dev-job']").count()).toBeGreaterThan(
      3,
    );
  });

  test('the Download CV button is there', async ({ page }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
  });

  test('responsibilities are open for the current role and slide for the others, inert while shut', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const toggles = page.getByRole('button', { name: /responsibilities/i });
    await expect(page.locator('[aria-expanded="true"]')).toHaveCount(1);

    const toggle = toggles.nth(1);
    const panel = toggle.locator('xpath=following-sibling::div[1]');
    await toggle.scrollIntoViewIfNeeded();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await height(panel)).toBe(0);
    await expect(panel).toHaveAttribute('inert', '');

    await toggle.click();
    await expect(page.locator('[aria-expanded="true"]')).toHaveCount(2);
    await expect.poll(() => height(panel)).toBeGreaterThan(80);
    await expect(panel).not.toHaveAttribute('inert', '');
    await expect(
      page.getByText('Architected and developed a cross-platform payment'),
    ).toBeVisible();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => height(panel)).toBe(0);
  });

  test('the current role has a live dot that breathes, and only it', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(page.locator("[data-slot='dev-live']")).toHaveCount(1);
    const animation = await page
      .locator("[data-slot='dev-live']")
      .evaluate((el) => getComputedStyle(el, '::before').animationName);
    expect(animation).toBe('dv-blink');
    await expect(
      page.locator("[data-slot='dev-job'][data-current]"),
    ).toHaveCount(1);
  });

  test('with reduced motion the live dot does not breathe and the list still opens', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/resume');
    const animation = await page
      .locator("[data-slot='dev-live']")
      .evaluate((el) => getComputedStyle(el, '::before').animationName);
    expect(animation).toBe('none');
    await page
      .getByRole('button', { name: /responsibilities/i })
      .nth(1)
      .click();
    await expect(page.locator('[aria-expanded="true"]')).toHaveCount(2);
  });

  test('skills are grouped by area and only listed skills are chips', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const skills = page.locator('#skills');
    await expect(
      skills.getByRole('heading', { name: 'AI and automation' }),
    ).toBeVisible();
    await expect(
      skills.getByRole('heading', { name: 'Tools and process' }),
    ).toBeVisible();
    await expect(skills.getByRole('button', { name: 'Kotlin' })).toBeVisible();
    await expect(
      skills.getByRole('button', { name: 'Matplotlib' }),
    ).toHaveCount(0);
    await expect(
      skills.getByRole('heading', { name: 'Core stack' }),
    ).toBeVisible();
    await expect(skills.locator('.dv-core-grid article')).not.toHaveCount(0);
  });

  test('a skill chip shows where it was used on hover and on keyboard focus', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const chip = page
      .locator('#skills')
      .getByRole('button', { name: 'Kotlin' });
    await settle(chip);
    await chip.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Used at FPT, MoMo. First used 2022.',
    );
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await chip.focus();
    await expect(page.getByRole('tooltip')).toContainText('Used at FPT, MoMo');
    await expect(chip).toHaveAttribute('aria-describedby', /.+/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    const unused = page
      .locator('#skills')
      .getByRole('button', { name: 'Git', exact: true });
    await settle(unused);
    await unused.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'No specific role or project listed for this yet.',
    );
  });

  test('education shows the thesis with its technologies and links', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
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
    await expect(
      master.getByRole('link', { name: 'Source code' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/bachbnt/stock-prediction-msc',
    );
    const bachelor = page
      .getByRole('article')
      .filter({ hasText: 'Bachelor of Science' });
    await expect(
      bachelor.getByRole('link', { name: 'Read the thesis' }),
    ).toHaveCount(0);
    await expect(
      bachelor.getByRole('link', { name: 'Source code' }),
    ).toHaveAttribute('href', 'https://github.com/bachbnt/pc-dashboard-bsc');
  });

  test('copy, dates and skill tips are translated in Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/resume');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Hồ sơ',
    );
    await expect(
      page.getByRole('heading', { name: 'Kinh nghiệm' }),
    ).toBeVisible();
    await expect(page.getByText('Thg 1 2026 – Nay')).toBeVisible();
    await expect(page.getByText('Dự án chính')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Học vấn' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Đọc luận văn' }).first(),
    ).toBeVisible();
    const chip = page
      .locator('#skills')
      .getByRole('button', { name: 'Kotlin' });
    await settle(chip);
    await chip.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Đã dùng tại FPT, MoMo. Dùng lần đầu năm 2022.',
    );
  });

  test.describe('on a touch device', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

    test('tap shows the tip, tap again hides it, tapping elsewhere closes it', async ({
      page,
    }) => {
      await gotoSkin(page, '/resume');
      const chip = page
        .locator('#skills')
        .getByRole('button', { name: 'Kotlin' });
      await settle(chip);
      await chip.tap();
      await expect(page.getByRole('tooltip')).toContainText(
        'Used at FPT, MoMo',
      );
      await chip.tap();
      await expect(page.getByRole('tooltip')).toHaveCount(0);

      await chip.tap();
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await page.getByRole('heading', { name: 'All skills by area' }).tap();
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    });

    test('there is no horizontal scroll', async ({ page }) => {
      await gotoSkin(page, '/resume');
      await expect(
        page.getByRole('heading', { name: 'Education' }),
      ).toBeVisible();
      // the cards slide in when they appear: look once the page has settled
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
    });
  });
});

test.describe('Certificates', () => {
  test('the latest certificate is featured and the others are in a grid, with skill names from the skills collection', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Certificates' }),
    ).toBeVisible();
    const cards = page.getByTestId('certificate');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toContainText('Latest');
    await expect(cards.first()).toContainText(
      'Claude Certified Architect - Professional',
    );
    await expect(cards.first()).toContainText('Issued Oct 31, 2026');
    await expect(cards.first()).toContainText('Anthropic');
    await expect(
      cards.first().getByRole('list', { name: 'Skills covered' }),
    ).toContainText('Claude Code');
    await expect(cards.nth(1)).toContainText('Issued May 01, 2026');
  });

  test('Open PDF opens the file in a new tab instead of downloading it', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const link = page
      .getByTestId('certificate')
      .first()
      .getByRole('link', { name: 'Open PDF' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('href', /\.pdf$/);
    await expect(link).not.toHaveAttribute('download', /.*/);
  });

  test('the Open PDF buttons of the cards in a row line up at the bottom', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/certificates');
    const cards = page.getByTestId('certificate');
    await expect(cards).toHaveCount(3);
    const bottoms = async () =>
      Promise.all(
        [1, 2].map(async (index) => {
          const link = cards
            .nth(index)
            .getByRole('link', { name: /open pdf/i });
          const box = await link.boundingBox();
          return Math.round(box!.y + box!.height);
        }),
      );
    await expect
      .poll(async () => {
        const [a, b] = await bottoms();
        return a === b;
      })
      .toBe(true);
  });

  test('the picture button has a name and is reachable by keyboard', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const opener = page
      .getByTestId('certificate')
      .first()
      .getByRole('button', { name: /View Claude Certified Architect/ });
    await opener.focus();
    await expect(opener).toBeFocused();
  });

  test('in Vietnamese the page and the dates are translated', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Chứng chỉ' }),
    ).toBeVisible();
    const first = page.getByTestId('certificate').first();
    await expect(first).toContainText('Mới nhất');
    await expect(first).toContainText('Cấp ngày 31/10/2026');
    await expect(first.getByRole('link', { name: 'Mở PDF' })).toBeVisible();
    await expect(
      first.getByRole('button', { name: 'Xem chứng chỉ' }),
    ).toBeVisible();
  });

  test('on a phone the page does not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/certificates');
    await expect(page.getByTestId('certificate')).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});
