/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

/** The narrowest phones in use: an iPhone SE and the 320 px of an old one. */
const SIZES = [
  { width: 375, height: 667 },
  { width: 320, height: 568 },
];

for (const size of SIZES) {
  test.describe(`at ${size.width} px`, () => {
    test.use({ viewport: size, hasTouch: true });

    test('the menu of Standard keeps its rows inside its padding and a gap above Download CV', async ({
      page,
    }) => {
      await mockFirestore(page);
      await page.goto('/');
      await page.getByRole('button', { name: 'Open menu' }).click();
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      const skin = drawer.getByRole('group', { name: 'Skin' });
      await expect(skin).toBeVisible();
      // the drawer slides in, and its button sticks to the bottom and floats over the rows until the end: look at the end of it
      const atEnd = () =>
        drawer.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
          const theme = [...el.querySelectorAll('[role=group]')].at(-1)!;
          const download = [...el.querySelectorAll('button')].find((b) =>
            /Download CV/.test(b.textContent ?? ''),
          );
          return download
            ? download.getBoundingClientRect().top -
                theme.getBoundingClientRect().bottom
            : 99;
        });
      await expect.poll(atEnd, { timeout: 8000 }).toBeGreaterThanOrEqual(8);
      const rects = await drawer.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const rect = (selector: string) =>
          el.querySelector(selector)?.getBoundingClientRect();
        const theme = [...el.querySelectorAll('[role=group]')].at(-1)!;
        const download = [...el.querySelectorAll('button')].find((b) =>
          /Download CV/.test(b.textContent ?? ''),
        );
        return {
          right: box.right,
          groups: [...el.querySelectorAll('[role=group]')].map(
            (g) => g.getBoundingClientRect().right,
          ),
          buttons: [...el.querySelectorAll('[role=group] button')].map(
            (b) => b.getBoundingClientRect().right,
          ),
          themeBottom: theme.getBoundingClientRect().bottom,
          downloadTop: download?.getBoundingClientRect().top ?? null,
          rect: rect('[role=group]')?.left,
        };
      });
      // the padding of the drawer (16 px) is kept on the right of every group and button
      for (const right of [...rects.groups, ...rects.buttons])
        expect(right).toBeLessThanOrEqual(rects.right - 15);
      if (rects.downloadTop !== null)
        expect(rects.downloadTop - rects.themeBottom).toBeGreaterThanOrEqual(8);
    });

    test('Dev keeps the buttons of its status bar in reach and its footer clear of the chat button', async ({
      page,
    }) => {
      await useSkin(page, 'dev');
      await mockFirestore(page);
      await mockImages(page);
      await gotoSkin(page, '/');
      for (const name of ['Output', 'Terminal']) {
        const button = page.getByRole('button', { name, exact: true });
        await expect(button.last()).toBeVisible();
      }
      const status = page
        .locator('div.bg-status')
        .first()
        .getByRole('button', { name: /Output|Terminal/ });
      expect(await status.count()).toBe(2);
      for (const i of [0, 1]) {
        const r = (await status.nth(i).boundingBox())!;
        expect(r.x + r.width).toBeLessThanOrEqual(size.width);
      }
      // a finger needs 44 px: the small controls of the title bar and the status bar reach it with an invisible area around them
      const reach = await page.evaluate(() =>
        [...document.querySelectorAll('button')]
          .filter((b) =>
            /^(Language|Skin|Theme|Output|Terminal)/.test(
              (b.getAttribute('aria-label') ?? b.textContent ?? '').trim(),
            ),
          )
          .filter((b) => b.getBoundingClientRect().width > 0)
          .map((b) => {
            const r = b.getBoundingClientRect();
            const after = getComputedStyle(b, '::after');
            return Math.max(
              r.height,
              after.content === 'none' ? 0 : parseFloat(after.height),
            );
          }),
      );
      expect(reach.length).toBeGreaterThanOrEqual(4);
      for (const height of reach) expect(height).toBeGreaterThanOrEqual(44);
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      );
      await page.waitForTimeout(300);
      const overlap = await page.evaluate(() => {
        const footer = document.querySelector('footer')!;
        const chat = document.querySelector('[aria-label="Open chat"]')!;
        const range = document.createRange();
        range.selectNodeContents(footer);
        const text = [...range.getClientRects()];
        const c = chat.getBoundingClientRect();
        return text.some(
          (t) =>
            t.left < c.right &&
            t.right > c.left &&
            t.top < c.bottom &&
            t.bottom > c.top,
        );
      });
      expect(overlap).toBe(false);
    });

    test('Trade has no scrollbar and no half-hidden button in the bar under the chart, and its two sheets share one header', async ({
      page,
    }) => {
      await useSkin(page, 'trade');
      await mockFirestore(page);
      await mockImages(page);
      await gotoSkin(page, '/');
      const bar = page.getByRole('toolbar', { name: 'Time range' });
      await expect(bar).toBeVisible();
      await expect(bar.getByRole('button').first()).toBeVisible();
      const overflow = await bar.evaluate(
        (el) => el.scrollWidth - el.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      expect(
        await bar.evaluate((el) =>
          [...el.querySelectorAll('button')]
            .filter((b) => b.getBoundingClientRect().width > 0)
            .every((b) => b.getBoundingClientRect().right <= innerWidth + 0.5),
        ),
      ).toBe(true);

      const header = async (open: () => Promise<void>, close: RegExp) => {
        await open();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        const geometry = await dialog.evaluate((el) => {
          const head = el.querySelector('header, aside > div')!;
          const h = head.getBoundingClientRect();
          const x = [...el.querySelectorAll('button')].find((b) =>
            /close|đóng/i.test(b.getAttribute('aria-label') ?? ''),
          )!;
          const c = x.getBoundingClientRect();
          return {
            height: Math.round(h.height),
            closeSize: Math.round(c.width),
            closeRight: Math.round(h.right - c.right),
            left: Math.round(el.getBoundingClientRect().left),
          };
        });
        await dialog.getByRole('button', { name: close }).click();
        await expect(dialog).toBeHidden();
        return geometry;
      };
      const watch = await header(
        () =>
          page
            .getByRole('navigation', { name: 'Quick links' })
            .getByRole('button', { name: 'Watchlist' })
            .click(),
        /Close the watchlist/,
      );
      const chat = await header(
        () => page.getByRole('button', { name: 'Open chat' }).first().click(),
        /Close/,
      );
      expect(watch.height).toBe(chat.height);
      expect(watch.closeSize).toBe(chat.closeSize);
      expect(watch.closeRight).toBe(chat.closeRight);
      expect(watch.left).toBe(chat.left);
    });
  });
}
