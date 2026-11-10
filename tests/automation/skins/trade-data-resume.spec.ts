/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { pageSettled } from '../support/animations';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const statement = (page: import('@playwright/test').Page) =>
  page.getByRole('table', { name: /^Years of the career/ });

test.describe('the statement', () => {
  test('has a column for each year, a row for each role and the Current word on the role I am in', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const table = statement(page);
    await expect(
      table.getByRole('columnheader').filter({ hasText: /^20\d\d$/ }),
    ).toHaveText(['2020', '2021', '2022', '2023', '2024', '2025', '2026']);
    await expect(table.getByTestId('statement-row')).toHaveCount(4);
    await expect(table.getByTestId('statement-row').first()).toContainText(
      'FPT Software',
    );
    await expect(table.getByTestId('statement-row').first()).toContainText(
      'Current',
    );
    await expect(table.getByText('Current')).toHaveCount(1);
    await expect(page.getByText('4 roles, 2020 to 2026')).toBeVisible();
    await expect(
      table.getByRole('cell', { name: '12 months of 2023' }),
    ).toHaveCount(1);
  });

  test('a bar says the company, role and dates on hover and on focus, and opens the notes of the role', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const bar = page.getByRole('button', {
      name: /^Senior Mobile App Developer at MoMo \(M_Service\), May 2022 – Jan 2026, 3 years 9 months/,
    });
    await bar.hover();
    await expect(
      page.getByText(
        'MoMo (M_Service) · Senior Mobile App Developer · May 2022 – Jan 2026 · 3 years 9 months',
      ),
    ).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByText('4 roles, 2020 to 2026')).toBeVisible();
    await bar.focus();
    await expect(
      page.getByText(/MoMo \(M_Service\) · Senior Mobile/),
    ).toBeVisible();
    await page.keyboard.press('Enter');
    const note = page.locator('[data-job="momo"]');
    await expect(note).toHaveAttribute('data-active', 'true');
    await expect(
      note.getByRole('button', { name: 'Hide responsibilities' }),
    ).toBeVisible();
    await expect(note).toBeInViewport();
  });

  test('By role makes each bar as long as the role lasted', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await page.getByRole('button', { name: 'By role' }).click();
    await expect(page.getByRole('button', { name: 'By role' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const table = statement(page);
    await expect(
      table.getByRole('columnheader', { name: 'Duration' }),
    ).toBeVisible();
    await expect(table.getByText('3 years 9 months')).toBeVisible();
    const width = async (id: string) =>
      (await page.locator(`[data-bar="${id}"]`).boundingBox())!.width;
    await expect
      .poll(
        async () => (await width('momo')) > (await width('devblock-vietnam')),
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await width('devblock-vietnam')) >
          (await width('american-code-lab')),
      )
      .toBe(true);
    await page.getByRole('button', { name: 'By year' }).click();
    await expect(
      table.getByRole('columnheader', { name: '2023' }),
    ).toBeVisible();
  });
});

