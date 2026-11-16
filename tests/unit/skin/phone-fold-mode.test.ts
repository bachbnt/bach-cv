/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  deviceScale,
  foldAfterDrag,
  parseFold,
  windowMode,
} from '@/skins/phone/shell/fold-mode';

describe('the mode of the window', () => {
  it('holds a device from 1100 x 600', () => {
    expect(windowMode(1100, 600)).toBe('device');
    expect(windowMode(1440, 900)).toBe('device');
  });

  it('is full-bleed when either side is short of that', () => {
    expect(windowMode(1099, 900)).toBe('full-bleed');
    expect(windowMode(1440, 599)).toBe('full-bleed');
    expect(windowMode(390, 844)).toBe('full-bleed');
    expect(windowMode(459, 900)).toBe('full-bleed');
  });
});

describe('the scale of the device', () => {
  it('is 1 where the window holds the whole device with its margin', () => {
    expect(deviceScale(1440, 900)).toBe(1);
    expect(deviceScale(1164, 868)).toBe(1);
    expect(deviceScale(2560, 1440)).toBe(1);
  });

  it('shrinks the device to the narrower of the two sides of the window', () => {
    // 1280 x 720: the height decides, (720 - 56) / 812
    expect(deviceScale(1280, 720)).toBe(0.817);
    // 1100 x 900: the width decides, (1100 - 24) / 1140
    expect(deviceScale(1100, 900)).toBe(0.943);
    // 1100 x 600, the smallest window with a device
    expect(deviceScale(1100, 600)).toBe(0.669);
  });
});

describe('the remembered fold', () => {
  it('is open unless the visitor folded it', () => {
    expect(parseFold(null)).toBe('open');
    expect(parseFold('open')).toBe('open');
    expect(parseFold('nonsense')).toBe('open');
    expect(parseFold('folded')).toBe('folded');
  });
});

describe('a drag on the free edge of the device', () => {
  it('folds an open device with a drag to the right and opens a folded one with a drag to the left', () => {
    expect(foldAfterDrag('open', 60)).toBe('folded');
    expect(foldAfterDrag('folded', -60)).toBe('open');
  });

  it('ignores a short drag and a drag the wrong way', () => {
    expect(foldAfterDrag('open', 59)).toBeNull();
    expect(foldAfterDrag('folded', -59)).toBeNull();
    expect(foldAfterDrag('open', -200)).toBeNull();
    expect(foldAfterDrag('folded', 200)).toBeNull();
  });
});
