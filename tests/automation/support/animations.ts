/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page } from '@playwright/test';

/**
 * Waits until every animation that has an end (a page arriving, a card dealt, a tour dropping open) has ended, so a test that measures a
 * box measures it at rest and not on its way. The loops (a live dot) never end and are left out; an animation that lasts longer than
 * `maxWaitMs` (a long slide of a strip of logos) is not waited for.
 */
export async function animationsSettled(page: Page, maxWaitMs = 4000) {
  await page.evaluate(
    (limit) =>
      Promise.race([
        Promise.all(
          document
            .getAnimations()
            .filter(
              (a) => a.effect?.getComputedTiming().iterations !== Infinity,
            )
            .map((a) => a.finished.catch(() => undefined)),
        ),
        new Promise((resolve) => setTimeout(resolve, limit)),
      ]),
    maxWaitMs,
  );
}

/**
 * The page is at rest: what it reads has been read (the network is quiet) and what it animates has stopped. A fixed wait stood here before;
 * `animationsSettled` alone would end at once on a page whose content has not arrived yet, because nothing animates yet.
 */
export async function pageSettled(page: Page) {
  await page
    .waitForLoadState('networkidle', { timeout: 5000 })
    .catch(() => undefined);
  await animationsSettled(page);
}
