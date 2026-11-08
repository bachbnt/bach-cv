/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import type { Candle } from '@/lib/derive/career-series';
import { makeAxis } from '@/skins/trade/chart/time-axis';
import {
  EMPTY_HISTORY,
  FIB_LEVELS,
  commit,
  drawingAt,
  fibPrice,
  handleAt,
  hits,
  measure,
  movePoint,
  redo,
  snap,
  translate,
  undo,
  type Drawing,
} from '@/skins/trade/chart/drawings';

// one pixel is one bar and one index point, with the price going up the screen
const proj = {
  x: (t: number) => t,
  y: (p: number) => 100 - p,
  width: 200,
  height: 100,
};
const line = (
  kind: Drawing['kind'],
  ...points: [number, number][]
): Drawing => ({
  id: kind,
  kind,
  points: points.map(([t, p]) => ({ t, p })),
});

describe('history', () => {
  const a = [line('hline', [0, 10])];
  const b = [...a, line('vline', [5, 0])];

  it('makes each change one step that can be undone and redone', () => {
    let h = commit(EMPTY_HISTORY, a);
    h = commit(h, b);
    expect(h.present).toBe(b);
    h = undo(h);
    expect(h.present).toBe(a);
    h = undo(h);
    expect(h.present).toEqual([]);
    expect(undo(h)).toBe(h);
    h = redo(h);
    expect(h.present).toBe(a);
    h = redo(redo(h));
    expect(h.present).toBe(b);
    expect(redo(h)).toBe(h);
  });

  it('forgets the redo steps when something new is drawn', () => {
    const undone = undo(commit(commit(EMPTY_HISTORY, a), b));
    expect(commit(undone, [])).toMatchObject({ future: [] });
  });

  it('ignores a change that is no change, and keeps a hundred steps', () => {
    const h = commit(EMPTY_HISTORY, a);
    expect(commit(h, h.present)).toBe(h);
    let long = EMPTY_HISTORY;
    for (let i = 0; i < 130; i++) long = commit(long, [line('hline', [0, i])]);
    expect(long.past).toHaveLength(100);
  });
});

describe('moving a drawing', () => {
  it('moves every point, or just one', () => {
    const d = line('trend', [0, 0], [10, 10]);
    expect(translate(d, 5, -2).points).toEqual([
      { t: 5, p: -2 },
      { t: 15, p: 8 },
    ]);
    expect(movePoint(d, 1, { t: 20, p: 3 }).points[1]).toEqual({ t: 20, p: 3 });
    expect(movePoint(d, 1, { t: 20, p: 3 }).points[0]).toEqual({ t: 0, p: 0 });
  });
});

describe('Fibonacci retracement', () => {
  it('has the level 0 at the second point and 1 at the first', () => {
    const d = line('fib', [0, 100], [10, 60]);
    expect(fibPrice(d.points, 0)).toBe(60);
    expect(fibPrice(d.points, 1)).toBe(100);
    expect(fibPrice(d.points, 0.5)).toBe(80);
    expect(FIB_LEVELS).toContain(0.618);
  });
});

describe('measure', () => {
  const WEEK = 7 * 24 * 60 * 60 * 1000;

  it('counts whole weeks and years with one decimal, and the change in index points', () => {
    expect(
      measure({ t: 10 * WEEK, p: 100 }, { t: 114 * WEEK, p: 130.456 }),
    ).toEqual({ weeks: 104, years: 2, delta: 30.46 });
    expect(measure({ t: 100 * WEEK, p: 50 }, { t: 90 * WEEK, p: 40 })).toEqual({
      weeks: 10,
      years: 0.2,
      delta: -10,
    });
  });

  it('counts real time, so it is the same on whatever interval the points were drawn', () => {
    const a = { t: new Date(2021, 0, 1).getTime(), p: 100 };
    const b = { t: new Date(2023, 0, 1).getTime(), p: 120 };
    expect(measure(a, b).weeks).toBe(104);
    expect(measure(b, a)).toEqual({ ...measure(a, b), delta: -20 });
  });
});

