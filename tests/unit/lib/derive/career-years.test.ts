/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { careerYears, yearsSince } from '@/lib/derive/career-years';

const now = new Date(2026, 10, 6); // November 2026

describe('yearsSince', () => {
  it('rounds to the nearest year, as Standard states it', () => {
    expect(yearsSince('2020-03', now)).toBe(7); // 6 years and 8 months
    expect(yearsSince('2020-06', now)).toBe(6); // 6 years and 5 months
    expect(yearsSince('2026-01', now)).toBe(1);
    expect(yearsSince('2026-11', now)).toBe(0);
  });

  it('is never below 0 and ignores a damaged month', () => {
    expect(yearsSince('2030-01', now)).toBe(0);
    expect(yearsSince('nope', now)).toBe(0);
    expect(yearsSince('', now)).toBe(0);
  });
});

describe('careerYears', () => {
  it('counts from the earliest start month', () => {
    expect(careerYears(['2022-05', '2020-03', '2026-01'], now)).toBe(7);
  });

  it('is null with no job', () => {
    expect(careerYears([], now)).toBeNull();
  });
});
