/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  cameraFromMatrix,
  cameraTransform,
  clampCamera,
  type Camera,
  type Size,
} from '@/skins/travel/map/camera';
import { toWorld } from '@/skins/travel/map/iso';
import { rideOf, type PlacedStop } from '@/skins/travel/map/route';
import type { MapFocus } from '@/skins/travel/map/types';

/**
 * The camera that rides with the traveller. When the traveller goes from one stop to another the camera does not fly to the end and wait
 * there: it follows the same road for the same time (`rideOf`), with the same easing, and the zoom changes on the way. It is one
 * animation of the transform of the map (the Web Animations API, so the compositor runs it); the state of the camera is the end of the
 * ride at once, so when the animation ends nothing moves. A hand on the map (a drag, a wheel turn, a key) ends the ride where it is.
 */
export function useRide({
  view,
  stops,
  camera,
  size,
  aimAt,
  reduced,
  flying,
  set,
}: {
  view: RefObject<HTMLElement | null>;
  stops: readonly { id: string; placed: PlacedStop }[];
  camera: Camera;
  size: Size;
  /** the camera that shows a world point in the free part of the view */
  aimAt: (world: { x: number; y: number }, zoom: number) => Camera;
  reduced: boolean;
  /** the camera is moving by a CSS transition (a fly) */
  flying: boolean;
  set: (camera: Camera, fly: boolean) => void;
}) {
  const [riding, setRiding] = useState(false);
  const animation = useRef<Animation | null>(null);
  const live = useRef({ camera, size });
  const flyingNow = useRef(flying);
  useEffect(() => {
    live.current = { camera, size };
    flyingNow.current = flying;
  });

  /**
   * Ends a ride, or a fly that is still running, where the camera is now and returns that camera. Only a transform the browser is moving
   * has a middle the state does not know: it is read from the matrix of the box, and the state takes it.
   */
  const endRide = useCallback((): Camera => {
    const { camera: shown, size: box } = live.current;
    const element = view.current;
    const running = animation.current;
    if (!element || (!running && !flyingNow.current)) return shown;
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    if (running) {
      running.cancel();
      animation.current = null;
      setRiding(false);
    }
    if (!(matrix.a > 0)) return shown;
    const here = clampCamera(cameraFromMatrix(matrix, box), box);
    set(here, false);
    return here;
  }, [view, set]);

  useEffect(() => () => animation.current?.cancel(), []);

  /**
   * Starts the ride of the camera to the stop of `focus`, from the stop the traveller left (`wasId`, or the current stop when it waited
   * at the end of the road), to the camera `aim`. False when there is no ride to follow (the camera then flies as before).
   */
  const follow = useCallback(
    (focus: MapFocus, wasId: string | null, aim: Camera): boolean => {
      const element = view.current;
      if (reduced || focus.kind !== 'stop' || !element) return false;
      const to = stops.find((s) => s.id === focus.id)?.placed;
      const from =
        stops.find((s) => s.id === wasId)?.placed ??
        stops[stops.length - 1]?.placed;
      if (!to || !from || from === to) return false;
      const start = endRide();
      const { points, duration } = rideOf(from, to);
      const last = points.length - 1;
      const frames = points.map(({ at, offset }, i) => {
        const camera =
          i === 0
            ? start
            : i === last
              ? aim
              : aimAt(toWorld(at), start.z + (aim.z - start.z) * offset);
        return { transform: cameraTransform(camera, size), offset };
      });
      // the state is the end of the ride at once; the animation shows the way there
      set(aim, false);
      const ride = element.animate(frames, {
        duration,
        easing: 'ease-in-out',
      });
      animation.current = ride;
      setRiding(true);
      ride.finished
        .then(() => {
          if (animation.current !== ride) return;
          animation.current = null;
          setRiding(false);
        })
        .catch(() => undefined);
      return true;
    },
    [view, stops, size, aimAt, reduced, set, endRide],
  );

  return { riding, follow, endRide };
}
