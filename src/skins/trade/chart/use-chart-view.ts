/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  clampView,
  easeOut,
  lerpView,
  type Limits,
  type View,
} from '@/skins/trade/chart/view';

const TWEEN_MS = 300;

/** The way to move the window: the same object for the whole life of the chart, so an effect that lists it is not torn down by a zoom. */
export type ChartView = {
  /** the newest window, for code that runs outside a render */
  ref: RefObject<View | null>;
  set: (next: View) => void;
  animate: (target: View) => void;
};

/**
 * The window of the chart (zoom and pan). `set` jumps there (a drag, the wheel); `animate` slides there with an ease, unless the
 * visitor asked for less motion. `view` is the window to draw (it changes on every frame of a zoom); `controls` moves it and is stable
 * (`set` and `animate` only change with the reduced-motion choice), so the effects that steer the window do not re-register on every
 * wheel or pan frame. `controls.ref` is the newest window for code that runs outside a render.
 */
export function useChartView(
  limits: Limits,
  initial: (limits: Limits) => View,
  reduced: boolean,
): { view: View | null; controls: ChartView } {
  const [view, setView] = useState<View | null>(null);
  const current = useRef<View | null>(null);
  const frame = useRef(0);
  const first = useRef(initial);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }, []);

  const set = useCallback(
    (next: View) => {
      stop();
      current.current = next;
      setView(next);
    },
    [stop],
  );

  const animate = useCallback(
    (target: View) => {
      const from = current.current;
      if (!from || reduced) {
        set(target);
        return;
      }
      stop();
      const started = performance.now();
      const run = (now: number) => {
        const t = Math.min(1, (now - started) / TWEEN_MS);
        const next = t >= 1 ? target : lerpView(from, target, easeOut(t));
        current.current = next;
        setView(next);
        frame.current = t < 1 ? requestAnimationFrame(run) : 0;
      };
      frame.current = requestAnimationFrame(run);
    },
    [reduced, set, stop],
  );

  // the first window is made when the candles arrive; later changes of the data keep the window inside them
  useEffect(() => {
    if (limits.count === 0) return;
    const existing = current.current;
    set(existing ? clampView(existing, limits) : first.current(limits));
  }, [limits, set]);

  useEffect(() => stop, [stop]);

  const controls = useMemo(
    () => ({ ref: current, set, animate }),
    [set, animate],
  );
  return { view, controls };
}
