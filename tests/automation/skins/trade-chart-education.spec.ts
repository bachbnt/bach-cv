/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
});

const chart = (page: Page) => page.getByTestId('tv-chart');
const bars = async (page: Page) =>
  Number(await chart(page).getAttribute('data-candles'));
const group = (page: Page) => page.getByRole('group', { name: 'Interval' });
const pick = (page: Page, name: string) =>
  group(page).getByRole('button', { name });
const legendDate = (page: Page) => page.getByTestId('tv-legend-date');
const caps = (page: Page) => page.locator('[data-degree]');
const jobs = (page: Page) => page.locator('[data-marker]');

const BACHELOR =
  'Bachelor of Science, University of Science - Vietnam National University Ho Chi Minh City. Show it on the Resume page.';

const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  await expect(caps(page)).toHaveCount(2);
};

/** The legend's lines for the bar under the pointer at a share of the plot's width. */
const legendAt = async (page: Page, share: number) => {
  const box = (await chart(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * share, box.y + box.height * 0.3);
  return legendDate(page).innerText();
};

test.describe('the education on the chart', () => {
  test('the chart starts at the first job, in March 2020, and shows a graduation flag for each degree inside it', async ({
    page,
  }) => {
    await ready(page);
    // the chart begins with the first job, as it always did: no label of the axis is before 2020
    await expect.poll(() => legendAt(page, 0.002)).toMatch(/^Mar 2020/);
    const years = async () =>
      (
        await chart(page)
          .locator('text')
          .evaluateAll((list) => list.map((el) => el.textContent ?? ''))
      )
        .filter((t) => /^20\d\d$/.test(t))
        .map(Number);
    await expect.poll(async () => Math.min(...(await years()))).toBe(2020);
    // the Bachelor ended in September 2020 and the Master in June 2023, both inside the chart
    await expect(caps(page)).toHaveCount(2);
    await expect(jobs(page)).toHaveCount(4);
    for (const flag of await caps(page).all()) await expect(flag).toBeVisible();
    // the monthly default: March 2020 to now, about 80 candles, all on screen
    expect(await bars(page)).toBeGreaterThan(70);
    expect(await bars(page)).toBeLessThan(90);
    // the study bands are gone: only marks on the candles
    await expect(page.locator('[data-study]')).toHaveCount(0);
  });

  test('the graduation flag has its own look, a name of its own, and sits beside a job flag on the same bar', async ({
    page,
  }) => {
    await ready(page);
    const bachelor = page.getByRole('button', { name: BACHELOR, exact: true });
    await expect(bachelor).toHaveAttribute('data-degree', 'bachelor');
    // a graduation cap, not the E of a job
    await expect(bachelor.locator('svg')).toHaveCount(1);
    await expect(bachelor).not.toContainText('E');
    // a past job has a briefcase (an icon, not a letter) in the job blue, the current one a star
    const past = jobs(page)
      .filter({ hasNot: page.locator('text=★') })
      .first();
    await expect(past.locator(':scope > svg')).toHaveCount(1);
    // the only text in it is the tip, which is hidden until the flag is pointed at
    await expect(past.locator(':scope > span')).toHaveCount(1);
    await expect(page.locator('[data-marker="fpt-software"]')).toContainText(
      '★',
    );
    const color = (l: ReturnType<Page['locator']>) =>
      l.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await color(bachelor)).not.toBe(await color(jobs(page).first()));
    // the master ended in June 2023 and the job that began the year before is on another bar, but on the yearly chart both
    // flags of 2023 stay apart so that each can be clicked
    await pick(page, 'Year (1Y)').click();
    await expect(pick(page, 'Year (1Y)')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const boxes = await page
      .locator('[data-degree], [data-marker]')
      .evaluateAll((list) =>
        list.map((el) => {
          const r = el.getBoundingClientRect();
          return [r.left, r.top, r.right, r.bottom];
        }),
      );
    for (let a = 0; a < boxes.length; a++)
      for (let b = a + 1; b < boxes.length; b++) {
        const apart =
          boxes[a][2] <= boxes[b][0] + 0.5 ||
          boxes[b][2] <= boxes[a][0] + 0.5 ||
          boxes[a][3] <= boxes[b][1] + 0.5 ||
          boxes[b][3] <= boxes[a][1] + 0.5;
        expect(apart).toBe(true);
      }
  });

  test('a tip names the degree, the major, the school and the period', async ({
    page,
  }) => {
    await ready(page);
    await caps(page).first().focus();
    const flagTip = caps(page).first().locator('span[aria-hidden]').last();
    await expect(flagTip).toBeVisible();
    await expect(flagTip).toContainText('Bachelor of Science');
    await expect(flagTip).toContainText('Physics and Informatics');
    await expect(flagTip).toContainText('University of Science');
    await expect(flagTip).toContainText('Sep 2016');
    await expect(flagTip).toContainText('Sep 2020');
    await page.mouse.move(5, 5);
    await caps(page).nth(1).hover();
    const masterTip = caps(page).nth(1).locator('span[aria-hidden]').last();
    await expect(masterTip).toContainText('Master of Science');
    await expect(masterTip).toContainText('Dec 2020');
    await expect(masterTip).toContainText('Jun 2023');
  });

  test('a click on the flag goes to the education on the Resume page, and so does Enter', async ({
    page,
  }) => {
    await ready(page);
    await caps(page).first().click();
    await expect(page).toHaveURL(/\/resume#tv-education$/);
    await expect(
      page.getByRole('heading', { name: 'Education' }),
    ).toBeInViewport();
    await page.goBack();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    await caps(page).nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/resume#tv-education$/);
    await expect(
      page.getByRole('heading', { name: 'Education' }),
    ).toBeInViewport();
  });

  test('the legend tells the degree in progress beside the job, and nothing when none is', async ({
    page,
  }) => {
    await ready(page);
    // 2022 is the Master, with the first job (Mar 2020 - Apr 2022) or the second: a job and a degree, two items
    await expect
      .poll(() => legendAt(page, 0.3))
      .toContain('MSc · University of Science');
    // the right edge is now: a job and no degree
    await expect.poll(() => legendAt(page, 0.97)).not.toContain('MSc');
    await expect(legendDate(page)).toContainText('Team Lead');
    // the first bars are the Bachelor, before any job
    await expect
      .poll(() => legendAt(page, 0.05))
      .toContain('BSc · University of Science');
  });

  test('the flags stay at their dates when the interval changes, and a flag outside the window is hidden', async ({
    page,
  }) => {
    await ready(page);
    const xs = async () =>
      caps(page).evaluateAll((list) =>
        list.map((el) => el.getBoundingClientRect().left),
      );
    for (const name of [
      'Week (1W)',
      'Month (1M)',
      'Quarter (3M)',
      'Year (1Y)',
    ]) {
      await pick(page, name).click();
      await expect(pick(page, name)).toHaveAttribute('aria-pressed', 'true');
      await expect(caps(page)).toHaveCount(2);
      // the Bachelor's flag (September 2020) is before the Master's (June 2023)
      await expect
        .poll(async () => {
          const [a, b] = await xs();
          return b - a;
        })
        .toBeGreaterThan(20);
    }
    await pick(page, 'Month (1M)').click();
    await page
      .getByRole('toolbar', { name: 'Time range' })
      .getByRole('button', { name: '1Y' })
      .click();
    await expect(caps(page).first()).toBeHidden();
  });

  test('the replay brings in the degrees as the playhead passes them, and says so', async ({
    page,
  }) => {
    await ready(page);
    await page.getByRole('button', { name: 'Bar replay' }).first().click();
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.03, box.y + box.height * 0.2);
    await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
    // at the start neither graduation has happened
    await expect(caps(page)).toHaveCount(0);
    const replay = page.getByRole('toolbar', { name: 'Bar replay' });
    await replay.getByRole('button', { name: '10x', exact: true }).click();
    await replay.getByRole('button', { name: 'Play', exact: true }).click();
    await expect(page.getByTestId('tv-replay-live')).toContainText(
      'Bachelor of Science, University of Science',
      { timeout: 30_000 },
    );
    await expect(caps(page)).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: /^Bachelor of Science/ }),
    ).toBeVisible();
    await expect(page.getByTestId('tv-replay-live')).toContainText(
      'Master of Science, University of Science',
      { timeout: 30_000 },
    );
  });

  test('the years in software are the jobs only: the degrees do not change the number', async ({
    page,
  }) => {
    await ready(page);
    // seven years (March 2020 to now), as it always was
    await expect(page.getByRole('main')).toContainText(/7\s+years in software/);
    await page.goto('/about');
    await expect(page.getByRole('main')).toContainText(/7\s+years in software/);
  });

  test('is fine when there is no education: no band, no graduation flag, the chart starts at the first job', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'education' ? { ...doc, visible: false } : doc,
    );
    await gotoSkin(page, '/');
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    await expect(caps(page)).toHaveCount(0);
    await expect(jobs(page)).toHaveCount(4);
    // March 2020 to now on months: about 80 candles
    expect(await bars(page)).toBeLessThan(90);
  });
});

