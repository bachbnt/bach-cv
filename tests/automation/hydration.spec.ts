/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { SKIN_IDS } from '@/lib/skin/skins';
import { mockFirestore } from './support/firestore-mock';
import { mockImages } from './support/images';
import { useSkin } from './support/skin';

/**
 * The static HTML is always Standard, light and English, and the head script then puts the visitor's choices on <html> before React
 * hydrates. Hydration must still find what it expects: React (in development, which is what these tests run against) prints a mismatch to the
 * console, and the Next.js overlay shows it as an issue. A visitor with a saved skin, theme and language, on a first visit and on a return
 * visit (when the browser already has the cached content and prefs), must get none.
 */
const PROBLEM = /hydrat|didn't match|did not match|Minified React error/i;

/** What the console and the page report that would mean a broken hydration (a failed network call of the mock is not one). */
const watch = (page: Page) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error' && message.type() !== 'warning') return;
    if (PROBLEM.test(message.text())) problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
};

/** The page is hydrated and settled: the skin is on screen (or it is the default, with its own header). */
const settled = async (page: Page, skin: (typeof SKIN_IDS)[number]) => {
  if (skin === 'standard')
    await expect(page.locator('html:not([data-skin]) header')).toBeVisible();
  else
    await expect(
      page.locator(`html[data-skin='${skin}'][data-skin-ready]`),
    ).toBeAttached();
};

const PREFERENCES = [
  { name: 'light and English', theme: null, lang: null },
  { name: 'dark and Vietnamese', theme: 'dark', lang: 'vi' },
] as const;

for (const skin of SKIN_IDS) {
  for (const preference of PREFERENCES) {
    test(`${skin}, ${preference.name}: Home and Projects hydrate without a mismatch`, async ({
      page,
    }) => {
      await mockImages(page);
      await mockFirestore(page);
      await useSkin(page, skin);
      await page.addInitScript((choice) => {
        if (choice.theme) localStorage.setItem('bach-cv-theme', choice.theme);
        if (choice.lang) localStorage.setItem('bach-cv-lang', choice.lang);
      }, preference);
      const problems = watch(page);

      // a first visit, then a return visit (the content and the owner's prefs are cached by then) of both pages
      for (const path of ['/', '/projects']) {
        await page.goto(path);
        await settled(page, skin);
        await page.reload();
        await settled(page, skin);
      }
      // let the late effects and the data that arrives after hydration run before the console is read
      await page.waitForLoadState('networkidle');
      expect(problems).toEqual([]);
    });
  }
}

test('what the owner forces and a link asks for hydrates without a mismatch, on a first and on a return visit', async ({
  page,
}) => {
  await mockImages(page);
  await mockFirestore(page, {
    'site/live': {
      prefs: {
        skin: { force: 'dev' },
        theme: { force: 'dark' },
        lang: { force: 'vi' },
      },
    },
  });
  const problems = watch(page);
  for (const path of ['/?skin=phone&theme=light&lang=en', '/projects']) {
    await page.goto(path);
    await settled(page, 'dev');
    await page.reload();
    await settled(page, 'dev');
  }
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});

test('an attribute that a browser extension puts on <body> before React hydrates is not a mismatch', async ({
  page,
}) => {
  await mockImages(page);
  await mockFirestore(page);
  // what Grammarly and the like do: they run before hydration and mark <body>
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.setAttribute('data-new-gr-c-s-check-loaded', '14.1');
      document.body.setAttribute('cz-shortcut-listen', 'true');
    });
  });
  const problems = watch(page);
  await page.goto('/');
  await settled(page, 'standard');
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});
