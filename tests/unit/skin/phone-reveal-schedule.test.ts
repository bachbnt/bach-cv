/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  ARC_MS,
  BAR_MS,
  BASE_DELAY,
  arcDelays,
  barDelays,
  countAt,
  easeOut,
} from '@/skins/phone/blocks/reveal-schedule';

describe('what arrives in the stat widgets', () => {
  it('draws the arcs in one after another, 70 ms apart, so seven years take about 700 ms', () => {
    const delays = arcDelays(7);
    expect(delays).toHaveLength(7);
    expect(delays[0]).toBe(BASE_DELAY);
    for (let i = 1; i < delays.length; i++)
      expect(delays[i] - delays[i - 1]).toBe(70);
    expect(delays[6] + ARC_MS - BASE_DELAY).toBeLessThanOrEqual(700);
  });

  it('keeps the whole ring to the same time however many years it has', () => {
    for (const years of [1, 2, 7, 12, 24]) {
      const delays = arcDelays(years);
      expect(delays).toHaveLength(years);
      expect(delays[0]).toBe(BASE_DELAY);
      expect([...delays].sort((a, b) => a - b)).toEqual(delays);
      expect(delays[years - 1] - BASE_DELAY).toBeLessThanOrEqual(420);
    }
    expect(arcDelays(0)).toEqual([]);
  });

  it('starts the bars 80 ms apart, from the top', () => {
    expect(barDelays(4)).toEqual([160, 240, 320, 400]);
    expect(barDelays(4)[3] + BAR_MS - BASE_DELAY).toBeLessThanOrEqual(900);
    expect(barDelays(0)).toEqual([]);
  });

  it('eases out between 0 and 1 and never leaves them', () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(-3)).toBe(0);
    expect(easeOut(9)).toBe(1);
    let last = 0;
    for (let t = 0; t <= 1; t += 0.05) {
      expect(easeOut(t)).toBeGreaterThanOrEqual(last);
      last = easeOut(t);
    }
    // slow at the end: more than half the way in the first third
    expect(easeOut(1 / 3)).toBeGreaterThan(0.5);
  });

  it('counts whole numbers from 0 to the target and no further', () => {
    expect(countAt(7, 0)).toBe(0);
    expect(countAt(7, 1)).toBe(7);
    expect(countAt(10, 2)).toBe(10);
    for (const target of [1, 7, 10, 38]) {
      let last = 0;
      for (let p = 0; p <= 1; p += 0.1) {
        const value = countAt(target, p);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(last);
        expect(value).toBeLessThanOrEqual(target);
        last = value;
      }
    }
  });
});
