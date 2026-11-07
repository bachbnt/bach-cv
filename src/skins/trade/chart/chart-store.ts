/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useSyncExternalStore } from 'react';
import type { RangeKey } from '@/skins/trade/config';
import {
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  type ChartPrefs,
} from '@/skins/trade/chart/chart-prefs';
import {
  INTERVALS,
  type ChartType,
  type Interval,
  type CursorMode,
  type IndicatorId,
  type IndicatorMode,
  type Indicators,
  type ToolId,
} from '@/skins/trade/chart/chart-types';
import {
  EMPTY_HISTORY,
  commit,
  redo,
  undo,
  type Drawing,
  type History,
} from '@/skins/trade/chart/drawings';
import {
  REPLAY_OFF,
  advance,
  type ReplaySpeed,
  type ReplayState,
} from '@/skins/trade/chart/replay';

export interface ChartState extends ChartPrefs {
  tool: ToolId;
  /** the tool stays after a drawing (the visitor double-clicked its button) instead of going back to the cursor */
  sticky: boolean;
  cursor: CursorMode;
  history: History;
  hidden: boolean;
  selected: string | null;
  log: boolean;
  auto: boolean;
  /** the range button the window is on now, `null` after a zoom or a pan */
  activeRange: RangeKey | null;
  /** how many bars the chart has, and the first and the last week (milliseconds) */
  count: number;
  /** how many bars each interval has (the Indicators window says which ones have enough for an average) */
  intervalBars: Record<Interval, number>;
  bounds: { first: number; last: number } | null;
  replay: ReplayState;
  /** the list of keyboard shortcuts is open */
  shortcutsOpen: boolean;
}

/** What the buttons outside the chart (range bar, tool rail) ask the chart to do with its window. */
export interface ChartController {
  setRange: (key: RangeKey) => void;
  goTo: (year: number, month: number) => void;
  fit: () => void;
  /** above 1 shows more bars */
  zoom: (factor: number) => void;
}

