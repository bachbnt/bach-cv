/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'moba');
  await mockFirestore(page);
  await mockImages(page);
});

const roles = (page: Page) => page.locator('li[data-job]');
const role = (page: Page, id: string) => page.locator(`li[data-job="${id}"]`);
const skills = (page: Page) => page.locator('#skills');
const tile = (page: Page, name: string) =>
  skills(page)
    .locator('[data-area]')
    .getByRole('button', { name, exact: true });
const height = (el: Locator) =>
  el.evaluate((node) => node.getBoundingClientRect().height);

/** The panel's own entrance animation moves the page for a moment: wait until the target has stopped, so a pointer is not moved from under it. */
const settle = async (target: Locator) => {
  await target.evaluate((node) => node.scrollIntoView({ block: 'center' }));
  let last = '';
  await expect
    .poll(async () => {
      const now = JSON.stringify(await target.boundingBox());
      const still = now === last;
      last = now;
      return still;
    })
    .toBe(true);
};

/** Answers the reads of one collection with `answer`, or waits `delay` ms before every read. */
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

test.describe('Resume in the Moba skin: head', () => {
  test('has the title, the intro and a Download CV button that opens the CV window', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
    await expect(
      page.getByText('Seven years in software, now leading a team of 10.'),
    ).toBeVisible();
    const button = page
      .getByRole('main')
      .getByRole('button', { name: 'Download CV' });
    await expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await button.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the cvDownload switch of site/live removes the page button', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { features: { cvDownload: false } },
    });
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Resume' }),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Download CV' }),
    ).toHaveCount(0);
  });
});

