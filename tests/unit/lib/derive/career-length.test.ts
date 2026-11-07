/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { careerMonthCount, careerShare } from '@/lib/derive/career-length';

describe('the length of the career', () => {
  const now = new Date(2026, 5, 15);

  it('counts the months from the earliest start to this month, both included', () => {
    expect(careerMonthCount(['2026-01', '2026-03'], now)).toBe(6);
    expect(careerMonthCount(['2025-06'], now)).toBe(13);
  });

  it('is 0 with no role', () => {
    expect(careerMonthCount([], now)).toBe(0);
  });

  it('never goes below 0 for a start in the future', () => {
    expect(careerMonthCount(['2030-01'], now)).toBe(0);
  });

  it('turns a number of months into a share of the career, kept between 0 and 1', () => {
    expect(careerShare(6, 12)).toBe(0.5);
    expect(careerShare(20, 12)).toBe(1);
    expect(careerShare(-2, 12)).toBe(0);
    expect(careerShare(5, 0)).toBe(0);
  });
});
