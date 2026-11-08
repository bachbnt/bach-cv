/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, type PointerEvent } from 'react';
import { useLatest } from '@/hooks/use-latest';
import { chartStore } from '@/skins/trade/chart/chart-store';
import {
  movePoint,
  snap,
  translate,
  type Point,
} from '@/skins/trade/chart/drawings';
import {
  pinchView,
  scaleRange,
  timeZoom,
  zoneAt,
} from '@/skins/trade/chart/gesture-math';
import type {
  Gesture,
  GestureContext,
} from '@/skins/trade/chart/gesture-types';
import { startToolGesture } from '@/skins/trade/chart/start-tool-gesture';
import { useDrawingSession } from '@/skins/trade/chart/use-drawing-session';
import { useWheelZoom } from '@/skins/trade/chart/use-wheel-zoom';
import { panView, rangeView } from '@/skins/trade/chart/view';

/** How far (px) a press must travel before releasing it finishes a drawing: a drag makes one, a click and a click make one too. */
const DRAG = 8;

/**
 * Everything the pointer does on the chart: crosshair, pan, wheel and pinch zoom, dragging the price scale and the time axis, the
 * drawing tools (click and click, or press and drag), moving a drawing or one of its ends, the eraser, the measure tool and picking
 * the start of the replay. Pointer work is gathered once per animation frame. Drawings are committed to the shared store only when a
 * gesture ends, so each one is a single step of undo.
 */