export interface ChartStore {
  get: () => ChartState;
  subscribe: (listener: () => void) => () => void;
  controller: () => ChartController | null;
  setController: (controller: ChartController | null) => void;
  setType: (type: ChartType) => void;
  setInterval: (interval: Interval) => void;
  setIndicator: (id: IndicatorId, mode: IndicatorMode) => void;
  toggleIndicator: (id: IndicatorId) => void;
  toggleMagnet: () => void;
  /** picks a tool; `sticky` keeps it after each drawing until another tool or Escape */
  setTool: (tool: ToolId, sticky?: boolean) => void;
  /** a drawing was made: back to the cursor, unless the tool is sticky */
  finishTool: () => void;
  setShortcutsOpen: (open: boolean) => void;
  setCursor: (mode: CursorMode) => void;
  select: (id: string | null) => void;
  /** adds or replaces (same id) a drawing, as one step of undo */
  put: (drawing: Drawing) => void;
  remove: (id: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  setHidden: (hidden: boolean) => void;
  setLog: (log: boolean) => void;
  setAuto: (auto: boolean) => void;
  publishData: (count: number, bounds: ChartState['bounds']) => void;
  publishIntervalBars: (bars: Record<Interval, number>) => void;
  publishRange: (key: RangeKey | null) => void;
  startReplay: () => void;
  pickReplay: (at: number) => void;
  /** the playhead moves to another bar (the interval changed); nothing happens when no replay is going */
  moveReplay: (at: number) => void;
  setPlaying: (playing: boolean) => void;
  stepReplay: (count: number) => void;
  setSpeed: (speed: ReplaySpeed) => void;
  exitReplay: () => void;
}

const initial = (prefs: ChartPrefs): ChartState => ({
  ...prefs,
  tool: 'cursor',
  sticky: false,
  cursor: 'cross',
  history: EMPTY_HISTORY,
  hidden: false,
  selected: null,
  log: false,
  auto: true,
  activeRange: null,
  count: 0,
  intervalBars: { week: 0, month: 0, quarter: 0, year: 0 },
  bounds: null,
  replay: REPLAY_OFF,
  shortcutsOpen: false,
});

/** The state the toolbar, the rails and the chart share. Pointer work stays in the chart; this holds what a button can change. */
export function createChartStore(prefs: ChartPrefs): ChartStore {
  let state = initial(prefs);
  let controller: ChartController | null = null;
  const listeners = new Set<() => void>();

  const set = (patch: Partial<ChartState>) => {
    const next = { ...state, ...patch };
    const saved =
      next.type !== state.type ||
      next.interval !== state.interval ||
      next.indicators !== state.indicators ||
      next.magnet !== state.magnet;
    state = next;
    if (saved)
      savePrefs({
        type: state.type,
        interval: state.interval,
        indicators: state.indicators,
        magnet: state.magnet,
      });
    listeners.forEach((l) => l());
  };
  const indicators = (id: IndicatorId, mode: IndicatorMode): Indicators => ({
    ...state.indicators,
    [id]: mode,
  });
  const drawings = (next: Drawing[], selected = state.selected) =>
    set({ history: commit(state.history, next), selected });

  return {
    get: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    controller: () => controller,
    setController: (next) => {
      controller = next;
    },
    setType: (type) => set({ type }),
    setInterval: (interval) => set({ interval }),
    setIndicator: (id, mode) => set({ indicators: indicators(id, mode) }),
    toggleIndicator: (id) =>
      set({
        indicators: indicators(
          id,
          state.indicators[id] === 'off' ? 'shown' : 'off',
        ),
      }),
    toggleMagnet: () => set({ magnet: !state.magnet }),
    setTool: (tool, sticky = false) =>
      set({ tool, sticky: sticky && tool !== 'cursor', selected: null }),
    finishTool: () => {
      if (!state.sticky) set({ tool: 'cursor' });
    },
    setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
    setCursor: (cursor) => set({ cursor, tool: 'cursor', sticky: false }),
    select: (selected) => set({ selected }),
    put: (drawing) => {
      const present = state.history.present;
      const exists = present.some((d) => d.id === drawing.id);
      drawings(
        exists
          ? present.map((d) => (d.id === drawing.id ? drawing : d))
          : [...present, drawing],
        drawing.id,
      );
    },
    remove: (id) =>
      drawings(
        state.history.present.filter((d) => d.id !== id),
        null,
      ),
    clear: () => {
      if (state.history.present.length > 0) drawings([], null);
    },
    undo: () => set({ history: undo(state.history), selected: null }),
    redo: () => set({ history: redo(state.history), selected: null }),
    setHidden: (hidden) => set({ hidden, selected: null }),
    setLog: (log) => set({ log }),
    setAuto: (auto) => set({ auto }),
    publishData: (count, bounds) => {
      if (
        count !== state.count ||
        bounds?.first !== state.bounds?.first ||
        bounds?.last !== state.bounds?.last
      )
        set({ count, bounds });
    },
    publishIntervalBars: (intervalBars) => {
      if (INTERVALS.some((i) => intervalBars[i] !== state.intervalBars[i]))
        set({ intervalBars });
    },
    publishRange: (activeRange) => {
      if (activeRange !== state.activeRange) set({ activeRange });
    },
    startReplay: () =>
      set({
        replay: { ...REPLAY_OFF, phase: 'select', speed: state.replay.speed },
        tool: 'cursor',
        sticky: false,
      }),
    pickReplay: (at) =>
      set({
        replay: {
          ...state.replay,
          phase: 'ready',
          at: Math.min(Math.max(0, at), Math.max(0, state.count - 1)),
          playing: false,
        },
      }),
    moveReplay: (at) => {
      if (state.replay.phase !== 'ready') return;
      set({
        replay: {
          ...state.replay,
          at: Math.min(Math.max(0, at), Math.max(0, state.count - 1)),
        },
      });
    },
    setPlaying: (playing) => {
      if (state.replay.phase !== 'ready') return;
      const finished = state.replay.at >= state.count - 1;
      set({ replay: { ...state.replay, playing: playing && !finished } });
    },
    stepReplay: (count) => {
      if (state.replay.phase !== 'ready') return;
      set({ replay: advance(state.replay, count, state.count - 1) });
    },
    setSpeed: (speed) => set({ replay: { ...state.replay, speed } }),
    exitReplay: () =>
      set({ replay: { ...REPLAY_OFF, speed: state.replay.speed } }),
  };
}

export const chartStore = createChartStore(
  typeof window === 'undefined' ? DEFAULT_PREFS : loadPrefs(),
);

/** Reads a part of the shared state; `select` must give a value that is the same until that part changes (a number, a string, an object kept in the state). */
export function useChartStore<T>(select: (state: ChartState) => T): T {
  return useSyncExternalStore(
    chartStore.subscribe,
    () => select(chartStore.get()),
    () => select(initial(DEFAULT_PREFS)),
  );
}
