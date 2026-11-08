/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { useSkin } from '../support/skin';

/**
 * A visitor who chose a skin must never see the default look first: the head script marks `data-skin` and the CSS hides the body until the
 * skin is ready. The first render of the app is always the default skin (it matches the static HTML), and it must not take that mark away.
 */
for (const skin of ['dev', 'trade'] as const) {
  test(`reloading in ${skin} never shows the default look before the skin`, async ({
    page,
  }) => {
    await useSkin(page, skin);
    await mockFirestore(page);
    await mockImages(page);
    // every frame, from the first: is the page visible while the chosen skin is not on screen?
    await page.addInitScript(() => {
      const w = window as unknown as { __shown: number[] };
      w.__shown = [];
      const t0 = performance.now();
      const tick = () => {
        const html = document.documentElement;
        const body = document.body;
        if (
          body &&
          getComputedStyle(body).visibility !== 'hidden' &&
          !html.hasAttribute('data-skin-ready')
        )
          w.__shown.push(Math.round(performance.now() - t0));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.goto('/');
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    // a slow phone makes the gap between the first render and the skin long enough to see
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.reload();
    await page.locator('html[data-skin-ready]').waitFor({ state: 'attached' });
    await page.waitForTimeout(300);
    const shown = await page.evaluate(
      () => (window as unknown as { __shown: number[] }).__shown,
    );
    expect(shown).toEqual([]);
  });
}
