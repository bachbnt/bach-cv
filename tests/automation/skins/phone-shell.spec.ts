/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

// The frame of the Phone skin: the home screen and the apps, the rail of a tablet, the quick settings shade that holds the three menus, and
// the states of the frame (404, Coming soon, hidden, maintenance). The device that folds and the system gestures are in phone-fold.spec.ts;
// what each page tells is checked by the spec of its area.

const APPS = [
  ['/about', 'About'],
  ['/resume', 'Resume'],
  ['/projects', 'Projects'],
  ['/certificates', 'Certificates'],
  ['/services', 'Services'],
  ['/payment', 'Payment'],
] as const;

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('the home screen and the apps', () => {
  test('the home screen has an app for every page but Home, with the Standard names', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'phone');
    for (const [href, name] of APPS)
      await expect(
        page.getByRole('link', { name, exact: true }).first(),
      ).toHaveAttribute('href', href);
  });

  for (const [href, name] of APPS)
    test(`${name} opens as an app with its large title, and the way back leads to the home screen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoSkin(page, href);
      await expect(
        page.getByRole('heading', { level: 1 }).first(),
      ).toBeVisible();
      await page
        .getByRole('link', { name: 'Home', exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(/\/$/);
    });

  test('a tablet has the rail of the apps at the side of the open one, and the open one is marked', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
    await gotoSkin(page, '/projects');
    const rail = page.getByRole('navigation', { name: 'Main' });
    await expect(rail.getByRole('link')).toHaveCount(7);
    await expect(rail.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await rail.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('has no horizontal scroll on any page at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const path of ['/', ...APPS.map(([href]) => href)]) {
      await gotoSkin(page, path);
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('the quick settings shade', () => {
  test('holds Language, Skin and Theme with the names Standard gives them, and the skin row leads back to Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Quick settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Settings' });
    for (const name of [/^Language: English$/, /^Skin: Phone$/, /^Theme$/])
      await expect(sheet.getByRole('button', { name })).toHaveCount(1);
    // the actions of the dock are here too
    for (const name of ['Ask BB Bot', 'Connect', 'Download CV'])
      await expect(sheet.getByRole('button', { name })).toBeVisible();
    await sheet.getByRole('button', { name: /^Skin: Phone$/ }).click();
    await sheet.getByRole('radio', { name: /Standard/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-skin',
      'phone',
    );
  });

  test('changes the language and the theme, and says them in Vietnamese afterwards', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Quick settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Settings' });
    await sheet.getByRole('button', { name: /^Language: English$/ }).click();
    await sheet.getByRole('radio', { name: /Tiếng Việt/ }).click();
    // the sheet is named in the new language
    const vi = page.getByRole('dialog', { name: 'Cài đặt' });
    await expect(vi).toBeVisible();
    await expect(
      vi.getByRole('button', { name: /^Ngôn ngữ: Tiếng Việt$/ }),
    ).toBeVisible();
    await expect(
      vi.getByRole('button', { name: /^Skin: Điện thoại$/ }),
    ).toBeVisible();
    await vi.getByRole('button', { name: /^Giao diện$/ }).click();
    await vi.getByRole('radio', { name: /Tối/ }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.keyboard.press('Escape');
    await expect(vi).toHaveCount(0);
  });

  test('hangs from the top of the screen and is closed by a tap outside it, and by the handle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Quick settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Settings' });
    await expect(sheet).toBeVisible();
    // it arrives with a short slide: measure it once it has stopped
    await page.waitForTimeout(450);
    expect((await sheet.boundingBox())?.y).toBe(0);
    await page.mouse.click(195, 800);
    await expect(sheet).toHaveCount(0);
    await page.getByRole('button', { name: 'Quick settings' }).click();
    await page.getByRole('button', { name: 'Close quick settings' }).click();
    await expect(sheet).toHaveCount(0);
  });

  test('an action in it closes it and opens its own sheet', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Quick settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Settings' });
    await sheet.getByRole('button', { name: 'Connect' }).click();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(1);
  });

  test('is closed with Esc and gives the focus back to the status bar', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const trigger = page.getByRole('button', { name: 'Quick settings' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe('the states of the frame', () => {
  test('a path that is not a page is the 404 screen inside the frame', async ({
    page,
  }) => {
    await gotoSkin(page, '/nowhere');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Quick settings' }),
    ).toBeVisible();
  });

  test('a page that is `soon` shows Coming soon and is not a link, a hidden one is not there and is a 404', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
    await mockFirestore(page, {
      'site/live': { pages: { services: 'soon', payment: 'hidden' } },
    });
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    const rail = page.getByRole('navigation', { name: 'Main' });
    await expect(rail.getByRole('link', { name: /^Services/ })).toHaveCount(0);
    await expect(rail.getByRole('link', { name: 'Payment' })).toHaveCount(0);
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
  });

  test('maintenance replaces the whole frame', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': {
        maintenance: { enabled: true, message: 'Back in an hour.' },
      },
    });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { level: 1, name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(page.getByText('Back in an hour.')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Quick settings' }),
    ).toHaveCount(0);
  });

  test('the owner can fix the skin, the language and the theme: the shade leaves those tiles out', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        prefs: {
          skin: { force: 'phone' },
          theme: { force: 'dark' },
          language: { force: 'en' },
        },
      },
    });
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Quick settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Settings' });
    await expect(sheet).toBeVisible();
    for (const name of [/^Language/, /^Skin/, /^Theme/])
      await expect(sheet.getByRole('button', { name })).toHaveCount(0);
  });
});

test.describe('an app that opens from its icon stays inside the display of the device', () => {
  for (const fold of ['open', 'folded'] as const)
    test(`${fold}: the icon grows into the screen, and the page change is clipped to the display, on the way in and on the way back`, async ({
      page,
      context,
    }) => {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        ['bach-cv-phone-fold', fold],
      );
      await page.setViewportSize({ width: 1440, height: 900 });
      // the first visit of a page compiles it, which a slowed animation would wait for
      await gotoSkin(page, '/projects');
      await page.waitForTimeout(600);
      await gotoSkin(page, '/');
      await page.waitForTimeout(600);
      const display = await page.locator('.ph-display').boundingBox();
      if (!display) throw new Error('no display');
      const cdp = await context.newCDPSession(page);
      await cdp.send('Animation.enable');

      /** What the group of the app is while a page change runs: where it is and how big, and the clip of the whole transition. */
      const sample = () =>
        page.evaluate(() => {
          const root = document.documentElement;
          const group = getComputedStyle(
            root,
            '::view-transition-group(ph-app-projects)',
          );
          const whole = getComputedStyle(root, '::view-transition');
          const matrix = new DOMMatrixReadOnly(group.transform);
          return {
            // before the first frame of the transition the group has no transform yet: there is nothing to look at
            moving: group.transform !== 'none',
            width: parseFloat(group.width),
            height: parseFloat(group.height),
            left: matrix.m41,
            top: matrix.m42,
            clip: whole.clipPath,
          };
        });
      const watch = async (act: () => Promise<void>) => {
        await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.05 });
        await act();
        const seen = [];
        // a loaded machine may start the transition late: look until eight samples are in, for as long as the slowed animation can last
        for (let i = 0; i < 40 && seen.length < 8; i++) {
          await page.waitForTimeout(250);
          const now = await sample();
          if (now.moving && Number.isFinite(now.width)) seen.push(now);
        }
        await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
        expect(seen.length).toBeGreaterThan(0);
        for (const now of seen) {
          expect(now.clip).not.toBe('none');
          expect(now.left).toBeGreaterThanOrEqual(display.x - 1);
          expect(now.top).toBeGreaterThanOrEqual(display.y - 1);
          expect(now.left + now.width).toBeLessThanOrEqual(
            display.x + display.width + 1,
          );
          expect(now.top + now.height).toBeLessThanOrEqual(
            display.y + display.height + 1,
          );
        }
      };

      await watch(() =>
        page
          .getByRole('link', { name: 'Projects', exact: true })
          .first()
          .click(),
      );
      await expect(page).toHaveURL(/\/projects$/);
      await page.waitForTimeout(800);
      await watch(() =>
        page
          .locator('[data-ph-app-bar]')
          .getByRole('link', { name: 'Home' })
          .click(),
      );
      await expect(page).toHaveURL(/\/$/);
    });
});
