/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const certs = (page: import('@playwright/test').Page) =>
  page.getByTestId('certificate');
const titles = (page: import('@playwright/test').Page) =>
  certs(page).evaluateAll((els) =>
    els.map((el) => el.querySelector('h2')?.textContent?.trim()),
  );

test.describe('the calendar', () => {
  test('is a timeline, newest first, with the Latest word on the newest and no label for a single year', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(certs(page)).toHaveCount(3);
    expect(await titles(page)).toEqual([
      'Claude Certified Architect - Professional',
      'Google Project Management Professional Certificate',
      'Google AI Professional Certificate',
    ]);
    await expect(certs(page).getByText('Latest')).toHaveCount(1);
    await expect(certs(page).first()).toContainText('Latest');
    await expect(page.getByText('3 of 3 certificates')).toBeVisible();
    // one year needs no label, and no bar for a single certificate
    await expect(page.getByRole('group', { name: '2026' })).toHaveCount(0);
    await expect(page.getByText('1 certificate', { exact: true })).toHaveCount(
      0,
    );
    // the rail names the day and the month of each one
    await expect(certs(page).first()).toContainText('31');
    await expect(certs(page).first()).toContainText('Oct 2026');
  });

  test('names the years when the certificates span more than one', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'certificates' && id === 'google-ai'
        ? { ...doc, issuedAt: '2025-04-30' }
        : doc,
    );
    await gotoSkin(page, '/certificates');
    const y2026 = page.getByRole('group', { name: '2026' });
    const y2025 = page.getByRole('group', { name: '2025' });
    await expect(y2026.getByTestId('certificate')).toHaveCount(2);
    await expect(y2025.getByTestId('certificate')).toHaveCount(1);
    await expect(y2026).toContainText('2 certificates');
    await expect(y2025).toContainText('1 certificate');
  });

  test('a card has the picture at a decent size, the issuer, the date, the skills and a primary Open PDF', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/certificates');
    const row = certs(page).first();
    await expect(row).toContainText('Issued Oct 31, 2026');
    await expect(row).toContainText('Anthropic');
    await expect(
      row.getByRole('list', { name: 'Skills covered' }),
    ).toContainText('MCP');
    const link = row.getByRole('link', { name: /Open PDF/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveCSS('background-color', 'rgb(41, 98, 255)');
    const thumb = row.getByRole('button', { name: /certificate$/ });
    const box = (await thumb.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(140);
    // the 4:3 frame is reserved, whatever the picture is
    expect(box.width / box.height).toBeCloseTo(4 / 3, 1);
  });

  test('the thumbnail and the card keep their place at every width', async ({
    page,
  }) => {
    for (const width of [1440, 1024, 800, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoSkin(page, '/certificates');
      await expect(certs(page)).toHaveCount(3);
      const [card, thumb, link] = await Promise.all([
        certs(page).first().locator('article').boundingBox(),
        certs(page)
          .first()
          .getByRole('button', { name: /certificate$/ })
          .boundingBox(),
        certs(page)
          .first()
          .getByRole('link', { name: /Open PDF/ })
          .boundingBox(),
      ]);
      // the thumbnail and the action sit inside the card
      expect(thumb!.x).toBeGreaterThanOrEqual(card!.x);
      expect(thumb!.x + thumb!.width).toBeLessThanOrEqual(
        card!.x + card!.width,
      );
      expect(link!.x + link!.width).toBeLessThanOrEqual(
        card!.x + card!.width + 1,
      );
      expect(link!.y + link!.height).toBeLessThanOrEqual(
        card!.y + card!.height,
      );
      expect(thumb!.width).toBeGreaterThanOrEqual(80);
    }
  });

  test('the picture opens the Standard preview, which steps through the certificates', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await certs(page).first().getByRole('button').click();
    const win = page.getByRole('dialog');
    await expect(win).toBeVisible();
    await expect(win.getByText('1 of 3')).toBeVisible();
    await expect(win.getByRole('link', { name: 'Open PDF' })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(win.getByText('2 of 3')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });

  test('sorts oldest first, filters by issuer and changes the density', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page.getByRole('button', { name: 'Oldest first' }).click();
    expect((await titles(page))[0]).toBe('Google AI Professional Certificate');
    await expect(
      page.getByRole('button', { name: 'Oldest first' }),
    ).toHaveAttribute('aria-pressed', 'true');
    const issuers = page.getByRole('group', { name: 'Filter by issuer' });
    await issuers.getByRole('button', { name: 'Anthropic' }).click();
    await expect(certs(page)).toHaveCount(1);
    await expect(page.getByText('1 of 3 certificates')).toBeVisible();
    await issuers.getByRole('button', { name: 'All', exact: true }).click();
    await expect(certs(page)).toHaveCount(3);
    await page.getByRole('button', { name: 'Comfortable' }).click();
    await expect(
      page.getByRole('button', { name: 'Comfortable' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('the feed', () => {
  test('is a card for each certificate with the picture, the date, the issuer and the skills', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page.getByRole('button', { name: 'Feed' }).click();
    await expect(certs(page)).toHaveCount(3);
    const card = certs(page).first();
    await expect(card).toContainText('Latest');
    await expect(card).toContainText('Issued Oct 31, 2026');
    await expect(card).toContainText('Enlarge');
    await expect(card.getByRole('link', { name: /Open PDF/ })).toBeVisible();
    await card
      .getByRole('button', {
        name: 'View Claude Certified Architect - Professional certificate',
      })
      .click();
    await expect(page.getByRole('dialog').getByText('1 of 3')).toBeVisible();
  });
});

test.describe('language and phone', () => {
  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await expect(page.getByRole('button', { name: 'Lịch' })).toBeVisible();
    await expect(page.getByText('3 / 3 chứng chỉ')).toBeVisible();
    await expect(page.getByText('Mới nhất').first()).toBeVisible();
    await expect(certs(page).first()).toContainText('31/10/2026');
  });

  for (const view of ['Calendar', 'Feed'])
    test(`${view} does not scroll the page sideways at 390px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoSkin(page, '/certificates');
      await page.getByRole('button', { name: view }).click();
      await expect(certs(page)).toHaveCount(3);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
      ).toBeLessThanOrEqual(0);
    });
});
