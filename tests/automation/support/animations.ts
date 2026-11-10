/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page } from '@playwright/test';

/**
 * Waits until every animation that has an end (a page arriving, a card dealt, a tour dropping open) has ended, so a test that measures a
 * box measures it at rest and not on its way. The loops (a live dot) never end and are left out.
 */
export async function animationsSettled(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}
