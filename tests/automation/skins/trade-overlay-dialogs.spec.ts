/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';

/** The first visit to a page compiles it in the dev server, which is slow when the machine is busy. */
const SLOW = { timeout: 30_000 };

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
  await servePayments(page, allOn());
});

const openScreenshots = async (page: Page) => {
  await gotoSkin(page, '/projects');
  const opener = page.getByRole('button', { name: '7 screenshots' }).first();
  await opener.click();
  return opener;
};

test.describe('the dialog of the skin', () => {
  test('is a dark panel with a 1px border, a title bar with the close button, and the focus stays inside', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await openScreenshots(page);
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win).toBeVisible();
    await expect(win).toHaveAttribute('data-slot', 'tv-dialog');
    await expect(win).toHaveCSS('border-top-width', '1px');
    await expect(win).toHaveCSS('background-color', 'rgb(30, 34, 45)');
    await expect(
      win.getByRole('button', { name: 'Close screenshots' }),
    ).toBeVisible();
    for (let i = 0; i < 40; i += 1) await page.keyboard.press('Tab');
    expect(
      await page.evaluate(
        () =>
          document.activeElement?.closest('[data-slot="tv-dialog"]') !== null,
      ),
    ).toBe(true);
  });

  test('opens with a quick scale and fade, and with none for reduced motion', async ({
    page,
  }) => {
    await openScreenshots(page);
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win).toHaveCSS('transition-property', /opacity/);
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: '7 screenshots' }).first().click();
    await expect(page.getByRole('dialog', { name: 'VenusAI' })).toHaveCSS(
      'transition-property',
      'none',
    );
  });
});

