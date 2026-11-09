/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  axisYears,
  barKind,
  placeBar,
} from '@/skins/academic/blocks/ac-timeline-model';

const now = new Date(2026, 10, 9);
const years = { from: 2016, to: 2026 };

describe('barKind', () => {
  it('draws a degree, a full-time role and any other role differently', () => {
    expect(barKind('degree')).toBe('edu');
    expect(barKind('full-time')).toBe('full');
    expect(barKind('part-time')).toBe('part');
    expect(barKind('freelance')).toBe('part');
    expect(barKind('internship')).toBe('part');
  });
});

describe('placeBar', () => {
  it('starts at the month and is as wide as the months it lasts, both counted', () => {
    // the whole of 2016 is the first twelfth of eleven years
    const bar = placeBar(
      { startMonth: '2016-01', endMonth: '2016-12' },
      years,
      now,
    );
    expect(bar.left).toBeCloseTo(0);
    expect(bar.width).toBeCloseTo(100 / 11);
  });

  it('ends this month for a role that is not over', () => {
    const bar = placeBar({ startMonth: '2026-01', endMonth: null }, years, now);
    // November: eleven of the twelve months of the last year are over
    expect(bar.left + bar.width).toBeCloseTo((131 / 132) * 100);
  });

  it('keeps a bar inside the figure', () => {
    const bar = placeBar(
      { startMonth: '2020-03', endMonth: '2022-08' },
      years,
      now,
    );
    expect(bar.left).toBeGreaterThanOrEqual(0);
    expect(bar.left + bar.width).toBeLessThanOrEqual(100);
  });
});

describe('axisYears', () => {
  it('marks every second year, each where it starts', () => {
    const marks = axisYears(years);
    expect(marks.map((mark) => mark.year)).toEqual([
      2016, 2018, 2020, 2022, 2024, 2026,
    ]);
    expect(marks[0].left).toBe(0);
    expect(marks[1].left).toBeCloseTo((2 / 11) * 100);
  });
});
