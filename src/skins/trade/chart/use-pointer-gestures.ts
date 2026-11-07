/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react';
import type { Candle } from '@/skins/trade/blocks/build-candles';
import { chartStore } from '@/skins/trade/chart/chart-store';
import type { ToolId } from '@/skins/trade/chart/chart-types';
import {
  drawingAt,
  handleAt,
  movePoint,
  snap,
  translate,
  type Drawing,
  type DrawingKind,
  type Point,
} from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import type { useChartView } from '@/skins/trade/chart/use-chart-view';
import {
  PAN_SETTLED,
  queueZoom,
  takeStep,
  wheelPixels,
  wheelZoomLog,
  ZOOM_SETTLED,
} from '@/skins/trade/chart/wheel-zoom';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';
import {
  clampView,
  panView,
  rangeView,
  zoomView,
  type Limits,
  type View,
} from '@/skins/trade/chart/view';

export interface Hover {
  /** the bar under the crosshair */
  index: number;
  /** the height of the pointer; `null` when the keyboard moved the crosshair (it then sits on the close) */
  y: number | null;
}

type ChartView = ReturnType<typeof useChartView>;

export interface GestureContext {
  svg: RefObject<SVGSVGElement | null>;
  frame: Frame;
  /** the real candles up to the playhead */
  candles: Candle[];
  /** how many bars the whole career has and how far zoom and pan may go */
  limits: Limits;
  /** the tool, for what is drawn while it is chosen (the gestures read the shared state themselves, so a key pressed a moment ago counts) */
  tool: ToolId;
  chartView: ChartView;
  setManual: (range: { lo: number; hi: number } | null) => void;
  setHover: (hover: Hover | null) => void;
}

type Gesture =
  | { kind: 'none' }
  | { kind: 'pan'; x: number; y: number; from: number; moved: boolean }
  | { kind: 'scale'; y: number; lo: number; hi: number; log: boolean }
  | { kind: 'time'; x: number; view: View }
  | { kind: 'move'; origin: Point; drawing: Drawing }
  | { kind: 'handle'; index: number; drawing: Drawing }
  | { kind: 'pinch'; distance: number; view: View; anchor: number };

export interface Pending {
  kind: DrawingKind | 'measure';
  first: Point;
  x: number;
  y: number;
}

export interface NoteAt {
  point: Point;
  x: number;
  y: number;
}

const TWO_POINT_TOOLS = ['trend', 'ray', 'rect', 'fib', 'measure'] as const;
const isTwoPoint = (tool: ToolId): tool is (typeof TWO_POINT_TOOLS)[number] =>
  (TWO_POINT_TOOLS as readonly ToolId[]).includes(tool);

let counter = 0;
const newId = () => `d${(counter += 1)}`;

const DRAG = 8;

/**
 * Everything the pointer does on the chart: crosshair, pan, wheel and pinch zoom, dragging the price scale and the time axis, the
 * drawing tools (click and click, or press and drag), moving a drawing or one of its ends, the eraser, the measure tool and picking
 * the start of the replay. Pointer work is gathered once per animation frame. Drawings are committed to the shared store only when a
 * gesture ends, so each one is a single step of undo.
 */
