/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore, interceptCollection } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
  // the current role is counted up to this month
  await page.clock.setFixedTime(new Date(2026, 10, 15));
});

const role = (page: Page, company: string) =>
  page.locator('article').filter({
    has: page.getByRole('heading', { level: 3, name: company }),
  });
const skillRow = (page: Page, name: string) =>
  page.getByRole('row').filter({
    has: page.getByRole('cell', { name, exact: false }),
  });

test.describe('the head and the roles', () => {
  test('has the title, the years in software and the CV button', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
    await expect(
      page.getByText('Seven years in software, now leading a team of 10.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Download CV/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
        name: /Resume/,
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('numbers every role, newest first, with what Standard shows for it', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const headings = page
      .getByRole('region', { name: 'Experience' })
      .getByRole('heading', { level: 3 });
    await expect(headings).toHaveText([
      /FPT Software/,
      /MoMo \(M_Service\)/,
      /American Code Lab/,
      /Devblock Vietnam/,
    ]);
    const fpt = role(page, 'FPT Software');
    await expect(fpt.getByText('Current', { exact: true })).toHaveCount(1);
    await expect(fpt.getByText('Team Lead')).toBeVisible();
    await expect(fpt.getByText('FHN.HNT')).toBeVisible();
    await expect(fpt.getByText('Jan 2026 – Present')).toBeVisible();
    await expect(fpt.getByText('Key project')).toBeVisible();
    await expect(
      fpt.getByRole('heading', { level: 4, name: '9PP - Yamato Transport' }),
    ).toBeVisible();
    await expect(
      fpt.getByRole('listitem').filter({ hasText: /^Kotlin$/ }),
    ).toBeVisible();
  });

  test('says in the margin how long a role lasted, and that the current one still goes on', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    // the end months are fixed, so these do not depend on the clock
    await expect(
      role(page, 'MoMo (M_Service)').getByRole('complementary'),
    ).toHaveText('3 y 9 mo');
    await expect(
      role(page, 'Devblock Vietnam').getByRole('complementary'),
    ).toHaveText('2 y 2 mo');
    await expect(
      role(page, 'American Code Lab').getByRole('complementary'),
    ).toHaveText('8 mo');
    await expect(
      role(page, 'FPT Software').getByRole('complementary'),
    ).toHaveText(/^11 mo\s*∴ Current$/);
  });

  test('opens the responsibilities of the first role and lets the others be opened', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const first = role(page, 'FPT Software');
    const hide = first.getByRole('button', { name: 'Hide responsibilities' });
    await expect(hide).toHaveAttribute('aria-expanded', 'true');
    await expect(first.getByRole('listitem').nth(0)).toBeVisible();

    const second = role(page, 'MoMo (M_Service)');
    const show = second.getByRole('button', {
      name: 'Show responsibilities',
    });
    await expect(show).toHaveAttribute('aria-expanded', 'false');
    // shut, the list cannot be reached
    await expect(second.locator('[inert]')).toHaveCount(1);
    await show.click();
    await expect(
      second.getByRole('button', { name: 'Hide responsibilities' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(second.locator('[inert]')).toHaveCount(0);
    await expect(
      second.getByRole('list').last().getByRole('listitem').first(),
    ).toBeVisible();
  });
});

test.describe('the skills', () => {
  test('has the core stack with where each skill was used', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 3, name: 'Core stack' }),
    ).toBeVisible();
    const core = page
      .getByRole('heading', { level: 3, name: 'Core stack' })
      .locator('xpath=following::ul[1]');
    await expect(core.getByRole('listitem')).toHaveCount(5);
    await expect(core.getByText('Used at FPT · MoMo')).toBeVisible();
  });

  test('has a row for each listed skill with its months, a tally of the years and where it was used', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const table = page.getByRole('table');
    await expect(
      table.getByRole('columnheader', { name: 'Skill' }),
    ).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(39);

    // used only at MoMo (May 2022 - Jan 2026): 45 months, four years begun, four strokes
    const kmm = skillRow(page, 'KMM');
    await expect(kmm.getByRole('cell', { name: '45 mo' })).toBeVisible();
    await expect(kmm.getByRole('cell', { name: 'Mobile' })).toBeVisible();
    await expect(kmm.getByRole('cell', { name: /^MoMo/ })).toBeVisible();
    await expect(kmm.getByText('First used 2022.')).toBeVisible();
    await expect(kmm.locator('td[aria-hidden="true"] i')).toHaveCount(4);

    // two roles back to back, 71 months, six years: five (four strokes and the one across) and one
    const react = skillRow(page, 'React Native');
    await expect(react.getByRole('cell', { name: '71 mo' })).toBeVisible();
    await expect(react.locator('td[aria-hidden="true"] i')).toHaveCount(6);

    // a skill of the core stack says so; one used only in side projects has no months
    await expect(
      skillRow(page, 'Kotlin').getByText('(Core stack)'),
    ).toBeAttached();
    const swift = skillRow(page, 'Swift').first();
    await expect(swift.getByText('Side projects')).toBeVisible();
    await expect(swift.locator('td[aria-hidden="true"] i')).toHaveCount(0);
  });

  test('keeps the order of Standard (by area), sorts by a column and filters by an area', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const names = () =>
      page.getByRole('row').evaluateAll((rows) =>
        rows
          .slice(1)
          .map((row) => row.querySelector('td')?.textContent ?? '')
          .map((text) =>
            text
              .replace(/\s*†.*$/, '')
              .replace(/\(Core stack\)/, '')
              .trim(),
          ),
      );
    // the Standard order starts with the AI area
    await expect(
      page.getByRole('columnheader', { name: 'Area' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    await expect(page.getByRole('row').nth(1)).toContainText(
      'AI and automation',
    );
    const first = await names();

    await page.getByRole('button', { name: 'Skill' }).click();
    await expect(
      page.getByRole('columnheader', { name: 'Skill' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    const sorted = await names();
    expect(sorted).toEqual([...first].sort((a, b) => a.localeCompare(b, 'en')));
    await page.getByRole('button', { name: 'Skill' }).click();
    await expect(
      page.getByRole('columnheader', { name: 'Skill' }),
    ).toHaveAttribute('aria-sort', 'descending');

    // the months sort from the most to the least used first
    await page.getByRole('button', { name: 'Months' }).click();
    await expect(
      page.getByRole('columnheader', { name: 'Months' }),
    ).toHaveAttribute('aria-sort', 'descending');
    const months = await page
      .getByRole('row')
      .evaluateAll((rows) =>
        rows
          .slice(1)
          .map((row) =>
            Number(/(\d+) mo/.exec(row.textContent ?? '')?.[1] ?? 0),
          ),
      );
    expect(months).toEqual([...months].sort((a, b) => b - a));

    const group = page.getByRole('group', { name: 'Filter skills by area' });
    await expect(group.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await group.getByRole('button', { name: 'Mobile' }).click();
    await expect(group.getByRole('button', { name: 'Mobile' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const rows = page.getByRole('row');
    const shown = await rows.count();
    expect(shown).toBeLessThan(38);
    await expect(rows.filter({ hasText: 'AI and automation' })).toHaveCount(0);
    await group.getByRole('button', { name: 'All' }).click();
    await expect(rows).toHaveCount(39);
  });

  test('explains the tally in the margin of the table', async ({ page }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByText(/One stroke for each year a skill was in use/),
    ).toBeVisible();
  });
});

test.describe('the degrees', () => {
  test('shows each degree with its school, period, major and thesis', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const master = page.locator('article').filter({
      has: page.getByRole('heading', { level: 3, name: 'Master of Science' }),
    });
    await expect(master.getByText(/University of Science/)).toBeVisible();
    await expect(master.getByText('Thesis', { exact: true })).toBeVisible();
    await expect(
      master.getByText('Stock Price Trend Prediction using Machine Learning'),
    ).toBeVisible();
    await expect(
      master.getByRole('link', { name: /Read the thesis/ }),
    ).toHaveAttribute('href', 'http://ir.vnulib.edu.vn/handle/VNUHCM/31347');
    await expect(
      master.getByRole('link', { name: /Source code/ }),
    ).toHaveAttribute('href', /stock-prediction-msc/);

    const bachelor = page.locator('article').filter({
      has: page.getByRole('heading', { level: 3, name: 'Bachelor of Science' }),
    });
    await expect(
      bachelor.getByRole('link', { name: /Read the thesis/ }),
    ).toHaveCount(0);
    await expect(
      bachelor.getByRole('link', { name: /Source code/ }),
    ).toBeVisible();
  });
});

test.describe('the states', () => {
  const COLLECTIONS = [
    {
      collection: 'experience',
      empty: 'No experience to show yet',
      error: "Experience couldn't be loaded",
      content: 'FPT Software',
    },
    {
      collection: 'education',
      empty: 'No education to show yet',
      error: "Education couldn't be loaded",
      content: 'Master of Science',
    },
  ] as const;

  for (const block of COLLECTIONS) {
    test.describe(block.collection, () => {
      test('shows a skeleton while loading, then the content', async ({
        page,
      }) => {
        await interceptCollection(page, block.collection, { delay: 1500 });
        await gotoSkin(page, '/resume');
        const loading = page.getByRole('status', { name: 'Loading' }).first();
        await expect(loading).toBeVisible();
        await expect(loading).toHaveAttribute('aria-busy', 'true');
        await expect(page.getByText(block.content).first()).toBeVisible({
          timeout: 15_000,
        });
      });

      test('says there is nothing to show yet, with a way forward', async ({
        page,
      }) => {
        await interceptCollection(page, block.collection, 'empty');
        await gotoSkin(page, '/resume');
        const notice = page.locator('[data-state="empty"]').first();
        await expect(notice).toBeVisible();
        await expect(
          notice.getByRole('heading', { name: block.empty }),
        ).toBeVisible();
      });

      test('says it could not load, and Try again loads it', async ({
        page,
      }) => {
        await interceptCollection(page, block.collection, 'error');
        await gotoSkin(page, '/resume');
        const alert = page.locator('[data-state="error"]').first();
        await expect(alert).toBeVisible({ timeout: 20_000 });
        await expect(
          alert.getByRole('heading', { name: block.error }),
        ).toBeVisible();
        await page.unroute('**/firestore.googleapis.com/**');
        await mockFirestore(page);
        await alert.getByRole('button', { name: 'Try again' }).click();
        await expect(page.getByText(block.content).first()).toBeVisible({
          timeout: 15_000,
        });
        await expect(page.locator('[data-state="error"]')).toHaveCount(0);
      });
    });
  }
});

test.describe('the switches', () => {
  test('a page that is coming soon says so, a hidden one is a 404', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { resume: 'soon' } },
    });
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
  });

  test('a hidden page is the 404 and has no tab', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { resume: 'hidden' } },
    });
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
        name: /Resume/,
      }),
    ).toHaveCount(0);
  });
});

test.describe('in Vietnamese', () => {
  test('has the words of Standard in Vietnamese, and the tally still counts years', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Hồ sơ' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Kinh nghiệm' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Kỹ năng' }),
    ).toBeVisible();
    await expect(
      role(page, 'MoMo (M_Service)').getByRole('complementary'),
    ).toHaveText('3 năm 9 tháng');
    await expect(
      page.getByRole('columnheader', { name: 'Số tháng' }),
    ).toBeVisible();
    await expect(
      skillRow(page, 'KMM').getByRole('cell', { name: '45 tháng' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Học vấn' }),
    ).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('does not scroll sideways, and the table is still sortable', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Months' })).toBeVisible();
    await page.getByRole('button', { name: 'Months' }).click();
    await expect(
      page.getByRole('columnheader', { name: 'Months' }),
    ).toHaveAttribute('aria-sort', 'descending');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    // the note of a role is under it, as real text
    await expect(
      role(page, 'MoMo (M_Service)').getByRole('complementary'),
    ).toHaveText('3 y 9 mo');
  });
});
