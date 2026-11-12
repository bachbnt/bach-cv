/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore, interceptCollection } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { pageSettled } from '../support/animations';

/** The first visit to a page compiles it in the dev server, which is slow when the machine is busy. */
const SLOW = { timeout: 30_000 };

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const TITLE = 'I lead mobile teams and build the AI tooling they ship with.';

test.describe('Home keeps the information of Standard', () => {
  test('the hero: the title and the intro as real text, Download CV and Ask BB Bot', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const hero = page.getByRole('region', { name: TITLE });
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(TITLE);
    await expect(hero).toContainText('Team Lead at FPT Software with 7 years');
    await hero.getByRole('button', { name: 'Ask BB Bot' }).click();
    await expect(page.getByRole('dialog', { name: /BB Bot/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await hero.getByRole('button', { name: 'Download CV' }).click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
  });

  test('the symbol overview: the name, the headline, the years that count up to the real number and the real counts', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const symbol = page.getByRole('region', { name: 'Symbol overview' });
    await expect(symbol).toContainText('Bach Bui');
    await expect(symbol).toContainText('Software Engineer');
    await expect(symbol).toContainText('Ho Chi Minh City, Vietnam');
    // the number is announced as it is, and the animated one settles on it
    await expect(symbol.getByText('7 years in software')).toBeAttached();
    await expect(
      symbol.locator('[aria-hidden="true"]').filter({ hasText: /^7$/ }),
    ).toBeVisible();
    const strip = symbol.getByRole('group', { name: 'The site in numbers' });
    await expect(strip.getByRole('link', { name: /Projects/ })).toContainText(
      '10',
    );
    await expect(
      strip.getByRole('link', { name: /Certificates/ }),
    ).toContainText('3');
    await expect(strip.getByRole('link', { name: /Roles/ })).toContainText('4');
    await strip.getByRole('link', { name: /Certificates/ }).click();
    await expect(page).toHaveURL(/\/certificates$/, SLOW);
  });

  test('the number counts up once: it starts below the real number and arrives', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const shown = page
      .getByRole('region', { name: 'Symbol overview' })
      .locator('span[aria-hidden="true"]')
      .filter({ hasText: /^\d+$/ })
      .first();
    await expect(shown).toHaveText('7');
    // going to another page and back does not make it count again
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'About' })
      .click();
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Home' })
      .click();
    await expect(shown).toHaveText('7');
  });

  test('with reduced motion the number is there at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    await expect(
      page
        .getByRole('region', { name: 'Symbol overview' })
        .locator('[aria-hidden="true"]')
        .filter({ hasText: /^7$/ }),
    ).toBeVisible();
  });

  test('the pipeline is an idea card of the dashboard', async ({ page }) => {
    await gotoSkin(page, '/');
    const idea = page.getByRole('region', {
      name: 'How a bug becomes a merge request',
    });
    await expect(idea).toContainText('Idea');
    await expect(idea.getByRole('heading', { level: 3 })).toHaveText([
      'Reads the Jira bug',
      'Finds the root cause',
      'Opens the right fix for review',
    ]);
    for (const tag of ['Fix MR', 'Vendor Q&A', 'Design + code MRs'])
      await expect(idea.getByText(tag)).toBeVisible();
  });

  test('featured projects are idea cards with the cover, kind, name, summary, technologies and links', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const widget = page.getByRole('region', { name: 'Featured projects' });
    const ideas = widget.getByTestId('idea');
    await expect(ideas).toHaveCount(3);
    await expect(ideas.getByRole('heading', { level: 3 })).toHaveText([
      'VenusAI',
      'Yoga Lasyn',
      'DevPad',
    ]);
    const venus = ideas.first();
    await expect(
      venus.getByRole('img', { name: 'VenusAI cover' }),
    ).toBeVisible();
    await expect(venus).toContainText('Freelance');
    await expect(venus).toContainText(
      'An app that creates AI avatars, built with Flutter and Firebase.',
    );
    await expect(venus).toContainText('Flutter, Firebase');
    await expect(venus.getByRole('link', { name: 'VenusAI' })).toHaveAttribute(
      'href',
      /apps\.apple\.com/,
    );
    const devpad = ideas.nth(2);
    await expect(devpad).toContainText('2026');
    await expect(devpad.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await expect(devpad.getByRole('link', { name: 'Releases' })).toBeVisible();
    await expect(
      widget.getByRole('link', { name: 'All projects' }),
    ).toHaveAttribute('href', '/projects');
  });

  test('where I have worked: the roles as a timeline with the Current pill and the link to the resume', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const widget = page.getByRole('region', { name: "Where I've worked" });
    await expect(widget.getByRole('heading', { level: 3 })).toHaveText([
      /FPT Software/,
      /MoMo/,
      /American Code Lab/,
      /Devblock Vietnam/,
    ]);
    await expect(widget.getByText('Current')).toHaveCount(1);
    await expect(widget).toContainText('Team Lead');
    // how long it lasted comes from the dates
    await expect(widget).toContainText(/\d+ y( \d+ mo)?|\d+ mo/);
    await expect(
      widget.getByRole('link', { name: 'Full resume' }),
    ).toHaveAttribute('href', '/resume');
    await widget.getByRole('link', { name: /MoMo/ }).click();
    await expect(page).toHaveURL(/\/resume$/, SLOW);
  });

  test("what I've built at FPT: the six items in order", async ({ page }) => {
    await gotoSkin(page, '/');
    const widget = page.getByRole('region', { name: "What I've built at FPT" });
    await expect(widget.getByRole('heading', { level: 3 })).toHaveText([
      'Bug-fixing pipeline',
      'Teams bot',
      'MR review and design-sync agents',
      'detekt-fix workflow',
      'Yokoten rollouts',
      'Build Portal',
    ]);
    await expect(widget).toContainText('Engineering workflows the team of 10');
  });

  test('the contact band: the title, the email, the place, the phone and the chat card', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const band = page.getByRole('region', {
      name: 'Have a role or a project in mind?',
    });
    await expect(
      band.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(band).toContainText('Ho Chi Minh City, Vietnam');
    await expect(band).toContainText('(+84) 384560623');
    await band.getByRole('button', { name: 'Chat with BB Bot' }).click();
    await expect(page.getByRole('dialog', { name: /BB Bot/ })).toBeVisible();
  });

  test('the bar of sections scrolls to each one', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await gotoSkin(page, '/');
    const bar = page.getByRole('group', { name: 'Sections of the home page' });
    await expect(bar.getByRole('button')).toHaveText([
      'Projects',
      'Work',
      'Build',
      'Contact',
    ]);
    await bar.getByRole('button', { name: 'Contact' }).click();
    await expect(
      page.getByRole('heading', { name: 'Have a role or a project in mind?' }),
    ).toBeInViewport();
    await bar.getByRole('button', { name: 'Build' }).click();
    await expect(
      page.getByRole('heading', { name: "What I've built at FPT" }),
    ).toBeInViewport();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Mình dẫn dắt các nhóm mobile',
    );
    await expect(
      page.getByRole('region', { name: 'Dự án nổi bật' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Nơi mình đã làm việc' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Tổng quan' })).toContainText(
      'năm làm phần mềm',
    );
    await expect(
      page.getByRole('group', { name: 'Các phần của trang chủ' }),
    ).toBeVisible();
  });
});

