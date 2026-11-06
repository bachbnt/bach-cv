/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
});

const HINT = 'Type help to see the commands.';

const lineOf = (page: Page, name = 'Terminal command line') =>
  page.getByRole('textbox', { name });
const logOf = (page: Page) => page.getByRole('log', { name: 'Terminal' });

/** Opens a page of the Dev skin and the Terminal tab of the bottom panel, as a visitor does. */
async function openTerminal(page: Page, path = '/') {
  await gotoSkin(page, path);
  await page
    .getByRole('button', { name: 'Terminal', exact: true })
    .first()
    .click();
  await expect(lineOf(page)).toBeVisible();
  return lineOf(page);
}

/** Types a line and presses Enter. */
async function run(page: Page, command: string, label?: string) {
  const line = lineOf(page, label);
  await line.fill(command);
  await line.press('Enter');
}

test.describe('the Terminal tab', () => {
  test.beforeEach(async ({ page }) => {
    await mockFirestore(page);
  });

  test('shows a prompt and a hint, and the line has the focus once the visitor opens the tab', async ({
    page,
  }) => {
    const line = await openTerminal(page);
    await expect(logOf(page).getByText(HINT)).toBeVisible();
    await expect(line).toBeFocused();
    await expect(line).toHaveAttribute('autocomplete', 'off');
    await expect(line).toHaveAttribute('spellcheck', 'false');
    await expect(page.getByText('➜ bachbntdev git:(main)')).toBeVisible();
  });

  test('does not take the focus on page load, even when the panel was left open on it', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'bach-cv-dev-ui',
        JSON.stringify({ panel: 'terminal' }),
      );
    });
    await gotoSkin(page, '/');
    await expect(lineOf(page)).toBeVisible();
    await expect(lineOf(page)).not.toBeFocused();
  });

  test('a click on the screen focuses the line', async ({ page }) => {
    const line = await openTerminal(page);
    await run(page, 'help');
    await page.getByRole('button', { name: 'Close panel' }).focus();
    await logOf(page).getByText('show this list').click();
    await expect(line).toBeFocused();
  });

  test('help lists the commands', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'help');
    const log = logOf(page);
    await expect(log.getByText('Commands:')).toBeVisible();
    for (const [name, text] of [
      ['help', 'show this list'],
      ['ls', 'list the pages'],
      ['cd', 'go to a page'],
      ['cv', 'open my CV'],
      ['connect', 'open the contact menu'],
      ['ask', 'chat with BB Bot'],
      ['clear', 'clear the screen'],
      ['exit', 'close the terminal'],
    ]) {
      await expect(
        log.getByText(new RegExp(`^\\s*${name}\\s+${text}`)),
      ).toBeVisible();
    }
    // the command is echoed with the prompt, the line is empty for the next one, and the hint is gone
    await expect(log.getByText('help', { exact: true })).toHaveCount(0);
    await expect(log.getByText(HINT)).toBeHidden();
    await expect(lineOf(page)).toHaveValue('');
  });

  test('ls lists the files of the pages', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'ls');
    await expect(
      logOf(page).getByText(
        'Home.java  About.js  Resume.dart  Projects.py  Certificates.kt  Services.ts  Payment.swift',
      ),
    ).toBeVisible();
  });

  test('cd goes to a page like its tab does, and the scrollback and history stay', async ({
    page,
  }) => {
    await openTerminal(page);
    await run(page, 'cd about');
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: /About\.js/ }),
    ).toHaveAttribute('aria-current', 'page');
    // the window is the same one, so what was typed is still there
    await expect(logOf(page).getByText('cd about')).toBeVisible();
    await expect(lineOf(page)).toBeFocused();
    await lineOf(page).press('ArrowUp');
    await expect(lineOf(page)).toHaveValue('cd about');
  });

  test('cd takes a file name in any case, ~ and ..', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'cd About.js');
    await expect(page).toHaveURL(/\/about$/);
    await run(page, 'cd PROJECTS.PY');
    await expect(page).toHaveURL(/\/projects$/);
    await run(page, 'cd ~');
    await expect(page).toHaveURL(/\/$/);
    await run(page, 'cd resume');
    await expect(page).toHaveURL(/\/resume$/);
    await run(page, 'cd ..');
    await expect(page).toHaveURL(/\/$/);
    await run(page, 'cd certificates');
    await expect(page).toHaveURL(/\/certificates$/);
    await run(page, 'cd');
    await expect(page).toHaveURL(/\/$/);
  });

  test('cd to an unknown page says so and stays', async ({ page }) => {
    await openTerminal(page, '/about');
    await run(page, 'cd nowhere');
    await expect(
      logOf(page).getByText('cd: no such file or directory: nowhere'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('an unknown command says so and hints at help; an empty line is a new prompt', async ({
    page,
  }) => {
    await openTerminal(page);
    await run(page, 'sudo reboot');
    const log = logOf(page);
    await expect(log.getByText('zsh: command not found: sudo')).toBeVisible();
    await expect(log.getByText(HINT)).toBeVisible();
    await run(page, '');
    await expect(log.locator('p')).toHaveCount(4);
  });

  test('cv opens the CV window and Escape gives the focus back to the line', async ({
    page,
  }) => {
    await openTerminal(page);
    await run(page, 'cv');
    await expect(logOf(page).getByText('opening cv…')).toBeVisible();
    const dialog = page.getByRole('dialog', { name: /CV/ });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(lineOf(page)).toBeFocused();
  });

  test('connect opens the palette and Escape gives the focus back to the line', async ({
    page,
  }) => {
    await openTerminal(page);
    await run(page, 'connect');
    await expect(logOf(page).getByText('opening connect…')).toBeVisible();
    await expect(
      page.getByRole('dialog', { name: "Let's connect" }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(lineOf(page)).toBeFocused();
  });

  test('ask opens BB Bot', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'ask');
    await expect(logOf(page).getByText('opening BB Bot…')).toBeVisible();
    await expect(
      page.getByRole('dialog', { name: 'BB Bot, AI assistant' }),
    ).toBeVisible();
  });

  test('ArrowUp and ArrowDown browse the history and keep what was being typed', async ({
    page,
  }) => {
    const line = await openTerminal(page);
    await run(page, 'help');
    await run(page, 'ls');
    await line.fill('half');
    await line.press('ArrowUp');
    await expect(line).toHaveValue('ls');
    await line.press('ArrowUp');
    await expect(line).toHaveValue('help');
    await line.press('ArrowUp');
    await expect(line).toHaveValue('help');
    await line.press('ArrowDown');
    await expect(line).toHaveValue('ls');
    await line.press('ArrowDown');
    await expect(line).toHaveValue('half');
    await line.press('ArrowDown');
    await expect(line).toHaveValue('half');
  });

  test('Tab completes a command, a page and lists several matches', async ({
    page,
  }) => {
    const line = await openTerminal(page);
    await line.fill('he');
    await line.press('Tab');
    await expect(line).toHaveValue('help ');

    await line.fill('cd ab');
    await line.press('Tab');
    await expect(line).toHaveValue('cd About.js');

    await line.fill('cd Res');
    await line.press('Tab');
    await expect(line).toHaveValue('cd Resume.dart');

    await line.fill('c');
    await line.press('Tab');
    await expect(line).toHaveValue('c');
    await expect(logOf(page).getByText('cd  cv  connect  clear')).toBeVisible();
    await expect(line).toBeFocused();
  });

  test('Tab moves on when the line is empty or has nothing to complete', async ({
    page,
  }) => {
    const line = await openTerminal(page);
    await line.press('Tab');
    await expect(line).not.toBeFocused();
    await line.focus();
    await line.fill('zzz');
    await line.press('Tab');
    await expect(line).not.toBeFocused();
  });

  test('clear and Ctrl+L empty the scrollback', async ({ page }) => {
    await openTerminal(page);
    await run(page, 'help');
    await expect(logOf(page).getByText('Commands:')).toBeVisible();
    await run(page, 'clear');
    await expect(logOf(page).getByText('Commands:')).toHaveCount(0);
    await expect(logOf(page).locator('p')).toHaveCount(1);

    await run(page, 'ls');
    await expect(logOf(page).getByText('Home.java')).toBeVisible();
    await lineOf(page).press('Control+l');
    await expect(logOf(page).getByText('Home.java')).toHaveCount(0);
    await expect(lineOf(page)).toBeFocused();
  });

  test('exit closes the panel and the Terminal button of the status bar has the focus', async ({
    page,
  }) => {
    await openTerminal(page);
    await run(page, 'exit');
    await expect(lineOf(page)).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Terminal', exact: true }).last(),
    ).toBeFocused();
  });

  test('keeps the scrollback when the panel is closed and opened again', async ({
    page,
  }) => {
    await openTerminal(page);
    await run(page, 'ls');
    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect(lineOf(page)).toBeHidden();
    await page
      .getByRole('button', { name: 'Terminal', exact: true })
      .first()
      .click();
    await expect(logOf(page).getByText('Home.java')).toBeVisible();
    await expect(lineOf(page)).toBeFocused();
  });

  test('the Output and Problems tabs keep their lines', async ({ page }) => {
    await openTerminal(page);
    await page
      .getByRole('button', { name: 'Output', exact: true })
      .first()
      .click();
    await expect(page.getByText(/I\/Portfolio: ready/)).toBeVisible();
    await expect(lineOf(page)).toBeHidden();
    await page.getByRole('button', { name: 'Problems', exact: true }).click();
    await expect(
      page.getByText('No problems have been detected in the workspace.'),
    ).toBeVisible();
  });

  test('answers in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('bach-cv-lang', 'vi');
    });
    await gotoSkin(page, '/');
    await page
      .getByRole('button', { name: 'Terminal', exact: true })
      .first()
      .click();
    const log = page.getByRole('log', { name: 'Terminal' });
    await expect(log.getByText('Gõ help để xem các lệnh.')).toBeVisible();
    await run(page, 'help', 'Dòng lệnh của terminal');
    await expect(log.getByText('Các lệnh:')).toBeVisible();
    await expect(log.getByText(/mở CV của mình/)).toBeVisible();
    await run(page, 'cd nowhere', 'Dòng lệnh của terminal');
    await expect(
      log.getByText('cd: không có tệp hoặc thư mục: nowhere'),
    ).toBeVisible();
    await run(page, 'abc', 'Dòng lệnh của terminal');
    await expect(log.getByText('zsh: không tìm thấy lệnh: abc')).toBeVisible();
  });

  test('is usable on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const line = await openTerminal(page);
    await run(page, 'help');
    await expect(logOf(page).getByText('Commands:')).toBeVisible();
    await line.fill('ls');
    await expect(line).toBeVisible();
    const box = await line.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe('the Terminal and the switches of the site', () => {
  test('the commands of a feature that is off say it is not available', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': {
        features: { cvDownload: false, connectMenu: false, chat: false },
      },
    });
    await openTerminal(page);
    // the switches arrive after the page: until they do, every feature is on
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
    for (const name of ['cv', 'connect', 'ask']) {
      await run(page, name);
      await expect(
        logOf(page).getByText(`${name}: not available`),
      ).toBeVisible();
    }
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('a hidden page is not listed and cannot be entered, a page that is soon is marked and cannot be entered', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'hidden', services: 'soon' } },
    });
    await openTerminal(page);
    // the switches arrive after the page: until they do, every page is on
    await expect(
      page.getByRole('link', { name: /Payment\.swift/ }),
    ).toHaveCount(0);
    await run(page, 'ls');
    const log = logOf(page);
    await expect(
      log.getByText(
        'Home.java  About.js  Resume.dart  Projects.py  Certificates.kt  Services.ts (soon)',
      ),
    ).toBeVisible();
    await run(page, 'cd Payment.swift');
    await expect(
      log.getByText('cd: no such file or directory: Payment.swift'),
    ).toBeVisible();
    await run(page, 'cd services');
    await expect(log.getByText('cd: services: coming soon')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
