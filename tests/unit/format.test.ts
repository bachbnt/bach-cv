/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { formatPeriod } from '@/lib/format';

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