export function usePointerGestures(ctx: GestureContext) {
  const latest = useRef(ctx);
  useEffect(() => {
    latest.current = ctx;
  });

  const [draft, setDraft] = useState<Drawing | null>(null);
  const [dragging, setDragging] = useState<Drawing | null>(null);
  const [measureBox, setMeasureBox] = useState<{ a: Point; b: Point } | null>(
    null,
  );
  const [note, setNote] = useState<NoteAt | null>(null);
  const dragRef = useRef<Drawing | null>(null);
  const gesture = useRef<Gesture>({ kind: 'none' });
  const pending = useRef<Pending | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const frameRequest = useRef(0);
  const lastMove = useRef<{ x: number; y: number } | null>(null);

  const setLive = useCallback((drawing: Drawing | null) => {
    dragRef.current = drawing;
    setDragging(drawing);
  }, []);

  const local = (event: { clientX: number; clientY: number }) => {
    const rect = ctx.svg.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  };

  const pointOf = useCallback((x: number, y: number): Point => {
    const { frame, candles } = latest.current;
    const { magnet } = chartStore.get();
    const { main } = frame.layout;
    const point = {
      t: frame.axis.time(frame.ts.indexAt(x)),
      p: frame.price.priceAt(Math.min(main.bottom, Math.max(main.top, y))),
    };
    return magnet ? snap(point, candles, frame.axis) : point;
  }, []);

  const cancel = useCallback(() => {
    pending.current = null;
    gesture.current = { kind: 'none' };
    setDraft(null);
    setLive(null);
    setMeasureBox(null);
    setNote(null);
    latest.current.setHover(null);
    const state = chartStore.get();
    if (state.tool !== 'cursor') chartStore.setTool('cursor');
    if (state.selected) chartStore.select(null);
    if (state.replay.phase === 'select') chartStore.exitReplay();
  }, [setLive]);

  // changing the tool drops a half-made drawing
  useEffect(() => {
    pending.current = null;
  }, [ctx.tool]);

  const finish = (kind: Pending['kind'], first: Point, second: Point) => {
    pending.current = null;
    setDraft(null);
    chartStore.finishTool();
    if (kind === 'measure') {
      setMeasureBox({ a: first, b: second });
      return;
    }
    chartStore.put({ id: newId(), kind, points: [first, second] });
  };

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
      const k = Math.exp((at.y - g.y) / 160);
      const a = g.log ? Math.log(g.lo) : g.lo;
      const b = g.log ? Math.log(g.hi) : g.hi;
      const mid = (a + b) / 2;
      const half = ((b - a) / 2) * k;
      const lo = mid - half;
      const hi = mid + half;
      c.setManual(g.log ? { lo: Math.exp(lo), hi: Math.exp(hi) } : { lo, hi });
      chartStore.setAuto(false);
    } else if (g.kind === 'time') {
      const factor = Math.exp(-(at.x - g.x) / 200);
      c.chartView.set(zoomView(g.view, factor, 1, c.limits));
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
      if (a && b) {
        const ratio =
          g.distance / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        const span = Math.max(c.limits.minSpan, g.view.span * ratio);
        const frac = g.anchor;
        const pinned = g.view.from + g.view.span * frac;
        c.chartView.set(
          clampView({ from: pinned - span * frac, span }, c.limits),
        );
      }
    }

    const wait = pending.current;
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

  // The wheel needs a listener that may call preventDefault, which React's own wheel handlers cannot. It only QUEUES what the wheel
  // asked for (a zoom as a logarithm, a pan in bars); one animation frame applies a share of the queue, so a fast spin is one smooth
  // glide instead of a jump for each event, and the chart is drawn at most once per frame.
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const el = ctx.svg.current;
    if (!el) return;
    // the listener is on the box around the chart, not on the SVG: a flag or a band under the pointer is an HTML element on top of
    // the SVG, and a wheel over it would otherwise be lost (the chart stopped zooming whenever a flag passed under the pointer)
    const host = el.parentElement;
    if (!host) return;
    let zoom = 0;
    let pan = 0;
    let anchor = 0.5;
    let frame = 0;
    let last = 0;
    // the window this loop set last: if the window is another one, someone else (a drag, a reset, a range button) has moved it
    let mine: View | null = null;
    const run = (now: number) => {
      const c = latest.current;
      const view = c.chartView.ref.current;
      const frameMs = last ? now - last : 16;
      last = now;
      if (!view) {
        // nothing to move yet: what was asked is dropped, so nothing stays queued
        zoom = 0;
        pan = 0;
        frame = 0;
        last = 0;
        return;
      }
      if (mine && view !== mine) {
        // what was asked is dropped: it must not undo what has taken the window since (a reset that is gliding, a pan)
        zoom = 0;
        pan = 0;
        frame = 0;
        last = 0;
        mine = null;
        return;
      }
      const zoomStep = takeStep(zoom, frameMs, reducedMotion);
      const panStep = takeStep(pan, frameMs, reducedMotion);
      zoom -= zoomStep;
      pan -= panStep;
      let next = view;
      if (zoomStep !== 0)
        next = zoomView(next, Math.exp(zoomStep), anchor, c.limits);
      if (panStep !== 0) next = panView(next, panStep, c.limits);
      c.chartView.set(next);
      mine = next;
      if (Math.abs(zoom) < ZOOM_SETTLED && Math.abs(pan) < PAN_SETTLED) {
        zoom = 0;
        pan = 0;
        frame = 0;
        last = 0;
        return;
      }
      frame = requestAnimationFrame(run);
    };
    const onWheel = (event: WheelEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, [role="toolbar"], [role="dialog"]',
        )
      )
        return;
      const c = latest.current;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { layout, ts } = c.frame;
      if (y < layout.toolbar || x > layout.plotWidth) return;
      if (!c.chartView.ref.current) return;
      event.preventDefault();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        pan += wheelPixels(event.deltaX, event.deltaMode) / ts.slot;
      } else {
        zoom = queueZoom(
          zoom,
          wheelZoomLog(
            wheelPixels(event.deltaY, event.deltaMode),
            event.ctrlKey,
          ),
        );
        anchor = x / layout.plotWidth;
      }
      if (!frame) {
        mine = null;
        frame = requestAnimationFrame(run);
      }
    };
    host.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      host.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frame);
    };
  }, [ctx.svg, reducedMotion]);

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const c = latest.current;
    const { x, y } = local(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x, y });
    const { layout, ts, price } = c.frame;
    const view = c.chartView.ref.current;
    if (!view) return;

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pending.current = null;
      setDraft(null);
      gesture.current = {
        kind: 'pinch',
        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        view,
        anchor: Math.min(1, Math.max(0, (a.x + b.x) / 2 / layout.plotWidth)),
      };
      return;
    }
    if (y < layout.toolbar) return;
    if (x >= layout.plotWidth && y < layout.axisY) {
      if (y <= layout.main.bottom)
        gesture.current = {
          kind: 'scale',
          y,
          lo: price.lo,
          hi: price.hi,
          log: price.log,
        };
      return;
    }
    if (y >= layout.axisY) {
      gesture.current = { kind: 'time', x, view };
      return;
    }

    const state = chartStore.get();
    const tool = state.tool;
    const drawings = state.history.present;
    if (state.replay.phase === 'select') {
      chartStore.pickReplay(
        Math.min(c.candles.length - 1, Math.max(0, ts.barAt(x))),
      );
      return;
    }

    // the second click of a drawing
    const wait = pending.current;
    if (wait) {
      finish(wait.kind, wait.first, pointOf(x, y));
      return;
    }

    const inMain = y <= layout.main.bottom;
    const tol = event.pointerType === 'touch' ? 14 : 6;
    const proj = {
      x: c.frame.xAt,
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
      setMeasureBox(null);
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
              t: c.frame.axis.time(ts.indexAt(x)),
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
      event.preventDefault();
      setNote({ point, x, y });
      return;
    }
    if (tool === 'hline' || tool === 'vline') {
      chartStore.finishTool();
      chartStore.put({ id: newId(), kind: tool, points: [point] });
      return;
    }
    if (isTwoPoint(tool)) {
      setMeasureBox(null);
      pending.current = { kind: tool, first: point, x, y };
    }
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
      const live = dragRef.current;
      setLive(null);
      if (live && live !== g.drawing) chartStore.put(live);
      return;
    }
    const wait = pending.current;
    if (wait && Math.hypot(x - wait.x, y - wait.y) > DRAG) {
      finish(wait.kind, wait.first, pointOf(x, y));
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
    if (chartStore.get().tool !== 'cursor' || pending.current) return;
    c.chartView.animate(rangeView(c.limits, null));
    chartStore.setAuto(true);
  };

  const finishNote = (text: string | null) => {
    const at = note;
    setNote(null);
    chartStore.finishTool();
    if (text && at)
      chartStore.put({ id: newId(), kind: 'text', points: [at.point], text });
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
    draft: draft && draft.kind === ctx.tool ? draft : null,
    dragging,
    measureBox,
    note,
    finishNote,
    cancel,
  };
}
