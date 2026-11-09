/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  clampView,
  zoomView,
  type Layout,
  type Limits,
  type View,
} from '@/skins/trade/chart/view';

/** Where a press landed: the plot, the price scale (the right strip), the time axis (the bottom strip) or nothing that takes a gesture. */
type Zone = 'plot' | 'scale' | 'time' | 'none';

export function zoneAt(layout: Layout, x: number, y: number): Zone {
  if (y < layout.toolbar) return 'none';
  if (x >= layout.plotWidth && y < layout.axisY)
    return y <= layout.main.bottom ? 'scale' : 'none';
  if (y >= layout.axisY) return 'time';
  return 'plot';
}

/** The price range a drag on the price scale gives: it opens as the pointer goes down and closes as it goes up, around the same middle. */
export function scaleRange(
  start: { y: number; lo: number; hi: number; log: boolean },
  y: number,
): { lo: number; hi: number } {
  const k = Math.exp((y - start.y) / 160);
  const a = start.log ? Math.log(start.lo) : start.lo;
  const b = start.log ? Math.log(start.hi) : start.hi;
  const mid = (a + b) / 2;
  const half = ((b - a) / 2) * k;
  const lo = mid - half;
  const hi = mid + half;
  return start.log ? { lo: Math.exp(lo), hi: Math.exp(hi) } : { lo, hi };
}

/** The window a drag along the time axis gives: right zooms in, left zooms out, around the right edge. */
export function timeZoom(
  start: { x: number; view: View },
  x: number,
  limits: Limits,
): View {
  return zoomView(start.view, Math.exp(-(x - start.x) / 200), 1, limits);
}

/** The window two fingers give: the span follows the distance between them, and the point between them stays where it was. */
export function pinchView(
  start: { distance: number; view: View; anchor: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
  limits: Limits,
): View {
  const ratio = start.distance / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
  const span = Math.max(limits.minSpan, start.view.span * ratio);
  const frac = start.anchor;
  const pinned = start.view.from + start.view.span * frac;
  return clampView({ from: pinned - span * frac, span }, limits);
}