test.describe('in Vietnamese', () => {
  test('names the flags in Vietnamese, with the same short degrees', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    await expect(
      page.getByRole('button', {
        name: /^Cử nhân Khoa học, .*Xem trong trang Hồ sơ\.$/,
      }),
    ).toBeVisible();
    await expect(chart(page)).toHaveAttribute(
      'aria-label',
      /những tấm bằng của mình/,
    );
    await caps(page).nth(1).hover();
    await expect(
      caps(page).nth(1).locator('span[aria-hidden]').last(),
    ).toContainText('Thạc sĩ Khoa học');
    await expect
      .poll(() => legendAt(page, 0.3))
      .toContain('MSc · University of Science');
  });

  test('changing the language keeps the window on the same dates', async ({
    page,
  }) => {
    await ready(page);
    await page
      .getByRole('toolbar', { name: 'Time range' })
      .getByRole('button', { name: '3Y' })
      .click();
    await expect.poll(() => bars(page)).toBeLessThan(45);
    // the window slides there: wait until it has stopped
    await page.waitForTimeout(700);
    const before = await legendAt(page, 0.5);
    const count = await bars(page);
    await page.getByRole('button', { name: /^Language/ }).click();
    await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
    await expect(
      page.getByRole('group', { name: 'Khung thời gian' }),
    ).toBeVisible();
    // the same stretch of time: the count may differ by a bar through rounding
    await expect
      .poll(async () => Math.abs((await bars(page)) - count))
      .toBeLessThanOrEqual(1);
    const year = (text: string) => text.match(/20\d\d/)?.[0];
    expect(year(await legendAt(page, 0.5))).toBe(year(before));
  });
});

test.describe('without motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the flags are there at once', async ({ page }) => {
    await ready(page);
    await expect(caps(page)).toHaveCount(2);
    for (const flag of await caps(page).all()) await expect(flag).toBeVisible();
    const animated = await caps(page)
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animated).toBe('none');
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the flags fit the plot, stay reachable and do not scroll the page', async ({
    page,
  }) => {
    await ready(page);
    const plot = (await chart(page).boundingBox())!;
    for (const flag of await caps(page).all()) {
      await expect(flag).toBeVisible();
      const b = (await flag.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(plot.x - 1);
      expect(b.x + b.width).toBeLessThanOrEqual(plot.x + plot.width + 1);
      expect(b.height).toBeGreaterThanOrEqual(16);
    }
    // a tap on a flag opens the education
    await caps(page).first().tap();
    await expect(page).toHaveURL(/\/resume#tv-education$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});
