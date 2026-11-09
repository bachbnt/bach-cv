/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
});

/** Answers the reads of one collection with `answer` ('empty' or 'error'), or waits `delay` ms before every read. */
async function intercept(
  page: Page,
  collection: string,
  answer: 'empty' | 'error' | { delay: number },
) {
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    if (typeof answer === 'object') {
      await new Promise((resolve) => setTimeout(resolve, answer.delay));
      return route.fallback();
    }
    const mine =
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes(`"collectionId":"${collection}"`);
    if (!mine) return route.fallback();
    return answer === 'error'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        })
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-01-01T00:00:00Z' }]),
        });
  });
}

const noHorizontalScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );

test.describe('Home in the Academic skin', () => {
  test('the title says what I do, with the CV and the chat buttons and the portrait', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'I lead mobile teams and build the AI tooling they ship with.',
    );
    await expect(
      page.getByRole('button', { name: /^Download CV/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Ask BB Bot/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Bach Bui reading a book' }),
    ).toBeVisible();
  });

  test('the margin says which role is not over and since when, read from the roles', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const note = page.getByRole('complementary').filter({
      hasText: 'current role',
    });
    await expect(note).toContainText('Team Lead, FPT Software');
    await expect(note).toContainText('since Jan 2026');
  });

  test('the abstract is the intro of Standard with the years in software, and the margin says them too', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const abstract = page
      .getByRole('heading', { level: 2, name: 'Abstract' })
      .locator('xpath=..');
    await expect(abstract).toContainText(/with \d+ years in software/);
    const margin = page
      .getByRole('complementary')
      .filter({ hasText: 'in software' });
    await expect(margin).toContainText(/^\d+ years/);
  });

  test('the keywords are the technologies of the strip, mobile first, in a list that stays still', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const keywords = page.getByRole('region', { name: 'Technologies' });
    await expect(keywords.getByRole('listitem').first()).toHaveText('Kotlin');
    await expect(keywords).toContainText('Jetpack Compose');
    expect(await keywords.getByRole('listitem').count()).toBeLessThanOrEqual(
      20,
    );
    // nothing moves, so there is no pause button to keep
    await expect(
      page.getByRole('button', { name: /moving list of technologies/ }),
    ).toHaveCount(0);
  });

  test('the method lists the three steps of the bug pipeline with their tags', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const method = page.getByRole('region', {
      name: 'How a bug becomes a merge request',
    });
    await expect(method.getByRole('heading', { level: 3 })).toHaveText([
      'Reads the Jira bug',
      'Finds the root cause',
      'Opens the right fix for review',
    ]);
    await expect(method).toContainText('Step 3');
    await expect(method.getByText('Vendor Q&A')).toBeVisible();
  });

  test('Figure 1 lays the roles and the studies in time, each row leads to the resume', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const figure = page.locator('figure', { hasText: 'Figure 1.' });
    await expect(figure).toBeVisible();
    // four roles and two degrees, the first to start on top
    const rows = figure.getByRole('link');
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toContainText('Bachelor of Science');
    await expect(rows.last()).toContainText('FPT Software');
    await expect(rows.last()).toContainText('Present');
    await expect(figure.locator('figcaption')).toContainText(
      /Roles and studies over time, \d{4}–\d{4}\./,
    );
    await expect(figure.locator('figcaption')).toContainText(
      'an arrow marks an item that is still ongoing',
    );
    await rows.last().click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('the newest four roles are listed with the Current stamp, the tagline and the period', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const work = page.getByRole('region', { name: "Where I've worked" });
    const rows = work.locator('a[data-row]');
    await expect(rows).toHaveCount(4);
    await expect(rows.first()).toContainText('FPT Software');
    await expect(rows.first()).toContainText('Current');
    await expect(rows.first()).toContainText('Jan 2026 – Present');
    await expect(rows.nth(1)).toContainText('MoMo');
    await expect(rows.nth(1)).not.toContainText('Current');
    await rows.first().click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('"Full resume" leads to the resume', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('link', { name: 'Full resume' }).click();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('what I built at FPT lists its six findings', async ({ page }) => {
    await gotoSkin(page, '/');
    const build = page.getByRole('region', { name: "What I've built at FPT" });
    await expect(build.getByRole('heading', { level: 3 })).toHaveCount(6);
    await expect(
      build.getByRole('heading', { name: 'Bug-fixing pipeline' }),
    ).toBeVisible();
  });

  test('the featured projects are the three best ranked, and a card leads where Standard leads', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const featured = page.getByRole('region', { name: 'Featured projects' });
    await expect(featured.getByRole('heading', { level: 3 })).toHaveText([
      'VenusAI',
      'Yoga Lasyn',
      'DevPad',
    ]);
    // a project with no link of its own leads to the Projects page
    const withoutLink = featured
      .getByRole('link')
      .filter({ hasText: 'VenusAI' });
    await expect(withoutLink).toHaveAttribute('href', /.+/);
    await featured.getByRole('link', { name: 'All projects' }).click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('the correspondence has the email, where I am and the sticky note that opens the chat', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const contact = page.getByRole('region', {
      name: 'Have a role or a project in mind?',
    });
    await expect(
      contact.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:bachbnt@gmail.com');
    await expect(contact).toContainText('Ho Chi Minh City, Vietnam');
    await expect(contact).toContainText('Not sure where to look?');
    await expect(
      contact.getByRole('button', { name: /^Chat with BB Bot/ }),
    ).toBeVisible();
  });

  test('the chat and CV switches take their buttons away, and with the chat off the sticky note goes too', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': {
        pages: {
          home: 'on',
          about: 'on',
          resume: 'on',
          projects: 'on',
          certificates: 'on',
          services: 'on',
          payment: 'on',
        },
        features: {
          chat: false,
          cvDownload: false,
          contactForm: true,
          connectMenu: true,
        },
        maintenance: { message: '', l10n: {}, enabled: false },
      },
    });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /BB Bot/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Download CV/ })).toHaveCount(
      0,
    );
    await expect(page.getByText('Not sure where to look?')).toHaveCount(0);
  });

  test('the contents list the pages of the tabs, each a link', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const contents = page
      .getByRole('heading', { name: 'Contents' })
      .locator('xpath=following::ol[1]');
    await expect(contents.getByRole('link')).toHaveText([
      /Home/,
      /About/,
      /Resume/,
      /Projects/,
      /Certificates/,
      /Services/,
      /Payment/,
    ]);
    await contents.getByRole('link', { name: /Services/ }).click();
    await expect(page).toHaveURL(/\/services$/, { timeout: 20_000 });
  });

  test('a page that is soon is only named in the contents and one that is off is left out', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': {
        pages: {
          home: 'on',
          about: 'hidden',
          resume: 'soon',
          projects: 'on',
          certificates: 'on',
          services: 'on',
          payment: 'on',
        },
        features: {
          chat: true,
          cvDownload: true,
          contactForm: true,
          connectMenu: true,
        },
        maintenance: { message: '', l10n: {}, enabled: false },
      },
    });
    await gotoSkin(page, '/');
    const contents = page
      .getByRole('heading', { name: 'Contents' })
      .locator('xpath=following::ol[1]');
    await expect(contents.getByRole('link', { name: /About/ })).toHaveCount(0);
    await expect(contents.getByRole('link', { name: /Resume/ })).toHaveCount(0);
    await expect(contents).toContainText('Resume');
    await expect(contents).toContainText('Soon');
    await expect(contents).not.toContainText('About');
  });

  test('a page that is coming soon, or switched off, says so', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': {
        pages: {
          home: 'soon',
          about: 'hidden',
          resume: 'on',
          projects: 'on',
          certificates: 'on',
          services: 'on',
          payment: 'on',
        },
        features: {
          chat: true,
          cvDownload: true,
          contactForm: true,
          connectMenu: true,
        },
        maintenance: { message: '', l10n: {}, enabled: false },
      },
    });
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
    await page.goto('/about');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
  });

  test('the words are Vietnamese when the visitor chose Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Mình dẫn dắt các nhóm mobile',
    );
    await expect(
      page.getByRole('heading', { level: 2, name: 'Tóm tắt' }),
    ).toBeVisible();
    await expect(page.locator('figure', { hasText: 'Hình 1.' })).toBeVisible();
    await expect(
      page.getByRole('complementary').filter({ hasText: 'vai trò hiện tại' }),
    ).toContainText('từ Thg 1 2026');
  });

  test('a phone gets no horizontal scroll, in both themes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const scheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await gotoSkin(page, '/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Featured projects' }),
      ).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    }
  });
});

