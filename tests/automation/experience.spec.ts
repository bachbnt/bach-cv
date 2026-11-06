/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

const height = (el: Locator) =>
  el.evaluate((node) => node.getBoundingClientRect().height);

test('responsibilities slide open and shut, line by line, and stay out of reach while shut', async ({
  page,
}) => {
  await page.goto('/resume');
  const toggle = page.getByRole('button', { name: /responsibilities/i }).nth(1);
  const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
  await toggle.scrollIntoViewIfNeeded();

  // shut: no height, and the list is inert (not focusable, not read out)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(await height(panel)).toBe(0);
  await expect(panel).toHaveAttribute('inert', '');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  // it grows over time instead of appearing at once
  await expect.poll(() => height(panel)).toBeGreaterThan(80);
  await expect(panel).not.toHaveAttribute('inert', '');
  const lines = panel.locator('li');
  await expect(lines.first()).toBeVisible();
  // the lines arrive one after another: the later the line, the later it starts
  const delays = await lines.evaluateAll((items) =>
    items
      .slice(0, 3)
      .map((li) => parseFloat(getComputedStyle(li).transitionDelay)),
  );
  expect(delays[1]).toBeGreaterThan(delays[0]);
  expect(delays[2]).toBeGreaterThan(delays[1]);
  await expect
    .poll(() => lines.last().evaluate((li) => getComputedStyle(li).opacity))
    .toBe('1');

  // the keyboard works too, and shutting it again takes the height back
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(() => height(panel)).toBe(0);
});

test('a timeline runs down the roles: a dot for each, the current one filled and breathing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/resume');
  const rows = page.locator('main article').filter({ has: page.locator('h3') });
  const dots = page.getByTestId('timeline-dot');
  await expect(dots.first()).toBeAttached();
  expect(await dots.count()).toBeGreaterThanOrEqual(4);
  expect(await dots.count()).toBeLessThanOrEqual(await rows.count());

  // only the job I am in now has a filled dot with a ring
  const filled = await dots.evaluateAll((items) =>
    items.map((d) => d.querySelector('.timeline-ring') !== null),
  );
  expect(filled.filter(Boolean)).toHaveLength(1);
  expect(filled[0]).toBe(true);

  // the dot sits in the gap between the date and the text, and the first dot is level with the company name
  const dot = dots.first();
  await dot.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  const geometry = await page.evaluate(() => {
    const row = document.querySelector('main article')!;
    const date = row.querySelector('p')!.getBoundingClientRect();
    const title = row.querySelector('h3')!.getBoundingClientRect();
    const d = row
      .querySelector('[data-testid="timeline-dot"]')!
      .getBoundingClientRect();
    return {
      between: d.left > date.right && d.right < title.left,
      level: Math.abs(d.top + d.height / 2 - (title.top + 15)),
    };
  });
  expect(geometry.between).toBe(true);
  expect(geometry.level).toBeLessThan(10);

  // and it is drawn: after the row appears the dot is full size
  await expect
    .poll(() => dot.evaluate((el) => getComputedStyle(el).scale))
    .toMatch(/^(none|1)$/);
});

test('on a narrower screen, where the date and the text do not share a line, there is no timeline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto('/resume');
  const dot = page.getByTestId('timeline-dot').first();
  await expect(dot).toBeAttached();
  await expect(dot).toBeHidden();
});

test('the parts of a role arrive one after another when it comes into view', async ({
  page,
}) => {
  await page.goto('/resume');
  const row = page.locator('main article').first();
  await row.scrollIntoViewIfNeeded();
  await expect(row).toHaveClass(/\bin\b/);
  const delays = await row.evaluate((el) => {
    const read = (n: number) =>
      parseFloat(
        getComputedStyle(el.querySelector(`[data-part][style*="--p: ${n}"]`)!)
          .transitionDelay,
      ) * 1000;
    return [0, 1, 2, 3, 6].map(read);
  });
  for (let i = 1; i < delays.length; i++)
    expect(delays[i]).toBeGreaterThan(delays[i - 1]);
  // and they all end up shown
  await expect
    .poll(() =>
      row.evaluate((el) =>
        [...el.querySelectorAll('[data-part]')].every(
          (p) => getComputedStyle(p).opacity === '1',
        ),
      ),
    )
    .toBe(true);
});

test('the logo of a role zooms in a little when the row is hovered', async ({
  page,
}) => {
  await page.goto('/resume');
  const row = page.locator('main article').nth(1);
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const image = row.locator('img').first();
  expect(await image.evaluate((el) => getComputedStyle(el).scale)).toMatch(
    /^(none|1)$/,
  );
  const box = (await row.boundingBox())!;
  await page.mouse.move(box.x + 60, box.y + box.height / 2, { steps: 4 });
  await expect
    .poll(() => image.evaluate((el) => getComputedStyle(el).scale))
    .toBe('1.05');
});

test('Current has a live dot that breathes, on Resume and on Home', async ({
  page,
}) => {
  for (const path of ['/resume', '/']) {
    await page.goto(path);
    const dot = page.locator('.current-dot').first();
    await expect(dot).toBeVisible();
    const animation = await dot.evaluate(
      (el) => getComputedStyle(el, '::after').animationName,
    );
    expect(animation, path).toBe('live-ring');
  }
});

test('with reduced motion nothing moves: parts shown at once, no breathing, no zoom', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/resume');
  const row = page.locator('main article').first();
  await row.scrollIntoViewIfNeeded();
  const result = await row.evaluate((el) => ({
    revealed: el.hasAttribute('data-reveal'),
    allShown: [...el.querySelectorAll('[data-part]')].every(
      (p) => getComputedStyle(p).opacity === '1',
    ),
    ring: getComputedStyle(el.querySelector('.current-dot')!, '::after')
      .animationName,
  }));
  expect(result.revealed).toBe(false);
  expect(result.allShown).toBe(true);
  expect(result.ring).toBe('none');
  // the list still opens and shuts
  await page
    .getByRole('button', { name: /responsibilities/i })
    .nth(1)
    .click();
  await expect(page.locator('[aria-expanded="true"]')).toHaveCount(2);
});
