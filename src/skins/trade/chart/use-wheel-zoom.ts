/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';
import type { GestureContext } from '@/skins/trade/chart/gesture-types';
import {
  PAN_SETTLED,
  queueZoom,
  takeStep,
  wheelPixels,
  wheelZoomLog,
  ZOOM_SETTLED,
} from '@/skins/trade/chart/wheel-zoom';
import { panView, zoomView, type View } from '@/skins/trade/chart/view';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';

/**
 * The wheel needs a listener that may call preventDefault, which React's own wheel handlers cannot. It only QUEUES what the wheel
 * asked for (a zoom as a logarithm, a pan in bars); one animation frame applies a share of the queue, so a fast spin is one smooth
 * glide instead of a jump for each event, and the chart is drawn at most once per frame.
 */
export function useWheelZoom(
  svg: RefObject<SVGSVGElement | null>,
  latest: RefObject<GestureContext>,
) {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const el = svg.current;
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
  }, [svg, latest, reducedMotion]);
}
