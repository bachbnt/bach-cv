/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  filterByIssuer,
  issuersOf,
  sortCertificates,
} from '@/skins/trade/blocks/data-certs-model';
import { certificate } from './trade-data-fixtures';

const items = [
  certificate('new', '2026-10-31', 'Anthropic'),
  certificate('may', '2026-05-01', 'Google'),
  certificate('apr', '2026-04-30', 'Google'),
  certificate('none', '2026-04-02', ''),
];
const ids = (list: typeof items) => list.map((c) => c.id);

describe('certificates calendar', () => {
  it('sorts newest or oldest first without touching the input', () => {
    expect(ids(sortCertificates(items, 'oldest'))).toEqual([
      'none',
      'apr',
      'may',
      'new',
    ]);
    expect(ids(sortCertificates(items, 'newest'))).toEqual([
      'new',
      'may',
      'apr',
      'none',
    ]);
    expect(ids(items)).toEqual(['new', 'may', 'apr', 'none']);
  });

  it('lists the issuers, the one with most certificates first, and skips a missing one', () => {
    expect(issuersOf(items)).toEqual([
      { issuer: 'Google', count: 2 },
      { issuer: 'Anthropic', count: 1 },
    ]);
  });

  it('filters by issuer, and null keeps everything', () => {
    expect(ids(filterByIssuer(items, 'Google'))).toEqual(['may', 'apr']);
    expect(filterByIssuer(items, null)).toBe(items);
  });
});