test.describe('Resume in the Moba skin: experience', () => {
  test('lists the visible roles newest first, each with the badge of its tower and the nexus on top', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(roles(page)).toHaveCount(4);
    await expect(roles(page).locator('h3')).toHaveText([
      'FPT Software Current',
      'MoMo (M_Service)',
      'American Code Lab',
      'Devblock Vietnam',
    ]);
    await expect(role(page, 'fpt-software')).toContainText('Nexus');
    await expect(role(page, 'momo')).toContainText('Tower 3 of 4');
    await expect(role(page, 'american-code-lab')).toContainText('Tower 2 of 4');
    await expect(role(page, 'devblock-vietnam')).toContainText('Tower 1 of 4');
    // hidden roles are not on the list
    await expect(page.getByRole('heading', { name: 'Freelancer' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('heading', { name: 'EasyGDS Limited' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'TMA Solutions' }),
    ).toHaveCount(0);
  });

  test('every role shows its company, role, team, period, how long it was held, logo or tile, and summary', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const fpt = role(page, 'fpt-software');
    await expect(
      fpt.getByRole('heading', { name: /FPT Software/ }),
    ).toBeVisible();
    await expect(fpt).toContainText('Team Lead');
    await expect(fpt).toContainText('FHN.HNT');
    await expect(fpt).toContainText('Jan 2026 – Present');
    await expect(fpt).toContainText(/Held \d+ mo/);
    await expect(fpt).toContainText('Own delivery of the FPT-scope functions');
    // no logo: a tile with the short name
    await expect(fpt.getByRole('img')).toHaveCount(0);
    await expect(fpt.getByText('FPT', { exact: true })).toBeVisible();

    const momo = role(page, 'momo');
    await expect(momo).toContainText('Senior Mobile App Developer');
    await expect(momo).toContainText('App Payment / App Platform Team');
    await expect(momo).toContainText('May 2022 – Jan 2026');
    await expect(momo).toContainText('Held 3 y 9 mo');
    await expect(momo).toContainText('Wearable QR payments');
    await expect(
      momo.getByRole('img', { name: 'MoMo (M_Service)' }),
    ).toBeVisible();

    await expect(role(page, 'devblock-vietnam')).toContainText(
      'Mar 2020 – Apr 2022',
    );
    await expect(role(page, 'devblock-vietnam')).toContainText('Held 2 y 2 mo');
    await expect(role(page, 'american-code-lab')).toContainText('Held 8 mo');
  });

  test('only the current role has the Current chip', async ({ page }) => {
    await gotoSkin(page, '/resume');
    await expect(page.getByText('Current', { exact: true })).toHaveCount(1);
    await expect(
      role(page, 'fpt-software').getByText('Current', { exact: true }),
    ).toBeVisible();
    await expect(
      role(page, 'momo').getByText('Current', { exact: true }),
    ).toHaveCount(0);
  });

  test('the key project of a role shows its name and description, and only key projects show', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(page.getByText('Key project', { exact: true })).toHaveCount(1);
    const fpt = role(page, 'fpt-software');
    await expect(
      fpt.getByRole('heading', { level: 4, name: '9PP - Yamato Transport' }),
    ).toBeVisible();
    await expect(fpt).toContainText(
      'Next-generation Android app for collection and delivery field operations',
    );
    // the projects of Devblock are not key projects
    await expect(page.getByRole('heading', { name: 'AppZocial' })).toHaveCount(
      0,
    );
  });

  test('the technologies of a role are chips, unlisted ones too', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const momo = role(page, 'momo');
    for (const name of [
      'React Native',
      'Kotlin',
      'KMM',
      'Clean Architecture',
      'WearOS',
      'watchOS',
    ])
      await expect(
        momo.getByRole('listitem').filter({ hasText: new RegExp(`^${name}$`) }),
      ).toHaveCount(1);
    // Detail Design is a tag on the role even though it is not a tile of the Skills section
    await expect(
      role(page, 'fpt-software')
        .getByRole('listitem')
        .filter({ hasText: /^Detail Design$/ }),
    ).toHaveCount(1);
  });

  test('the responsibilities are open for the first role, shut and inert for the others, and the toggle slides them', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const toggles = page.getByRole('button', { name: /responsibilities/i });
    // every role with bullets has a toggle
    await expect(toggles).toHaveCount(4);
    await expect(toggles.first()).toHaveText('Hide responsibilities');
    await expect(toggles.first()).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('button[aria-expanded="true"]')).toHaveCount(1);

    const toggle = role(page, 'momo').getByRole('button', {
      name: /responsibilities/i,
    });
    const panel = page.locator(
      `#${await toggle.getAttribute('aria-controls')}`,
    );
    await toggle.scrollIntoViewIfNeeded();
    await expect(toggle).toHaveText('Show responsibilities');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await height(panel)).toBe(0);
    await expect(panel).toHaveAttribute('inert', '');

    await toggle.click();
    await expect(toggle).toHaveText('Hide responsibilities');
    await expect.poll(() => height(panel)).toBeGreaterThan(80);
    await expect(panel).not.toHaveAttribute('inert', '');
    await expect(
      page.getByText('Architected and developed a cross-platform payment'),
    ).toBeVisible();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => height(panel)).toBe(0);
    await expect(panel).toHaveAttribute('inert', '');
  });

  test('with reduced motion the list still opens', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/resume');
    const toggle = role(page, 'american-code-lab').getByRole('button', {
      name: /responsibilities/i,
    });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(
      role(page, 'american-code-lab').getByText(
        'Designed and taught a Flutter',
      ),
    ).toBeVisible();
  });

  test('the list has the lane line that joins the towers', async ({ page }) => {
    await gotoSkin(page, '/resume');
    const lane = page.locator('ol.mb-lane');
    await expect(lane).toBeVisible();
    expect(
      await lane.evaluate((el) => getComputedStyle(el, '::before').content),
    ).not.toBe('none');
  });

  test('coming from the tower of a role on the map opens that role, scrolls to it and lights its frame once', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    // the towers are a pointer shortcut (aria-hidden): click one the way a visitor does on the map
    await page
      .locator('button[data-role="american-code-lab"]')
      .dispatchEvent('click');
    await expect(page).toHaveURL(/\/resume$/);
    const card = role(page, 'american-code-lab').locator('.mb-role-card');
    await expect(card).toHaveAttribute('data-flash', '');
    const toggle = role(page, 'american-code-lab').getByRole('button', {
      name: /responsibilities/i,
    });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // it is in view, near the top of the panel's scroll area
    await expect
      .poll(async () => {
        const box = await role(page, 'american-code-lab').boundingBox();
        const area = await page.locator('.mb-panel-scroll').boundingBox();
        return box && area ? box.y - area.y : 9999;
      })
      .toBeLessThan(120);
    // the frame goes dark again after a moment, the role stays open
    await expect(card).not.toHaveAttribute('data-flash', '', { timeout: 6000 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('a tower clicked while the page is open does the same', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/resume');
    await expect(roles(page)).toHaveCount(4);
    await page
      .locator('button[data-role="devblock-vietnam"]')
      .dispatchEvent('click');
    await expect(
      role(page, 'devblock-vietnam').locator('.mb-role-card'),
    ).toHaveAttribute('data-flash', '');
    await expect(
      role(page, 'devblock-vietnam').getByRole('button', {
        name: /responsibilities/i,
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Resume in the Moba skin: skills', () => {
  test('has the section #skills with the core stack and every area', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      skills(page).getByRole('heading', { level: 2, name: 'Skills' }),
    ).toBeVisible();
    await expect(
      skills(page).getByText(
        'The stack behind my work, grouped by area, with where I have used it.',
      ),
    ).toBeVisible();
    await expect(
      skills(page).getByRole('heading', { name: 'Core stack' }),
    ).toBeVisible();
    await expect(
      skills(page).getByText('What I use every day in my current role.'),
    ).toBeVisible();
    await expect(
      skills(page).getByRole('heading', { name: 'All skills by area' }),
    ).toBeVisible();
    await expect(
      skills(page).getByText(
        'Bold ones are my core stack. Hover, focus or tap a skill to see where I used it.',
      ),
    ).toBeVisible();
    for (const name of [
      'AI and automation',
      'Mobile',
      'Frontend and backend',
      'Tools and process',
    ])
      await expect(
        skills(page).getByRole('heading', { level: 4, name }),
      ).toBeVisible();
  });

  test('the core stack has every highlighted skill in rank order with where it was used; the first four wear Q W E R', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const cards = skills(page).locator('[data-skill]');
    await expect(cards).toHaveCount(5);
    await expect(cards.locator('h4')).toHaveText([
      'Kotlin',
      'KMM',
      'Jetpack Compose',
      'Python',
      'Claude Code',
    ]);
    await expect(cards.nth(0)).toContainText('Used at FPT · MoMo');
    await expect(cards.nth(1)).toContainText('Used at MoMo');
    await expect(cards.nth(3)).toContainText('Used at FPT · Side projects');
    await expect(cards.nth(4)).toContainText('Used at FPT');
    await expect(cards.locator('kbd')).toHaveText(['Q', 'W', 'E', 'R']);
    await expect(cards.nth(4).locator('kbd')).toHaveCount(0);
    // how long it has been in use: the months of the roles that list it
    await expect(cards.nth(0)).toContainText(/Used \d+(\.\d)? (y|mo)/);
  });

  test('every listed skill is a tile of its area, the core ones are bold, the unlisted ones are not tiles', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const area = (name: string) =>
      skills(page).locator(`[data-area="${name}"]`);
    await expect(area('ai').getByRole('button')).toHaveCount(7);
    await expect(area('mobile').getByRole('button')).toHaveCount(14);
    await expect(area('web').getByRole('button')).toHaveCount(7);
    await expect(area('tools').getByRole('button')).toHaveCount(9);
    // the count of an area is stated in its head
    await expect(area('ai')).toContainText('7');
    await expect(area('mobile')).toContainText('14');
    await expect(tile(page, 'Kotlin')).toHaveAttribute('data-core', '');
    await expect(tile(page, 'Git')).not.toHaveAttribute('data-core', '');
    await expect(tile(page, 'Matplotlib')).toHaveCount(0);
    await expect(tile(page, 'Detail Design')).toHaveCount(1);
  });

  test('a tile shows where the skill was used on hover and on keyboard focus, and Escape closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const kotlin = tile(page, 'Kotlin');
    await settle(kotlin);
    await kotlin.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Used at FPT, MoMo. First used 2022.',
    );
    await expect(kotlin).toHaveAttribute('aria-describedby', 'mb-skill-tip');
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await kotlin.focus();
    await expect(page.getByRole('tooltip')).toContainText('Used at FPT, MoMo');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    const git = tile(page, 'Git');
    await settle(git);
    await git.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'No specific role or project listed for this yet.',
    );

    // side projects are phrased apart
    const python = tile(page, 'Python');
    await settle(python);
    await python.hover();
    await expect(page.getByRole('tooltip')).toContainText(
      'and in side projects',
    );
  });

  test('the tiles can be reached with the keyboard in order, each showing its tip', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const tiles = skills(page).locator('[data-area="ai"] button');
    await tiles.first().focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(tiles.nth(1)).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    await expect(tiles.nth(1)).toHaveAttribute(
      'aria-describedby',
      'mb-skill-tip',
    );
  });

  test('a small scroll keeps the tip on its tile and a scroll that takes the tile out of the panel closes it', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const kotlin = tile(page, 'Kotlin');
    await settle(kotlin);
    await kotlin.focus();
    const tip = page.getByRole('tooltip');
    await expect(tip).toBeVisible();
    await page.locator('.mb-panel-scroll').evaluate((el) => el.scrollBy(0, 30));
    await expect(tip).toBeVisible();
    // the tip is still centred over the tile
    await expect
      .poll(async () => {
        const [a, b] = [await tip.boundingBox(), await kotlin.boundingBox()];
        return a && b
          ? Math.abs(a.x + a.width / 2 - (b.x + b.width / 2)) < 3 &&
              Math.abs(a.y + a.height - b.y) < 20
          : false;
      })
      .toBe(true);
    await page.locator('.mb-panel-scroll').evaluate((el) => el.scrollTo(0, 0));
    await expect(tip).toHaveCount(0);
  });
});

