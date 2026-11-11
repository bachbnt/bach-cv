/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { SKIN_IDS, type SkinId } from '@/lib/skin/skins';
import { mockFirestore } from './support/firestore-mock';
import { mockImages } from './support/images';

/**
 * What the owner can say in `site/live` `prefs` about the skin, the theme and the language (the default, a force, what to leave out), and
 * how that meets the visitor's own choice and `?skin=`, `?theme=`, `?lang=`. The order is `lib/preference/preference.ts`, held against the
 * head script by `preference-script.test.ts`; here it is seen on a page.
 */
const PREFS_KEY = 'bach-cv-prefs';

type Prefs = Record<
  string,
  { default?: string; force?: string; off?: string[] }
>;

const open = async (
  page: Page,
  prefs: Prefs,
  options: { path?: string; saved?: Record<string, string> } = {},
) => {
  await mockImages(page);
  await mockFirestore(page, { 'site/live': { prefs } });
  const saved = options.saved ?? {};
  await page.addInitScript((entries) => {
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
  }, saved);
  await page.goto(options.path ?? '/');
};

/** The skin that is on screen: `standard` is the page without `data-skin`. */
const skinOn = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.skin ?? 'standard');
const skinReady = async (page: Page, skin: SkinId) => {
  if (skin === 'standard') {
    await expect(page.locator('html:not([data-skin])')).toBeAttached();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  } else {
    await expect(
      page.locator(`html[data-skin='${skin}'][data-skin-ready]`),
    ).toBeAttached();
  }
};
const skinMenu = (page: Page) => page.getByRole('button', { name: /^Skin:/ });
const themeMenu = (page: Page) =>
  page.getByRole('button', { name: 'Theme', exact: true });
// the name is the one of the language that shows: `Language: English` or `Ngôn ngữ: Tiếng Việt`
const languageMenu = (page: Page) =>
  page.getByRole('button', { name: /^(Language|Ngôn ngữ):/ });

test.describe('the skins the owner leaves out', () => {
  test('are not in the menu, and a visitor who had chosen one is given the default', async ({
    page,
  }) => {
    await open(
      page,
      { skin: { off: ['dev', 'travel'] } },
      { saved: { 'bach-cv-skin': 'travel' } },
    );
    // the head script has read nothing yet (a first visit), so the saved skin shows until the read comes back
    await expect.poll(() => skinOn(page)).toBe('standard');
    await skinMenu(page).click();
    const names = await page.getByRole('menuitemradio').allTextContents();
    expect(names.join(' ')).toMatch(/Trade/);
    expect(names.join(' ')).not.toMatch(/Developer|Dev\b|Travel/);
    expect(names).toHaveLength(3);
  });

  test('cannot be asked for in the URL either', async ({ page }) => {
    await open(page, { skin: { off: ['dev'] } }, { path: '/?skin=dev' });
    await expect.poll(() => skinOn(page)).toBe('standard');
  });

  test('can never take the default skin away', async ({ page }) => {
    await open(page, {
      skin: { off: ['standard', 'dev', 'trade', 'academic', 'travel'] },
    });
    await skinReady(page, 'standard');
    // nothing is left to choose: there is no Skin menu
    await expect(skinMenu(page)).toHaveCount(0);
  });
});

test.describe('the skin the owner sets as the default', () => {
  test('is the skin of a visitor who has not chosen', async ({ page }) => {
    await open(page, { skin: { default: 'travel' } });
    await skinReady(page, 'travel');
    // and the menu still offers the others
    await expect(skinMenu(page)).toBeVisible();
  });

  test('does not take the choice of a visitor who has chosen', async ({
    page,
  }) => {
    await open(
      page,
      { skin: { default: 'travel' } },
      { saved: { 'bach-cv-skin': 'standard' } },
    );
    await skinReady(page, 'standard');
  });

  test('is overruled by `?skin=`', async ({ page }) => {
    await open(page, { skin: { default: 'travel' } }, { path: '/?skin=dev' });
    await skinReady(page, 'dev');
  });
});

test.describe('the skin the owner forces', () => {
  for (const skin of SKIN_IDS) {
    test(`${skin} is the skin of everyone, with no Skin menu, whatever they chose`, async ({
      page,
    }) => {
      await open(
        page,
        { skin: { force: skin } },
        {
          saved: { 'bach-cv-skin': skin === 'dev' ? 'trade' : 'dev' },
          path: '/?skin=academic',
        },
      );
      await skinReady(page, skin);
      await expect(skinMenu(page)).toHaveCount(0);
      // the visitor's own choices are not touched, and `?skin=` was not kept
      expect(
        await page.evaluate(() => localStorage.getItem('bach-cv-skin')),
      ).toBe(skin === 'dev' ? 'trade' : 'dev');
    });
  }

  test('leaves the language and the theme menus where they are', async ({
    page,
  }) => {
    await open(page, { skin: { force: 'dev' } });
    await skinReady(page, 'dev');
    await expect(languageMenu(page)).toBeVisible();
    await expect(themeMenu(page)).toBeVisible();
  });
});

