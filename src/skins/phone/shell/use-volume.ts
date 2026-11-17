/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';
import {
  HUD_MS,
  repeatDelay,
  START_VOLUME,
  stepVolume,
  type VolumeKey,
} from '@/skins/phone/shell/volume';

/*
 * The volume of the device in ONE small store, in memory only (the pages do not subscribe: the HUD does). A press steps it, shows the HUD and starts
 * the 1.4 s of its stay again; a key that is held repeats. Nothing real is changed: the site has no sound.
 */

interface VolumeView {
  level: number;
  /** the HUD is on screen */
  shown: boolean;
  /** how many presses at the end of the range there have been (each one shakes the HUD) */
  shakes: number;
  /** what a reader is told: set by a press only, so the HUD that goes by itself says nothing */
  said: number;
}

let view: VolumeView = {
  level: START_VOLUME,
  shown: false,
  shakes: 0,
  said: 0,
};
const listeners = new Set<() => void>();
let hide: ReturnType<typeof setTimeout> | undefined;
let repeat: ReturnType<typeof setTimeout> | undefined;

function publish(next: VolumeView) {
  view = next;
  for (const notify of listeners) notify();
}

/** One press of a key: a step, the HUD, and a shake if the key was at the end of its range. */
export function pressVolume(key: VolumeKey) {
  const { level, atLimit } = stepVolume(view.level, key);
  publish({
    level,
    shown: true,
    shakes: view.shakes + (atLimit ? 1 : 0),
    said: view.said + 1,
  });
  clearTimeout(hide);
  hide = setTimeout(() => publish({ ...view, shown: false }), HUD_MS);
}

/** A key goes down: a step now, and a repeat after 400 ms and every 150 ms until `stopVolume`. */
export function holdVolume(key: VolumeKey) {
  stopVolume();
  pressVolume(key);
  let repeats = 0;
  const again = () => {
    repeat = setTimeout(() => {
      pressVolume(key);
      repeats += 1;
      again();
    }, repeatDelay(repeats));
  };
  again();
}

/** The key is let go. */
export function stopVolume() {
  clearTimeout(repeat);
  repeat = undefined;
}

/** Puts the HUD away at once and stops the repeat (the screen turned off, the skin went away). */
export function putVolumeAway() {
  stopVolume();
  clearTimeout(hide);
  if (view.shown) publish({ ...view, shown: false });
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};
const SERVER: VolumeView = {
  level: START_VOLUME,
  shown: false,
  shakes: 0,
  said: 0,
};

/** The volume, whether the HUD is shown, and the counters that say when to shake and when to speak. */
export function useVolume(): VolumeView {
  return useSyncExternalStore(
    subscribe,
    () => view,
    () => SERVER,
  );
}
