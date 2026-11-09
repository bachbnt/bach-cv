/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { academicCopy } from '@/content/copy/academic';
import { PAGES } from '@/lib/content/schema';

describe('the words of the board', () => {
  it('name the term of the manuscript of every page, in both languages', () => {
    for (const lang of ['en', 'vi'] as const)
      for (const page of PAGES)
        expect(academicCopy[lang].terms[page]).not.toBe('');
  });
});
