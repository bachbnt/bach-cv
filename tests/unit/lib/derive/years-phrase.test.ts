/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { yearsPhrase } from '@/lib/derive/years-phrase';

describe('yearsPhrase', () => {
  it('writes the number and the unit in both languages', () => {
    expect(yearsPhrase(7, 'en')).toBe('7 years');
    expect(yearsPhrase(1, 'en')).toBe('1 year');
    expect(yearsPhrase(7, 'vi')).toBe('7 năm');
  });

  it('spells the number with a capital for a sentence that starts with it', () => {
    expect(yearsPhrase(7, 'en', { spelled: true })).toBe('Seven years');
    expect(yearsPhrase(1, 'en', { spelled: true })).toBe('One year');
    expect(yearsPhrase(7, 'vi', { spelled: true })).toBe('Bảy năm');
    expect(yearsPhrase(12, 'vi', { spelled: true })).toBe('Mười hai năm');
  });

  it('keeps a digit past twenty', () => {
    expect(yearsPhrase(25, 'en', { spelled: true })).toBe('25 years');
  });
});
