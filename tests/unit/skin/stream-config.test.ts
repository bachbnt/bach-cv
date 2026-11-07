/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { streamCopy } from '@/content/copy/stream';
import { PAGES } from '@/lib/content/schema';
import {
  chapterTime,
  MAIN_PAGES,
  MORE_PAGES,
  orderPages,
  splitTabs,
  stepIndex,
  SWIPE_DISTANCE,
  swipeStep,
  TAB_COUNT,
  WHEEL_DISTANCE,
  wheelStep,
} from '@/skins/stream/config';

describe('the pages of the Stream navigation', () => {
  it('lists every page once', () => {
    expect([...MAIN_PAGES, ...MORE_PAGES].sort()).toEqual([...PAGES].sort());
  });

  it('puts the pages in the order of the skin, whatever order they come in', () => {
    const shuffled = [...PAGES].reverse().map((page) => ({ page }));
    expect(orderPages(shuffled).map((item) => item.page)).toEqual([
      ...MAIN_PAGES,
      ...MORE_PAGES,
    ]);
  });

  it('keeps four tabs for a phone and sends the rest to the Menu sheet', () => {
    const items = orderPages(PAGES.map((page) => ({ page })));
    const { tabs, more } = splitTabs(items);
    expect(tabs).toHaveLength(TAB_COUNT);
    expect(tabs.map((t) => t.page)).toEqual([...MAIN_PAGES]);
    expect(more.map((m) => m.page)).toEqual([...MORE_PAGES]);
  });

  it('fills the tabs from the next pages when one is switched off', () => {
    const visible = orderPages(
      PAGES.filter((page) => page !== 'projects').map((page) => ({ page })),
    );
    expect(splitTabs(visible).tabs.map((t) => t.page)).toEqual([
      'home',
      'resume',
      'about',
      'services',
    ]);
  });
});

describe('chapter times', () => {
  it('count 1:20 for each step, starting at 0:00', () => {
    expect([0, 1, 2, 3, 4].map(chapterTime)).toEqual([
      '0:00',
      '1:20',
      '2:40',
      '4:00',
      '5:20',
    ]);
  });

  it('never goes below the start', () => {
    expect(chapterTime(-3)).toBe('0:00');
  });
});

describe('moving through the reel', () => {
  it('wraps around at both ends', () => {
    expect(stepIndex(0, 1, 4)).toBe(1);
    expect(stepIndex(3, 1, 4)).toBe(0);
    expect(stepIndex(0, -1, 4)).toBe(3);
  });

  it('stays at the start when there is nothing to move through', () => {
    expect(stepIndex(0, 1, 0)).toBe(0);
    expect(stepIndex(2, -1, 0)).toBe(0);
  });

  it('turns a swipe into a step: up is next, down is previous, a short move is none', () => {
    expect(swipeStep(400, 400 - SWIPE_DISTANCE)).toBe(1);
    expect(swipeStep(400, 400 + SWIPE_DISTANCE)).toBe(-1);
    expect(swipeStep(400, 400 - SWIPE_DISTANCE + 1)).toBe(0);
  });
});

describe('the words of the Stream skin', () => {
  it('are there in both languages', () => {
    const words = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : Object.values(value as Record<string, unknown>).flatMap(words);
    for (const lang of ['en', 'vi'] as const) {
      const all = words(streamCopy[lang]);
      expect(all.length).toBeGreaterThan(5);
      for (const word of all) expect(word.trim()).not.toBe('');
    }
  });
});

describe('wheelStep', () => {
  it('goes to the next project when the wheel turns down and to the previous one when it turns up', () => {
    expect(wheelStep(WHEEL_DISTANCE)).toBe(1);
    expect(wheelStep(-WHEEL_DISTANCE)).toBe(-1);
    expect(wheelStep(120)).toBe(1);
  });

  it('ignores a small turn and a sideways one', () => {
    expect(wheelStep(WHEEL_DISTANCE - 1)).toBe(0);
    expect(wheelStep(0)).toBe(0);
    expect(wheelStep(40, 90)).toBe(0);
  });
});
