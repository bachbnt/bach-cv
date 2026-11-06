/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page } from '@playwright/test';

/**
 * Makes the page open in a skin (`dev`, or `standard` for the default look): the visitor's choice is kept in the browser, so it is
 * written before any script of the page runs. Call it before `page.goto`.
 */
export async function useSkin(page: Page, skin: 'standard' | 'dev') {
  await page.addInitScript((id) => {
    window.localStorage.setItem('bach-cv-skin', id);
  }, skin);
}

/**
 * Opens `path` and waits until the skin is on screen. Until then the page is the one Standard sends, which has the same buttons and
 * names, so a test that clicked at once could click the old element just before it is replaced.
 */
export async function gotoSkin(page: Page, path = '/') {
  await page.goto(path);
  await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
}