test.describe('Resume in the Moba skin: education', () => {
  test('shows the thesis, its technologies and its links', async ({ page }) => {
    await gotoSkin(page, '/resume');
    const education = page.locator('#education');
    await expect(
      education.getByRole('heading', { level: 2, name: 'Education' }),
    ).toBeVisible();
    const master = education
      .getByRole('article')
      .filter({ hasText: 'Master of Science' });
    await expect(master).toContainText('University of Science');
    await expect(master).toContainText('Dec 2020 – Jun 2023');
    await expect(master.getByText('Thesis', { exact: true })).toBeVisible();
    await expect(master).toContainText(
      'Stock Price Trend Prediction using Machine Learning',
    );
    await expect(
      master.getByRole('listitem').filter({ hasText: /^Matplotlib$/ }),
    ).toHaveCount(1);
    await expect(
      master.getByRole('img', {
        name: /Master of Science, University of Science/,
      }),
    ).toBeVisible();
    const thesis = master.getByRole('link', { name: 'Read the thesis' });
    await expect(thesis).toHaveAttribute(
      'href',
      'http://ir.vnulib.edu.vn/handle/VNUHCM/31347',
    );
    await expect(thesis).toHaveAttribute('target', '_blank');
    await expect(thesis).toHaveAttribute('rel', /noopener/);
    await expect(
      master.getByRole('link', { name: 'Source code' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/bachbnt/stock-prediction-msc',
    );

    const bachelor = education
      .getByRole('article')
      .filter({ hasText: 'Bachelor of Science' });
    await expect(bachelor).toContainText('Sep 2016 – Sep 2020');
    await expect(
      bachelor.getByRole('link', { name: 'Read the thesis' }),
    ).toHaveCount(0);
    await expect(
      bachelor.getByRole('link', { name: 'Source code' }),
    ).toHaveAttribute('href', 'https://github.com/bachbnt/pc-dashboard-bsc');
  });

  test('a degree without a thesis has no thesis box', async ({ page }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'education' && id === 'bachelor'
        ? {
            ...doc,
            thesisTitle: '',
            thesisUrl: '',
            thesisSourceUrl: '',
            major: '',
          }
        : doc,
    );
    await gotoSkin(page, '/resume');
    const bachelor = page
      .locator('#education')
      .getByRole('article')
      .filter({ hasText: 'Bachelor of Science' });
    await expect(bachelor).toBeVisible();
    await expect(bachelor.getByText('Thesis', { exact: true })).toHaveCount(0);
    await expect(bachelor.getByRole('link')).toHaveCount(0);
  });
});

test.describe('Resume in the Moba skin: states', () => {
  const BLOCKS = [
    {
      collection: 'experience',
      empty: 'No experience to show yet',
      error: "Experience couldn't be loaded",
      content: 'FPT Software',
    },
    {
      collection: 'education',
      empty: 'No education to show yet',
      error: "Education couldn't be loaded",
      content: 'Master of Science',
    },
    {
      collection: 'skills',
      empty: 'No skills to show yet',
      error: "Skills couldn't be loaded",
      content: 'Core stack',
    },
  ] as const;

  for (const block of BLOCKS) {
    test(`${block.collection}: a loading screen, then the content`, async ({
      page,
    }) => {
      await intercept(page, block.collection, { delay: 4000 });
      await gotoSkin(page, '/resume');
      const loading = page.getByRole('status', { name: 'Loading' }).first();
      await expect(loading).toBeVisible();
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByText(block.content).first()).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(
        0,
      );
    });

    test(`${block.collection}: says there is nothing to show, with a way forward`, async ({
      page,
    }) => {
      await intercept(page, block.collection, 'empty');
      await gotoSkin(page, '/resume');
      // the Skills section has two blocks (the core stack and the areas): look for the card that carries the words
      const notice = page
        .locator('[data-state="empty"]')
        .filter({ has: page.getByRole('heading', { name: block.empty }) });
      await expect(notice).toBeVisible();
      await expect(notice.getByRole('link')).toHaveCount(1);
    });

    test(`${block.collection}: says it could not load, and Try again loads it`, async ({
      page,
    }) => {
      await intercept(page, block.collection, 'error');
      await gotoSkin(page, '/resume');
      const alert = page
        .locator('[data-state="error"]')
        .filter({ has: page.getByRole('heading', { name: block.error }) });
      // a failed read is tried once more before it counts as an error
      await expect(alert).toBeVisible({ timeout: 20_000 });
      await page.unroute('**/firestore.googleapis.com/**');
      await mockFirestore(page);
      await alert.getByRole('button', { name: 'Try again' }).click();
      await expect(page.getByText(block.content).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('[data-state="error"]')).toHaveCount(0);
    });
  }

  test('the core stack has its own empty card when no skill is highlighted', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'skills' ? { ...doc, highlight: null } : doc,
    );
    await gotoSkin(page, '/resume');
    const notice = page.locator('[data-state="empty"]');
    await expect(notice).toHaveCount(1);
    await expect(notice.getByRole('heading')).toHaveText(/core stack/i);
    // the areas still show
    await expect(tile(page, 'Kotlin')).toBeVisible();
  });
});