test.describe('notes', () => {
  test('the first role is open and the others open with a click or the keyboard; hidden roles are absent', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const notes = page.locator('[data-job]');
    await expect(notes).toHaveCount(4);
    await expect(notes.first()).toContainText('Current');
    await expect(
      notes.first().getByRole('button', { name: 'Hide responsibilities' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByText('Own delivery of the FPT-scope functions'),
    ).toBeVisible();
    await expect(page.getByText('EasyGDS')).toHaveCount(0);

    const second = notes.nth(1);
    const button = second.getByRole('button', {
      name: 'Show responsibilities',
    });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    // shut: the body is inert and invisible
    await expect(second.locator('[inert]')).toHaveCount(1);
    await expect(second.getByRole('list')).toBeHidden();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(
      second.getByRole('button', { name: 'Hide responsibilities' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(second.locator('[inert]')).toHaveCount(0);
    await expect(second.getByRole('list').first()).toBeVisible();
  });

  test('a note shows the summary, the key project and the technologies', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const first = page.locator('[data-job]').first();
    await expect(first.getByText('Key project')).toBeVisible();
    await expect(first.getByText('9PP - Yamato Transport')).toBeVisible();
    await expect(
      first.getByRole('list', { name: 'Technologies' }),
    ).toContainText('Kotlin');
  });
});

test('a flag of the chart opens the note of its job, also while Resume is on screen', async ({
  page,
}) => {
  await gotoSkin(page, '/about');
  await page
    .getByRole('button', { name: /MoMo.*Resume/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/resume$/);
  const note = page.locator('[data-job="momo"]');
  await expect(note).toHaveAttribute('data-active', 'true');
  await expect(
    note.getByRole('button', { name: 'Hide responsibilities' }),
  ).toBeVisible();
  await expect(note).toBeInViewport();
  await page
    .getByRole('button', { name: /Devblock.*Resume/ })
    .first()
    .click();
  await expect(page.locator('[data-job="devblock-vietnam"]')).toHaveAttribute(
    'data-active',
    'true',
  );
});

test('a flag scrolls the panel so that the TOP of the note is at the top, once the note has opened', async ({
  page,
}) => {
  // the note opens with an animation: scrolling while it opens used to aim at the shut note and end elsewhere
  await gotoSkin(page, '/about');
  await page
    .getByRole('button', { name: /Devblock.*Resume/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/resume$/);
  const note = page.locator('[data-job="devblock-vietnam"]');
  await expect(
    note.getByRole('button', { name: 'Hide responsibilities' }),
  ).toBeVisible();
  // how far the top of the note is below the top of the box that scrolls
  const gap = () =>
    note.evaluate((el) => {
      let box: HTMLElement | null = el.parentElement;
      while (box && getComputedStyle(box).overflowY === 'visible')
        box = box.parentElement;
      const top = box ? box.getBoundingClientRect().top : 0;
      return el.getBoundingClientRect().top - top;
    });
  // the scroll is smooth and starts when the animations have ended: wait for it to arrive, then it must not move again
  await expect.poll(gap, { timeout: 10_000 }).toBeLessThan(40);
  expect(await gap()).toBeGreaterThanOrEqual(-2);
  await expect
    .poll(async () => {
      const before = await gap();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      return Math.abs(before - (await gap())) < 0.5;
    })
    .toBe(true);
  await expect(note).toBeInViewport();
});

test('asking for the same job again scrolls to it again (the current job, after the visitor scrolled away)', async ({
  page,
}) => {
  await gotoSkin(page, '/about');
  const flag = page.getByRole('button', { name: /FPT.*Resume/ }).first();
  await flag.click();
  await expect(page).toHaveURL(/\/resume$/);
  const note = page.locator('[data-job="fpt-software"]');
  await expect(note).toHaveAttribute('data-active', 'true');
  const box = () =>
    note
      .evaluate((el) => {
        let node: HTMLElement | null = el.parentElement;
        while (node && getComputedStyle(node).overflowY === 'visible')
          node = node.parentElement;
        return {
          box: node,
          gap:
            el.getBoundingClientRect().top -
            (node?.getBoundingClientRect().top ?? 0),
        };
      })
      .then((r) => r.gap);
  await expect.poll(box, { timeout: 10_000 }).toBeLessThan(40);
  // the visitor scrolls the panel away from it, then asks for the same job again
  await note.evaluate((el) => {
    let node: HTMLElement | null = el.parentElement;
    while (node && getComputedStyle(node).overflowY === 'visible')
      node = node.parentElement;
    node?.scrollTo({ top: 0 });
  });
  await expect.poll(box).toBeGreaterThan(200);
  await flag.click();
  await expect.poll(box, { timeout: 10_000 }).toBeLessThan(40);
});

const showHeat = async (page: Page) => {
  await page.getByRole('button', { name: 'Heatmap', exact: true }).click();
  await expect(page.locator('[data-heat-tile]').first()).toBeAttached();
};

test.describe('the skills section', () => {
  test('is one section with a List and a Heatmap view, the list first', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toHaveCount(1);
    const list = page.getByRole('button', { name: 'List', exact: true });
    const heat = page.getByRole('button', { name: 'Heatmap', exact: true });
    await expect(list).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('heading', { name: 'All skills by area' }),
    ).toBeVisible();
    await expect(page.locator('[data-heat-tile]')).toHaveCount(0);
    await heat.click();
    await expect(heat).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-heat-tile]').first()).toBeAttached();
    await expect(
      page.getByRole('heading', { name: 'All skills by area' }),
    ).toHaveCount(0);
    // the core stack is in both views
    await expect(
      page.getByRole('heading', { name: 'Core stack' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toHaveCount(1);
    await list.click();
    await expect(page.locator('[data-heat-tile]')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'AI and automation' }),
    ).toBeVisible();
    await expect(page.locator('#tv-technologies')).toHaveCount(0);
    await expect(
      page
        .getByRole('navigation', { name: 'Sections of the resume' })
        .getByRole('link'),
    ).toHaveText(['Experience', 'Events', 'Education', 'Skills']);
  });
});

test.describe('the skills heatmap', () => {
  const tiles = (page: Page) => page.locator('[data-heat-tile]');
  const area = async (page: Page, name: RegExp) => {
    const box = (await page.getByRole('button', { name }).boundingBox())!;
    return box.width * box.height;
  };

  test('has a tile for each listed skill, in the four areas of the skills list', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await showHeat(page);
    await expect(tiles(page)).toHaveCount(37);
    const heat = page.getByRole('group', {
      name: 'Skills heatmap, grouped by area',
    });
    for (const area of [
      'AI and automation',
      'Mobile',
      'Frontend and backend',
      'Tools and process',
    ])
      await expect(heat.getByRole('region', { name: area })).toBeVisible();
    await expect(
      page.getByText(/^Area: the months a role listed the skill/),
    ).toBeVisible();
  });

  test('the area of a tile follows the months, and a skill no role lists is the smallest', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await showHeat(page);
    await expect
      .poll(
        async () =>
          (await area(page, /^Kotlin, 4\.6 y$/)) > (await area(page, /^KMM, /)),
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await area(page, /^KMM, /)) >
          (await area(page, /^MCP, no role lists it$/)),
      )
      .toBe(true);
    // the same months in two areas are the same area, once the tiles have popped in
    await expect
      .poll(async () =>
        Math.abs(
          (await area(page, /^MCP, no role/)) /
            (await area(page, /^Git, no role/)) -
            1,
        ),
      )
      .toBeLessThan(0.05);
  });

  test('pointing at or focusing a tile shows the tip with the roles and their periods', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await showHeat(page);
    const kotlin = page.getByRole('button', { name: /^Kotlin, / });
    await kotlin.scrollIntoViewIfNeeded();
    await kotlin.hover();
    const tip = page.getByRole('tooltip');
    await expect(tip).toContainText('Kotlin: 4.6 y in 2 roles.');
    await expect(tip).toContainText('MoMo, May 2022 – Jan 2026');
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
    const mcp = page.getByRole('button', { name: /^MCP, no role lists it$/ });
    await mcp.scrollIntoViewIfNeeded();
    // the scroll event of that move closes a tip, so let it pass before the focus
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await mcp.focus();
    await expect(tip).toContainText('MCP: no role lists it.');
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
  });

  test('a click pins a skill and the list beside the map names its roles, each of which opens its note', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await showHeat(page);
    const aside = page.getByRole('complementary', {
      name: 'Roles that used the selected skill',
    });
    await expect(aside).toContainText(
      'Select a skill to see the roles that used it.',
    );
    const kotlin = page.getByRole('button', { name: /^Kotlin, / });
    await kotlin.scrollIntoViewIfNeeded();
    await kotlin.click();
    await expect(kotlin).toHaveAttribute('aria-pressed', 'true');
    await expect(
      aside.getByRole('heading', { name: 'Roles that used Kotlin' }),
    ).toBeVisible();
    await expect(aside.getByRole('listitem')).toHaveCount(2);
    await expect(aside).toContainText('May 2022 – Jan 2026');
    await aside
      .getByRole('button', {
        name: 'Open the notes of Senior Mobile App Developer at MoMo (M_Service)',
      })
      .click();
    const note = page.locator('[data-job="momo"]');
    await expect(note).toHaveAttribute('data-active', 'true');
    await expect(
      note.getByRole('button', { name: 'Hide responsibilities' }),
    ).toBeVisible();
    await page.getByRole('button', { name: /^MCP, no role lists it$/ }).click();
    await expect(aside).toContainText('No role lists it.');
    await page.getByRole('button', { name: /^MCP, no role lists it$/ }).click();
    await expect(aside).toContainText('Select a skill');
  });

  test('the arrow keys move between tiles and Enter pins one', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await showHeat(page);
    const first = tiles(page).first();
    await first.scrollIntoViewIfNeeded();
    await first.focus();
    const id = (await first.getAttribute('data-heat-tile'))!;
    await page.keyboard.press('ArrowRight');
    expect(
      await page.evaluate(() =>
        document.activeElement?.getAttribute('data-heat-tile'),
      ),
    ).not.toBe(id);
    const second = page.locator(':focus');
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(first).toBeFocused();
    await page.keyboard.press('End');
    await expect(tiles(page).last()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
  });

  test('every tile is at least 44px wide and tall at 390px, and the page does not scroll sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    await showHeat(page);
    await tiles(page).first().scrollIntoViewIfNeeded();
    await pageSettled(page);
    const small = await tiles(page).evaluateAll((els) =>
      els
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width < 43.5 || r.height < 43.5)
        .map((r) => [Math.round(r.width), Math.round(r.height)]),
    );
    expect(small).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });
});

