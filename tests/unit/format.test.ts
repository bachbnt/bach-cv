/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  formatDay,
  formatMonth,
  formatMonthAt,
  formatPeriod,
  longMonthName,
  shortMonthName,
} from '@/lib/format';

describe('formatPeriod', () => {
  it('writes both years when they differ', () => {
    expect(formatPeriod('2022-05', '2026-01')).toBe('May 2022 – Jan 2026');
  });

  it('shares the year when both ends fall in it', () => {
    expect(formatPeriod('2023-05', '2023-12')).toBe('May – Dec 2023');
  });

  it('says Present for a role with no end', () => {
    expect(formatPeriod('2026-01', null)).toBe('Jan 2026 – Present');
  });
});

describe('formatPeriod in Vietnamese', () => {
  it('uses Thg for months and Nay for a role with no end', () => {
    expect(formatPeriod('2022-05', '2026-01', 'vi')).toBe(
      'Thg 5 2022 – Thg 1 2026',
    );
    expect(formatPeriod('2026-01', null, 'vi')).toBe('Thg 1 2026 – Nay');
  });
});

describe('names and dates of a time', () => {
  const t = new Date(2022, 4, 17).getTime();

  it('names the months short and long in both languages (one table with formatMonth)', () => {
    expect(shortMonthName(4)).toBe('May');
    expect(shortMonthName(4, 'vi')).toBe('Thg 5');
    expect(longMonthName(0)).toBe('January');
    expect(longMonthName(4, 'vi')).toBe('Tháng 5');
  });

  it('writes a time as the same month text as formatMonth', () => {
    expect(formatMonthAt(t)).toBe('May 2022');
    expect(formatMonthAt(t, 'vi')).toBe('Thg 5 2022');
    expect(formatMonthAt(t)).toBe(formatMonth('2022-05'));
  });

  it('writes the day of a weekly bar with its weekday', () => {
    expect(formatDay(t)).toBe('Tue 17 May 22');
    expect(formatDay(t, 'vi')).toBe('T3 17 Thg 5 22');
  });
});
