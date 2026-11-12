/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { gotoSkin, useSkin } from './support/skin';

// "See all skills" of About ends in /resume#skills. The roles above the section are a skeleton when the page opens and grow when their
// data arrives, so the browser's own jump must be repeated once they have: the visitor has to end on the Skills section.
const SIZES = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 844 },
];

for (const skin of ['standard', 'dev', 'trade', 'academic', 'travel'] as const)
  for (const size of SIZES)
    test(`${skin}: See all skills ends on the Skills section of Resume (${size.name})`, async ({
      page,
    }) => {
      await mockFirestore(page);
      await useSkin(page, skin);
      await page.setViewportSize({ width: size.width, height: size.height });
      // Standard has no `data-skin-ready` to wait for
      if (skin === 'standard') await page.goto('/about');
      else await gotoSkin(page, '/about');
      await page.getByRole('link', { name: 'See all skills' }).first().click();
      await expect(page).toHaveURL(/\/resume#skills$/);
      // the roles have arrived (and the page has grown), then the section must be where the visitor is
      await expect(page.getByText('FPT Software').first()).toBeAttached();
      await expect
        .poll(
          () =>
            page.evaluate((height) => {
              const top = document
                .getElementById('skills')
                ?.getBoundingClientRect().top;
              return top !== undefined && top >= -5 && top < height - 100;
            }, size.height),
          { timeout: 5_000 },
        )
        .toBe(true);
    });
