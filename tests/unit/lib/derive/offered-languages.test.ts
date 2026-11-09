/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/content/schema';
import { offeredLanguages } from '@/lib/derive/offered-languages';

describe('offeredLanguages', () => {
  it('lists the languages of the shell in the order of the menu, whatever order the shell has them in', () => {
    expect(offeredLanguages(['vi', 'en'])).toEqual([...LANGS]);
  });

  it('leaves out a language that the shell does not list', () => {
    expect(offeredLanguages(['en'])).toEqual(['en']);
    expect(offeredLanguages([])).toEqual([]);
  });
});
