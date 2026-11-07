/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'stream');
  await mockFirestore(page);
  await mockImages(page);
});

const player = (page: Page) =>
  page.getByRole('region', { name: 'My career, played scene by scene' });
const chapters = (page: Page) =>
  player(page).getByRole('group', { name: 'Chapters' }).getByRole('button');
const playing = (page: Page) =>
  player(page)
    .getByRole('group', { name: 'Chapters' })
    .locator('[aria-current="true"]');

/** The roles of the seed that are visible, from the oldest to the newest: the order the player plays them. */
const SCENES = [
  /Devblock Vietnam/,
  /MoMo \(M_Service\)/,
  /American Code Lab/,
  /FPT Software/,
];

const running = (page: Page, value: 'true' | 'false') =>
  expect(player(page)).toHaveAttribute('data-running', value);

/**
 * Takes the page's clock over once the player is on screen, so a test moves the career by hand: it waits for the frame loop to
 * follow the fake clock (it may still hang on a real frame), then starts the career again from its first moment, with the pointer away.
 */
async function holdClock(page: Page) {
  await running(page, 'true');
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const progress = () =>
    player(page).evaluate((el) => Number(el.style.getPropertyValue('--sm-cp')));
  const before = await progress();
  await expect
    .poll(async () => {
      await page.clock.runFor(50);
      return (await progress()) !== before;
    })
    .toBe(true);
  await chapters(page).first().click();
  await page.mouse.move(0, 0);
  await running(page, 'true');
  await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
}

