/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { jobBadge } from '@/lib/derive/job-badge';

describe('jobBadge', () => {
  it('is the short name, or the first three letters of the company', () => {
    expect(jobBadge({ shortName: 'FPT', company: 'FPT Software' })).toBe('FPT');
    expect(jobBadge({ shortName: '', company: 'Momo Wallet' })).toBe('Mom');
  });
});
