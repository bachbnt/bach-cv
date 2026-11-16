/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import type { SkinId } from '@/lib/skin/skins';
import { mockFirestore } from './firestore-mock';
import { mockImages } from './images';
import { gotoSkin, useSkin } from './skin';

// "Ongoing" or "Finished" of a project, on the project itself, in Standard and in every skin: the word of the copy (`projectsCopy.statuses`,
// worked out by `statusOf`, so a project with no end month is ongoing), a glyph, and a box of the same size for both, so a project that ends
// does not move anything. Each skin draws its own flag and marks it `data-status`; the suite only asks where a project is (`project`, the
// Projects page) and, on Home, where a featured one is (`home`). The seed has DevCmd and DevPad ongoing (no end month) and Beli Coffee and
// VenusAI finished; VenusAI and DevPad are featured, so they are on Home too.

export interface ProjectStatusTarget {
  skin: SkinId;
  /** the block of a project (a card, an entry, a row) on the Projects page, found by its name */
  project: (page: Page, name: string) => Locator;
  /** the block of a featured project on Home; leave it out for a skin that has none there */
  home?: (page: Page, name: string) => Locator;
}

const WORDS = {
  en: { ongoing: 'Ongoing', finished: 'Finished' },
  vi: { ongoing: 'Đang chạy', finished: 'Đã xong' },
} as const;

// Standard is the page the server sends, so there is no skin to wait for
const open = (skin: SkinId, page: Page, path: string) =>
  skin === 'standard' ? page.goto(path) : gotoSkin(page, path);

const flagOf = (block: Locator) => block.locator('[data-status]').first();

// the layout size, which a tilt of the flag or of the photo under it does not change
const sizeOf = (flag: Locator) =>
  flag.evaluate((el) => ({
    width: (el as HTMLElement).offsetWidth,
    height: (el as HTMLElement).offsetHeight,
  }));

/** The flag says the right word and has a glyph; its box is returned. */
async function expectFlag(
  block: Locator,
  status: 'ongoing' | 'finished',
  lang: 'en' | 'vi',
) {
  const flag = flagOf(block);
  await expect(flag).toHaveAttribute('data-status', status);
  await expect(flag).toContainText(WORDS[lang][status]);
  // what is seen is the word of this status only (a flag may keep the other one unseen to reserve its width)
  const other = status === 'ongoing' ? 'finished' : 'ongoing';
  const seen = (
    await flag.evaluate((el) => (el as HTMLElement).innerText)
  ).toLowerCase();
  expect(seen).toContain(WORDS[lang][status].toLowerCase());
  expect(seen).not.toContain(WORDS[lang][other].toLowerCase());
  // never a colour alone: a shape as well (an icon, or a dot or a ring drawn as an element)
  await expect(
    flag.locator('svg, span[aria-hidden="true"]').first(),
  ).toBeAttached();
  return sizeOf(flag);
}

export function defineProjectStatusTests({
  skin,
  project,
  home,
}: ProjectStatusTarget) {
  for (const lang of ['en', 'vi'] as const) {
    test.describe(`Project status (${skin}, ${lang})`, () => {
      test.beforeEach(async ({ page }) => {
        await useSkin(page, skin);
        await page.addInitScript((value) => {
          window.localStorage.setItem('bach-cv-lang', value);
        }, lang);
        await mockFirestore(page);
        await mockImages(page);
      });

      test('a project says whether it goes on or is finished, in a box of the same size', async ({
        page,
      }) => {
        await open(skin, page, '/projects');
        const ongoing = await expectFlag(
          project(page, 'DevCmd').first(),
          'ongoing',
          lang,
        );
        const finished = await expectFlag(
          project(page, 'Beli Coffee').first(),
          'finished',
          lang,
        );
        expect(ongoing).toEqual(finished);
        // a featured project says it in its card and in the list too
        await expectFlag(project(page, 'VenusAI').first(), 'finished', lang);
        await expectFlag(project(page, 'DevPad').last(), 'ongoing', lang);
      });

      if (home) {
        test('the featured projects of Home say it too', async ({ page }) => {
          await open(skin, page, '/');
          const ongoing = await expectFlag(
            home(page, 'DevPad').first(),
            'ongoing',
            lang,
          );
          const finished = await expectFlag(
            home(page, 'VenusAI').first(),
            'finished',
            lang,
          );
          expect(ongoing).toEqual(finished);
        });
      }
    });
  }

  for (const width of [320, 375]) {
    test(`Project status (${skin}) stays inside a ${width} px screen`, async ({
      page,
    }) => {
      await useSkin(page, skin);
      await page.addInitScript(() => {
        window.localStorage.setItem('bach-cv-lang', 'vi');
      });
      await mockFirestore(page);
      await mockImages(page);
      await page.setViewportSize({ width, height: 800 });
      await open(skin, page, '/projects');
      for (const name of ['DevCmd', 'Beli Coffee']) {
        const flag = flagOf(project(page, name).first());
        await flag.scrollIntoViewIfNeeded();
        const box = await flag.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}