test.describe('the picture viewer', () => {
  test('shows the screenshots with a toolbar, a counter, a strip of thumbnails and the arrow keys', async ({
    page,
  }) => {
    const opener = await openScreenshots(page);
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(
      win.getByRole('toolbar', { name: 'Picture tools' }),
    ).toBeVisible();
    await expect(win.getByText('1 of 7')).toBeVisible();
    const strip = win.getByRole('group', { name: 'All screenshots' });
    await expect(strip.getByRole('button')).toHaveCount(7);
    await expect(strip.getByRole('button').first()).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.keyboard.press('ArrowRight');
    await expect(win.getByText('2 of 7')).toBeVisible();
    await expect(strip.getByRole('button').nth(1)).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(win.getByText('7 of 7')).toBeVisible();
    await strip.getByRole('button', { name: 'Go to screenshot 4' }).click();
    await expect(win.getByText('4 of 7')).toBeVisible();
    await win.getByRole('button', { name: 'Next screenshot' }).click();
    await expect(win.getByText('5 of 7')).toBeVisible();
    await win.getByRole('button', { name: 'Previous screenshot' }).click();
    await expect(win.getByText('4 of 7')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('zooms in and out, fits again, and zooms with the keys', async ({
    page,
  }) => {
    await openScreenshots(page);
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    const level = win.getByRole('img', { name: /^Zoom \d+%$/ });
    await expect(level).toHaveText('100%');
    await expect(win.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    await expect(
      win.getByRole('button', { name: 'Fit to window' }),
    ).toBeDisabled();
    const picture = win.locator('img[alt^="VenusAI screenshot"]');
    const fit = (await picture.boundingBox())!.width;
    await win.getByRole('button', { name: 'Zoom in' }).click();
    await expect(level).toHaveText('150%');
    await expect
      .poll(async () => (await picture.boundingBox())!.width)
      .toBeGreaterThan(fit);
    await page.keyboard.press('+');
    await expect(level).toHaveText('200%');
    await page.keyboard.press('-');
    await expect(level).toHaveText('150%');
    await win.getByRole('button', { name: 'Fit to window' }).click();
    await expect(level).toHaveText('100%');
    await page.keyboard.press('+');
    await page.keyboard.press('0');
    await expect(level).toHaveText('100%');
    // another picture starts at the size that fits
    await page.keyboard.press('+');
    await page.keyboard.press('ArrowRight');
    await expect(level).toHaveText('100%');
  });

  test('a certificate has the Open PDF action in the toolbar and steps through the certificates', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', { name: /certificate$/ })
      .first()
      .click();
    const win = page.getByRole('dialog');
    await expect(win).toBeVisible();
    await expect(win.getByText('1 of 3')).toBeVisible();
    await expect(
      win.getByRole('toolbar').getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('target', '_blank');
    // one picture, so no strip of thumbnails
    await expect(win.getByRole('group')).toHaveCount(0);
    await page.keyboard.press('ArrowRight');
    await expect(win.getByText('2 of 3')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await page
      .getByRole('button', { name: '7 ảnh chụp màn hình' })
      .first()
      .click();
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win.getByRole('button', { name: 'Phóng to' })).toBeVisible();
    await expect(
      win.getByRole('toolbar', { name: 'Công cụ xem ảnh' }),
    ).toBeVisible();
    await expect(win.getByText('1 / 7')).toBeVisible();
  });
});

test.describe('the QR window', () => {
  test('is a deposit dialog: the QR, the account name and number, Copy, Copy all and Save QR', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(win).toBeVisible();
    await expect(
      win.getByRole('img', { name: 'BIDV payment QR code' }),
    ).toBeVisible();
    await expect(win.getByText('NGUYEN VAN A')).toBeVisible();
    await expect(win.getByText('1234567890')).toBeVisible();
    const toast = page.getByTestId('payment-toast');
    await win.getByRole('button', { name: 'Copy number' }).click();
    await expect(toast).toContainText('BIDV account number copied');
    await win.getByRole('button', { name: 'Copy all details' }).click();
    await expect(toast).toContainText('BIDV details copied');
    const popup = page
      .context()
      .waitForEvent('page', { timeout: 15_000 })
      .catch(() => null);
    const download = page
      .waitForEvent('download', { timeout: 15_000 })
      .catch(() => null);
    await win.getByRole('button', { name: 'Save QR' }).click();
    // the picture is saved, or opened in a new tab where the browser refuses: the toast says which
    await expect(toast).toContainText(/QR code saved|Opened the QR image/);
    await Promise.all([popup, download]);
  });

  test('steps through the methods that have a QR and closes with Esc, giving the focus back', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    const opener = page.getByRole('button', { name: 'Enlarge BIDV QR code' });
    await opener.click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(win.getByText(/^1 of \d+$/)).toBeVisible();
    await win.getByRole('button', { name: 'Next method' }).click();
    const next = page.getByRole('dialog', { name: 'MoMo QR code' });
    await expect(next.getByText(/^2 of \d+$/)).toBeVisible();
    await next.getByRole('button', { name: 'Previous method' }).click();
    await expect(
      page.getByRole('dialog', { name: 'BIDV QR code' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  for (const [name, width, height] of [
    ['a laptop', 1440, 900],
    ['a short laptop', 1280, 600],
    ['a phone', 390, 800],
    ['a short phone', 360, 640],
  ] as const)
    test(`keeps the ratio of the picture and fits the window without scrolling on ${name}`, async ({
      page,
    }) => {
      // the real pictures are bank cards, taller than they are wide: serve one of that shape (306 x 400)
      await page.context().route('**/qr-bidv-v2.jpg', (route) =>
        route.fulfill({
          status: 200,
          headers: { 'access-control-allow-origin': '*' },
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="306" height="400"><rect width="306" height="400" fill="#1e3a8a"/><rect x="30" y="60" width="246" height="280" rx="16" fill="#fff"/></svg>',
        }),
      );
      await page.setViewportSize({ width, height });
      await gotoSkin(page, '/payment');
      await page
        .getByRole('button', { name: 'Enlarge BIDV QR code' })
        .first()
        .click();
      const win = page.getByRole('dialog', { name: 'BIDV QR code' });
      const picture = win.getByTestId('tv-qr-picture');
      await expect(picture).toBeVisible();
      await expect
        .poll(() =>
          picture.evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBe(306);
      const shown = (await picture.boundingBox())!;
      expect(shown.width / shown.height).toBeCloseTo(306 / 400, 2);
      // as large as the window allows: neither the window nor its body scrolls, and the picture is not a thumbnail
      const body = await picture.evaluate((img) => {
        let el = img.parentElement;
        while (el && getComputedStyle(el).overflowY !== 'auto')
          el = el.parentElement;
        return el ? el.scrollHeight - el.clientHeight : -1;
      });
      expect(body).toBeLessThanOrEqual(0);
      const frame = (await win.boundingBox())!;
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.y + frame.height).toBeLessThanOrEqual(height + 1);
      expect(shown.height).toBeGreaterThanOrEqual(Math.min(280, height * 0.35));
      await expect(win.getByRole('button', { name: 'Save QR' })).toBeVisible();
    });

  test('has the toolbar of the viewer: zoom, Copy number, Copy all details, Save QR and the way through the methods', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    const bar = win.getByRole('toolbar', { name: 'Picture tools' });
    for (const name of [
      'Zoom out',
      'Zoom in',
      'Fit to window',
      'Copy number',
      'Copy all details',
      'Save QR',
      'Previous method',
      'Next method',
    ])
      await expect(bar.getByRole('button', { name })).toBeVisible();
    await expect(bar.getByText(/^1 of \d+$/)).toBeVisible();
    // the account name and number stay under the picture
    await expect(win.getByText('NGUYEN VAN A')).toBeVisible();
    // zoom, with the buttons and the keys of the viewer
    const level = bar.getByRole('img', { name: /^Zoom \d+%$/ });
    const picture = win.getByTestId('tv-qr-picture');
    const fit = (await picture.boundingBox())!.width;
    await bar.getByRole('button', { name: 'Zoom in' }).click();
    await expect(level).toHaveText('150%');
    await expect
      .poll(async () => (await picture.boundingBox())!.width)
      .toBeGreaterThan(fit);
    await page.keyboard.press('+');
    await expect(level).toHaveText('200%');
    await page.keyboard.press('0');
    await expect(level).toHaveText('100%');
    await expect(
      bar.getByRole('button', { name: 'Fit to window' }),
    ).toBeDisabled();
    // the arrow keys step through the methods, and a new method starts at the size that fits
    await page.keyboard.press('+');
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('dialog', { name: 'MoMo QR code' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('dialog', { name: 'MoMo QR code' })
        .getByRole('img', { name: 'Zoom 100%' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(
      page.getByRole('dialog', { name: 'BIDV QR code' }),
    ).toBeVisible();
  });

  test('is a sheet at the bottom edge on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await gotoSkin(page, '/payment');
    await page
      .getByRole('button', { name: /^Enlarge .* QR code$/ })
      .first()
      .click();
    const win = page.getByRole('dialog', { name: /QR code$/ });
    await expect(win).toBeVisible();
    const box = (await win.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(388);
    expect(box.y + box.height).toBeGreaterThan(790);
    await expect(win.getByRole('button', { name: 'Save QR' })).toBeVisible();
  });
});

test.describe('the CV window', () => {
  const toolbar = (page: Page) =>
    page.getByRole('toolbar', { name: 'CV tools' });

  test('opens from Download CV with the sheets, the page counter and the zoom, and Esc closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const button = page
      .getByRole('banner')
      .getByRole('button', { name: 'Download CV' });
    await button.click();
    const win = page.getByRole('dialog', { name: /CV$/ });
    await expect(win).toBeVisible();
    await expect(win).toHaveAttribute('data-slot', 'tv-dialog');
    const bar = toolbar(page);
    await expect(bar.getByRole('button', { name: 'Download PDF' })).toBeEnabled(
      SLOW,
    );
    await expect(bar.getByText(/^Page 1 of \d+$/)).toBeVisible(SLOW);
    await expect(win.getByRole('region', { name: 'CV preview' })).toBeVisible();
    await expect(win.getByRole('region', { name: /^Page 1 of/ })).toBeVisible();

    const level = bar.getByRole('img', { name: /^Zoom \d+%$/ });
    await expect(level).toHaveText('100%');
    const sheet = win.locator('section[aria-label^="Page 1"]');
    const fit = (await sheet.boundingBox())!.width;
    await bar.getByRole('button', { name: 'Zoom in' }).click();
    await expect(level).toHaveText('125%');
    await expect
      .poll(async () => (await sheet.boundingBox())!.width)
      .toBeGreaterThan(fit + 20);
    await bar.getByRole('button', { name: 'Zoom out' }).click();
    await bar.getByRole('button', { name: 'Zoom out' }).click();
    await expect(level).toHaveText('75%');
    await bar.getByRole('button', { name: 'Fit to window' }).click();
    await expect(level).toHaveText('100%');
    // the keys of the picture viewer zoom the sheets too (the desk has the focus, as for a visitor who tabbed to it)
    await win.getByRole('region', { name: 'CV preview' }).focus();
    await page.keyboard.press('+');
    await expect(level).toHaveText('125%');
    await page.keyboard.press('-');
    await page.keyboard.press('-');
    await expect(level).toHaveText('75%');
    await page.keyboard.press('0');
    await expect(level).toHaveText('100%');

    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the page counter follows the scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await gotoSkin(page, '/about');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Download CV' })
      .click();
    const win = page.getByRole('dialog', { name: /CV$/ });
    await expect(toolbar(page).getByText(/^Page 1 of \d+$/)).toBeVisible(SLOW);
    await win.getByRole('region', { name: 'CV preview' }).evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(toolbar(page).getByText(/^Page [2-9] of \d+$/)).toBeVisible();
  });

  test('Download PDF makes the PDF of Standard', async ({ page }) => {
    await gotoSkin(page, '/about');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Download CV' })
      .click();
    const button = toolbar(page).getByRole('button', { name: 'Download PDF' });
    await expect(button).toBeEnabled(SLOW);
    const download = page.waitForEvent('download', { timeout: 60_000 });
    await button.click();
    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('shows the error with Try again when the data cannot be read', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      const request = route.request();
      if (
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"certificates"')
      )
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        });
      return route.fallback();
    });
    await gotoSkin(page, '/about');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Download CV' })
      .click();
    const win = page.getByRole('dialog');
    await expect(
      win.getByRole('heading', { name: "The CV couldn't be loaded" }),
    ).toBeVisible(SLOW);
    await expect(win.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(
      win.getByRole('button', { name: 'Download PDF' }),
    ).toBeDisabled();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/about');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Tải CV' })
      .click();
    const win = page.getByRole('dialog');
    await expect(win.getByRole('button', { name: 'Tải PDF' })).toBeEnabled(
      SLOW,
    );
    await expect(win.getByText(/^Trang 1 \/ \d+$/)).toBeVisible(SLOW);
    await expect(win.getByRole('button', { name: 'Đóng' })).toBeVisible();
    await expect(win.getByRole('button', { name: 'Phóng to' })).toBeVisible();
  });

  test('fills the screen on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await gotoSkin(page, '/about');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Download CV' })
      .click();
    const win = page.getByRole('dialog', { name: /CV$/ });
    await expect(win).toBeVisible();
    const box = (await win.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(388);
    expect(box.height).toBeGreaterThanOrEqual(798);
    await expect(toolbar(page).getByText(/^Page 1 of \d+$/)).toBeVisible(SLOW);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe('the Connect popover', () => {
  test('keeps working and has the frame of the dialogs', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Connect' }).click();
    const win = page.locator('[data-slot="popover-content"]').filter({
      hasText: "Let's connect",
    });
    await expect(
      win.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(win).toHaveCSS('border-top-width', '1px');
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });
});
