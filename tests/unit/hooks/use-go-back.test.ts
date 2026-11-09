/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { canGoBack } from '@/hooks/use-go-back';

describe('canGoBack', () => {
  it('is true when the browser has an earlier page', () => {
    expect(canGoBack(2)).toBe(true);
    expect(canGoBack(10)).toBe(true);
  });

  it('is false for a page opened in a new tab (one entry), so the screen goes home', () => {
    expect(canGoBack(1)).toBe(false);
    expect(canGoBack(0)).toBe(false);
  });
});
