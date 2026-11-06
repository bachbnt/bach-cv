/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

const logOf = (page: Page) => page.locator('[data-slot="dev-output"]');
const panelOf = (page: Page) => page.locator('[data-slot="dev-panel"]');
// The terminal card is left out of the checks below: it shows what the visitor typed (that is its job), and the name of the
// project (`bachbntdev`, a public label of the skin that is also the Firebase project id).
const textOf = async (locator: Locator) => (await locator.textContent()) ?? '';

/** Opens the Output or Problems tab from the status bar, as a visitor does. */
async function openTab(page: Page, tab: 'Output' | 'Problems' | 'Vấn đề') {
  // the status bar button of Problems is named with its counters
  const name = tab === 'Output' ? tab : /^(Problems|Vấn đề) \(/;
  const button = page
    .getByRole('button', { name, exact: tab === 'Output' })
    .first();
  // the panel keeps the tab it had: open it only when it is not open yet
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click();
  }
}

/** Opens a page of the Dev skin and the Output tab. */
async function openOutput(page: Page, path = '/') {
  await gotoSkin(page, path);
  await openTab(page, 'Output');
  await expect(logOf(page)).toBeVisible();
  return logOf(page);
}

/** A query for `name` fails with a body full of things that must never be shown. */
async function failCollection(page: Page, name: string) {
  await page.route('**/firestore.googleapis.com/**', (route) => {
    const request = route.request();
    if (
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes(`"collectionId":"${name}"`)
    ) {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 500,
            message: 'secret-message https://x.test/path?key=AIzaSecret123',
            status: 'INTERNAL',
          },
        }),
      });
    }
    return route.fallback();
  });
}

/** The Firebase project id, as the page itself sends it to Firestore. */
function watchProjectId(page: Page) {
  const ids = new Set<string>();
  page.on('request', (request) => {
    const match = /\/projects\/([^/]+)\/databases/.exec(request.url());
    if (match) ids.add(match[1]);
  });
  return ids;
}

/** Nothing a visitor or a document owns is in the text: no email, no number, no URL, no query string, no project id. */
function expectNoSecrets(text: string, projectIds: Set<string>) {
  expect(text).not.toContain('gmail');
  expect(text).not.toMatch(/@/);
  expect(text).not.toMatch(/https?:|www\./i);
  expect(text).not.toMatch(/[?&]\w+=/);
  expect(text).not.toMatch(/\d{6,}/);
  expect(text).not.toMatch(/secret|AIza|googleapis|key=/i);
  for (const id of projectIds) expect(text).not.toContain(id);
}

