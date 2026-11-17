/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  isUsable,
  nextScreen,
  type ScreenAction,
  type ScreenState,
} from '@/skins/phone/shell/screen-power';
import { isUpDrag } from '@/skins/phone/shell/gestures';

const STATES: ScreenState[] = ['on', 'off', 'locked'];
const ACTIONS: ScreenAction[] = ['power', 'wake', 'unlock'];

describe('the power button and the lock screen', () => {
  it('turns the screen off from the page and from the lock screen', () => {
    expect(nextScreen('on', 'power')).toBe('off');
    expect(nextScreen('locked', 'power')).toBe('off');
  });

  it('wakes a dark screen to the lock screen, never straight to the page', () => {
    expect(nextScreen('off', 'power')).toBe('locked');
    expect(nextScreen('off', 'wake')).toBe('locked');
    for (const action of ACTIONS)
      expect(nextScreen('off', action)).not.toBe('on');
  });

  it('is unlocked only from the lock screen', () => {
    expect(nextScreen('locked', 'unlock')).toBe('on');
    expect(nextScreen('off', 'unlock')).toBe('off');
    expect(nextScreen('on', 'unlock')).toBe('on');
  });

  it('ignores a wake that is not on a dark screen', () => {
    expect(nextScreen('on', 'wake')).toBe('on');
    expect(nextScreen('locked', 'wake')).toBe('locked');
  });

  it('has the legal transitions and no others: only the page is usable, and the way to it is off, locked, on', () => {
    const edges = new Set<string>();
    for (const state of STATES)
      for (const action of ACTIONS) {
        const next = nextScreen(state, action);
        if (next !== state) edges.add(`${state}>${next}`);
      }
    expect([...edges].sort()).toEqual(
      ['locked>off', 'locked>on', 'off>locked', 'on>off'].sort(),
    );
    expect(STATES.filter(isUsable)).toEqual(['on']);
  });

  it('loops: off, locked, on, off again', () => {
    let state: ScreenState = 'on';
    for (const [action, expected] of [
      ['power', 'off'],
      ['power', 'locked'],
      ['unlock', 'on'],
      ['power', 'off'],
      ['wake', 'locked'],
      ['power', 'off'],
    ] as const) {
      state = nextScreen(state, action);
      expect(state).toBe(expected);
    }
  });

  it('unlocks with the swipe of the home bar: a drag up that is mostly vertical', () => {
    expect(isUpDrag(0, -80)).toBe(true);
    expect(isUpDrag(10, -49)).toBe(true);
    expect(isUpDrag(0, -20)).toBe(false);
    expect(isUpDrag(90, -60)).toBe(false);
    expect(isUpDrag(0, 80)).toBe(false);
  });
});