test.describe('events', () => {
  test('the events list jobs, degrees and certificates newest first and can be filtered', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const events = page.getByTestId('event');
    await expect(events.first()).toContainText('Claude Certified Architect');
    await expect(events.first()).toContainText('Issued');
    await expect(events.last()).toContainText('Bachelor of Science');
    await page
      .getByRole('group', { name: 'Filter events' })
      .getByRole('button', { name: 'Certificates' })
      .click();
    await expect(events).toHaveCount(3);
    await page
      .getByRole('group', { name: 'Filter events' })
      .getByRole('button', { name: 'Jobs' })
      .click();
    await expect(events).toHaveCount(7);
    await events.filter({ hasText: 'Junior Mobile Developer' }).first().click();
    await expect(page.locator('[data-job="devblock-vietnam"]')).toHaveAttribute(
      'data-active',
      'true',
    );
  });
});

test.describe('education and skills', () => {
  test('degrees show the school, period, major and the thesis with its links', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const degrees = page.getByTestId('degree');
    await expect(degrees).toHaveCount(2);
    await expect(
      page.getByRole('heading', { name: 'Education', level: 2 }),
    ).toBeVisible();
    await expect(degrees.first()).toContainText('Master of Science');
    await expect(degrees.first()).toContainText('Major:');
    await expect(
      degrees.first().getByText('Thesis', { exact: true }),
    ).toBeVisible();
    await expect(
      degrees.first().getByRole('link', { name: 'Read the thesis' }),
    ).toHaveAttribute('target', '_blank');
  });

  test('has the core stack and the skills by area, with the tip on hover, focus and Escape', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { name: 'Core stack' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'AI and automation' }),
    ).toBeVisible();
    const tile = page.locator('[data-skill-chip]').first();
    await tile.scrollIntoViewIfNeeded();
    await tile.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toBeHidden();
    await tile.focus();
    await expect(page.getByRole('tooltip')).toContainText(/Used at|Used in/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
  });

  test('Download CV opens the CV window of Standard', async ({ page }) => {
    await gotoSkin(page, '/resume');
    await page.getByRole('button', { name: 'Download CV' }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('the About link goes to the skills on Resume', async ({ page }) => {
    await gotoSkin(page, '/about');
    await page.getByRole('link', { name: 'See all skills' }).click();
    await expect(page).toHaveURL(/\/resume#skills$/);
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toBeInViewport();
  });

  test('the jump links go to the sections', async ({ page }) => {
    await gotoSkin(page, '/resume');
    // the link scrolls to a section that exists once the jobs have arrived
    await expect(statement(page)).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Sections of the resume' })
      .getByRole('link', { name: 'Events' })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Events', level: 2 }),
    ).toBeInViewport();
  });
});

test.describe('language and phone', () => {
  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('heading', { name: 'Kinh nghiệm', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Theo vai trò' }),
    ).toBeVisible();
    await expect(page.getByText('4 vai trò, từ 2020 đến 2026')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sự kiện', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('Hiện tại').first()).toBeVisible();
  });

  test('does not scroll the page sideways at 390px, and the statement scrolls inside its box', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    await expect(statement(page)).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
    expect(
      await statement(page).evaluate(
        (el) => el.parentElement!.scrollWidth > el.parentElement!.clientWidth,
      ),
    ).toBe(true);
  });
});

