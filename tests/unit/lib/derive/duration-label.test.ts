/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  formatUsed,
  lengthLabel,
} from '@/lib/derive/duration-label';

describe('formatUsed', () => {
  const units = { years: '{n} y', months: '{n} mo' };
  it('reads months below a year and years with one decimal above', () => {
    expect(formatUsed(8, units)).toBe('8 mo');
    expect(formatUsed(12, units)).toBe('1 y');
    expect(formatUsed(55, units)).toBe('4.6 y');
    expect(formatUsed(48, units)).toBe('4 y');
  });
});

describe('lengthLabel and formatDuration', () => {
  const words = {
    length: '{years} y {months} mo',
    lengthYears: '{years} y',
    lengthMonths: '{months} mo',
  };
  it('names it in the shortest way', () => {
    expect(lengthLabel({ years: 3, months: 2 }, words)).toBe('3 y 2 mo');
    expect(lengthLabel({ years: 3, months: 0 }, words)).toBe('3 y');
    expect(lengthLabel({ years: 0, months: 5 }, words)).toBe('5 mo');
  });
  it('writes a duration with the words of the copy', () => {
    const long = {
      yearOne: '1 year',
      yearMany: '{count} years',
      monthOne: '1 month',
      monthMany: '{count} months',
    };
    expect(formatDuration(45, long)).toBe('3 years 9 months');
    expect(formatDuration(12, long)).toBe('1 year');
    expect(formatDuration(13, long)).toBe('1 year 1 month');
    expect(formatDuration(1, long)).toBe('1 month');
  });
});
