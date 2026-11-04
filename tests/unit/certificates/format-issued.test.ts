/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { formatIssued } from '@/components/certificates/format-issued';

describe('formatIssued', () => {
  it('writes a day as in the design, with a two-digit day', () => {
    expect(formatIssued('2026-05-01')).toBe('May 01, 2026');
    expect(formatIssued('2026-10-31')).toBe('Oct 31, 2026');
  });

  it('writes day/month/year in Vietnamese', () => {
    expect(formatIssued('2026-05-01', 'vi')).toBe('01/05/2026');
    expect(formatIssued('2026-04-30', 'vi')).toBe('30/04/2026');
  });

  it('returns anything that is not a day unchanged', () => {
    expect(formatIssued('')).toBe('');
    expect(formatIssued('2026-05')).toBe('2026-05');
    expect(formatIssued('2026-13-01')).toBe('2026-13-01');
    expect(formatIssued('', 'vi')).toBe('');
  });
});
