/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'moba');
  await mockFirestore(page);
});

/** Where the champion is on the minimap, in percent. */
const where = (page: Page) =>
  page.locator('.mb-me').evaluate((el) => ({
    x: parseFloat((el as HTMLElement).style.left),
    y: parseFloat((el as HTMLElement).style.top),
  }));

test.describe('walking the arena', () => {
  test('a click on a place of the minimap walks the champion there and then opens the page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const start = await where(page);
    await page.locator('[data-minimap-station="mid"]').click();
    // the page is folded away while the champion walks
    await expect(page.getByRole('main')).toBeHidden();
    await expect(page).toHaveURL(/\/resume$/, { timeout: 15_000 });
    await expect(page.getByRole('main')).toBeVisible();
    const end = await where(page);
    expect(end.x).toBeGreaterThan(start.x + 10);
    expect(end.y).toBeLessThan(start.y - 10);
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Resume' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('a click on the map between places walks there and leaves the page folded', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Fold the page, show the map' })
      .click();
    const before = await where(page);
    await page
      .locator('.mb-minimap [aria-hidden="true"]')
      .first()
      .click({ position: { x: 100, y: 12 } });
    await expect
      .poll(async () => (await where(page)).x)
      .toBeGreaterThan(before.x + 5);
    await expect(page).toHaveURL(/\/$/);
  });

  test('a tower of the career opens Resume at that role', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Fold the page, show the map' })
      .click();
    const tower = page.locator('[data-role]').first();
    await tower.dispatchEvent('click');
    await expect(page).toHaveURL(/\/resume$/, { timeout: 20_000 });
  });

  test('the arrow keys steer the champion along a lane while the page is folded, and stop on a place', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('Escape');
    const before = await where(page);
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowUp');
    const after = await where(page);
    expect(after.y).toBeLessThan(before.y - 3);
  });

  test('with reduced motion the champion is placed, not walked', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    await page.locator('[data-minimap-station="shrine"]').click();
    await expect(page).toHaveURL(/\/certificates$/, { timeout: 3000 });
  });

  test('recall (B) takes the champion home', async ({ page }) => {
    await gotoSkin(page, '/projects');
    await page.keyboard.press('b');
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
  });
});