test.describe('the Output tab', () => {
  test('logs the start, the queries (with counts), the route and the timings', async ({
    page,
  }) => {
    const log = await openOutput(page);
    await expect(log).toContainText(/I\/Portfolio: ready \(\+\d+ ms\)/);
    await expect(log).toContainText('I/Router: /');
    await expect(log).toContainText(/D\/Query: \w+ read \(\d+ docs?, \d+ ms\)/);
    await expect(log).toContainText(/I\/Perf: TTFB \d+ ms/);
    // the page settles a few seconds after it is ready
    await expect(log).toContainText(
      /I\/Perf: (LCP [\d.]+ s \u00b7 )?CLS \d\.\d\d/,
      {
        timeout: 10_000,
      },
    );
    await expect(log.locator('p').first()).toContainText(
      /^\d\d:\d\d:\d\d\.\d{3}/,
    );
  });

  test('is a polite log, and the levels have their colours', async ({
    page,
  }) => {
    const log = await openOutput(page);
    await expect(log).toHaveAttribute('role', 'log');
    await expect(log).toHaveAttribute('aria-live', 'polite');
    await expect(log).toHaveAttribute('aria-label', 'Output log');
    const debug = log.getByText(/^D\/Query: /).first();
    const info = log.getByText(/^I\/Portfolio: /);
    await expect(debug).toBeVisible();
    const color = (locator: typeof debug) =>
      locator.evaluate((el) => getComputedStyle(el).color);
    expect(await color(debug)).not.toBe(await color(info));
  });

  test('a page change adds its path, without a query string or a hash', async ({
    page,
  }) => {
    const log = await openOutput(page);
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /About\.js/ })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(log).toContainText('I/Router: /about');
    await gotoSkin(page, '/projects?token=abc123&email=a@b.co#x');
    await openTab(page, 'Output');
    await expect(logOf(page)).toContainText('I/Router: /projects');
    expectNoSecrets(await textOf(logOf(page)), new Set());
  });

  test('a change of language or theme adds a settings line', async ({
    page,
  }) => {
    const log = await openOutput(page);
    await expect(log).toContainText('I/Router: /');
    // nothing was changed yet: no settings line
    await expect(log).not.toContainText('I/Settings');
    await page.getByRole('button', { name: 'Language' }).click();
    await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
    await expect(log).toContainText('I/Settings: language -> vi');
    await page.getByRole('button', { name: 'Giao diện', exact: true }).click();
    await page.getByRole('menuitemradio', { name: /Tối|Dark/ }).click();
    await expect(log).toContainText('I/Settings: theme -> dark');
  });

  test('opening the CV and the Connect palette is logged by name', async ({
    page,
  }) => {
    const log = await openOutput(page);
    await page.getByRole('button', { name: 'Download CV' }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(log).toContainText('I/UI: cv opened');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /^Account/ }).click();
    await expect(log).toContainText('I/UI: connect opened');
  });

  test('copying is logged without what was copied', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const ids = watchProjectId(page);
    const log = await openOutput(page);
    await page.getByRole('button', { name: /^Account/ }).click();
    await page.getByRole('button', { name: 'Copy' }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
    await expect(log).toContainText('I/UI: copied');
    expectNoSecrets(await textOf(logOf(page)), ids);
  });

  test('the terminal logs the name of a command and never what follows it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Terminal', exact: true })
      .first()
      .click();
    const line = page.getByRole('textbox', { name: 'Terminal command line' });
    for (const command of [
      'cd about',
      'hunter2 bachbnt@gmail.com 0912345678',
    ]) {
      await line.fill(command);
      await line.press('Enter');
    }
    await openTab(page, 'Output');
    const log = logOf(page);
    await expect(log).toContainText('I/Terminal: cd');
    await expect(log).toContainText('I/Terminal: unknown');
    await expect(log).not.toContainText('hunter2');
    expectNoSecrets((await log.textContent()) ?? '', new Set());
  });

  test('Clear empties the log', async ({ page }) => {
    const log = await openOutput(page);
    await expect(log).toContainText('I/Portfolio');
    await panelOf(page).getByRole('button', { name: 'Clear output' }).click();
    await expect(log).not.toContainText('I/Portfolio');
    await expect(log).toContainText('Nothing has been logged yet.');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /About\.js/ })
      .click();
    await expect(log).toContainText('I/Router: /about');
    await expect(log).not.toContainText('Nothing has been logged yet.');
  });

  test('only the Output tab has the Clear button', async ({ page }) => {
    await openOutput(page);
    await expect(
      panelOf(page).getByRole('button', { name: 'Clear output' }),
    ).toBeVisible();
    await openTab(page, 'Problems');
    await expect(
      panelOf(page).getByRole('button', { name: 'Clear output' }),
    ).toHaveCount(0);
  });

  test('does not take the focus on page load, even when the panel was left open on it', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'bach-cv-dev-ui',
        JSON.stringify({ panel: 'output' }),
      );
    });
    await gotoSkin(page, '/');
    await expect(logOf(page)).toContainText('I/Portfolio');
    await expect(logOf(page)).not.toBeFocused();
    await expect(
      panelOf(page).getByRole('button', { name: 'Clear output' }),
    ).not.toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(
      'BODY',
    );
  });

  test('follows the newest line, unless the visitor has scrolled up', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Terminal', exact: true })
      .first()
      .click();
    const line = page.getByRole('textbox', { name: 'Terminal command line' });
    for (let i = 0; i < 30; i += 1) {
      await line.fill('ls');
      await line.press('Enter');
    }
    await openTab(page, 'Output');
    const log = logOf(page);
    const gap = () =>
      log.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);
    await expect.poll(gap).toBeLessThan(4);
    expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
      true,
    );

    // scrolled up: a new line does not pull the view down
    await log.evaluate((el) => {
      el.scrollTop = 0;
    });
    await page
      .getByRole('button', { name: 'Giao diện', exact: true })
      .or(page.getByRole('button', { name: 'Theme', exact: true }))
      .click();
    await page.getByRole('menuitemradio', { name: /Light|Sáng/ }).click();
    await expect(log).toContainText('I/Settings: theme -> light');
    expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  });
});