test.describe('what the owner said is kept for the next visit', () => {
  test('and is used before the page has read it again, so a returning visitor sees no change', async ({
    page,
  }) => {
    await mockImages(page);
    await mockFirestore(page, {
      'site/live': { prefs: { skin: { force: 'dev' } } },
    });
    await page.addInitScript(() => {
      // a visit before: what the owner said was this, and the site/live of today is slow to come
      localStorage.setItem(
        'bach-cv-prefs',
        JSON.stringify({ skin: { force: 'dev', off: [] } }),
      );
    });
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return route.fallback();
    });
    await page.goto('/');
    // the head script knew it from the first paint, a second and a half before the read came back
    expect(await skinOn(page)).toBe('dev');
    await skinReady(page, 'dev');
    expect(
      JSON.parse(
        (await page.evaluate((k) => localStorage.getItem(k), PREFS_KEY)) ??
          '{}',
      ),
    ).toMatchObject({
      skin: { force: 'dev' },
    });
  });

  test('is replaced when the owner says something else', async ({ page }) => {
    await open(
      page,
      { skin: { force: 'trade' } },
      {
        saved: {
          [PREFS_KEY]: JSON.stringify({ skin: { force: 'dev', off: [] } }),
        },
      },
    );
    await skinReady(page, 'trade');
  });
});

test.describe('a slip in site/live', () => {
  test('counts for nothing: the site opens as usual', async ({ page }) => {
    await open(page, {
      skin: { force: 'nonsense', off: ['x', 1] },
      theme: { default: 5 },
    } as unknown as Prefs);
    await skinReady(page, 'standard');
    await expect(skinMenu(page)).toBeVisible();
  });
});

test.describe('the theme', () => {
  test('is dark for everyone when the owner forces it, with no Theme menu, wherever the system and the visitor stand', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await open(
      page,
      { theme: { force: 'dark' } },
      { saved: { 'bach-cv-theme': 'light' } },
    );
    await expect(page.locator('html.dark')).toBeAttached();
    await expect(themeMenu(page)).toHaveCount(0);
  });

  test('is the default of a visitor who has not chosen, and the choice of one who has wins', async ({
    page,
    browser,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await open(page, { theme: { default: 'dark' } });
    await expect(page.locator('html.dark')).toBeAttached();
    const other = await browser.newPage();
    await other.emulateMedia({ colorScheme: 'dark' });
    await open(
      other,
      { theme: { default: 'dark' } },
      { saved: { 'bach-cv-theme': 'light' } },
    );
    await expect(other.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(other.locator('html.dark')).toHaveCount(0);
    await other.close();
  });

  test('has no dark at all when the owner leaves it out, also for a system that is dark', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(
      page,
      { theme: { off: ['dark'] } },
      { saved: { 'bach-cv-theme': 'dark' } },
    );
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('html.dark')).toHaveCount(0);
    await expect(themeMenu(page)).toHaveCount(0);
  });

  test('takes `system` out of the menu only, when the owner leaves it out', async ({
    page,
  }) => {
    await open(page, { theme: { off: ['system'] } });
    await themeMenu(page).click();
    const names = await page.getByRole('menuitemradio').allTextContents();
    expect(names).toHaveLength(2);
    expect(names.join(' ')).not.toMatch(/System/);
  });

  test('is kept from `?theme=` like a choice, and not when it is forced', async ({
    page,
    browser,
  }) => {
    await open(page, {}, { path: '/?theme=dark' });
    await expect(page.locator('html.dark')).toBeAttached();
    // kept once the page has read what the owner said
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('bach-cv-theme')))
      .toBe('dark');
    // another visitor: its own storage
    const forced = await browser.newPage();
    await open(forced, { theme: { force: 'light' } }, { path: '/?theme=dark' });
    await expect(forced.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(
      await forced.evaluate(() => localStorage.getItem('bach-cv-theme')),
    ).toBeNull();
    await forced.close();
  });
});

test.describe('the language', () => {
  const heading = (page: Page, text: RegExp) =>
    page.getByRole('heading', { level: 1, name: text });

  test('is the one the owner forces, with no Language menu, over what the visitor chose', async ({
    page,
  }) => {
    await open(
      page,
      { language: { force: 'vi' } },
      { saved: { 'bach-cv-lang': 'en' } },
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(languageMenu(page)).toHaveCount(0);
  });

  test('is the default of a visitor who has not chosen, over the browser, and the choice of one who has wins', async ({
    page,
    browser,
  }) => {
    await open(page, { language: { default: 'vi' } });
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(languageMenu(page)).toBeVisible();
    const other = await browser.newPage();
    await open(
      other,
      { language: { default: 'vi' } },
      { saved: { 'bach-cv-lang': 'en' } },
    );
    await expect(other.locator('html')).toHaveAttribute('lang', 'en');
    await other.close();
    expect(heading).toBeDefined();
  });

  test('has no Language menu when the owner leaves one language out: there is only one to read', async ({
    page,
  }) => {
    await open(page, { language: { off: ['en'] } });
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(languageMenu(page)).toHaveCount(0);
  });

  test('is kept from `?lang=` like a choice, and not when it is forced', async ({
    page,
    browser,
  }) => {
    await open(page, {}, { path: '/?lang=vi' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('bach-cv-lang')))
      .toBe('vi');
    // another visitor: its own storage
    const forced = await browser.newPage();
    await open(forced, { language: { force: 'en' } }, { path: '/?lang=vi' });
    await expect(forced.locator('html')).toHaveAttribute('lang', 'en');
    expect(
      await forced.evaluate(() => localStorage.getItem('bach-cv-lang')),
    ).toBeNull();
    await forced.close();
  });
});
