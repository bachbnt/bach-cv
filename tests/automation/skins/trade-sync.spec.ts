/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { careerYears } from '@/lib/derive/career-years';
import { yearsPhrase } from '@/lib/derive/years-phrase';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

/** The first visit to a page compiles it in the dev server, which is slow when the machine is busy. */
const SLOW = { timeout: 30_000 };

const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8')) as {
  experience: Record<string, { startMonth: string; visible: boolean }>;
};
/** The years in software of the seed, worked out the way every page does (`careerYears`). */
const YEARS = careerYears(
  Object.values(seed.experience)
    .filter((job) => job.visible)
    .map((job) => job.startMonth),
  new Date(),
)!;

const LAYOUT = 'bach-cv-trade-layout';
const chart = (page: Page) => page.getByTestId('tv-chart');
const watchlist = (page: Page) =>
  page.getByRole('complementary', { name: 'Watchlist' });

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('the years in software are one number in every skin', () => {
  test('Standard states it in the Home intro and, spelled, on Resume', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByText(
        `Team Lead at FPT Software with ${YEARS} years in software`,
      ),
    ).toBeVisible(SLOW);
    await page.goto('/resume');
    await expect(
      page.getByText(
        `${yearsPhrase(YEARS, 'en', { spelled: true })} in software, now leading a team of 10.`,
      ),
    ).toBeVisible(SLOW);
  });

  test('Standard says it in Vietnamese too', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await page.goto('/resume');
    await expect(
      page.getByText(
        `${yearsPhrase(YEARS, 'vi', { spelled: true })} làm việc trong ngành phần mềm`,
      ),
    ).toBeVisible(SLOW);
  });

  test('Trade states the same number in the hero, the symbol, the watchlist and Resume', async ({
    page,
  }) => {
    await useSkin(page, 'trade');
    await gotoSkin(page, '/');
    await expect(
      page.getByText(
        `Team Lead at FPT Software with ${YEARS} years in software`,
      ),
    ).toBeVisible(SLOW);
    await expect(
      page.getByRole('region', { name: 'Symbol overview' }),
    ).toContainText(`${YEARS} ${YEARS === 1 ? 'year' : 'years'} in software`, {
      useInnerText: false,
    });
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: /Home/ }),
    ).toContainText(String(YEARS));
    await page.goto('/resume');
    await expect(
      page.getByText(
        `${yearsPhrase(YEARS, 'en', { spelled: true })} in software, now leading a team of 10.`,
      ),
    ).toBeVisible(SLOW);
  });

  test('Dev states the same number in the hero and in its profile window', async ({
    page,
  }) => {
    await useSkin(page, 'dev');
    await gotoSkin(page, '/');
    await expect(
      page.getByText(
        `Team Lead at FPT Software with ${YEARS} years in software`,
      ),
    ).toBeVisible(SLOW);
    await expect(
      page.getByText(`experience={${YEARS}} // years of experience`),
    ).toBeVisible();
  });
});

test.describe('Go back with no page to go back to', () => {
  for (const skin of ['standard', 'dev', 'trade'] as const) {
    test(`${skin}: the 404 screen opened in a new tab goes home`, async ({
      page,
      context,
    }) => {
      await context.addInitScript((id) => {
        window.localStorage.setItem('bach-cv-skin', id);
      }, skin);
      await page.goto('/');
      // a tab opened by a link has one entry in its history: nothing to go back to
      const [tab] = await Promise.all([
        context.waitForEvent('page'),
        page.evaluate(() => window.open('/no-such-page')),
      ]);
      await tab.waitForLoadState();
      expect(await tab.evaluate(() => window.history.length)).toBe(1);
      await tab
        .getByRole('button', { name: 'Go back' })
        .click({ timeout: 60_000 });
      await expect(tab).toHaveURL(/\/$/);
    });

    test(`${skin}: the 404 screen goes back to the page before it`, async ({
      page,
    }) => {
      await useSkin(page, skin);
      await page.goto('/projects');
      await page.goto('/no-such-page');
      await page
        .getByRole('button', { name: 'Go back' })
        .click({ timeout: 60_000 });
      await expect(page).toHaveURL(/\/projects$/);
    });
  }
});

test.describe('Trade Home, with the pieces of the terminal turned off', () => {
  test('keeps the pipeline when the watchlist is off', async ({ page }) => {
    await useSkin(page, 'trade');
    await page.addInitScript(
      ([key]) =>
        localStorage.setItem(
          key,
          JSON.stringify({ watchlist: false, panel: true, tools: true }),
        ),
      [LAYOUT],
    );
    await gotoSkin(page, '/');
    await expect(watchlist(page)).toHaveCount(0);
    const idea = page.getByRole('region', {
      name: 'How a bug becomes a merge request',
    });
    await expect(idea).toBeVisible(SLOW);
    await expect(idea.getByRole('heading', { level: 3 })).toHaveCount(3);
    await expect(idea.getByText('Fix MR')).toBeVisible();
  });

  test('has the pipeline once, with the watchlist on', async ({ page }) => {
    await useSkin(page, 'trade');
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'How a bug becomes a merge request' }),
    ).toHaveCount(1);
    await expect(
      watchlist(page).getByText('How a bug becomes a merge request'),
    ).toHaveCount(0);
  });
});

