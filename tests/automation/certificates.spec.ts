/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test('the latest certificate is featured and the others are in a grid, with skill names from the skills collection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/certificates');

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
  await page.goto('/certificates');
  const link = page
    .getByTestId('certificate')
    .first()
    .getByRole('link', { name: 'Open PDF' });
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(link).toHaveAttribute('href', /\.pdf$/);
  await expect(link).not.toHaveAttribute('download', /.*/);
});

test('the preview dialog shows the certificate and steps with the buttons and the arrow keys', async ({
  page,
}) => {
  await page.goto('/certificates');
  const opener = page
    .getByTestId('certificate')
    .first()
    .getByRole('button', { name: /View Claude Certified Architect/ });
  await opener.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', {
      name: 'Claude Certified Architect - Professional',
    }),
  ).toBeVisible();
  await expect(dialog).toContainText('Anthropic, issued Oct 31, 2026');
  await expect(dialog.getByText('1 of 3')).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Open PDF' })).toHaveAttribute(
    'target',
    '_blank',
  );

  await dialog.getByRole('button', { name: 'Next certificate' }).click();
  await expect(
    dialog.getByRole('heading', {
      name: 'Google Project Management Professional Certificate',
    }),
  ).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(
    dialog.getByRole('heading', { name: 'Google AI Professional Certificate' }),
  ).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('1 of 3')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByText('3 of 3')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('on a phone the page does not scroll sideways and the preview is a bottom sheet', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/certificates');
  await expect(page.getByTestId('certificate')).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page
    .getByRole('button', { name: /View Google AI Professional/ })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect
    .poll(async () => (await dialog.boundingBox())?.width)
    .toBeCloseTo(390, 0);
  await expect
    .poll(async () => {
      const box = await dialog.boundingBox();
      return box ? box.y + box.height : 0;
    })
    .toBeCloseTo(844, 0);
});

test('in Vietnamese the page, the dates and the preview are translated', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await page.goto('/certificates');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Chứng chỉ' }),
  ).toBeVisible();
  const first = page.getByTestId('certificate').first();
  await expect(first).toContainText('Mới nhất');
  await expect(first).toContainText('Cấp ngày 31/10/2026');
  await expect(first.getByRole('link', { name: 'Mở PDF' })).toBeVisible();

  await first.getByRole('button', { name: 'Xem chứng chỉ' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Anthropic, cấp ngày 31/10/2026');
  await expect(dialog.getByText('1 / 3')).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Chứng chỉ tiếp theo' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Đóng xem trước' }),
  ).toBeVisible();
});

test('the Open PDF buttons of the cards in a row line up at the bottom, whatever the title length', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/certificates');
  const cards = page.getByTestId('certificate');
  await expect(cards).toHaveCount(3);

  // the two grid cards are in one row; one title wraps to two lines and the other does not.
  // The cards slide in when they appear, so wait until the positions settle.
  const bottoms = async () =>
    Promise.all(
      [1, 2].map(async (index) => {
        const link = cards.nth(index).getByRole('link', { name: /open pdf/i });
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
