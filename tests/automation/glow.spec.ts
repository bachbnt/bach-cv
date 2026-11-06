/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

/** The computed style of the card's ::before (the spotlight) and ::after (the lit edge). */
const layers = (card: Locator) =>
  card.evaluate((el) => {
    const read = (pseudo: '::before' | '::after') => {
      const s = getComputedStyle(el, pseudo);
      return {
        content: s.content,
        opacity: s.opacity,
        pointerEvents: s.pointerEvents,
        background: s.backgroundImage,
      };
    };
    return { before: read('::before'), after: read('::after') };
  });

test('a card lights up where the mouse is: a spotlight inside and a lit edge', async ({
  page,
}) => {
  await page.goto('/projects');
  const card = page.locator('article.glow').first();
  await card.scrollIntoViewIfNeeded();

  // resting: nothing shows
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await layers(card)).before.opacity).toBe('0');

  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, {
    steps: 6,
  });
  await expect.poll(async () => (await layers(card)).before.opacity).toBe('1');

  const lit = await layers(card);
  expect(lit.after.opacity).toBe('1');
  // both layers are radial gradients and never take the mouse
  expect(lit.before.background).toContain('radial-gradient');
  expect(lit.after.background).toContain('radial-gradient');
  expect(lit.before.pointerEvents).toBe('none');
  expect(lit.after.pointerEvents).toBe('none');

  // the position follows the pointer, relative to the card
  const pos = await card.evaluate((el) => ({
    x: parseFloat(el.style.getPropertyValue('--mx')),
    y: parseFloat(el.style.getPropertyValue('--my')),
  }));
  expect(Math.abs(pos.x - box.width * 0.7)).toBeLessThan(2);
  expect(Math.abs(pos.y - box.height * 0.6)).toBeLessThan(2);

  // and it goes away again when the mouse leaves
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await layers(card)).before.opacity).toBe('0');
});

test('the glow takes the colour of the page and works in dark mode', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-theme', 'dark'));
  await page.goto('/projects');
  const card = page.locator('article.glow').first();
  await card.scrollIntoViewIfNeeded();
  const colours = await card.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      glow: s.getPropertyValue('--glow').trim(),
      strong: s.getPropertyValue('--glow-strong').trim(),
      page: s.getPropertyValue('--page').trim(),
    };
  });
  expect(colours.glow.length).toBeGreaterThan(0);
  expect(colours.strong.length).toBeGreaterThan(0);
  expect(colours.page.length).toBeGreaterThan(0);

  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 4,
  });
  await expect.poll(async () => (await layers(card)).before.opacity).toBe('1');
});

test('with reduced motion there is no glow at all', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects');
  const card = page.locator('article.glow').first();
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 4,
  });
  const result = await layers(card);
  expect(result.before.content).toBe('none');
  expect(result.after.content).toBe('none');
});

test('the cards of every page that has them carry the glow, and links inside still work', async ({
  page,
}) => {
  for (const path of [
    '/',
    '/projects',
    '/certificates',
    '/services',
    '/resume',
  ]) {
    await page.goto(path);
    await page.waitForTimeout(800);
    expect(
      await page.locator('.glow').count(),
      `glow cards on ${path}`,
    ).toBeGreaterThan(0);
  }

  // a link inside a glowing card is still the thing under the mouse
  await page.goto('/projects');
  const link = page.locator('article.glow a[href]').first();
  await link.scrollIntoViewIfNeeded();
  const box = (await link.boundingBox())!;
  const top = await page.evaluate(
    ([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el?.closest('a')?.getAttribute('href') ?? el?.tagName;
    },
    [box.x + box.width / 2, box.y + box.height / 2],
  );
  expect(top).toBe(await link.getAttribute('href'));
});

/** What a card does on hover: how far it moved, its shadow, and whether the move is animated. */
const lifted = (card: Locator) =>
  card.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      translate: s.translate,
      shadow: s.boxShadow,
      animated: s.transitionProperty.split(',').some((p) => {
        const name = p.trim();
        return name === 'translate' || name === 'all';
      }),
      delay: s.transitionDelay.split(',')[0].trim(),
    };
  });