test('a tap shows the tip of a skill and a second tap hides it', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
  await gotoSkin(page, '/resume');
  const tile = page.locator('[data-skill-chip]').first();
  await tile.scrollIntoViewIfNeeded();
  await tile.tap();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.waitForTimeout(500);
  await tile.tap();
  await expect(page.getByRole('tooltip')).toBeHidden();
  await context.close();
});

test.describe('the statement grid at any width of the panel', () => {
  for (const width of [520, 760, 1000, 1500, 1900]) {
    for (const mode of ['By year', 'By role'])
      test(`${mode} at ${width}px: no sideways page scroll, labels clear of the cells, bars inside their cells`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoSkin(page, '/resume');
        if (mode === 'By role')
          await page.getByRole('button', { name: 'By role' }).click();
        const box = page.getByTestId('statement-box');
        await expect(box.getByTestId('statement-row')).toHaveCount(4);
        // the bars grow in; measure once they have
        await expect
          .poll(() =>
            page.evaluate(() =>
              document
                .getAnimations()
                .some(
                  (a) =>
                    a instanceof CSSAnimation &&
                    a.animationName === 'tv-grow' &&
                    a.playState === 'running',
                ),
            ),
          )
          .toBe(false);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        ).toBeLessThanOrEqual(0);

        const report = await box.evaluate((el) => {
          const rect = (e: Element) => e.getBoundingClientRect();
          const rows = [
            ...el.querySelectorAll('[data-testid="statement-row"]'),
          ];
          const problems: string[] = [];
          for (const row of rows) {
            const label = rect(row.querySelector('[data-label]')!);
            const next = rect(
              (row.querySelector('[data-year]') ??
                row.querySelector('[role="cell"]'))!,
            );
            if (label.right > next.left + 0.5)
              problems.push(
                `label overlaps the first cell in ${row.textContent}`,
              );
            const track = rect(row.querySelector('[data-track]')!);
            const bar = rect(row.querySelector('[data-bar]')!);
            if (bar.left < track.left - 0.5 || bar.right > track.right + 0.5)
              problems.push(`bar leaves its cells in ${row.textContent}`);
            if (bar.left < label.right - 0.5 && bar.right > label.left)
              problems.push(`bar under the label in ${row.textContent}`);
          }
          const heights = new Set(rows.map((r) => Math.round(rect(r).height)));
          if (heights.size !== 1) problems.push('rows differ in height');
          return { problems, scrolls: el.scrollWidth > el.clientWidth };
        });
        expect(report.problems).toEqual([]);

        // a narrow panel scrolls the years inside the box, and the labels stay in view
        if (report.scrolls) {
          await box.evaluate((el) => {
            el.scrollLeft = el.scrollWidth;
          });
          const left = await box.evaluate((el) => {
            const label = el
              .querySelector('[data-label]')!
              .getBoundingClientRect();
            return label.left - el.getBoundingClientRect().left;
          });
          expect(Math.abs(left)).toBeLessThanOrEqual(1);
        }
      });
  }

  test('a long name is cut and carries a title, a bar shows a focus ring and the row keeps its height', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 520, height: 900 });
    await gotoSkin(page, '/resume');
    const row = page.getByTestId('statement-row').nth(2);
    await expect(
      row.getByTitle('Part-Time Technical Instructor'),
    ).toBeAttached();
    const height = (await row.boundingBox())!.height;
    await page.keyboard.press('Tab');
    await row.locator('[data-bar]').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(row.locator('[data-bar]')).toBeFocused();
    const outline = await row
      .locator('[data-bar]')
      .evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
    expect((await row.boundingBox())!.height).toBe(height);
  });
});

