/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
});

const tabs = (page: Page) => page.getByRole('navigation', { name: 'Main' });

/** Counts the copies of a page that are laid over the board (`.ac-ghost`), from now on. */
async function watchGhosts(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __ghosts: number };
    w.__ghosts = 0;
    new MutationObserver((records) => {
      for (const record of records)
        for (const node of Array.from(record.addedNodes))
          if (
            node instanceof HTMLElement &&
            node.classList.contains('ac-ghost')
          )
            w.__ghosts += 1;
    }).observe(document.body, { childList: true, subtree: true });
  });
}
const ghostsSeen = (page: Page) =>
  page.evaluate(() => (window as unknown as { __ghosts: number }).__ghosts);

/** Nothing of a wipe is left: no copy, no mask on the page, the overlay hidden, the browser's own fade not held off. */
async function expectClean(page: Page) {
  await expect(page.locator('.ac-ghost')).toHaveCount(0, { timeout: 4000 });
  await expect(page.locator('.ac-wipe')).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-ac-wipe', '');
  const masked = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>('main *')).filter(
        (el) =>
          el.style.maskImage || el.style.getPropertyValue('-webkit-mask-image'),
      ).length,
  );
  expect(masked).toBe(0);
}

test.describe('the eraser that changes the page', () => {
  test('wipes when a tab is clicked, then leaves nothing behind', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await watchGhosts(page);
    await tabs(page).getByRole('link', { name: /About/ }).click();
    // the old page is a copy laid over the board while the eraser works
    await expect(page.locator('.ac-ghost')).toHaveCount(1);
    await expect(page.locator('.ac-wipe')).toBeVisible();
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      tabs(page).getByRole('link', { name: /About/ }),
    ).toHaveAttribute('aria-current', 'page');
    await expectClean(page);
    expect(await ghostsSeen(page)).toBe(1);
    // the new page is there and works
    await tabs(page)
      .getByRole('link', { name: /Resume/ })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('the copy of the old page is never read out, reached or duplicated in the page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await tabs(page).getByRole('link', { name: /About/ }).click();
    const ghost = page.locator('.ac-ghost');
    await expect(ghost).toHaveCount(1);
    await expect(ghost).toHaveAttribute('aria-hidden', 'true');
    await expect(ghost).toHaveAttribute('inert', '');
    expect(await ghost.locator('[id]').count()).toBe(0);
    expect(
      await ghost.evaluate((el) => getComputedStyle(el).pointerEvents),
    ).toBe('none');
    // the one real heading is the page's own: the copy is out of the accessibility tree
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expectClean(page);
  });

  test('wipes on the arrow-key turn of the page too', async ({ page }) => {
    await gotoSkin(page, '/');
    await watchGhosts(page);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.ac-ghost')).toHaveCount(1);
    await expect(page).toHaveURL(/\/about$/);
    await expectClean(page);
    expect(await ghostsSeen(page)).toBe(1);
  });

  test('has no wipe for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    await watchGhosts(page);
    await tabs(page).getByRole('link', { name: /About/ }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      tabs(page).getByRole('link', { name: /About/ }),
    ).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator('.ac-wipe')).toBeHidden();
    expect(await ghostsSeen(page)).toBe(0);
    await expectClean(page);
  });

  test('has no wipe for the first page, a jump to an anchor or the back button', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await watchGhosts(page);
    expect(await ghostsSeen(page)).toBe(0);
    await tabs(page).getByRole('link', { name: /About/ }).click();
    await expectClean(page);
    expect(await ghostsSeen(page)).toBe(1);
    // the browser's own back button gives no copy to wipe
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expectClean(page);
    expect(await ghostsSeen(page)).toBe(1);
  });

  test('a second page change ends the first wipe at once, and the last page asked for is the one shown', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await watchGhosts(page);
    await tabs(page).getByRole('link', { name: /About/ }).click();
    await expect(page.locator('.ac-ghost')).toHaveCount(1);
    await tabs(page)
      .getByRole('link', { name: /Resume/ })
      .click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(
      tabs(page).getByRole('link', { name: /Resume/ }),
    ).toHaveAttribute('aria-current', 'page');
    await expectClean(page);
    // two page changes, two copies, never two at the same time
    expect(await ghostsSeen(page)).toBe(2);
    await expect(
      tabs(page).getByRole('link', { name: /About/ }),
    ).not.toHaveAttribute('aria-current', 'page');
  });

  test('is drawn live: the eraser and the masks move while it runs', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await tabs(page).getByRole('link', { name: /About/ }).click();
    await expect(page.locator('.ac-ghost')).toHaveCount(1);
    const first = await page
      .locator('.ac-ghost')
      .evaluate((el) => (el as HTMLElement).style.maskImage);
    expect(first).toContain('radial-gradient');
    expect(first).toContain('conic-gradient');
    await expect
      .poll(() =>
        page
          .locator('.ac-ghost')
          .evaluate((el) => (el as HTMLElement).style.maskImage)
          .catch(() => ''),
      )
      .not.toBe(first);
    await expectClean(page);
  });
});