test.describe('the Problems tab', () => {
  test('says there are no problems, and the status bar counts zero', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await openTab(page, 'Problems');
    await expect(
      page.getByText('No problems have been detected in the workspace.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Problems (0 errors, 0 warnings)' }),
    ).toBeVisible();
  });

  test('a failed query is an error in the Output, a row in Problems and 1 in the status bar', async ({
    page,
  }) => {
    const ids = watchProjectId(page);
    await failCollection(page, 'projects');
    await gotoSkin(page, '/projects');
    await openTab(page, 'Output');
    const log = logOf(page);
    await expect(log).toContainText(/E\/Query: projects failed \(\w+\)/, {
      timeout: 15_000,
    });
    // the retry before it is a warning
    await expect(log).toContainText('W/Query: projects retry 1');
    const error = log.getByText(/^E\/Query: projects failed/);
    const info = log.getByText(/^I\/Portfolio: /);
    const color = (locator: typeof error) =>
      locator.evaluate((el) => getComputedStyle(el).color);
    expect(await color(error)).not.toBe(await color(info));
    const status = page.getByRole('button', {
      name: 'Problems (1 errors, 1 warnings)',
    });
    await expect(status).toBeVisible();
    expectNoSecrets(await textOf(logOf(page)), ids);

    // the status button opens the tab on the row
    await status.click();
    const list = page.getByRole('list', { name: 'Problems list' });
    await expect(
      list
        .getByRole('listitem')
        .filter({ hasText: 'projects: could not be read' }),
    ).toContainText('query');
    await expect(
      list
        .getByRole('listitem')
        .filter({ hasText: 'projects: needed a retry' }),
    ).toBeVisible();
    expectNoSecrets(await textOf(list), ids);
    // the Output keeps its lines when Clear is pressed: the problems stay
    await openTab(page, 'Output');
    await panelOf(page).getByRole('button', { name: 'Clear output' }).click();
    await expect(status).toBeVisible();
  });

  test('an uncaught error and an unhandled rejection are rows with the error type only, and a repeat is counted', async ({
    page,
  }) => {
    // the log has started: the listeners for errors are on
    await expect(await openOutput(page)).toContainText('I/Portfolio: ready');
    await page.evaluate(() => {
      for (let i = 0; i < 3; i += 1) {
        setTimeout(() => {
          throw new TypeError(
            'bachbnt@gmail.com 0912345678 https://x.test/?a=b',
          );
        }, 0);
      }
      Promise.reject(new RangeError('secret-token-in-a-message'));
    });
    await openTab(page, 'Problems');
    const list = page.getByRole('list', { name: 'Problems list' });
    const uncaught = list
      .getByRole('listitem')
      .filter({ hasText: 'An uncaught error occurred (TypeError)' });
    await expect(uncaught).toContainText('runtime');
    await expect(uncaught.getByLabel('3 times')).toHaveText('3');
    await expect(
      list.getByRole('listitem').filter({
        hasText: 'A promise was rejected and nothing handled it (RangeError)',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Problems (2 errors, 0 warnings)' }),
    ).toBeVisible();
    expectNoSecrets(await textOf(list), new Set());
    await openTab(page, 'Output');
    await expect(logOf(page)).toContainText('E/Runtime: uncaught (TypeError)');
    expectNoSecrets(await textOf(logOf(page)), new Set());
  });

  test('has Vietnamese words', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('bach-cv-lang', 'vi');
    });
    await gotoSkin(page, '/');
    await openTab(page, 'Vấn đề');
    await expect(
      page.getByText('Không phát hiện vấn đề nào trong workspace.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Vấn đề (0 lỗi, 0 cảnh báo)' }),
    ).toBeVisible();
    await openTab(page, 'Output');
    await expect(
      page.getByRole('log', { name: 'Nhật ký Output' }),
    ).toContainText('I/Portfolio: ready');
    await expect(
      panelOf(page).getByRole('button', { name: 'Xóa output' }),
    ).toBeVisible();
  });

  test('has Vietnamese rows for a failed query', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('bach-cv-lang', 'vi');
    });
    await failCollection(page, 'projects');
    await gotoSkin(page, '/projects');
    await openTab(page, 'Vấn đề');
    await expect(
      page
        .getByRole('list', { name: 'Danh sách vấn đề' })
        .getByText('projects: không đọc được'),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: 'Vấn đề (1 lỗi, 1 cảnh báo)' }),
    ).toBeVisible();
    await openTab(page, 'Output');
    await expect(logOf(page)).toContainText('E/Query: projects failed');
  });
});