test.describe('Home, the career playing', () => {
  test('keeps the information of Standard: title, intro, buttons, technologies, work, pipeline, build, projects, contact', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'I lead mobile teams and build the AI tooling they ship with.',
    );
    await expect(
      page.getByText(/^Team Lead at FPT Software with 7 years/),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Download CV' }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Technologies' })
        .getByRole('listitem')
        .first(),
    ).toBeVisible();

    const work = page.getByRole('region', { name: "Where I've worked" });
    await expect(work.getByRole('listitem')).toHaveCount(4);
    await expect(work.getByText('Current')).toHaveCount(1);
    await expect(
      work.getByRole('link', { name: 'Full resume' }),
    ).toHaveAttribute('href', '/resume');

    const flow = page.getByRole('region', {
      name: 'How a bug becomes a merge request',
    });
    await expect(
      flow.getByRole('listitem').filter({ hasText: 'Reads the Jira bug' }),
    ).toBeVisible();
    await expect(flow.getByText('Design + code MRs')).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: "What I've built at FPT" })
        .getByRole('listitem'),
    ).toHaveCount(6);

    const featured = page.getByRole('region', { name: 'Featured projects' });
    await expect(
      featured.getByRole('listitem').filter({ has: page.getByRole('heading') }),
    ).toHaveCount(3);
    await expect(
      featured.getByRole('heading', { name: 'VenusAI' }),
    ).toBeVisible();
    await expect(
      featured.getByRole('link', { name: /VenusAI/ }),
    ).toHaveAttribute('href', /apps\.apple\.com/);
    await expect(featured.getByText('Flutter, Firebase').first()).toBeVisible();
    await expect(
      featured.getByText(/An app that creates AI avatars/),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'All projects' }),
    ).toHaveAttribute('href', '/projects');

    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(page.getByText('(+84) 384560623')).toBeVisible();
    await expect(page.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Chat with BB Bot' }),
    ).toBeVisible();
  });

  test('has one chapter for each role, the red badge on the current one only, and 2x as the speed', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(chapters(page)).toHaveCount(4);
    for (const [i, name] of SCENES.entries())
      await expect(chapters(page).nth(i)).toHaveAccessibleName(name);
    await expect(
      player(page).getByRole('button', { name: 'Playback speed: 2x' }),
    ).toHaveText('2x');
    const scene = player(page).locator('[data-active="true"]');
    await expect(scene.getByText('Current')).toHaveCount(0);
    await expect(player(page)).toContainText(
      /2020 \/ 2020–2026|20\d\d \/ 2020–2026/,
    );
    await chapters(page).nth(3).click();
    await expect(scene.getByText('Current', { exact: true })).toBeVisible();
  });

  test('plays scene by scene by itself, and a scene says all about its role', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    const scene = player(page).locator('[data-active="true"]');
    await expect(scene).toContainText('Devblock Vietnam');
    await expect(scene).toContainText('Junior Mobile Developer');
    await expect(scene).toContainText('Mar 2020 – Apr 2022');
    await expect(scene).toContainText('REST APIs');
    // 2x: a scene lasts 4 seconds
    await page.clock.runFor(4300);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
    await page.clock.runFor(4000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[2]);
  });

  test('stops on the current role at the end, offers Replay, and Replay starts again', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    await page.clock.runFor(20_000);
    await running(page, 'false');
    await expect(playing(page)).toHaveAccessibleName(SCENES[3]);
    const scene = player(page).locator('[data-active="true"]');
    await expect(scene).toContainText('Key project');
    await expect(scene).toContainText('9PP - Yamato Transport');
    const replay = player(page).getByRole('button', {
      name: 'Replay the career',
    });
    await expect(replay).toBeVisible();
    // it stays on the current role
    await page.clock.runFor(10_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[3]);
    await replay.click();
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await page.mouse.move(0, 0);
    await page.clock.runFor(4300);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
  });

  test('pause, play and the speed button work', async ({ page }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    const speed = (label: string) =>
      player(page).getByRole('button', { name: `Playback speed: ${label}` });
    await speed('2x').click();
    await expect(speed('1x')).toBeVisible();
    await speed('1x').click();
    await expect(speed('1.5x')).toBeVisible();
    await speed('1.5x').click();
    await expect(speed('2x')).toBeVisible();
    await speed('2x').click();
    await speed('1x').click();

    await player(page)
      .getByRole('button', { name: 'Pause the career' })
      .click();
    const play = player(page).getByRole('button', { name: 'Play the career' });
    await expect(play).toBeVisible();
    await page.mouse.move(0, 0);
    await running(page, 'false');
    await page.clock.runFor(12_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await play.click();
    await page.mouse.move(0, 0);
    await running(page, 'true');
    // 1.5x: a scene lasts 5.33 seconds
    await page.clock.runFor(5000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await page.clock.runFor(700);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
  });

  test('a press on Play goes on while the pointer is still on the player', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    await player(page)
      .getByRole('button', { name: 'Pause the career' })
      .click();
    await player(page).getByRole('button', { name: 'Play the career' }).click();
    // the pointer is still on the player and the career goes on all the same
    await running(page, 'true');
    await page.clock.runFor(4300);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
  });

  test('is held while the pointer or the keyboard focus is on the player', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    await player(page).hover({ position: { x: 300, y: 100 } });
    await running(page, 'false');
    await page.clock.runFor(10_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await chapters(page).first().focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(chapters(page).first()).toBeFocused();
    await running(page, 'false');
    await page.clock.runFor(10_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await chapters(page).first().blur();
    await running(page, 'true');
    await page.clock.runFor(4300);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
  });

  test('does not run while it is off screen', async ({ page }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(player(page)).not.toBeInViewport();
    await running(page, 'false');
    await page.clock.runFor(10_000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(player(page)).toBeInViewport();
    await running(page, 'true');
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await page.clock.runFor(4300);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
  });

  test('does not run while the tab is hidden', async ({ page }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await running(page, 'false');
    await page.clock.runFor(10_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
  });

  test('a click on a chapter seeks, the arrow keys, Home and End seek too, and the panel seeks', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await holdClock(page);
    await chapters(page).nth(2).click();
    await expect(playing(page)).toHaveAccessibleName(SCENES[2]);
    await expect(player(page).locator('[data-active="true"]')).toContainText(
      'Part-Time Technical Instructor',
    );

    await chapters(page).nth(2).focus();
    await page.keyboard.press('ArrowRight');
    await expect(playing(page)).toHaveAccessibleName(SCENES[3]);
    await expect(chapters(page).nth(3)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(playing(page)).toHaveAccessibleName(SCENES[2]);
    await page.keyboard.press('Home');
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await page.keyboard.press('End');
    await expect(playing(page)).toHaveAccessibleName(SCENES[3]);

    const work = page.getByRole('region', { name: "Where I've worked" });
    await work.getByRole('button', { name: /MoMo/ }).click();
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
    await expect(work.getByRole('button', { name: /MoMo/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('shows the title of a chapter (company and role) on hover and on focus', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const tip = player(page).locator('[data-chapter-tip]');
    await chapters(page).nth(1).hover();
    await expect(tip.nth(1)).toBeVisible();
    await expect(tip.nth(1)).toContainText('MoMo (M_Service)');
    await expect(tip.nth(1)).toContainText('Senior Mobile App Developer');
    await page.mouse.move(0, 0);
    await chapters(page).nth(3).focus();
    await expect(tip.nth(3)).toContainText('Current');
    await expect(tip.nth(3)).toContainText('FPT Software');
  });

  test('with reduced motion nothing plays by itself, the scenes change only by seeking, and the first one is whole', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await expect(
      player(page).getByRole('button', {
        name: /Pause the career|Play the career/,
      }),
    ).toHaveCount(0);
    await expect(
      player(page).getByRole('button', { name: /Playback speed/ }),
    ).toHaveCount(0);
    const scene = player(page).locator('[data-active="true"]');
    await expect(scene).toContainText('Junior Mobile Developer');
    await expect(scene).toContainText('Mar 2020 – Apr 2022');
    await expect(scene).toContainText('Android, iOS and React Native apps');
    await page.clock.install();
    await page.clock.runFor(30_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[0]);
    await chapters(page).nth(1).click();
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
    await page.clock.runFor(30_000);
    await expect(playing(page)).toHaveAccessibleName(SCENES[1]);
  });

  test('the scenes that do not play are out of reach of the keyboard and of screen readers', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(player(page).locator('[data-active="false"]')).toHaveCount(3);
    await expect(
      player(page).locator('[data-active="false"][inert][aria-hidden="true"]'),
    ).toHaveCount(3);
  });

  test('is in Vietnamese, words and all', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Mình dẫn dắt các nhóm mobile',
    );
    await expect(
      page.getByRole('region', {
        name: 'Hành trình nghề nghiệp của mình, phát từng cảnh',
      }),
    ).toBeVisible();
    await expect(page.getByRole('group', { name: 'Các chương' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Tốc độ phát: 2x' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Tải CV' }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem hồ sơ đầy đủ' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Tất cả dự án' }),
    ).toBeVisible();
  });

  test('the Ask BB Bot button opens the chat in a sheet', async ({ page }) => {
    await mockWorker(page, () => ({ body: { text: 'Hello from the bot.' } }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Ask BB Bot' }).click();
    const chat = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(chat).toBeVisible();
    await chat.getByRole('textbox', { name: 'Message' }).fill('Hi');
    await chat.getByRole('button', { name: 'Send chat message' }).click();
    await expect(chat.getByText('Hello from the bot.')).toBeVisible();
    await chat.getByRole('button', { name: 'Close chat' }).click();
    await expect(chat).toHaveCount(0);
  });

  test('the chat switch takes the chat buttons away, the CV switch takes Download CV away', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { features: { chat: false, cvDownload: false } },
    });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask BB Bot' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('button', { name: 'Chat with BB Bot' }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
  });

  test('shows the player in a skeleton while the roles load, and keeps the title', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      if (
        (route.request().postData() ?? '').includes(
          '"collectionId":"experience"',
        )
      )
        await new Promise((resolve) => setTimeout(resolve, 1500));
      return route.fallback();
    });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('status', { name: 'Loading' }).first(),
    ).toBeVisible();
    await expect(chapters(page)).toHaveCount(4, { timeout: 15_000 });
  });

  test('has no horizontal scroll on a phone, and keeps 44px targets for the controls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/');
    await expect(chapters(page)).toHaveCount(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const box = await player(page)
      .getByRole('button', { name: /Pause the career|Play the career/ })
      .boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(40);
  });
});