test.describe('Resume in the Moba skin: switches and language', () => {
  test('a page that is soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { resume: 'soon' } } });
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: /Coming soon/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Experience' })).toHaveCount(
      0,
    );
  });

  test('a hidden page shows the 404', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { resume: 'hidden' } } });
    await gotoSkin(page, '/resume');
    await expect(page.getByText('404', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Experience' })).toHaveCount(
      0,
    );
  });

  test('copy, dates, towers and tips are in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Hồ sơ' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Kinh nghiệm' }),
    ).toBeVisible();
    await expect(role(page, 'fpt-software')).toContainText('Thg 1 2026 – Nay');
    await expect(role(page, 'fpt-software')).toContainText('Nhà chính');
    await expect(role(page, 'fpt-software')).toContainText('Hiện tại');
    await expect(role(page, 'momo')).toContainText('Trụ 3 trên 4');
    await expect(role(page, 'momo')).toContainText('Giữ 3 năm 9 tháng');
    await expect(page.getByText('Dự án chính')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Ẩn trách nhiệm công việc' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Học vấn' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Đọc luận văn' }).first(),
    ).toBeVisible();
    await expect(
      skills(page).getByRole('heading', { name: 'Công nghệ chính' }),
    ).toBeVisible();
    await expect(skills(page).locator('[data-skill]').first()).toContainText(
      'Đã dùng tại FPT · MoMo',
    );
    const kotlin = tile(page, 'Kotlin');
    await settle(kotlin);
    await kotlin.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Đã dùng tại FPT, MoMo. Dùng lần đầu năm 2022.',
    );
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Tải CV' }),
    ).toContainText('Tải CV');
  });
});

