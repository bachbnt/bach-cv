/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import {
  clampCamera,
  zoomAt,
  type Camera,
  type Size,
} from '@/skins/travel/map/camera';

const FLY_MS = 800;
const PAN_KEY = 90;

/**
 * The camera of the map: drag to pan, wheel and pinch to zoom, keys to move (arrows, + and -). `fly` moves it with a CSS transition
 * (`flying` is true while it runs; a drag or a wheel turn cuts it short). Everything is clamped to the map.
 */
export function useCamera(
  stage: RefObject<HTMLElement | null>,
  size: Size,
  initial: Camera,
) {
  const [raw, setCamera] = useState<Camera>(() => clampCamera(initial, size));
  // the view may change size (a window resize, a panel): the camera shown is always valid for it
  const camera = useMemo(() => clampCamera(raw, size), [raw, size]);
  const [flying, setFlying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const live = useRef({ camera, size });
  useEffect(() => {
    live.current = { camera, size };
  });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number } | null>(null);
  const moved = useRef(0);

  const set = useCallback((next: Camera, fly: boolean) => {
    window.clearTimeout(timer.current);
    setFlying(fly);
    setCamera(clampCamera(next, live.current.size));
    if (fly)
      timer.current = window.setTimeout(() => setFlying(false), FLY_MS + 60);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const { camera: now, size: box } = live.current;
      set(
        zoomAt(
          now,
          box,
          Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0018)),
          event.clientX - rect.left,
          event.clientY - rect.top,
        ),
        false,
      );
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [stage, set]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    moved.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) };
    }
    setDragging(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const last = pointers.current.get(event.pointerId);
    if (!last) return;
    const { camera: now, size: box } = live.current;
    const next = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, next);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = event.currentTarget.getBoundingClientRect();
      set(
        zoomAt(
          now,
          box,
          dist / pinch.current.dist,
          (a.x + b.x) / 2 - rect.left,
          (a.y + b.y) / 2 - rect.top,
        ),
        false,
      );
      pinch.current = { dist };
      return;
    }
    const dx = next.x - last.x;
    const dy = next.y - last.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    set({ ...now, cx: now.cx - dx / now.z, cy: now.cy - dy / now.z }, false);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    if (pointers.current.size === 0) setDragging(false);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const { camera: now, size: box } = live.current;
    const step = PAN_KEY / now.z;
    const moves: Record<string, Camera> = {
      ArrowLeft: { ...now, cx: now.cx - step },
      ArrowRight: { ...now, cx: now.cx + step },
      ArrowUp: { ...now, cy: now.cy - step },
      ArrowDown: { ...now, cy: now.cy + step },
      '+': zoomAt(now, box, 1.3, box.w / 2, box.h / 2),
      '=': zoomAt(now, box, 1.3, box.w / 2, box.h / 2),
      '-': zoomAt(now, box, 1 / 1.3, box.w / 2, box.h / 2),
    };
    const next = moves[event.key];
    if (!next) return;
    event.preventDefault();
    set(next, false);
  };

  return {
    camera,
    flying,
    dragging,
    set,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onKeyDown,
    },
  };
}
