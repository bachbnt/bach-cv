/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { CastLayer } from '@/skins/moba/map/cast-layer';
import { Champion } from '@/skins/moba/map/champion';
import { FogLayer } from '@/skins/moba/map/fog-layer';
import { RIFT_VIEWBOX, RiftArt } from '@/skins/moba/map/rift-art';
import { RoleLayer } from '@/skins/moba/map/role-layer';
import { StationTags } from '@/skins/moba/map/station-tags';
import { useFx } from '@/skins/moba/shell/fx-context';
import { useAttach, useGame, VISION } from '@/skins/moba/shell/game-context';
import { useAnimationGate } from '@/skins/moba/shell/use-animation-gate';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';
import { WORLD, type Pt } from '@/skins/moba/world/geometry';

const ART = 'mb-m';
/** A finger held this long on the map opens the ping wheel there; moving more than `SLOP` pixels first is a drag, not a hold. */
const HOLD_MS = 450;
const SLOP = 10;

/**
 * The stage: the whole map drawn once, bigger than the window. The camera is a transform on `.mb-world` that the walker keeps on the
 * champion. A click or a tap (and a right click) on the map walks the champion there along the lanes. It is decoration for assistive
 * technology: the list of places and the keys do the same work.
 */
export function MapStage() {
  const { scale, explored, walkToPoint } = useGame();
  const { aimAt, ping, openWheel } = useFx();
  const placeWorld = useAttach('world');
  const reduced = useReducedMotion();
  const svg = useRef<SVGSVGElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<(Pt & { n: number }) | null>(null);
  const hold = useRef<{
    timer: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  // a hold that opened the wheel is followed by a click of the same finger, which must not walk the champion
  const held = useRef(false);
  useAnimationGate(root, svg, reduced);
  const size = WORLD * scale;

  const pointAt = (event: { clientX: number; clientY: number }): Pt => {
    const rect = root.current
      ?.querySelector('.mb-world')
      ?.getBoundingClientRect();
    return {
      x: (event.clientX - (rect?.left ?? 0)) / scale,
      y: (event.clientY - (rect?.top ?? 0)) / scale,
    };
  };

  const move = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (held.current) return;
    const at = pointAt(event);
    // Alt + click marks the spot, as the quick ping of the game does; it does not walk
    if (event.altKey) {
      ping('alert', at);
      return;
    }
    setMark((old) => ({ ...at, n: (old?.n ?? 0) + 1 }));
    walkToPoint(at);
  };

  const track = (event: PointerEvent<HTMLDivElement>) => {
    aimAt(pointAt(event), { x: event.clientX, y: event.clientY });
    const start = hold.current;
    if (
      start &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > SLOP
    ) {
      clearTimeout(start.timer);
      hold.current = null;
    }
  };
  const press = (event: PointerEvent<HTMLDivElement>) => {
    held.current = false;
    if (event.pointerType !== 'touch') return;
    const at = pointAt(event);
    const screen = { x: event.clientX, y: event.clientY };
    aimAt(at, screen);
    hold.current = {
      x: event.clientX,
      y: event.clientY,
      timer: setTimeout(() => {
        hold.current = null;
        held.current = true;
        openWheel(at, screen);
      }, HOLD_MS),
    };
  };
  const release = () => {
    if (hold.current) clearTimeout(hold.current.timer);
    hold.current = null;
  };

  return (
    <div
      ref={root}
      className='mb-map absolute inset-0 overflow-hidden'
      aria-hidden='true'
    >
      <div
        ref={placeWorld}
        className='mb-world absolute top-0 left-0 cursor-pointer will-change-transform'
        style={{ width: size, height: size }}
        onClick={move}
        onContextMenu={move}
        onPointerMove={track}
        onPointerDown={press}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <svg
          ref={svg}
          viewBox={RIFT_VIEWBOX}
          width={size}
          height={size}
          className='block'
          focusable='false'
        >
          <RiftArt p={ART} full />
        </svg>
        <FogLayer p={ART} explored={explored} vision={VISION} strength={0.5} />
        <RoleLayer p={ART} />
        <StationTags />
        {mark && (
          <span
            key={mark.n}
            className='mb-ping pointer-events-none absolute z-10 block size-10 -translate-x-1/2 -translate-y-1/2 rounded-full'
            style={{ left: mark.x * scale, top: mark.y * scale }}
          />
        )}
        <CastLayer />
        <Champion />
      </div>
    </div>
  );
}