test.describe('Home data states in the Academic skin', () => {
  test('shows a loading note while the roles are on the way, then the roles', async ({
    page,
  }) => {
    await intercept(page, 'experience', { delay: 1500 });
    await gotoSkin(page, '/');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText('FPT Software').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says there are no roles yet; Figure 1 keeps only the studies', async ({
    page,
  }) => {
    await intercept(page, 'experience', 'empty');
    await gotoSkin(page, '/');
    const notice = page.locator('[data-state="empty"]').first();
    await expect(notice).toBeVisible();
    await expect(
      notice.getByRole('heading', { name: 'No roles to show yet' }),
    ).toBeVisible();
    const figure = page.locator('figure', { hasText: 'Figure 1.' });
    await expect(figure.getByRole('link')).toHaveCount(2);
    await expect(figure).not.toContainText('FPT Software');
  });

  test('says the roles could not load, and Try again loads them', async ({
    page,
  }) => {
    await intercept(page, 'experience', 'error');
    await gotoSkin(page, '/');
    const alert = page.locator('[data-state="error"]').first();
    // a failed read is tried once more before it counts as an error
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(alert).toContainText(/work history/);
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText('FPT Software').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('with no featured projects, or if they fail to load, the block is left out', async ({
    page,
  }) => {
    await intercept(page, 'projects', 'error');
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: "Where I've worked" }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toHaveCount(0);
  });

  test('says there are no contact details yet when there are none', async ({
    page,
  }) => {
    await intercept(page, 'contacts', 'empty');
    await gotoSkin(page, '/');
    await expect(
      page
        .locator('[data-state="empty"]')
        .getByRole('heading', { name: 'No contact details yet' }),
    ).toBeVisible();
  });
});

