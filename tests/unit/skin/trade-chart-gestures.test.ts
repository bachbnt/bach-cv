/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  pinchView,
  scaleRange,
  timeZoom,
  zoneAt,
} from '@/skins/trade/chart/gesture-math';
import { layoutOf, limitsOf } from '@/skins/trade/chart/view';

const flat = layoutOf(800, 400, { rsi: false, macd: false }, 34);
const panes = layoutOf(800, 400, { rsi: true, macd: false }, 34);

describe('zoneAt', () => {
  it('finds the plot, the price scale and the time axis', () => {
    expect(zoneAt(flat, 100, 100)).toBe('plot');
    expect(zoneAt(flat, flat.plotWidth + 5, 100)).toBe('scale');
    expect(zoneAt(flat, 100, flat.axisY + 2)).toBe('time');
    // the corner under the price scale is the time axis too
    expect(zoneAt(flat, flat.plotWidth + 5, flat.axisY + 2)).toBe('time');
  });

  it('gives nothing to the strip of the chart buttons', () => {
    expect(zoneAt(flat, 100, 10)).toBe('none');
    expect(zoneAt(flat, flat.plotWidth + 5, 10)).toBe('none');
  });

  it('only the price pane has a price scale to drag: the scale of a lower pane takes nothing', () => {
    const below = panes.main.bottom + 4;
    expect(zoneAt(panes, panes.plotWidth + 5, below)).toBe('none');
    expect(zoneAt(panes, panes.plotWidth + 5, panes.main.bottom - 4)).toBe(
      'scale',
    );
    expect(zoneAt(panes, 100, below)).toBe('plot');
  });
});

describe('scaleRange', () => {
  const start = { y: 100, lo: 10, hi: 30, log: false };

  it('keeps the range while the pointer has not moved', () => {
    expect(scaleRange(start, 100)).toEqual({ lo: 10, hi: 30 });
  });

  it('opens down and closes up, around the same middle', () => {
    const wider = scaleRange(start, 180);
    expect(wider.lo).toBeLessThan(10);
    expect(wider.hi).toBeGreaterThan(30);
    expect((wider.lo + wider.hi) / 2).toBeCloseTo(20);
    const tighter = scaleRange(start, 20);
    expect(tighter.hi - tighter.lo).toBeLessThan(20);
    expect((tighter.lo + tighter.hi) / 2).toBeCloseTo(20);
  });

  it('works on the logarithm on a log scale, so the range stays positive', () => {
    const log = scaleRange({ y: 0, lo: 10, hi: 1000, log: true }, 50);
    expect(log.lo).toBeGreaterThan(0);
    expect(Math.sqrt(log.lo * log.hi)).toBeCloseTo(100);
  });
});

describe('timeZoom', () => {
  const limits = limitsOf(80, 'month');
  const view = { from: 20, span: 30 };

  it('does nothing without a move', () => {
    expect(timeZoom({ x: 300, view }, 300, limits)).toEqual(view);
  });

  it('zooms in to the right and out to the left, keeping the right edge', () => {
    const inward = timeZoom({ x: 300, view }, 420, limits);
    const outward = timeZoom({ x: 300, view }, 180, limits);
    expect(inward.span).toBeLessThan(view.span);
    expect(outward.span).toBeGreaterThan(view.span);
    expect(inward.from + inward.span).toBeCloseTo(view.from + view.span);
  });

  it('stops at the closest window', () => {
    expect(timeZoom({ x: 0, view }, 5000, limits).span).toBe(limits.minSpan);
  });
});

describe('pinchView', () => {
  const limits = limitsOf(80, 'month');
  const view = { from: 20, span: 30 };
  const start = { distance: 100, view, anchor: 0.5 };

  it('keeps the view while the fingers keep their distance', () => {
    const same = pinchView(start, { x: 0, y: 0 }, { x: 100, y: 0 }, limits);
    expect(same.span).toBeCloseTo(30);
    expect(same.from).toBeCloseTo(20);
  });

  it('zooms in as the fingers spread and out as they close, around the point between them', () => {
    const spread = pinchView(start, { x: 0, y: 0 }, { x: 200, y: 0 }, limits);
    const closed = pinchView(start, { x: 0, y: 0 }, { x: 50, y: 0 }, limits);
    expect(spread.span).toBeCloseTo(15);
    expect(closed.span).toBeCloseTo(60);
    expect(spread.from + spread.span / 2).toBeCloseTo(35);
  });

  it('never goes under the closest window', () => {
    const tiny = pinchView(start, { x: 0, y: 0 }, { x: 5000, y: 0 }, limits);
    expect(tiny.span).toBe(limits.minSpan);
  });
});
