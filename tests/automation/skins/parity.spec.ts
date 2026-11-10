/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { SKIN_IDS } from '@/lib/skin/skins';
import { animationsSettled } from '../support/animations';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

/**
 * What every skin owes the visitor of a small phone, said once for all of them: at 320 px (an iPhone SE of the first kind) and 375 px
 * (an iPhone SE) no page grows a sideways scroll and every page has its one level 1 heading. A skin that is added to `SKIN_IDS` is
 * checked here without anyone adding a line.
 */
const PAGES = [
  '/',
  '/resume',
  '/projects',
  '/certificates',
  '/services',
  '/payment',
  '/about',
] as const;

for (const skin of SKIN_IDS) {
  test.describe(`the ${skin} skin on a small phone`, () => {
    test.use({ hasTouch: true, isMobile: true });

    for (const width of [320, 375]) {
      for (const path of PAGES) {
        test(`${path} at ${width} px has no sideways scroll and one level 1 heading`, async ({
          page,
        }) => {
          await useSkin(page, skin);
          await mockFirestore(page);
          await mockImages(page);
          await page.setViewportSize({ width, height: 700 });
          // Standard is the page the server sends: it has no skin to wait for
          if (skin === 'standard') await page.goto(path);
          else await gotoSkin(page, path);
          await expect(
            page.getByRole('heading', { level: 1 }).first(),
          ).toBeVisible();
          await animationsSettled(page);
          const overflow = await page.evaluate(() => ({
            page: document.documentElement.scrollWidth - window.innerWidth,
            body: document.body.scrollWidth - window.innerWidth,
          }));
          expect(overflow.page).toBeLessThanOrEqual(0);
          expect(overflow.body).toBeLessThanOrEqual(0);
          // one title for the page: a second level 1 heading would give a screen reader two pages in one
          await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        });
      }
    }
  });
}