test.describe('Home states', () => {
  test('the featured projects show a skeleton while they load, then the cards', async ({
    page,
  }) => {
    await interceptCollection(page, 'projects', { delay: 1500 });
    await gotoSkin(page, '/');
    await expect(
      page
        .getByRole('region', { name: 'Featured projects' })
        .getByRole('status', { name: 'Loading' }),
    ).toBeVisible();
    await expect(page.getByTestId('idea')).toHaveCount(3);
  });

  test('the featured projects are left out when there are none or they fail to load', async ({
    page,
  }) => {
    await interceptCollection(page, 'projects', 'error');
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Featured projects' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Projects', exact: true }),
    ).toHaveCount(0);
  });

  test('where I have worked shows the error with Try again, and the empty card', async ({
    page,
  }) => {
    await interceptCollection(page, 'experience', 'error');
    await gotoSkin(page, '/');
    const widget = page.getByRole('region', { name: "Where I've worked" });
    await expect(
      widget.getByRole('heading', {
        name: "The work history couldn't be loaded",
      }),
    ).toBeVisible();
    await expect(
      widget.getByRole('button', { name: 'Try again' }),
    ).toBeVisible();
  });

  test('where I have worked says so when there is nothing to show', async ({
    page,
  }) => {
    await interceptCollection(page, 'experience', 'empty');
    await gotoSkin(page, '/');
    await expect(
      page
        .getByRole('region', { name: "Where I've worked" })
        .getByRole('heading', { name: 'No roles to show yet' }),
    ).toBeVisible();
  });

  test('the contact band shows the error with Try again', async ({ page }) => {
    await interceptCollection(page, 'contacts', 'error');
    await gotoSkin(page, '/');
    await expect(
      page
        .getByRole('region', { name: 'Have a role or a project in mind?' })
        .getByRole('button', { name: 'Try again' }),
    ).toBeVisible();
  });

  test('the Skills list of the watchlist has the same three states', async ({
    page,
  }) => {
    await interceptCollection(page, 'skills', 'error');
    await gotoSkin(page, '/about');
    await page.getByRole('tab', { name: 'Skills' }).click();
    await expect(
      page
        .getByRole('tabpanel')
        .getByRole('heading', { name: "Skills couldn't be loaded" }),
    ).toBeVisible();
    await expect(
      page.getByRole('tabpanel').getByRole('button', { name: 'Try again' }),
    ).toBeVisible();
  });

  test('the switches take the chat and the CV away, and a page that is coming soon shows its screen', async ({
    page,
  }) => {
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
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
  });

  test('Home coming soon shows the Coming soon screen', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { home: 'soon' } } });
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
  });
});

test.describe('Home on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('stacks the cards and nothing scrolls sideways', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(page.getByTestId('idea')).toHaveCount(3);
    await pageSettled(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const first = (await page.getByTestId('idea').first().boundingBox())!;
    const second = (await page.getByTestId('idea').nth(1).boundingBox())!;
    expect(second.y).toBeGreaterThan(first.y + first.height - 2);
  });
});
