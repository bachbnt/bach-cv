/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  STOP_OF_CATEGORY,
  stampParts,
  stampTurnClass,
  stopClass,
  stopOfIndex,
  tiltClass,
} from '@/skins/travel/blocks/postcard-model';

describe('the postcards of the Travel skin', () => {
  it('leans the postcards in a repeating pattern, also for odd indexes', () => {
    expect(tiltClass(0)).toBe('[--r:-2.2deg]');
    expect(tiltClass(5)).toBe(tiltClass(0));
    expect(tiltClass(7)).toBe(tiltClass(2));
    expect(tiltClass(-1)).toBe(tiltClass(4));
  });

  it('turns the stamps of the passport in a repeating pattern', () => {
    expect(stampTurnClass(0)).toBe('[--r:-8deg]');
    expect(stampTurnClass(5)).toBe(stampTurnClass(0));
    expect(new Set([0, 1, 2, 3, 4].map(stampTurnClass)).size).toBe(5);
  });

  it('gives the colour of a stop to the n-th item, six colours and then again', () => {
    expect([0, 1, 5, 6, 7].map(stopOfIndex)).toEqual([1, 2, 6, 1, 2]);
    expect(stopClass(1)).toBe('[--tl-pc:var(--tl-stop-1)]');
    expect(stopClass(6)).toBe('[--tl-pc:var(--tl-stop-6)]');
    expect(stopClass(7)).toBe(stopClass(1));
  });

  it('tints every skill category with a stop colour of its own', () => {
    const stops = Object.values(STOP_OF_CATEGORY);
    expect(new Set(stops).size).toBe(stops.length);
    for (const stop of stops) expect(stopClass(stop)).toContain('--tl-stop-');
  });
});

describe('the rubber stamp of a certificate', () => {
  it('prints the first name of the issuer, the month and the year', () => {
    expect(
      stampParts({ issuer: 'Google / Coursera', issuedAt: '2026-05-01' }, 'en'),
    ).toEqual({ issuer: 'Google', month: 'May', year: '2026' });
  });

  it('writes the month the way the site does in Vietnamese', () => {
    expect(
      stampParts({ issuer: 'Anthropic', issuedAt: '2026-10-31' }, 'vi'),
    ).toEqual({ issuer: 'Anthropic', month: 'Thg 10', year: '2026' });
  });

  it('keeps an issuer that has no slash whole and survives an empty one', () => {
    expect(
      stampParts({ issuer: 'FPT Software', issuedAt: '2025-01-02' }, 'en')
        .issuer,
    ).toBe('FPT Software');
    expect(
      stampParts({ issuer: '', issuedAt: '2025-01-02' }, 'en').issuer,
    ).toBe('');
  });
});