for (const [name, path, selector] of [
  ['the featured project', '/projects', 'article.glow >> nth=0'],
  ['a project in the grid', '/projects', 'article.glow >> nth=4'],
  ['a certificate', '/certificates', 'article.glow >> nth=1'],
  ['the preferred payment method', '/payment', 'article.glow >> nth=0'],
  ['a payment method row', '/payment', 'li.glow >> nth=0'],
  ['a service', '/services', 'article.glow >> nth=0'],
] as const) {
  test(`${name} rises and gets a shadow on hover, smoothly and without a delay`, async ({
    page,
  }) => {
    await page.goto(path);
    const card = page.locator(selector);
    await card.scrollIntoViewIfNeeded();
    // let the entrance finish, and its stagger delay with it
    await page.waitForTimeout(1800);

    const resting = await lifted(card);
    expect(resting.translate === 'none' || resting.translate === '0px').toBe(
      true,
    );
    expect(resting.animated).toBe(true);
    expect(resting.delay).toBe('0s');

    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 4,
    });
    await expect
      .poll(async () => (await lifted(card)).translate)
      .toBe('0px -3px');
    expect((await lifted(card)).shadow).not.toBe('none');
  });
}

test('with reduced motion the cards do not move on hover', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects');
  const card = page.locator('article.glow').first();
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 4,
  });
  const after = await lifted(card);
  expect(after.translate === 'none' || after.translate === '0px').toBe(true);
});

test('the tinted head of a page lights up softly under the mouse, across the header and the title', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/projects');
  const bands = page.locator('.band-glow');
  await expect(bands).toHaveCount(2);
  // the page listens to the mouse once it has started up
  await page.waitForTimeout(800);

  // resting: dark
  await page.mouse.move(640, 700, { steps: 3 });
  await expect
    .poll(() =>
      bands.evaluateAll((els) =>
        els.map((e) => (e as HTMLElement).style.getPropertyValue('--band-o')),
      ),
    )
    .toEqual(['0', '0']);

  // the mouse over the title part: both blocks light, with the same centre seen from the page
  await page.mouse.move(700, 160, { steps: 6 });
  await expect
    .poll(() =>
      bands.evaluateAll((els) =>
        els.map((e) => (e as HTMLElement).style.getPropertyValue('--band-o')),
      ),
    )
    .toEqual(['1', '1']);
  const seen = await bands.evaluateAll((els) =>
    els.map((el) => {
      const box = el.getBoundingClientRect();
      const s = (el as HTMLElement).style;
      return {
        x: box.left + parseFloat(s.getPropertyValue('--mx')),
        y: box.top + parseFloat(s.getPropertyValue('--my')),
        image: getComputedStyle(el).backgroundImage,
      };
    }),
  );
  for (const band of seen) {
    expect(Math.abs(band.x - 700)).toBeLessThan(2);
    expect(Math.abs(band.y - 160)).toBeLessThan(2);
    expect(band.image).toContain('radial-gradient');
  }

  // and it goes out again below the head
  await page.mouse.move(640, 700, { steps: 6 });
  await expect
    .poll(() =>
      bands.evaluateAll((els) =>
        els.map((e) => (e as HTMLElement).style.getPropertyValue('--band-o')),
      ),
    )
    .toEqual(['0', '0']);
});

test('every page has a lit head, and with reduced motion there is none', async ({
  page,
}) => {
  for (const path of [
    '/',
    '/about',
    '/resume',
    '/certificates',
    '/services',
    '/payment',
  ]) {
    await page.goto(path);
    expect(
      await page.locator('.band-glow').count(),
      `bands on ${path}`,
    ).toBeGreaterThanOrEqual(2);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects');
  await page.mouse.move(700, 160, { steps: 4 });
  const images = await page
    .locator('.band-glow')
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundImage));
  expect(images).toEqual(['none', 'none']);
});
