/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { chartStore } from '@/skins/trade/chart/chart-store';
import { barsDue, type ReplayState } from '@/skins/trade/chart/replay';
import type { ChartView } from '@/skins/trade/chart/use-chart-view';
import { followView, type Limits } from '@/skins/trade/chart/view';

/**
 * The replay's clock: while it plays, bars come due by the time that passed (so a slow frame does not slow the replay, and reduced
 * motion does not autoplay), and the window follows the playhead when it reaches the right edge.
 */
export function useReplayClock(
  replay: ReplayState,
  reduced: boolean,
  controls: ChartView,
  limits: Limits,
) {
  const playing = replay.phase === 'ready' && replay.playing && !reduced;
  const speed = replay.speed;
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let before = performance.now();
    let carry = 0;
    const run = (now: number) => {
      const due = barsDue(now - before + carry, speed);
      before = now;
      carry = due.rest;
      if (due.bars > 0) chartStore.stepReplay(due.bars);
      frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  const at = replay.phase === 'ready' ? replay.at : -1;
  useEffect(() => {
    const current = controls.ref.current;
    if (at < 0 || !current) return;
    const next = followView(current, at, limits);
    if (next !== current) controls.set(next);
  }, [at, controls, limits]);
}
