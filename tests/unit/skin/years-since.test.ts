/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { yearsSince } from '@/skins/dev/blocks/years-since';

describe('yearsSince', () => {
  const now = new Date(2026, 10, 6); // 6 Nov 2026

  it('rounds the months to the nearest year', () => {
    expect(yearsSince('2020-03', now)).toBe(7); // 6 years 8 months
    expect(yearsSince('2020-06', now)).toBe(6); // 6 years 5 months
    expect(yearsSince('2026-01', now)).toBe(1);
  });

  it('is 0 for a month in the future or text that is not a month', () => {
    expect(yearsSince('2027-05', now)).toBe(0);
    expect(yearsSince('soon', now)).toBe(0);
    expect(yearsSince('', now)).toBe(0);
  });
});
