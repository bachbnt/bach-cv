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
/** How long after the last drag, wheel or key step the map still counts as moving (and keeps one raster instead of painting at each step). */
const SETTLE_MS = 220;
const PAN_KEY = 90;
/** A press that moved less than this (in pixels, all the moves added) is a tap, not a drag. */
const TAP_PX = 6;

/**
 * The camera of the map: drag to pan, wheel and pinch to zoom, keys to move (arrows, + and -). `fly` moves it with a CSS transition
 * (`flying` is true while it runs; a drag or a wheel turn cuts it short). Everything is clamped to the map.
 */
export function useCamera(
  stage: RefObject<HTMLElement | null>,
  size: Size,
  initial: Camera,
  onTap?: (target: Element | null) => void,
) {
  const [raw, setCamera] = useState<Camera>(() => clampCamera(initial, size));
  // the view may change size (a window resize, a panel): the camera shown is always valid for it
  const camera = useMemo(() => clampCamera(raw, size), [raw, size]);
  const [flying, setFlying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [moving, setMoving] = useState(false);
  // the zoom the sprites were last sized for: it only follows the camera when a drag, wheel turn or key step has ended
  const [restZoom, setRestZoom] = useState(camera.z);
  const timer = useRef<number | undefined>(undefined);
  const settle = useRef<number | undefined>(undefined);
  const live = useRef({ camera, size });
  useEffect(() => {
    live.current = { camera, size };
  });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number } | null>(null);
  const moved = useRef(0);

  /** `byHand`: a drag, wheel turn, pinch or key step, which keeps the sprites' size until it ends; any other move is final at once. */
  const move = useCallback((next: Camera, fly: boolean, byHand: boolean) => {
    window.clearTimeout(timer.current);
    setFlying(fly);
    const clamped = clampCamera(next, live.current.size);
    // the next event of the same turn (a wheel step after a ride was cut) already reads this camera
    live.current = { ...live.current, camera: clamped };
    setCamera(clamped);
    if (fly)
      timer.current = window.setTimeout(() => setFlying(false), FLY_MS + 60);
    window.clearTimeout(settle.current);
    if (!byHand) {
      setMoving(false);
      setRestZoom(clamped.z);
      return;
    }
    setMoving(true);
    settle.current = window.setTimeout(() => {
      setMoving(false);
      setRestZoom(live.current.camera.z);
    }, SETTLE_MS);
  }, []);
  const set = useCallback(
    (next: Camera, fly: boolean) => move(next, fly, false),
    [move],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(settle.current);
    },
    [],
  );

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const { camera: now, size: box } = live.current;
      move(
        zoomAt(
          now,
          box,
          Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0018)),
          event.clientX - rect.left,
          event.clientY - rect.top,
        ),
        false,
        true,
      );
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [stage, move]);

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
      move(
        zoomAt(
          now,
          box,
          dist / pinch.current.dist,
          (a.x + b.x) / 2 - rect.left,
          (a.y + b.y) / 2 - rect.top,
        ),
        false,
        true,
      );
      pinch.current = { dist };
      return;
    }
    const dx = next.x - last.x;
    const dy = next.y - last.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    move(
      { ...now, cx: now.cx - dx / now.z, cy: now.cy - dy / now.z },
      false,
      true,
    );
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const began = pointers.current.delete(event.pointerId);
    pinch.current = null;
    if (pointers.current.size === 0) setDragging(false);
    // a press on the map that did not drag is a tap: what is under the finger is told to the map (a sight shows its card)
    if (
      began &&
      event.type === 'pointerup' &&
      pointers.current.size === 0 &&
      moved.current < TAP_PX
    )
      onTap?.(document.elementFromPoint(event.clientX, event.clientY));
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
    move(next, false, true);
  };

  return {
    camera,
    flying,
    dragging,
    moving,
    restZoom,
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
