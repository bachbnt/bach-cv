/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/lib/derive/career-series';
import { WEEK_MS } from '@/lib/derive/career-series';
import type { TimeAxis } from '@/skins/trade/chart/time-axis';

/**
 * A place on the chart in data units: a time (milliseconds) and an index value, so a drawing follows zoom and pan and stays at the same
 * date and value when the interval of the candles changes.
 */
export interface Point {
  t: number;
  p: number;
}

export type DrawingKind =
  'trend' | 'ray' | 'hline' | 'vline' | 'rect' | 'fib' | 'text';

export interface Drawing {
  id: string;
  kind: DrawingKind;
  points: Point[];
  /** the words of a text note */
  text?: string;
}

/** The levels of the Fibonacci retracement, from the second point (0) back to the first one (1). */
export const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;

export function fibPrice(points: Point[], level: number): number {
  const [a, b] = points;
  return b.p + (a.p - b.p) * level;
}

/** The drawings and what undo and redo can go back to. A change that is part of one gesture is one step. */
export interface History {
  past: Drawing[][];
  present: Drawing[];
  future: Drawing[][];
}

export const EMPTY_HISTORY: History = { past: [], present: [], future: [] };
const LIMIT = 100;

export function commit(history: History, next: Drawing[]): History {
  if (next === history.present) return history;
  return {
    past: [...history.past, history.present].slice(-LIMIT),
    present: next,
    future: [],
  };
}

export function undo(history: History): History {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo(history: History): History {
  const [next, ...rest] = history.future;
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
  };
}

export function translate(drawing: Drawing, dt: number, dp: number): Drawing {
  return {
    ...drawing,
    points: drawing.points.map((pt) => ({ t: pt.t + dt, p: pt.p + dp })),
  };
}

export function movePoint(drawing: Drawing, index: number, to: Point): Drawing {
  return {
    ...drawing,
    points: drawing.points.map((pt, k) => (k === index ? to : pt)),
  };
}

const WEEKS_PER_YEAR = 52.1775;

export interface Measure {
  weeks: number;
  years: number;
  /** the change in index points from the first point to the second (a decoration, never a return) */
  delta: number;
}

/**
 * What the measure tool reports between two points: whole weeks, years with one decimal, and the difference in index points. The
 * time is real time, so it is the same whatever the interval of the candles.
 */
export function measure(a: Point, b: Point): Measure {
  const weeks = Math.round(Math.abs(b.t - a.t) / WEEK_MS);
  return {
    weeks,
    years: Math.round((weeks / WEEKS_PER_YEAR) * 10) / 10,
    delta: Math.round((b.p - a.p) * 100) / 100,
  };
}

/** Snaps a point to the middle of the nearest bar and to the open, high, low or close of it that is nearest to the point's value. */
export function snap(point: Point, candles: Candle[], axis: TimeAxis): Point {
  if (candles.length === 0) return point;
  const i = Math.min(
    candles.length - 1,
    Math.max(0, Math.round(axis.index(point.t))),
  );
  const k = candles[i];
  const p = [k.o, k.h, k.l, k.c].reduce((best, v) =>
    Math.abs(v - point.p) < Math.abs(best - point.p) ? v : best,
  );
  return { t: axis.time(i), p };
}

/** Where data units are on screen (the chart gives its own), so drawings can be tested for a pointer without the chart. */
interface Projection {
  x: (t: number) => number;
  y: (price: number) => number;
  width: number;
  height: number;
}

const NOTE_HEIGHT = 18;
const NOTE_CHAR = 7;

function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  open: boolean,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;
  let t = length === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / length;
  t = open ? Math.max(0, t) : Math.min(1, Math.max(0, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Whether the pointer at (`x`, `y`) touches the drawing, within `tolerance` pixels. */
export function hits(
  drawing: Drawing,
  x: number,
  y: number,
  proj: Projection,
  tolerance: number,
): boolean {
  const pts = drawing.points.map((pt) => ({
    x: proj.x(pt.t),
    y: proj.y(pt.p),
  }));
  const [a, b] = pts;
  switch (drawing.kind) {
    case 'hline':
      return Math.abs(y - a.y) <= tolerance;
    case 'vline':
      return Math.abs(x - a.x) <= tolerance;
    case 'text': {
      const width = (drawing.text?.length ?? 1) * NOTE_CHAR + 12;
      return (
        x >= a.x - tolerance &&
        x <= a.x + width + tolerance &&
        y >= a.y - NOTE_HEIGHT - tolerance &&
        y <= a.y + tolerance
      );
    }
    case 'trend':
      return distanceToSegment(x, y, a.x, a.y, b.x, b.y, false) <= tolerance;
    case 'ray':
      return distanceToSegment(x, y, a.x, a.y, b.x, b.y, true) <= tolerance;
    case 'rect':
      return (
        x >= Math.min(a.x, b.x) - tolerance &&
        x <= Math.max(a.x, b.x) + tolerance &&
        y >= Math.min(a.y, b.y) - tolerance &&
        y <= Math.max(a.y, b.y) + tolerance
      );
    case 'fib': {
      const inside =
        x >= Math.min(a.x, b.x) - tolerance &&
        x <= Math.max(a.x, b.x) + tolerance;
      if (distanceToSegment(x, y, a.x, a.y, b.x, b.y, false) <= tolerance)
        return true;
      return (
        inside &&
        FIB_LEVELS.some(
          (level) =>
            Math.abs(y - proj.y(fibPrice(drawing.points, level))) <= tolerance,
        )
      );
    }
  }
}

/** The newest drawing under the pointer, or `null`. */
export function drawingAt(
  drawings: Drawing[],
  x: number,
  y: number,
  proj: Projection,
  tolerance: number,
): Drawing | null {
  for (let k = drawings.length - 1; k >= 0; k--)
    if (hits(drawings[k], x, y, proj, tolerance)) return drawings[k];
  return null;
}

/** The index of the handle of a drawing under the pointer (an end of a line, a corner), or -1. */
export function handleAt(
  drawing: Drawing,
  x: number,
  y: number,
  proj: Projection,
  tolerance: number,
): number {
  if (drawing.kind === 'hline' || drawing.kind === 'vline') return -1;
  return drawing.points.findIndex(
    (pt) => Math.hypot(proj.x(pt.t) - x, proj.y(pt.p) - y) <= tolerance,
  );
}