test.describe('Resume in the Moba skin: light theme and phone', () => {
  test('the headings of the roles are dark ink in the light theme', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('bach-cv-theme', 'light'),
    );
    await gotoSkin(page, '/resume');
    const color = await role(page, 'momo')
      .getByRole('heading', { level: 3 })
      .evaluate((el) => getComputedStyle(el).color);
    const [r, g, b] = color.match(/\d+(\.\d+)?/g)!.map(Number);
    // the pale gold of the dark theme (about 244, 231, 197) is not used on parchment
    expect(r + g + b).toBeLessThan(450);
  });

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 360, height: 740 }, hasTouch: true });

    test('nothing is wider than the screen, in English and in Vietnamese', async ({
      page,
    }) => {
      await gotoSkin(page, '/resume');
      await expect(
        page.getByRole('heading', { level: 2, name: 'Education' }),
      ).toBeVisible();
      const overflow = () =>
        page.evaluate(() => {
          const wide = [
            ...document.querySelectorAll<HTMLElement>('.mb-panel-scroll *'),
          ].filter(
            (el) => el.getBoundingClientRect().right > window.innerWidth + 1,
          );
          return {
            doc: document.documentElement.scrollWidth <= window.innerWidth,
            wide: wide.length,
          };
        });
      await expect.poll(overflow).toEqual({ doc: true, wide: 0 });
      await page.evaluate(() => localStorage.setItem('bach-cv-lang', 'vi'));
      await page.reload();
      await page
        .locator('html[data-skin-ready]')
        .waitFor({ state: 'attached' });
      await expect(
        page.getByRole('heading', { level: 2, name: 'Học vấn' }),
      ).toBeVisible();
      await expect.poll(overflow).toEqual({ doc: true, wide: 0 });
    });

    test('a tap shows the tip, a second tap hides it, a tap elsewhere closes it', async ({
      page,
    }) => {
      await gotoSkin(page, '/resume');
      const kotlin = tile(page, 'Kotlin');
      await settle(kotlin);
      await kotlin.tap();
      await expect(page.getByRole('tooltip')).toContainText(
        'Used at FPT, MoMo',
      );
      // a click that follows the focus of the same tap within 350 ms is the same tap (by design): the second tap comes later
      await page.waitForTimeout(450);
      await kotlin.tap();
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await page.waitForTimeout(450);
      await kotlin.tap();
      await expect(page.getByRole('tooltip')).toHaveCount(1);
      await skills(page)
        .getByRole('heading', { name: 'All skills by area' })
        .tap();
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    });

    test('the Download CV button, the toggles and the tiles are at least 44px tall', async ({
      page,
    }) => {
      await gotoSkin(page, '/resume');
      expect(
        await height(
          page.getByRole('main').getByRole('button', { name: 'Download CV' }),
        ),
      ).toBeGreaterThanOrEqual(44);
      const toggle = role(page, 'momo').getByRole('button', {
        name: /responsibilities/i,
      });
      await toggle.scrollIntoViewIfNeeded();
      expect(await height(toggle)).toBeGreaterThanOrEqual(44);
      expect(await height(tile(page, 'Kotlin'))).toBeGreaterThanOrEqual(44);
    });
  });
});