test.describe('pictures', () => {
  const dialog = (page: Page) => page.getByRole('dialog');

  test('the picture of a role opens the preview with a counter, and the arrows go on from the roles to the degrees', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    await page
      .locator('[data-job="momo"]')
      .getByRole('button', { name: 'Show responsibilities' })
      .click();
    const picture = page.locator('[data-media="job:momo"]');
    await expect(picture).toBeVisible();
    await picture.click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toContainText('MoMo (M_Service)');
    await expect(dialog(page).getByText('1 of 5')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog(page).getByText('2 of 5')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog(page).getByText('3 of 5')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog(page).getByText('4 of 5')).toBeVisible();
    await expect(dialog(page)).toContainText('University of Science');
    await dialog(page)
      .getByRole('button', { name: 'Previous picture' })
      .click();
    await expect(dialog(page).getByText('3 of 5')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(picture).toBeFocused();
  });

  test('the photo of a degree is a small 16:9 thumbnail beside the text that opens the same preview', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const banner = page.locator('[data-media^="degree:"]').first();
    await banner.scrollIntoViewIfNeeded();
    expect(await banner.getAttribute('aria-label')).toMatch(
      /^View University of Science/,
    );
    const box = (await banner.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(210);
    expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    await banner.click();
    await expect(dialog(page).getByText(/^[45] of 5$/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(banner).toBeFocused();
  });

  test('a role has its picture beside the text at 16:9 about 240px wide, and a role without one has the initials tile', async ({
    page,
  }) => {
    await gotoSkin(page, '/resume');
    const momo = page.locator('[data-job="momo"]');
    await momo.getByRole('button', { name: 'Show responsibilities' }).click();
    const photo = momo.locator('[data-media]');
    await expect(photo).toBeVisible();
    const box = (await photo.boundingBox())!;
    expect(box.width).toBeGreaterThan(220);
    expect(box.width).toBeLessThan(260);
    expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    const tile = page
      .locator('[data-job="fpt-software"]')
      .getByText('FS', { exact: true });
    await expect(tile).toBeVisible();
    const tileBox = (await tile.locator('xpath=..').boundingBox())!;
    expect(tileBox.width).toBeGreaterThan(220);
  });

  test('at 390px the picture of a role is as wide as the note and nothing scrolls sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/resume');
    const momo = page.locator('[data-job="momo"]');
    await momo.getByRole('button', { name: 'Show responsibilities' }).click();
    const box = (await momo.locator('[data-media]').boundingBox())!;
    expect(box.width).toBeGreaterThan(330);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
    await momo.locator('[data-media]').click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
  });
});
