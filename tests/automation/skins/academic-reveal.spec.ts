/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { animationsSettled } from '../support/animations';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
});

// the live page: the copy of the old page that the eraser wipes (`.ac-ghost`) is left out
const LIVE = '.ac-reveal:not(.ac-ghost)';
const sheets = (page: Page) => page.locator(`${LIVE} [data-reveal="paper"]`);
const headings = (page: Page) => page.locator(`${LIVE} [data-reveal="line"]`);
const animationOf = (page: Page, selector: string, pseudo?: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el, p).animationName, pseudo ?? null);

test.describe('what arrives on a page of the board', () => {
  test('the sheets of the page are pinned on and its chalk headings underlined once they are in view', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(sheets(page).first()).toHaveAttribute('data-in', '');
    await expect(headings(page).first()).toHaveAttribute('data-in', '');
    expect(await animationOf(page, '[data-reveal="paper"][data-in]')).toBe(
      'ac-pin',
    );
    expect(
      await animationOf(page, '[data-reveal="line"][data-in]', '::after'),
    ).toBe('ac-chalk-line');
    await animationsSettled(page);
    // at rest every one of them is whole: nothing is left waiting or half drawn
    await expect(sheets(page).first()).toHaveCSS('opacity', '1');
    await expect(headings(page).first()).toHaveCSS('opacity', '1');
  });

  test('a sheet further down waits, hidden, until it is scrolled to', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    // the last photo of Resume is far below the first screen
    const last = sheets(page).last();
    await expect(last).toHaveAttribute('data-reveal', 'paper');
    expect(
      await last.evaluate((el) => el.getBoundingClientRect().top),
    ).toBeGreaterThan(900);
    await expect(last).not.toHaveAttribute('data-in', '');
    await expect(last).toHaveCSS('opacity', '0');
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveAttribute('data-in', '');
    await animationsSettled(page);
    await expect(last).toHaveCSS('opacity', '1');
  });

  test('a sheet that lies inside another comes with it, and plays nothing of its own', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(sheets(page).first()).toHaveAttribute('data-in', '');
    const inside = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal="paper"]')].filter((el) =>
          el.parentElement?.closest('.ac-paper, .ac-wind'),
        ).length,
    );
    expect(inside).toBe(0);
  });

  test('a page that the eraser uncovers is shown as it is: its sheets play no entrance, so none is seen half way, pale and tilted', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(sheets(page).first()).toHaveAttribute('data-in', '');
    await page.getByRole('link', { name: 'Certificates' }).first().click();
    await expect(page).toHaveURL(/\/certificates$/);
    await expect(sheets(page).first()).toHaveAttribute('data-in', 'still');
    expect(await animationOf(page, `${LIVE} [data-reveal="paper"]`)).toBe(
      'none',
    );
    expect(
      await animationOf(page, `${LIVE} [data-reveal="line"]`, '::after'),
    ).toBe('none');
    // and at no moment is a sheet that is in view less than whole
    await expect(sheets(page).first()).toHaveCSS('opacity', '1');
    await animationsSettled(page);
  });

  test('a sheet scrolled to after the eraser has passed still plays its entrance', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('link', { name: 'Resume' }).first().click();
    await expect(page).toHaveURL(/\/resume$/);
    // the eraser is drawn frame by frame, not by a CSS animation: it is over when the page stops being marked as wiped
    await expect(page.locator('html')).not.toHaveAttribute('data-ac-wipe');
    const last = sheets(page).last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveAttribute('data-in', '');
    expect(
      await last.evaluate((el) => getComputedStyle(el).animationName),
    ).not.toBe('none');
  });

  test('the tape of a photo comes with the photo: it has no entrance of its own, so it is never missing while the eraser uncovers it', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(sheets(page).first()).toHaveAttribute('data-in', '');
    await page.getByRole('link', { name: 'Home' }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.ac-tape[data-in]').first()).toBeVisible();
    const names = await page.evaluate(() =>
      [...document.querySelectorAll('.ac-tape[data-reveal]')].map(
        (el) => getComputedStyle(el, '::before').animationName,
      ),
    );
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names)).toEqual(new Set(['none']));
  });

  test('nothing waits and nothing plays for reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/projects');
    await expect(sheets(page).first()).toHaveCSS('opacity', '1');
    expect(await animationOf(page, `${LIVE} [data-reveal="paper"]`)).toBe(
      'none',
    );
    expect(
      await animationOf(page, `${LIVE} [data-reveal="line"]`, '::after'),
    ).toBe('none');
    await expect(headings(page).first()).toHaveCSS('opacity', '1');
  });

  test('the copy of the old page that the eraser wipes does not play it again', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(sheets(page).first()).toHaveAttribute('data-in', '');
    await animationsSettled(page);
    const ghost = await page.evaluate(() => {
      const copy = document
        .querySelector('[data-reveal="paper"]')!
        .cloneNode(true) as HTMLElement;
      const holder = document.createElement('div');
      holder.className = 'ac-ghost';
      holder.appendChild(copy);
      document.body.appendChild(holder);
      const style = getComputedStyle(copy);
      const result = { name: style.animationName, opacity: style.opacity };
      holder.remove();
      return result;
    });
    expect(ghost).toEqual({ name: 'none', opacity: '1' });
  });
});
