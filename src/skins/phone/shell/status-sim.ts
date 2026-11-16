/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/*
 * The small story that the glyphs of the status bar tell: the mobile data and the Wi-Fi rise and fall, and the battery drains, is plugged in at 1%,
 * charges and drains again. It is decoration: nothing is read from the device. The machine is pure (`step` takes the state and a source of
 * randomness and returns the next state), so it can be tested without a clock; the time is the number of ticks.
 */

/** the time of a tick, in ms (the timer of `use-status-sim.ts`) */
export const TICK_MS = 250;
/** a tick is a quarter second: 1% of the battery goes in 6 ticks (1.5 s) */
export const DRAIN_TICKS = 6;
/** the level below which the charge is FAST (1% a tick, 0.25 s); from it on the charge is NORMAL */
export const FAST_BELOW = 80;
/** a normal charge: 1% in 5 ticks (1.25 s), and in 8 (2 s) from `SLOW_FROM` on, as a real one slows near the top */
export const NORMAL_TICKS = 5;
export const SLOW_TICKS = 8;
export const SLOW_FROM = 95;
/** how long the charger stays in at 100%, in ticks (2 s), before it is unplugged */
export const HOLD_TICKS = 8;
/** the level at and below which the battery is in danger (red) while it is not charging */
export const DANGER_AT = 20;
/** the bars of the mobile data and the arcs of the Wi-Fi at their best; the least that is ever shown is 1 of each */
export const SIGNAL_MAX = 4;
export const WIFI_MAX = 3;
/** the signal changes one step every 12 to 32 ticks (3 to 8 s) */
const CHANGE_MIN = 12;
const CHANGE_SPAN = 21;

/** how the battery is charging: fast (below `FAST_BELOW`), normal (from it on), or not at all while the charger is out */
export type ChargeMode = 'fast' | 'normal' | null;

export interface StatusState {
  /** the percentage of the battery, 1 to 100 */
  level: number;
  /** the charger is in, and how fast it charges: `null` while it is out, so it is never `fast` while the battery drains */
  chargeMode: ChargeMode;
  /** the ticks since the level last moved */
  beat: number;
  /** the ticks that the charger has been in at 100% */
  held: number;
  /** the bars of the mobile data, 1 to 4, and the arcs of the Wi-Fi, 1 to 3 */
  signal: number;
  wifi: number;
  /** the ticks until the next change of each */
  signalIn: number;
  wifiIn: number;
}

/** What the glyphs draw; the rest of the state is only bookkeeping of the machine. */
export interface StatusView {
  level: number;
  chargeMode: ChargeMode;
  signal: number;
  wifi: number;
}

export type BatteryTone = 'ink' | 'danger' | 'ok';

/** The start of the story, and what a still screen shows (reduced motion, the server): a full battery, the best signal. */
export const INITIAL_STATE: StatusState = {
  level: 100,
  chargeMode: null,
  beat: 0,
  held: 0,
  signal: SIGNAL_MAX,
  wifi: WIFI_MAX,
  signalIn: 10,
  wifiIn: 14,
};

export const viewOf = (state: StatusState): StatusView => ({
  level: state.level,
  chargeMode: state.chargeMode,
  signal: state.signal,
  wifi: state.wifi,
});

export const sameView = (a: StatusView, b: StatusView): boolean =>
  a.level === b.level &&
  a.chargeMode === b.chargeMode &&
  a.signal === b.signal &&
  a.wifi === b.wifi;

/** The colour of the fill: green while the charger is in, red from 20% down, the ink of the bar otherwise. */
export const batteryTone = ({
  level,
  chargeMode,
}: Pick<StatusView, 'level' | 'chargeMode'>): BatteryTone =>
  chargeMode ? 'ok' : level <= DANGER_AT ? 'danger' : 'ink';

/** The mode of a charge at a level. */
export const chargeModeAt = (level: number): 'fast' | 'normal' =>
  level < FAST_BELOW ? 'fast' : 'normal';

/** The ticks that a charge takes to gain 1% at a level (1 while it is fast). */
const chargeTicks = (level: number): number =>
  chargeModeAt(level) === 'fast'
    ? 1
    : level >= SLOW_FROM
      ? SLOW_TICKS
      : NORMAL_TICKS;

/** One step of a random walk of 1 to `max`: up or down by one, and back from an edge. */
function walk(value: number, max: number, random: () => number): number {
  if (value <= 1) return 2;
  if (value >= max) return max - 1;
  return random() < 0.5 ? value - 1 : value + 1;
}

const wait = (random: () => number) =>
  CHANGE_MIN + Math.floor(random() * CHANGE_SPAN);

/** The battery after one tick: it drains, is plugged in at 1%, charges (fast, then normal) to 100%, is held there for a moment and unplugged. */
function battery(
  state: StatusState,
): Pick<StatusState, 'level' | 'chargeMode' | 'beat' | 'held'> {
  const { level, chargeMode, beat, held } = state;
  if (chargeMode) {
    if (level < 100) {
      if (beat + 1 < chargeTicks(level))
        return { level, chargeMode, beat: beat + 1, held: 0 };
      const next = level + 1;
      return { level: next, chargeMode: chargeModeAt(next), beat: 0, held: 0 };
    }
    if (held + 1 < HOLD_TICKS)
      return { level, chargeMode, beat: 0, held: held + 1 };
    return { level, chargeMode: null, beat: 0, held: 0 };
  }
  if (beat + 1 < DRAIN_TICKS)
    return { level, chargeMode, beat: beat + 1, held };
  const next = level - 1;
  return {
    level: next,
    chargeMode: next <= 1 ? 'fast' : null,
    beat: 0,
    held: 0,
  };
}

/**
 * The state one tick later. `random` is a source of numbers in [0, 1) (`Math.random` in the page, a fixed one in a test).
 * The signal and the Wi-Fi change by at most one step each time and stay in 1 to their best.
 */
export function step(state: StatusState, random: () => number): StatusState {
  const next: StatusState = { ...state, ...battery(state) };
  next.signalIn = state.signalIn - 1;
  next.wifiIn = state.wifiIn - 1;
  if (next.signalIn <= 0) {
    next.signal = walk(state.signal, SIGNAL_MAX, random);
    next.signalIn = wait(random);
  }
  if (next.wifiIn <= 0) {
    next.wifi = walk(state.wifi, WIFI_MAX, random);
    next.wifiIn = wait(random);
  }
  return next;
}
