/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { foldText } from '@/lib/fold-text';

describe('foldText', () => {
  it('drops accents and the bar of đ, and lower-cases', () => {
    expect(foldText('Hồ Sơ')).toBe('ho so');
    expect(foldText('Đại học')).toBe('dai hoc');
    expect(foldText('Dự án')).toBe('du an');
  });

  it('keeps plain text and digits as they are, in lower case', () => {
    expect(foldText('React Native 0.76')).toBe('react native 0.76');
    expect(foldText('')).toBe('');
  });
});
