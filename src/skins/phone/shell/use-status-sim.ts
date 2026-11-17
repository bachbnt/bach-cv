/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';
import {
  INITIAL_STATE,
  sameView,
  step,
  TICK_MS,
  viewOf,
  type StatusState,
  type StatusView,
} from '@/skins/phone/shell/status-sim';

/*
 * ONE store and ONE timer for the story of the status bar (`status-sim.ts`): the glyphs of the bar and the summary of the shade subscribe to it,
 * the pages do not, so a tick draws nothing but those. The timer runs only while something subscribes, not while the tab is hidden, and not at all
 * for a visitor who asks for less motion: that one sees the still screen (a full battery, the best signal). Decoration: nothing real is read.
 */

let state: StatusState = INITIAL_STATE;
/** the snapshot is replaced only when something a glyph draws has changed (a tick that only counts keeps it), so a render is made only then */
let view: StatusView = viewOf(INITIAL_STATE);
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
/** the screen of the device is off: nothing is drawn, so the timer has nothing to do (`use-screen-power.ts`) */
let paused = false;

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick() {
  state = step(state, Math.random);
  const next = viewOf(state);
  if (sameView(view, next)) return;
  view = next;
  for (const notify of listeners) notify();
}

/** Starts or stops the timer for what is the case now: someone is listening, the tab is shown, and the visitor has not asked for a still page. */
function update() {
  const run = listeners.size > 0 && !document.hidden && !paused && !still();
  if (run && timer === undefined) timer = setInterval(tick, TICK_MS);
  if (!run && timer !== undefined) {
    clearInterval(timer);
    timer = undefined;
  }
}

/** Stops the story while the screen is off and goes on when it is on again. */
export function pauseStatusSim(value: boolean) {
  paused = value;
  if (typeof document !== 'undefined') update();
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1)
    document.addEventListener('visibilitychange', update);
  update();
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0)
      document.removeEventListener('visibilitychange', update);
    update();
  };
}

const snapshot = () => view;
const serverSnapshot = () => viewOf(INITIAL_STATE);
// the server snapshot must be the same object every time
const SERVER_VIEW = serverSnapshot();

/** What the status bar shows now: the percentage and the charger of the battery, the bars of the mobile data and the arcs of the Wi-Fi. */
export function useStatusSim(): StatusView {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER_VIEW);
}
