/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from 'react';
import {
  DRAG_SLOP,
  dragDismisses,
  dragOffset,
} from '@/skins/phone/shell/ph-overlay-drag';

interface Press {
  id: number;
  x: number;
  y: number;
  at: number;
  /** `pending` until the pointer has moved a few px, then it is a drag down or something else (a swipe sideways, a scroll) that is left alone */
  mode: 'pending' | 'drag' | 'ignore';
  extent: number;
}

/** How long a sheet that is let go takes to leave, or to settle back; the same for the scrim. */
const LEAVE_MS = 180;
const SETTLE_MS = 280;

/**
 * Drag-to-dismiss for an overlay. A press that starts on an element marked `data-ph-drag` (the grabber and the bar; `data-ph-drag='touch'`
 * for a touch screen only, like the picture of the viewer) and moves down drags the whole window with the pointer, `transform` only, and
 * the scrim fades with it. Let go after a third of its height or a quick flick and it leaves and `onDismiss` runs; otherwise it settles
 * back. Esc and the close button are unchanged: this is one more way, never the only one.
 */
export function useOverlayDrag(onDismiss: () => void): {
  /** the callback ref of the window that is dragged */
  setPopup: (element: HTMLDivElement | null) => void;
  scrim: RefObject<HTMLDivElement | null>;
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  };
} {
  const popup = useRef<HTMLDivElement | null>(null);
  const setPopup = useCallback((element: HTMLDivElement | null) => {
    popup.current = element;
  }, []);
  const scrim = useRef<HTMLDivElement | null>(null);
  const press = useRef<Press | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const follow = (dy: number, extent: number) => {
    const el = popup.current;
    if (!el) return;
    const offset = dragOffset(dy);
    el.style.transition = 'none';
    el.style.transform = `translateY(${offset}px)`;
    if (scrim.current) {
      scrim.current.style.transition = 'none';
      scrim.current.style.opacity = String(1 - Math.min(1, offset / extent));
    }
  };

  const settle = useCallback(() => {
    const el = popup.current;
    if (!el) return;
    el.style.transition = `transform ${SETTLE_MS}ms var(--ease-ph-out)`;
    el.style.transform = '';
    if (scrim.current) {
      scrim.current.style.transition = `opacity ${SETTLE_MS}ms var(--ease-ph-out)`;
      scrim.current.style.opacity = '';
    }
    timer.current = setTimeout(() => {
      el.style.transition = '';
      if (scrim.current) scrim.current.style.transition = '';
    }, SETTLE_MS);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const zone = target.closest<HTMLDivElement>('[data-ph-drag]');
    if (!zone || !event.currentTarget.contains(zone)) return;
    if (zone.dataset.phDrag === 'touch' && event.pointerType !== 'touch')
      return;
    // a button or a field in the bar keeps its own press
    if (target.closest('button, a, input, textarea, select')) return;
    clearTimeout(timer.current);
    press.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      at: event.timeStamp,
      mode: 'pending',
      extent: 0,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p || p.id !== event.pointerId || p.mode === 'ignore') return;
    const dx = event.clientX - p.x;
    const dy = event.clientY - p.y;
    if (p.mode === 'pending') {
      if (Math.hypot(dx, dy) < DRAG_SLOP) return;
      if (dy > 0 && dy > Math.abs(dx)) {
        p.mode = 'drag';
        p.extent = event.currentTarget.offsetHeight;
        event.currentTarget.setPointerCapture(event.pointerId);
      } else {
        p.mode = 'ignore';
        return;
      }
    }
    follow(dy, p.extent);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p || p.id !== event.pointerId) return;
    press.current = null;
    if (p.mode !== 'drag') return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const dy = event.clientY - p.y;
    if (!dragDismisses(dy, event.timeStamp - p.at, p.extent)) {
      settle();
      return;
    }
    const el = popup.current;
    if (el) {
      el.style.transition = `transform ${LEAVE_MS}ms var(--ease-ph-out)`;
      el.style.transform = 'translateY(100%)';
    }
    if (scrim.current) {
      scrim.current.style.transition = `opacity ${LEAVE_MS}ms var(--ease-ph-out)`;
      scrim.current.style.opacity = '0';
    }
    timer.current = setTimeout(onDismiss, LEAVE_MS);
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p || p.id !== event.pointerId) return;
    press.current = null;
    if (p.mode === 'drag') settle();
  };

  return {
    setPopup,
    scrim,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