test.describe('About in the Academic skin', () => {
  test('has the title, the summary, the specialties and the three photographs', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    await expect(page.getByText(/I hold a Master of Science/)).toBeVisible();
    const tags = page.getByRole('list', { name: 'Expertise' });
    await expect(tags.getByRole('listitem')).toHaveText([
      'Software Engineer',
      'Mobile',
      'Web',
      'AI',
    ]);
    await expect(
      page.getByRole('img', { name: 'Portrait of Bach Bui' }),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Photo of Bach Bui' }),
    ).toHaveCount(2);
  });

  test('the core stack is the skills marked highlight, in rank order, with where each was used', async ({
    page,
  }) => {
    await gotoSkin(page, '/about');
    const core = page.getByRole('region', { name: 'Core stack' });
    await expect(core.getByRole('heading', { level: 3 })).toHaveText([
      'Kotlin',
      'KMM',
      'Jetpack Compose',
      'Python',
      'Claude Code',
    ]);
    await expect(core.locator('article', { hasText: 'Kotlin' })).toContainText(
      /Used at .*FPT/,
    );
    await expect(
      core.getByRole('link', { name: 'See all skills' }),
    ).toHaveAttribute('href', '/resume#skills');
  });

  test('ends with the correspondence', async ({ page }) => {
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(page.getByText('Not sure where to look?')).toBeVisible();
  });

  test('is Vietnamese when the visitor chose Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Giới thiệu',
    );
    await expect(
      page.getByRole('region', { name: 'Công nghệ chính' }),
    ).toBeVisible();
    await expect(page.getByRole('list', { name: 'Chuyên môn' })).toBeVisible();
  });

  test('says there is no core stack yet, and that it could not load, with Try again', async ({
    page,
  }) => {
    await intercept(page, 'skills', 'empty');
    await gotoSkin(page, '/about');
    await expect(
      page
        .locator('[data-state="empty"]')
        .getByRole('heading', { name: 'No core stack to show yet' }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await intercept(page, 'skills', 'error');
    await page.reload();
    const alert = page.locator('[data-state="error"]').first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Core stack' })
        .getByRole('heading', { name: 'Kotlin' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('a phone gets no horizontal scroll, in both themes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const scheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await gotoSkin(page, '/about');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(
        page.getByRole('region', { name: 'Core stack' }),
      ).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    }
  });
});
