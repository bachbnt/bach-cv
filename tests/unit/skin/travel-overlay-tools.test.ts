/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { PICTURE_ZOOMS, zoomFromKey } from '@/skins/travel/shell/overlay-tools';

const last = PICTURE_ZOOMS.length - 1;

describe('the zoom steps of the picture windows', () => {
  it('starts at the size that fits and only grows from there', () => {
    expect(PICTURE_ZOOMS[0]).toBe(1);
    expect([...PICTURE_ZOOMS]).toEqual(
      [...PICTURE_ZOOMS].sort((a, b) => a - b),
    );
  });

  it('+ and = go one step in, - one step out', () => {
    expect(zoomFromKey('+', 0, last, 0)).toBe(1);
    expect(zoomFromKey('=', 1, last, 0)).toBe(2);
    expect(zoomFromKey('-', 2, last, 0)).toBe(1);
  });

  it('stops at both ends instead of running past them', () => {
    expect(zoomFromKey('-', 0, last, 0)).toBe(0);
    expect(zoomFromKey('+', last, last, 0)).toBe(last);
  });

  it('0 goes back to the step that fits', () => {
    expect(zoomFromKey('0', 3, last, 0)).toBe(0);
    expect(zoomFromKey('0', 3, last, 1)).toBe(1);
  });

  it('leaves every other key to the window (the arrows step through the pictures)', () => {
    for (const key of ['ArrowLeft', 'ArrowRight', 'Enter', 'a', ' '])
      expect(zoomFromKey(key, 2, last, 0)).toBeNull();
  });
});
