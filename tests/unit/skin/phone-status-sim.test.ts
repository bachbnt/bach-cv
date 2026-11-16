/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  batteryTone,
  chargeModeAt,
  DANGER_AT,
  DRAIN_TICKS,
  FAST_BELOW,
  HOLD_TICKS,
  NORMAL_TICKS,
  SLOW_FROM,
  SLOW_TICKS,
  INITIAL_STATE,
  sameView,
  SIGNAL_MAX,
  step,
  viewOf,
  WIFI_MAX,
  type StatusState,
} from '@/skins/phone/shell/status-sim';

/** A source of numbers that is the same every time (a small linear generator), so the walk is the same in every run. */
const seeded = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

const run = (ticks: number, random = seeded(7)) => {
  const states: StatusState[] = [INITIAL_STATE];
  for (let i = 0; i < ticks; i++)
    states.push(step(states[states.length - 1], random));
  return states;
};

/** the ticks of a whole story: 99 drains, the charge from 1% to 100% (fast below 80%, normal from there, slower from 95%), the hold */
const DRAIN = 99 * DRAIN_TICKS;
const CHARGE = 79 + 15 * NORMAL_TICKS + 5 * SLOW_TICKS;
const STORY = DRAIN + CHARGE + HOLD_TICKS;

describe('the battery of the status bar', () => {
  it('starts full and drains by 1% every 1.5 s, never up while the charger is out', () => {
    const states = run(DRAIN);
    expect(states[0].level).toBe(100);
    expect(states[0].chargeMode).toBeNull();
    expect(states[DRAIN_TICKS].level).toBe(99);
    for (let i = 1; i < states.length - 1; i++) {
      expect(states[i].level).toBeLessThanOrEqual(states[i - 1].level);
      expect(states[i - 1].level - states[i].level).toBeLessThanOrEqual(1);
    }
  });

  it('turns red at 20% and below, and stays red down to 1%', () => {
    const states = run(DRAIN).filter((state) => !state.chargeMode);
    for (const state of states) {
      const tone = batteryTone(state);
      if (state.level > DANGER_AT) expect(tone).toBe('ink');
      else expect(tone).toBe('danger');
    }
    expect(states.some((state) => state.level === DANGER_AT)).toBe(true);
    // at 1% the charger goes in, so the last red level of the drain is 2%
    expect(states.some((state) => state.level === 2)).toBe(true);
    expect(states.every((state) => state.level > 1)).toBe(true);
  });

  it('is plugged in at 1% and charges green, FAST (1% a tick) below 80% and NORMAL (slower) from 80%', () => {
    const states = run(STORY);
    const plugged = states.findIndex((state) => state.chargeMode);
    expect(states[plugged].level).toBe(1);
    expect(plugged).toBe(DRAIN);
    expect(states[plugged].chargeMode).toBe('fast');
    for (let i = plugged + 1; states[i].level < 100; i++) {
      expect(batteryTone(states[i])).toBe('ok');
      expect(states[i].level - states[i - 1].level).toBeLessThanOrEqual(1);
      expect(states[i].chargeMode).toBe(chargeModeAt(states[i].level));
      expect(states[i].chargeMode).toBe(
        states[i].level < FAST_BELOW ? 'fast' : 'normal',
      );
    }
    // fast: every tick a percent, up to 79%; then 80% is the first of the normal charge
    expect(states[plugged + 78].level).toBe(79);
    expect(states[plugged + 78].chargeMode).toBe('fast');
    expect(states[plugged + 79].level).toBe(80);
    expect(states[plugged + 79].chargeMode).toBe('normal');
    expect(states[plugged + CHARGE].level).toBe(100);
  });

  it('charges slower per percent from 80% than below, and slower still from 95%', () => {
    const states = run(STORY);
    const ticksAt = (level: number) =>
      states.filter((state) => state.chargeMode && state.level === level)
        .length;
    expect(ticksAt(40)).toBe(1);
    expect(ticksAt(80)).toBe(NORMAL_TICKS);
    expect(ticksAt(94)).toBe(NORMAL_TICKS);
    expect(ticksAt(SLOW_FROM)).toBe(SLOW_TICKS);
    expect(ticksAt(99)).toBe(SLOW_TICKS);
    const from = states.findIndex(
      (state) => state.level === 1 && state.chargeMode,
    );
    const fast = states.findIndex((state) => state.level === FAST_BELOW) - from;
    const normal =
      states.findIndex((state, i) => i > from && state.level === 100) -
      states.findIndex((state) => state.level === FAST_BELOW);
    expect(normal / 20).toBeGreaterThan(fast / 79);
  });

  it('is never fast while it drains, and nothing but a charge is green', () => {
    for (const state of run(STORY * 2)) {
      if (state.chargeMode === null) expect(batteryTone(state)).not.toBe('ok');
      if (state.chargeMode === 'fast')
        expect(state.level).toBeLessThan(FAST_BELOW);
    }
    expect(run(DRAIN - 1).every((state) => state.chargeMode === null)).toBe(
      true,
    );
  });

  it('keeps the charger in at 100% for a moment, unplugs it, and drains again', () => {
    const states = run(STORY + DRAIN_TICKS + 1);
    const full = states.findIndex(
      (state, i) => i > DRAIN && state.chargeMode && state.level === 100,
    );
    expect(full).toBeGreaterThan(0);
    // held for HOLD_TICKS ticks, then out
    expect(states[full + HOLD_TICKS - 1].chargeMode).toBe('normal');
    expect(states[full + HOLD_TICKS].chargeMode).toBeNull();
    expect(states[full + HOLD_TICKS].level).toBe(100);
    expect(states[full + HOLD_TICKS + DRAIN_TICKS].level).toBe(99);
  });

  it('loops: after a whole story it is where it started, and the next story is the same', () => {
    const states = run(STORY * 2 + 2);
    const start = INITIAL_STATE;
    for (const at of [STORY, STORY * 2]) {
      expect(states[at].level).toBe(start.level);
      expect(states[at].chargeMode).toBeNull();
    }
    expect(
      states.every((state) => state.level >= 1 && state.level <= 100),
    ).toBe(true);
  });
});

