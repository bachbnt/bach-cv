/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { RefObject } from 'react';
import { chartStore } from '@/skins/trade/chart/chart-store';
import type { ToolId } from '@/skins/trade/chart/chart-types';
import { drawingAt, handleAt, type Point } from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import type { Gesture } from '@/skins/trade/chart/gesture-types';
import {
  newId,
  type DrawingSession,
} from '@/skins/trade/chart/use-drawing-session';
import type { View } from '@/skins/trade/chart/view';

const TWO_POINT_TOOLS = ['trend', 'ray', 'rect', 'fib', 'measure'] as const;
const isTwoPoint = (tool: ToolId): tool is (typeof TWO_POINT_TOOLS)[number] =>
  (TWO_POINT_TOOLS as readonly ToolId[]).includes(tool);

/** What a press in the plot starts, which depends on the tool: the replay start, the second click of a drawing, the eraser, a pan or a move, or the first click of a new drawing. */
export function startToolGesture({
  x,
  y,
  touch,
  frame,
  view,
  bars,
  pointOf,
  gesture,
  session,
  preventDefault,
}: {
  x: number;
  y: number;
  touch: boolean;
  frame: Frame;
  view: View;
  /** how many bars are on the chart up to the playhead */
  bars: number;
  pointOf: (x: number, y: number) => Point;
  gesture: RefObject<Gesture>;
  session: DrawingSession;
  preventDefault: () => void;
}) {
  const { layout, ts, price } = frame;
  const state = chartStore.get();
  const tool = state.tool;
  const drawings = state.history.present;
  if (state.replay.phase === 'select') {
    chartStore.pickReplay(Math.min(bars - 1, Math.max(0, ts.barAt(x))));
    return;
  }

  // the second click of a drawing
  const wait = session.pendingRef.current;
  if (wait) {
    session.finish(wait.kind, wait.first, pointOf(x, y));
    return;
  }

  const inMain = y <= layout.main.bottom;
  const tol = touch ? 14 : 6;
  const proj = {
    x: frame.xAt,
    y: price.y,
    width: layout.plotWidth,
    height: layout.main.bottom,
  };
  if (tool === 'eraser') {
    const hit =
      inMain && !state.hidden ? drawingAt(drawings, x, y, proj, tol) : null;
    if (hit) chartStore.remove(hit.id);
    return;
  }
  if (tool === 'cursor') {
    session.setMeasureBox(null);
    const selected = drawings.find((d) => d.id === state.selected);
    if (inMain && !state.hidden) {
      if (selected) {
        const index = handleAt(selected, x, y, proj, tol + 2);
        if (index >= 0) {
          gesture.current = { kind: 'handle', index, drawing: selected };
          return;
        }
      }
      const hit = drawingAt(drawings, x, y, proj, tol);
      if (hit) {
        chartStore.select(hit.id);
        gesture.current = {
          kind: 'move',
          origin: {
            t: frame.axis.time(ts.indexAt(x)),
            p: price.priceAt(y),
          },
          drawing: hit,
        };
        return;
      }
    }
    if (state.selected) chartStore.select(null);
    gesture.current = { kind: 'pan', x, y, from: view.from, moved: false };
    return;
  }

  if (!inMain) return;
  const point = pointOf(x, y);
  if (tool === 'text') {
    // the press must not move the focus to the chart: the box for the note has just taken it
    preventDefault();
    session.setNote({ point, x, y });
    return;
  }
  if (tool === 'hline' || tool === 'vline') {
    chartStore.finishTool();
    chartStore.put({ id: newId(), kind: tool, points: [point] });
    return;
  }
  if (isTwoPoint(tool)) {
    session.setMeasureBox(null);
    session.pendingRef.current = { kind: tool, first: point, x, y };
  }
}
