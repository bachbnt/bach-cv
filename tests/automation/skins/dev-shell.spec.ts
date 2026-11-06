/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

test.describe('the editor window', () => {
  test('has a tab and a file for every page, and the open one is marked', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const tabs = page.getByRole('navigation', { name: 'Main' });
    await expect(tabs.getByRole('link')).toHaveCount(7);
    await expect(
      tabs.getByRole('link', { name: /Projects\.py/ }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      page
        .getByRole('complementary', { name: 'Explorer' })
        .getByRole('link', { name: /Projects\.py/ }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('the Explorer, its folders and the project folder can be shut, and stay shut on the next page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const explorer = page.getByRole('complementary', { name: 'Explorer' });
    const project = explorer.locator('summary', { hasText: 'BACHBNTDEV' });
    await project.click();
    await expect(
      explorer.getByRole('link', { name: /Home\.java/ }),
    ).toBeHidden();
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /About\.js/ })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      explorer.getByRole('link', { name: /Home\.java/ }),
    ).toBeHidden();
    await project.click();
    await expect(
      explorer.getByRole('link', { name: /About\.js/ }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Explorer' }).click();
    await expect(explorer).toBeHidden();
  });

  test('the status bar names the language of the file and the panel opens from it', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(page.getByText('{ } Kotlin')).toBeVisible();
    await page.getByRole('button', { name: 'Terminal' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Terminal command line' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Terminal command line' }),
    ).toBeHidden();
  });

  test('the menus of the title bar change the language and the theme', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Language' }).click();
    await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
    await expect(page.getByRole('button', { name: 'Ngôn ngữ' })).toBeVisible();
    await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
    await page.getByRole('menuitemradio', { name: /Tối|Dark/ }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

/** Waits for the entrance animation to end, so a measured box is not scaled. */
const settled = (locator: Locator) =>
  expect
    .poll(() =>
      locator.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === 'running').length,
      ),
    )
    .toBe(0);

test.describe('Connect, in the account palette', () => {
  const connect = (page: Page) =>
    page.getByRole('dialog', { name: "Let's connect" });
  const box = (page: Page) =>
    page.locator('[data-slot="dev-connect-palette"] > div');
  const openConnect = async (page: Page) => {
    await gotoSkin(page, '/');
    const trigger = page.getByRole('button', { name: /^Account/ });
    await trigger.click();
    await expect(connect(page)).toBeVisible();
    await settled(connect(page));
    return trigger;
  };

  test('has the same content as the Connect menu of the Standard header', async ({
    page,
  }) => {
    await openConnect(page);
    const win = connect(page);
    await expect(
      win.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    for (const name of ['LinkedIn', 'GitHub', 'Telegram', 'Facebook']) {
      await expect(
        win.getByRole('link', { name: new RegExp(name) }),
      ).toBeVisible();
    }
    // a contact that is switched off is not listed
    await expect(win.getByRole('link', { name: /GitLab|Skype/ })).toHaveCount(
      0,
    );
    await expect(win.getByText('Professional')).toBeVisible();
    await expect(win.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await expect(win.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  test('is a small box at the bottom left, by the account button', async ({
    page,
  }) => {
    await openConnect(page);
    const b = (await box(page).boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(b.x).toBeLessThan(120);
    expect(b.width).toBeLessThanOrEqual(430);
    expect(b.y + b.height).toBeGreaterThan(viewport.height - 80);
    expect(b.y + b.height).toBeLessThanOrEqual(viewport.height);
  });

  test('Copy puts the email on the clipboard, Escape closes it and gives the focus back', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const trigger = await openConnect(page);
    await page.getByRole('button', { name: 'Copy' }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
    await page.keyboard.press('Escape');
    await expect(connect(page)).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a click outside closes it and the account button opens it again', async ({
    page,
  }) => {
    const trigger = await openConnect(page);
    await page.mouse.click(900, 300);
    await expect(connect(page)).toBeHidden();
    await trigger.click();
    await expect(connect(page)).toBeVisible();
  });

  test('typing filters the contacts and says so when none matches', async ({
    page,
  }) => {
    await openConnect(page);
    const win = connect(page);
    const filter = win.getByRole('textbox');
    await expect(filter).toBeFocused();
    await filter.fill('git');
    await expect(win.getByRole('link', { name: /GitHub/ })).toBeVisible();
    await expect(win.getByRole('link', { name: /LinkedIn/ })).toHaveCount(0);
    await expect(win.getByText('Messaging')).toHaveCount(0);
    await filter.fill('zzz');
    await expect(win.getByText('No contact matches')).toBeVisible();
    await filter.fill('');
    await expect(win.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
  });

  test('the arrow keys go through the contacts and back to the filter line', async ({
    page,
  }) => {
    await openConnect(page);
    const win = connect(page);
    await page.keyboard.press('ArrowDown');
    await expect(
      win.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(win.getByRole('button', { name: 'Copy' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(win.getByRole('link', { name: /LinkedIn/ })).toBeFocused();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowUp');
    await expect(win.getByRole('textbox')).toBeFocused();
  });

  test('with the bottom panel open the account button and the box stay above the panel', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Terminal' }).click();
    const panel = page.getByText('Type help to see the commands.');
    await expect(panel).toBeVisible();
    const panelTop = (await panel.boundingBox())!.y;
    const trigger = page.getByRole('button', { name: /^Account/ });
    const button = (await trigger.boundingBox())!;
    expect(button.y + button.height).toBeLessThanOrEqual(panelTop);
    await trigger.click();
    await expect(connect(page)).toBeVisible();
    await settled(connect(page));
    const b = (await box(page).boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(panelTop);
  });

  test('the account button is only a picture when the Connect switch is off', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { features: { connectMenu: false } },
    });
    await gotoSkin(page, '/');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Account/ })).toHaveCount(0);
    await expect(connect(page)).toHaveCount(0);
  });

  test('opens with an empty filter line again', async ({ page }) => {
    const trigger = await openConnect(page);
    await connect(page).getByRole('textbox').fill('git');
    await page.keyboard.press('Escape');
    await trigger.click();
    await expect(connect(page).getByRole('textbox')).toHaveValue('');
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('the burger opens the Explorer as a drawer and a tap outside shuts it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const drawer = page.getByRole('complementary', { name: 'Explorer' });
    await expect(drawer).not.toBeInViewport();
    await page.getByRole('button', { name: 'Files' }).click();
    await expect(drawer).toBeInViewport();
    await page.mouse.click(380, 400);
    await expect(drawer).not.toBeInViewport();
  });

  test('Connect and the CV button are in the drawer, Connect opens as a sheet', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Files' }).click();
    await expect(
      page
        .getByRole('complementary', { name: 'Explorer' })
        .getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Connect' }).click();
    const win = page.getByRole('dialog', { name: "Let's connect" });
    await expect(win).toBeVisible();
    await settled(win);
    await expect(
      win.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    const sheet = (await win.locator('> div').boundingBox())!;
    expect(sheet.width).toBeGreaterThan(360);
    expect(sheet.height).toBeLessThanOrEqual(800 * 0.7 + 1);
    expect(sheet.y + sheet.height).toBeGreaterThan(800 - 20);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

  test('the drawer has no Connect button when the Connect switch is off', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { features: { connectMenu: false } },
    });
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Files' }).click();
    const drawer = page.getByRole('complementary', { name: 'Explorer' });
    await expect(
      drawer.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Connect' })).toHaveCount(
      0,
    );
  });

  test('Escape closes the Connect sheet and the focus goes back to the drawer button', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Files' }).click();
    const button = page
      .getByRole('complementary', { name: 'Explorer' })
      .getByRole('button', { name: 'Connect' });
    await button.click();
    const win = page.getByRole('dialog', { name: "Let's connect" });
    await expect(win).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the buttons of the drawer have the same size and the CV one shuts the drawer', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Files' }).click();
    const drawer = page.getByRole('complementary', { name: 'Explorer' });
    const connect = drawer.getByRole('button', { name: 'Connect' });
    const cv = drawer.getByRole('button', { name: 'Download CV' });
    const [a, b] = [await connect.boundingBox(), await cv.boundingBox()];
    expect(a!.height).toBeCloseTo(b!.height, 1);
    expect(a!.width).toBeCloseTo(b!.width, 1);
    await cv.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(drawer).not.toBeInViewport();
  });

  test('a file of the drawer goes to its page and shuts the drawer', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Files' }).click();
    await page
      .getByRole('complementary', { name: 'Explorer' })
      .getByRole('link', { name: /Services\.ts/ })
      .click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(
      page.getByRole('complementary', { name: 'Explorer' }),
    ).not.toBeInViewport();
  });
});