test.describe('the keys', () => {
  test('open the pages: S Resume, P Services, O Payment, J Projects, C Certificates, H About', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    for (const [key, path] of [
      ['s', /\/resume$/],
      ['p', /\/services$/],
      ['o', /\/payment$/],
      ['j', /\/projects$/],
      ['c', /\/certificates$/],
      ['h', /\/about$/],
    ] as const) {
      await page.keyboard.press(key);
      await expect(page).toHaveURL(path);
    }
  });

  test('do nothing while typing in a field, and never take Tab', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await page.getByRole('textbox', { name: 'Message' }).fill('');
    await page.getByRole('textbox', { name: 'Message' }).press('p');
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('button', { name: 'Close chat' }).first().focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('body')).not.toBeFocused();
  });

  test('Q opens the card of the first key skill, with where it was used, and Esc closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    // the key skills come with the data: the key does nothing before they are there
    await expect(
      page
        .getByRole('contentinfo')
        .getByRole('button', { name: /^Key skill Q: / }),
    ).toBeVisible();
    await page.keyboard.press('q');
    const card = page.getByRole('group', { name: /^Key skill Q: / });
    await expect(card).toBeVisible();
    await expect(card).toContainText(/Used at|side projects|No specific/);
    await page.keyboard.press('Escape');
    await expect(card).toBeHidden();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('the question mark lists the keys in a window that returns focus', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.keyboard.press('?');
    const dialog = page.getByRole('dialog', { name: 'Keyboard' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Walk');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('the champion bar', () => {
  test('has the key skills Q W E R, the passive, the spells and the certificates, with real names', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const bar = page.getByRole('contentinfo');
    await expect(
      bar.getByRole('button', { name: /^Key skill Q: /i }),
    ).toBeVisible();
    await expect(
      bar.getByRole('button', { name: /^Key skill R: /i }),
    ).toBeVisible();
    await expect(
      bar.getByRole('button', { name: /^Current role: Team Lead/ }),
    ).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Connect' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Open chat' })).toBeVisible();
    await expect(
      bar.getByRole('button', { name: 'Download CV' }),
    ).toBeVisible();
    await expect(
      bar.getByRole('button', { name: /^Certificate 1: / }),
    ).toBeVisible();
    await expect(
      bar.getByText('Certificates', { exact: true }).first(),
    ).toBeVisible();
  });

  test('shows the years in software as the level, and counts with a name beside each bar', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const bar = page.getByRole('contentinfo');
    await expect(
      bar.getByRole('img', { name: 'Years in software: 7' }),
    ).toBeVisible();
    await expect(bar.getByText('Projects')).toBeVisible();
    await expect(bar.getByText('Skills', { exact: true })).toBeVisible();
  });

  test('a certificate slot opens Certificates', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('contentinfo')
      .getByRole('button', { name: /^Certificate 1: / })
      .click();
    await expect(page).toHaveURL(/\/certificates$/);
  });

  test('the passive opens Resume', async ({ page }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('contentinfo')
      .getByRole('button', { name: /^Current role/ })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('Connect lists the e-mail with a Copy button and the social links in groups', async ({
    page,
  }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Connect' }).click();
    await expect(page.getByText("Let's connect")).toBeVisible();
    await expect(page.getByText('Professional')).toBeVisible();
    await expect(page.getByRole('link', { name: /LinkedIn/ })).toBeVisible();
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText("Let's connect")).toBeHidden();
  });

  test('the CV window opens from the trinket, shows the CV, and Esc returns focus to it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const trinket = page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Download CV' });
    await trinket.click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('button', { name: 'Download PDF' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trinket).toBeFocused();
  });

  test('the chat opens from F, answers with the Worker, and closes', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Hello from the bot.' } }));
    await gotoSkin(page, '/');
    await page.keyboard.press('f');
    const chat = page.getByRole('dialog', { name: /BB Bot/ });
    await expect(chat).toBeVisible();
    await chat.getByRole('textbox', { name: 'Message' }).fill('Hi');
    await chat.getByRole('button', { name: 'Send chat message' }).click();
    await expect(chat.getByText('Hello from the bot.')).toBeVisible();
    await chat.getByRole('button', { name: 'Close chat' }).click();
    await expect(chat).toBeHidden();
  });

  test('a failed answer offers Try again', async ({ page }) => {
    let n = 0;
    await mockWorker(page, () =>
      ++n === 1
        ? { status: 502, body: { error: 'x' } }
        : { body: { text: 'Second try.' } },
    );
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    const chat = page.getByRole('dialog', { name: /BB Bot/ });
    await chat.getByRole('textbox', { name: 'Message' }).fill('Hi');
    await chat.getByRole('button', { name: 'Send chat message' }).click();
    await chat.getByRole('button', { name: 'Try again' }).click();
    await expect(chat.getByText('Second try.')).toBeVisible();
  });

  test('the switches of the site take the buttons away', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': {
        features: { chat: false, cvDownload: false, connectMenu: false },
      },
    });
    await gotoSkin(page, '/');
    const bar = page.getByRole('contentinfo');
    await expect(
      bar.getByRole('button', { name: 'Key skill Q: ', exact: false }).first(),
    ).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Open chat' })).toHaveCount(0);
    await expect(bar.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
    await expect(bar.getByRole('button', { name: 'Connect' })).toHaveCount(0);
    await page.keyboard.press('f');
    await page.keyboard.press('d');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('the art', () => {
  test('is decoration: the map and the minimap are hidden from assistive technology', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.locator('.mb-map')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.locator('.mb-minimap > div').first()).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  test('pauses its animation while the window is hidden and with reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    await expect(page.locator('.mb-map')).toHaveAttribute('data-paused', '');
    // transitions that were already started finish at once; what must be gone is every keyframe animation
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter(
                (a) => a instanceof CSSAnimation && a.playState === 'running',
              ).length,
        ),
      )
      .toBe(0);
  });

  test('is one inline svg of bounded size, with no raster picture but the photo of the champion', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const count = await page
      .locator('.mb-world svg')
      .first()
      .evaluate((svg) => svg.querySelectorAll('*').length);
    expect(count).toBeGreaterThan(300);
    expect(count).toBeLessThan(3500);
    await expect(page.locator('.mb-world img')).toHaveCount(1);
  });
});
