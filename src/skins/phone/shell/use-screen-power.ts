/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';
import {
  nextScreen,
  type ScreenAction,
  type ScreenState,
} from '@/skins/phone/shell/screen-power';
import { pauseStatusSim } from '@/skins/phone/shell/use-status-sim';

/*
 * The state of the screen of the device (on, off, the lock screen) in ONE small store, in memory only: a reload shows the page. The power button,
 * the black screen and the lock screen act on it; the shell and the glyphs read it. The status simulation stops while the screen is off.
 */

let state: ScreenState = 'on';
const listeners = new Set<() => void>();

function set(next: ScreenState) {
  if (next === state) return;
  state = next;
  pauseStatusSim(next === 'off');
  for (const notify of listeners) notify();
}

/** Applies an action of the power button, the black screen or the lock screen. */
export const actOnScreen = (action: ScreenAction) =>
  set(nextScreen(state, action));

/** Back to the page, for when the skin goes away (the next visit must not find a dark screen). */
export const resetScreen = () => set('on');

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

/** The state of the screen of the device. */
export function useScreenPower(): ScreenState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => 'on',
  );
}
