/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type KeyboardEvent } from 'react';
import { useLatest } from '@/hooks/use-latest';
import { isTyping } from '@/lib/is-typing';
import { chartStore } from '@/skins/trade/chart/chart-store';
import type { Interval, ToolId } from '@/skins/trade/chart/chart-types';
import type { Hover } from '@/skins/trade/chart/gesture-types';
import type { ChartView } from '@/skins/trade/chart/use-chart-view';
import {
  centerView,
  panView,
  zoomView,
  type Limits,
} from '@/skins/trade/chart/view';

/** Alt plus a letter picks a drawing tool (the letter of the key, not the character, because Alt types another one on a Mac). */
const TOOL_KEYS: Partial<Record<string, ToolId>> = {
  KeyT: 'trend',
  KeyH: 'hline',
  KeyV: 'vline',
  KeyR: 'rect',
  KeyF: 'fib',
  KeyM: 'measure',
};

/** Alt plus a digit picks the interval of the candles. */
const INTERVAL_KEYS: Partial<Record<string, Interval>> = {
  Digit1: 'week',
  Digit2: 'month',
  Digit3: 'quarter',
  Digit4: 'year',
};

const inField = (target: EventTarget | null): boolean =>
  isTyping(target) ||
  (target instanceof Element &&
    target.closest('[role="dialog"], [role="menu"], [role="listbox"]') !==
      null);

/**
 * The shortcuts that work anywhere on the page while the chart is there (not while the visitor types in a field or has a window
 * open): Alt plus a letter for a tool and Alt plus a digit for the interval, Escape, undo and redo, Shift+R for the replay and the question mark for the list.
 */
export function useChartShortcuts({ cancel }: { cancel: () => void }) {
  const latest = useLatest({ cancel });
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || inField(event.target)) return;
      const state = chartStore.get();
      const { code, key } = event;
      const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
      if (key === 'Escape') {
        if (
          state.tool !== 'cursor' ||
          state.selected ||
          state.replay.phase === 'select'
        )
          event.preventDefault();
        latest.current.cancel();
        return;
      }
      if (key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        chartStore.setShortcutsOpen(true);
        return;
      }
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const interval = INTERVAL_KEYS[code];
        if (interval) {
          event.preventDefault();
          chartStore.setInterval(interval);
          return;
        }
        const tool = TOOL_KEYS[code];
        if (!tool) return;
        event.preventDefault();
        chartStore.setTool(state.tool === tool ? 'cursor' : tool);
        return;
      }
      if (event.shiftKey && plain && code === 'KeyR') {
        event.preventDefault();
        if (state.replay.phase === 'off') chartStore.startReplay();
        else chartStore.exitReplay();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        if (code === 'KeyZ') {
          event.preventDefault();
          if (event.shiftKey) chartStore.redo();
          else chartStore.undo();
        } else if (code === 'KeyY') {
          event.preventDefault();
          chartStore.redo();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [latest]);
}

/** The keys of the chart itself (it has the focus): the arrows and Home and End move the crosshair, plus and minus zoom, Delete removes the chosen drawing, Enter chooses the start of the replay. */
export function useChartKeyboard({
  hover,
  setHover,
  last,
  limits,
  chartView,
}: {
  hover: Hover | null;
  setHover: (hover: Hover | null) => void;
  last: number;
  limits: Limits;
  chartView: ChartView;
}) {
  return (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const view = chartView.ref.current;
    if (!view) return;
    const at = hover?.index ?? last;
    const target = {
      ArrowLeft: at - 1,
      ArrowRight: at + 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target !== undefined) {
      event.preventDefault();
      const index = Math.min(last, Math.max(0, target));
      setHover({ index, y: null });
      if (index < view.from + 0.5 || index > view.from + view.span - 5)
        chartView.set(
          event.key === 'Home' || event.key === 'End'
            ? centerView(view, index, limits)
            : panView(
                view,
                index < view.from + 0.5
                  ? index - view.from - 1
                  : index - (view.from + view.span - 5),
                limits,
              ),
        );
      return;
    }
    if (['+', '=', '-', '_'].includes(event.key)) {
      event.preventDefault();
      const out = event.key === '-' || event.key === '_';
      chartView.set(zoomView(view, out ? 1.25 : 0.8, 0.5, limits));
      return;
    }
    const state = chartStore.get();
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      state.selected
    ) {
      event.preventDefault();
      chartStore.remove(state.selected);
      return;
    }
    if (event.key === 'Enter' && state.replay.phase === 'select') {
      event.preventDefault();
      chartStore.pickReplay(at);
    }
  };
}
