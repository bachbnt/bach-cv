/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export const REPLAY_SPEEDS = [1, 3, 10] as const;
export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number];

/** `select`: the visitor is choosing the start bar. `ready`: the start is chosen and the replay is paused or playing. */
export interface ReplayState {
  phase: 'off' | 'select' | 'ready';
  /** the index of the bar at the playhead: later bars are hidden */
  at: number;
  playing: boolean;
  speed: ReplaySpeed;
}

export const REPLAY_OFF: ReplayState = {
  phase: 'off',
  at: 0,
  playing: false,
  speed: 1,
};

/** The time one bar takes at 1x. */
export const BAR_MS = 320;

/** How many bars `elapsed` milliseconds are worth at a speed, with the fraction that is left over. */
export function barsDue(
  elapsed: number,
  speed: number,
): { bars: number; rest: number } {
  const exact = (elapsed * speed) / BAR_MS;
  const bars = Math.floor(exact);
  return { bars, rest: ((exact - bars) * BAR_MS) / speed };
}

/** The playhead `count` bars on, stopping (and pausing) at the last bar. */
export function advance(
  state: ReplayState,
  count: number,
  last: number,
): ReplayState {
  const at = Math.min(last, state.at + count);
  return { ...state, at, playing: state.playing && at < last };
}

/** A flag on a bar: a job or a degree. */
export interface Flagged {
  index: number;
}

/** The flags the playhead has already passed: a job or a degree shows when its bar has been played. */
export function flagsUpTo<T extends Flagged>(markers: T[], at: number): T[] {
  return markers.filter((m) => m.index <= at);
}

/** The flags the playhead passed when it moved from `from` (not counted) to `to`. */
export function flagsPassed<T extends Flagged>(
  markers: T[],
  from: number,
  to: number,
): T[] {
  return markers.filter((m) => m.index > from && m.index <= to);
}