describe('magnet', () => {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const k = (
    t: number,
    o: number,
    h: number,
    l: number,
    c: number,
  ): Candle => ({
    t,
    o,
    h,
    l,
    c,
    v: 1,
  });
  const list = [k(0, 10, 14, 9, 12), k(WEEK, 12, 20, 11, 18)];
  const axis = makeAxis(list, 'week');

  it('snaps to the nearest bar and to the nearest of its open, high, low and close', () => {
    const snapped = (i: number, p: number) =>
      snap({ t: axis.time(i), p }, list, axis);
    expect(snapped(0.4, 13.2)).toEqual({ t: WEEK / 2, p: 14 });
    expect(snapped(0.6, 11.4)).toEqual({ t: WEEK * 1.5, p: 11 });
    expect(snapped(9, 18.4)).toEqual({ t: WEEK * 1.5, p: 18 });
    expect(snapped(-4, 9.2)).toEqual({ t: WEEK / 2, p: 9 });
    expect(snap({ t: 1, p: 5 }, [], axis)).toEqual({ t: 1, p: 5 });
  });
});

describe('what the pointer touches', () => {
  it('touches a line near it and not far from it', () => {
    const trend = line('trend', [0, 0], [100, 0]);
    expect(hits(trend, 50, 100 + 3, proj, 6)).toBe(true);
    expect(hits(trend, 50, 100 + 20, proj, 6)).toBe(false);
    // a segment ends, a ray goes on
    expect(hits(trend, 150, 100, proj, 6)).toBe(false);
    expect(hits(line('ray', [0, 0], [100, 0]), 180, 100, proj, 6)).toBe(true);
    expect(hits(line('ray', [0, 0], [100, 0]), -30, 100, proj, 6)).toBe(false);
  });

  it('touches the horizontal and vertical lines anywhere along them', () => {
    expect(hits(line('hline', [0, 40]), 170, 60 + 2, proj, 6)).toBe(true);
    expect(hits(line('hline', [0, 40]), 170, 90, proj, 6)).toBe(false);
    expect(hits(line('vline', [30, 0]), 31, 5, proj, 6)).toBe(true);
    expect(hits(line('vline', [30, 0]), 60, 5, proj, 6)).toBe(false);
  });

  it('touches a rectangle inside, a Fibonacci on a level or its line, and a note on its box', () => {
    const rect = line('rect', [10, 10], [50, 50]);
    expect(hits(rect, 30, 70, proj, 4)).toBe(true);
    expect(hits(rect, 80, 70, proj, 4)).toBe(false);
    const fib = line('fib', [10, 80], [60, 20]);
    expect(hits(fib, 30, proj.y(fibPrice(fib.points, 0.5)), proj, 4)).toBe(
      true,
    );
    expect(hits(fib, 120, proj.y(fibPrice(fib.points, 0.5)), proj, 4)).toBe(
      false,
    );
    const note = { ...line('text', [20, 50]), text: 'Lead' };
    expect(hits(note, 30, 40, proj, 4)).toBe(true);
    expect(hits(note, 30, 90, proj, 4)).toBe(false);
  });

  it('finds the newest drawing under the pointer', () => {
    const a = line('hline', [0, 50]);
    const b = { ...line('hline', [0, 50]), id: 'later' };
    expect(drawingAt([a, b], 10, 50, proj, 5)?.id).toBe('later');
    expect(drawingAt([a, b], 10, 5, proj, 5)).toBeNull();
  });

  it('finds the end of a drawing that is chosen', () => {
    const d = line('trend', [10, 10], [60, 40]);
    expect(handleAt(d, 61, 61, proj, 8)).toBe(1);
    expect(handleAt(d, 11, 89, proj, 8)).toBe(0);
    expect(handleAt(d, 30, 30, proj, 8)).toBe(-1);
    expect(handleAt(line('hline', [0, 10]), 0, 90, proj, 8)).toBe(-1);
  });
});
