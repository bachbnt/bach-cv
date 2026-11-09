/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { tallyGroups, tallyYears } from '@/lib/derive/tally';

describe('tallyYears', () => {
  it('counts every year begun', () => {
    expect(tallyYears(1)).toBe(1);
    expect(tallyYears(12)).toBe(1);
    expect(tallyYears(13)).toBe(2);
    expect(tallyYears(81)).toBe(7);
  });

  it('is none for no time, and for what is not a number of months', () => {
    expect(tallyYears(0)).toBe(0);
    expect(tallyYears(-4)).toBe(0);
    expect(tallyYears(Number.NaN)).toBe(0);
  });
});

describe('tallyGroups', () => {
  it('has no group for no year', () => {
    expect(tallyGroups(0)).toEqual([]);
    expect(tallyGroups(-2)).toEqual([]);
  });

  it('writes under five years as upright strokes', () => {
    expect(tallyGroups(1)).toEqual([{ strokes: 1, crossed: false }]);
    expect(tallyGroups(4)).toEqual([{ strokes: 4, crossed: false }]);
  });

  it('writes five as four strokes and a crossing one, then starts a new group', () => {
    expect(tallyGroups(5)).toEqual([{ strokes: 4, crossed: true }]);
    expect(tallyGroups(7)).toEqual([
      { strokes: 4, crossed: true },
      { strokes: 2, crossed: false },
    ]);
    expect(tallyGroups(10)).toEqual([
      { strokes: 4, crossed: true },
      { strokes: 4, crossed: true },
    ]);
  });

  it('counts every stroke once', () => {
    for (let years = 0; years <= 23; years += 1) {
      const sum = tallyGroups(years).reduce(
        (total, group) => total + group.strokes + (group.crossed ? 1 : 0),
        0,
      );
      expect(sum).toBe(years);
    }
  });
});