test.describe('the chart cell tells what went wrong', () => {
  /** Fails the reads of `experience` while `failing.on`, so the next try can succeed. */
  const failExperience = async (page: Page) => {
    const state = { on: true };
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      const mine =
        state.on &&
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"experience"');
      return mine
        ? route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: '{"error":{"code":500,"status":"INTERNAL"}}',
          })
        : route.fallback();
    });
    return state;
  };

  test('an error is not an empty chart: it says so and Try again draws it', async ({
    page,
  }) => {
    await useSkin(page, 'trade');
    const state = await failExperience(page);
    await gotoSkin(page, '/about');
    const alert = page.locator('[data-state="error"]').first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Experience couldn't be loaded" }),
    ).toBeVisible();
    await expect(chart(page)).toHaveCount(0);
    state.on = false;
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/, SLOW);
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('with no role the cell says there is no experience and points to the projects', async ({
    page,
  }) => {
    await useSkin(page, 'trade');
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'experience' ? { ...doc, visible: false } : doc,
    );
    await gotoSkin(page, '/about');
    const notice = page.locator('[data-state="empty"]').first();
    await expect(notice).toBeVisible(SLOW);
    await expect(
      notice.getByRole('heading', { name: 'No experience to show yet' }),
    ).toBeVisible();
    await expect(
      notice.getByRole('link', { name: 'See my projects' }),
    ).toBeVisible();
    await expect(chart(page)).toHaveCount(0);
  });
});

test.describe('zooming the chart with the keys stops at its limits', () => {
  test('plus and minus never slide the chart once they cannot zoom any more', async ({
    page,
  }) => {
    await useSkin(page, 'trade');
    await gotoSkin(page, '/about');
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/, SLOW);
    // let the chart draw in and the live tick settle before measuring
    await page.waitForTimeout(1500);
    const bars = async () =>
      Number(await chart(page).getAttribute('data-candles'));
    const years = () =>
      chart(page).evaluate((svg) =>
        Array.from(svg.querySelectorAll('text'))
          .filter((t) => /^\d{4}$/.test(t.textContent ?? ''))
          .map(
            (t) =>
              `${t.textContent}@${Math.round(t.getBoundingClientRect().x)}`,
          )
          .join(' '),
      );
    await chart(page).focus();
    for (let i = 0; i < 40; i++) await page.keyboard.press('-');
    await expect.poll(bars).toBeGreaterThan(60);
    const widest = await bars();
    const wide = await years();
    for (let i = 0; i < 6; i++) await page.keyboard.press('-');
    await page.waitForTimeout(400);
    expect(await bars()).toBe(widest);
    expect(await years()).toBe(wide);
    for (let i = 0; i < 60; i++) await page.keyboard.press('=');
    await expect.poll(bars).toBeLessThan(widest / 3);
    await page.waitForTimeout(600);
    const closest = await bars();
    const near = await years();
    for (let i = 0; i < 6; i++) await page.keyboard.press('+');
    await page.waitForTimeout(400);
    expect(await bars()).toBe(closest);
    expect(await years()).toBe(near);
  });
});

test.describe('the Connect email row', () => {
  test('Copy confirms with Copied, has the keyboard order of a row and a visible ring', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await useSkin(page, 'trade');
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Connect' }).click();
    const win = page.locator('[data-slot="popover-content"]').filter({
      hasText: "Let's connect",
    });
    await expect(win).toBeVisible(SLOW);
    // the row is one block: the word Email, the address and the copy button side by side, one height
    const email = win.getByRole('link', { name: /bachbnt@gmail.com/ });
    const copy = win.getByRole('button', { name: 'Copy' });
    await expect(email).toContainText('Email');
    const [a, b] = await Promise.all([email.boundingBox(), copy.boundingBox()]);
    expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(1);
    expect(b!.x).toBeGreaterThanOrEqual(a!.x + a!.width - 1);

    await email.focus();
    await page.keyboard.press('Tab');
    await expect(copy).toBeFocused();
    const ring = await copy.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
    });
    expect(ring).toBe(true);
    await page.keyboard.press('Tab');
    await expect(win.getByRole('link', { name: /LinkedIn/ })).toBeFocused();

    await copy.click();
    await expect(win.getByRole('status')).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
    // the tip of the button is the HintTip, not the browser's title
    await expect(copy).not.toHaveAttribute('title', /.+/);
  });
});

test.describe('pages that are hidden or coming soon', () => {
  const live = {
    'site/live': { pages: { services: 'soon', certificates: 'hidden' } },
  };

  test('are not found by the symbol search, which finds the others', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, live);
    await useSkin(page, 'trade');
    await gotoSkin(page, '/');
    await page.keyboard.press('Control+k');
    const box = page.getByRole('combobox', { name: 'Search the whole site' });
    const list = page.getByRole('listbox', { name: 'Search results' });
    await box.fill('claude');
    // a certificate lives on a hidden page
    await expect(list.getByText('Claude Certified Architect')).toHaveCount(0);
    await box.fill('app development');
    // a service lives on a page that is coming soon
    await expect(
      list.getByRole('option', { name: /App Development/ }),
    ).toHaveCount(0);
    await box.fill('venus');
    await expect(list.getByRole('option', { name: /VenusAI/ })).toBeVisible();
  });

  test('are marked in the bar of the phone: a hidden one is absent and a soon one is not a link', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { services: 'soon', resume: 'hidden' } },
    });
    await useSkin(page, 'trade');
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    const bar = page.getByRole('navigation', { name: 'Quick links' });
    await expect(bar.getByRole('link', { name: 'Home' })).toBeVisible(SLOW);
    await expect(bar.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(bar.getByText('Resume')).toHaveCount(0);
    await expect(bar.getByText('Services')).toBeVisible();
    await expect(bar.getByText('Soon')).toBeVisible();
    await expect(bar.getByRole('link', { name: /Services/ })).toHaveCount(0);
  });
});