describe('the signal and the Wi-Fi of the status bar', () => {
  it('stay in 1 to their best and change by at most one step', () => {
    const states = run(STORY * 2, seeded(99));
    for (let i = 1; i < states.length; i++) {
      const [a, b] = [states[i - 1], states[i]];
      expect(b.signal).toBeGreaterThanOrEqual(1);
      expect(b.signal).toBeLessThanOrEqual(SIGNAL_MAX);
      expect(b.wifi).toBeGreaterThanOrEqual(1);
      expect(b.wifi).toBeLessThanOrEqual(WIFI_MAX);
      expect(Math.abs(b.signal - a.signal)).toBeLessThanOrEqual(1);
      expect(Math.abs(b.wifi - a.wifi)).toBeLessThanOrEqual(1);
    }
  });

  it('change every 3 to 8 seconds, and over a story they do change, with either source of numbers', () => {
    for (const random of [seeded(1), () => 0, () => 0.999]) {
      const states = run(STORY, random);
      const at: number[] = [];
      for (let i = 1; i < states.length; i++)
        if (states[i].signal !== states[i - 1].signal) at.push(i);
      expect(new Set(states.map((state) => state.signal)).size).toBeGreaterThan(
        1,
      );
      for (let i = 1; i < at.length; i++) {
        expect(at[i] - at[i - 1]).toBeGreaterThanOrEqual(12);
        expect(at[i] - at[i - 1]).toBeLessThanOrEqual(32);
      }
    }
  });
});

describe('the view of the status bar', () => {
  it('leaves out the bookkeeping, so a tick that only counts does not draw again', () => {
    const [a, b] = run(1);
    expect(a.beat).not.toBe(b.beat);
    expect(sameView(viewOf(a), viewOf(b))).toBe(true);
    expect(sameView(viewOf(a), { ...viewOf(a), level: 50 })).toBe(false);
  });

  it('does not change the state it is given', () => {
    const before = { ...INITIAL_STATE };
    step(INITIAL_STATE, seeded(3));
    expect(INITIAL_STATE).toEqual(before);
  });
});
