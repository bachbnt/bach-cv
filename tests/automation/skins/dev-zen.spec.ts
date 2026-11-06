/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

const light = (page: import('@playwright/test').Page, key: string) =>
  page.locator(`[data-slot="dev-dots"] [data-light="${key}"]`).first();

test.describe('the lights of the editor window', () => {
  test('all three are real buttons with a name', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('button', {
        name: 'Close the editor and return to the standard look',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Zen mode', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Full screen', exact: true }),
    ).toBeVisible();
  });

  test('yellow is Zen mode: the chrome goes away, the page stays, Esc and the light bring it back', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const chrome = [
      page.getByRole('navigation', { name: 'Main' }),
      page.getByRole('navigation', { name: 'Activity bar' }),
      page.locator('[data-slot="dev-minimap"]'),
      page.locator('#dv-explorer'),
      page.locator('[data-slot="dev-panel"]'),
    ];
    const statusBar = page.getByRole('button', { name: 'Terminal' }).last();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(statusBar).toBeVisible();

    await page.getByRole('button', { name: 'Zen mode', exact: true }).click();
    // the title bar and the page stay; the tabs, the activity bar, the Explorer and the status bar do not
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Leave Zen mode' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await expect(page.locator('#dv-explorer')).toBeHidden();
    await expect(statusBar).toBeHidden();
    for (const part of chrome) await expect(part).toBeHidden();
    // a hint says how to leave
    await expect(page.getByText('Zen mode. Press Esc to leave.')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(statusBar).toBeVisible();
    await expect(page.locator('#dv-explorer')).toBeVisible();

    // and the light itself leaves it
    await page.getByRole('button', { name: 'Zen mode', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await page.getByRole('button', { name: 'Leave Zen mode' }).click();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  });

  test('Zen mode keeps what the terminal had, and the page still works in it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Terminal', exact: true })
      .last()
      .click();
    const input = page.getByRole('textbox', { name: 'Terminal command line' });
    await expect(input).toBeVisible();
    await input.fill('help');
    await input.press('Enter');
    await expect(page.getByRole('log', { name: 'Terminal' })).toContainText(
      'help',
    );

    await page.getByRole('button', { name: 'Zen mode', exact: true }).click();
    await expect(page.locator('[data-slot="dev-panel"]')).toBeHidden();
    await page.keyboard.press('Escape');
    // the panel opens again with its scrollback: nothing was thrown away
    await expect(page.getByRole('log', { name: 'Terminal' })).toContainText(
      'help',
    );
  });

  test('Esc closes a window that is open before it leaves Zen mode', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Zen mode', exact: true }).click();
    await page.getByRole('button', { name: 'Ask BB Bot' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    // Zen mode is still on
    await expect(
      page.getByRole('button', { name: 'Leave Zen mode' }),
    ).toBeVisible();
  });

  test('green asks the browser for full screen and back', async ({ page }) => {
    await page.addInitScript(() => {
      // headless Chrome has no real full screen: a stand-in that behaves like the API
      let element: Element | null = null;
      Object.defineProperty(document, 'fullscreenEnabled', { get: () => true });
      Object.defineProperty(document, 'fullscreenElement', {
        get: () => element,
      });
      Element.prototype.requestFullscreen = () => {
        element = document.documentElement;
        document.dispatchEvent(new Event('fullscreenchange'));
        return Promise.resolve();
      };
      document.exitFullscreen = () => {
        element = null;
        document.dispatchEvent(new Event('fullscreenchange'));
        return Promise.resolve();
      };
    });
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Full screen', exact: true })
      .click();
    const exit = page.getByRole('button', { name: 'Exit full screen' });
    await expect(exit).toBeVisible();
    await expect(light(page, 'max')).toHaveAttribute(
      'aria-label',
      'Exit full screen',
    );
    await exit.click();
    await expect(
      page.getByRole('button', { name: 'Full screen', exact: true }),
    ).toBeVisible();
  });

  test('green is grey when the browser cannot do full screen', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        get: () => false,
      });
    });
    await gotoSkin(page, '/');
    // not a button: a grey light that does nothing
    await expect(
      page.getByRole('button', { name: /full screen/i }),
    ).toHaveCount(0);
    await expect(light(page, 'max')).toHaveCount(1);
    await expect(light(page, 'max')).toHaveJSProperty('tagName', 'I');
  });

  test('red goes back to the standard look', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', {
        name: 'Close the editor and return to the standard look',
      })
      .click();
    await expect(page.locator('html')).not.toHaveAttribute('data-skin', 'dev');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'I lead mobile teams',
    );
    await expect(page.locator('[data-slot="dev-dots"]')).toHaveCount(0);
    // the choice is kept, as with the Skin menu
    expect(
      await page.evaluate(() => localStorage.getItem('bach-cv-skin')),
    ).toBe('standard');
  });

  test('the lights are named in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('button', { name: 'Chế độ Zen', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Toàn màn hình', exact: true }),
    ).toBeVisible();
  });
});