export function usePointerGestures(ctx: GestureContext) {
  const latest = useLatest(ctx);
  const session = useDrawingSession(ctx.tool);
  const { setLive, setDraft, setMeasureBox, pendingRef } = session;

  const gesture = useRef<Gesture>({ kind: 'none' });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const frameRequest = useRef(0);
  const lastMove = useRef<{ x: number; y: number } | null>(null);

  const local = (event: { clientX: number; clientY: number }) => {
    const rect = ctx.svg.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  };

  const pointOf = useCallback(
    (x: number, y: number): Point => {
      const { frame, candles } = latest.current;
      const { magnet } = chartStore.get();
      const { main } = frame.layout;
      const point = {
        t: frame.axis.time(frame.ts.indexAt(x)),
        p: frame.price.priceAt(Math.min(main.bottom, Math.max(main.top, y))),
      };
      return magnet ? snap(point, candles, frame.axis) : point;
    },
    [latest],
  );

  const resetSession = session.reset;
  const cancel = useCallback(() => {
    resetSession();
    gesture.current = { kind: 'none' };
    latest.current.setHover(null);
    const state = chartStore.get();
    if (state.tool !== 'cursor') chartStore.setTool('cursor');
    if (state.selected) chartStore.select(null);
    if (state.replay.phase === 'select') chartStore.exitReplay();
  }, [latest, resetSession]);

  const flush = () => {
    frameRequest.current = 0;
    const at = lastMove.current;
    if (!at) return;
    const c = latest.current;
    const { layout, ts, price } = c.frame;
    const g = gesture.current;
    const inPlot =
      at.x >= 0 &&
      at.x < layout.plotWidth &&
      at.y >= layout.toolbar &&
      at.y < layout.axisY;
    if (inPlot)
      c.setHover({
        index: Math.min(c.candles.length - 1, Math.max(0, ts.barAt(at.x))),
        y: at.y,
      });
    else if (g.kind === 'none') c.setHover(null);

    if (g.kind === 'pan') {
      if (Math.hypot(at.x - g.x, at.y - g.y) > 3) g.moved = true;
      c.chartView.set(
        panView(
          { from: g.from, span: c.chartView.ref.current?.span ?? 1 },
          -(at.x - g.x) / ts.slot,
          c.limits,
        ),
      );
    } else if (g.kind === 'scale') {
      c.setManual(scaleRange(g, at.y));
      chartStore.setAuto(false);
    } else if (g.kind === 'time') {
      c.chartView.set(timeZoom(g, at.x, c.limits));
    } else if (g.kind === 'move') {
      const now = pointOf(at.x, at.y);
      c.setHover(null);
      setLive(
        translate(
          g.drawing,
          now.t - g.origin.t,
          price.priceAt(at.y) - g.origin.p,
        ),
      );
    } else if (g.kind === 'handle') {
      setLive(movePoint(g.drawing, g.index, pointOf(at.x, at.y)));
    } else if (g.kind === 'pinch') {
      const [a, b] = [...pointers.current.values()];
      if (a && b) c.chartView.set(pinchView(g, a, b, c.limits));
    }

    const wait = pendingRef.current;
    if (wait && inPlot) {
      const second = pointOf(at.x, at.y);
      if (wait.kind === 'measure') setMeasureBox({ a: wait.first, b: second });
      else
        setDraft({
          id: 'draft',
          kind: wait.kind,
          points: [wait.first, second],
        });
    }
  };

  const schedule = (x: number, y: number) => {
    lastMove.current = { x, y };
    if (!frameRequest.current)
      frameRequest.current = requestAnimationFrame(flush);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRequest.current);
    },
    [],
  );

  useWheelZoom(ctx.svg, latest);

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const c = latest.current;
    const { x, y } = local(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x, y });
    const { layout, price } = c.frame;
    const view = c.chartView.ref.current;
    if (!view) return;

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pendingRef.current = null;
      setDraft(null);
      gesture.current = {
        kind: 'pinch',
        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        view,
        anchor: Math.min(1, Math.max(0, (a.x + b.x) / 2 / layout.plotWidth)),
      };
      return;
    }
    const zone = zoneAt(layout, x, y);
    if (zone === 'scale')
      gesture.current = {
        kind: 'scale',
        y,
        lo: price.lo,
        hi: price.hi,
        log: price.log,
      };
    else if (zone === 'time') gesture.current = { kind: 'time', x, view };
    else if (zone === 'plot')
      startToolGesture({
        x,
        y,
        touch: event.pointerType === 'touch',
        frame: c.frame,
        view,
        bars: c.candles.length,
        pointOf,
        gesture,
        session,
        preventDefault: () => event.preventDefault(),
      });
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    const { x, y } = local(event);
    if (pointers.current.has(event.pointerId))
      pointers.current.set(event.pointerId, { x, y });
    schedule(x, y);
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    const c = latest.current;
    const { x, y } = local(event);
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    const g = gesture.current;
    if (g.kind === 'pinch') {
      if (pointers.current.size < 2) gesture.current = { kind: 'none' };
      return;
    }
    gesture.current = { kind: 'none' };
    if (g.kind === 'move' || g.kind === 'handle') {
      const live = session.dragRef.current;
      setLive(null);
      if (live && live !== g.drawing) chartStore.put(live);
      return;
    }
    const wait = pendingRef.current;
    if (wait && Math.hypot(x - wait.x, y - wait.y) > DRAG) {
      session.finish(wait.kind, wait.first, pointOf(x, y));
      return;
    }
    if (g.kind === 'pan' && !g.moved && chartStore.get().tool === 'cursor') {
      const view = c.chartView.ref.current;
      if (view) c.chartView.set(view);
    }
  };

  const leave = () => {
    if (gesture.current.kind === 'none') latest.current.setHover(null);
  };

  const abort = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    gesture.current = { kind: 'none' };
    setLive(null);
    latest.current.setHover(null);
  };

  const reset = () => {
    const c = latest.current;
    if (chartStore.get().tool !== 'cursor' || pendingRef.current) return;
    c.chartView.animate(rangeView(c.limits, null));
    chartStore.setAuto(true);
  };

  return {
    handlers: {
      onPointerDown: down,
      onPointerMove: move,
      onPointerUp: up,
      onPointerLeave: leave,
      onPointerCancel: abort,
      onDoubleClick: reset,
    },
    draft:
      session.draft && session.draft.kind === ctx.tool ? session.draft : null,
    dragging: session.dragging,
    measureBox: session.measureBox,
    note: session.note,
    finishNote: session.finishNote,
    cancel,
  };
}
