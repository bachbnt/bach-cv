/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  jobLength,
  lengthOfMonths,
  monthIndex,
  monthSpan,
  nowMonthIndex,
  spanMonths,
} from '@/lib/derive/career-months';

const now = new Date(2026, 10, 6);

describe('months of a role', () => {
  it('turns a month into a number that can be subtracted', () => {
    expect(monthIndex('2026-11') - monthIndex('2026-01')).toBe(10);
    expect(monthIndex('2027-01') - monthIndex('2026-12')).toBe(1);
    expect(nowMonthIndex(now)).toBe(monthIndex('2026-11'));
  });

  it('counts both ends and runs the current role to this month', () => {
    expect(
      monthSpan({ startMonth: '2022-05', endMonth: '2022-05' }, now),
    ).toEqual([monthIndex('2022-05'), monthIndex('2022-05')]);
    expect(
      spanMonths({ startMonth: '2022-05', endMonth: '2026-01' }, now),
    ).toBe(45);
    expect(spanMonths({ startMonth: '2026-01', endMonth: null }, now)).toBe(11);
  });

  it('is never below one month, even for an end before the start', () => {
    expect(
      spanMonths({ startMonth: '2024-05', endMonth: '2024-01' }, now),
    ).toBe(1);
  });
});

describe('length of a role', () => {
  it('splits the months into years and months', () => {
    expect(lengthOfMonths(45)).toEqual({ years: 3, months: 9 });
    expect(lengthOfMonths(11)).toEqual({ years: 0, months: 11 });
    expect(
      jobLength({ startMonth: '2022-05', endMonth: '2023-12' }, now),
    ).toEqual({ years: 1, months: 8 });
    expect(jobLength({ startMonth: '2026-06', endMonth: null }, now)).toEqual({
      years: 0,
      months: 6,
    });
  });
});
