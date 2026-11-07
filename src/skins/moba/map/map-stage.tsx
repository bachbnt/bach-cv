/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { Champion } from '@/skins/moba/map/champion';
import { FogLayer } from '@/skins/moba/map/fog-layer';
import { RIFT_VIEWBOX, RiftArt } from '@/skins/moba/map/rift-art';
import { RoleLayer } from '@/skins/moba/map/role-layer';
import { StationTags } from '@/skins/moba/map/station-tags';
import { useAttach, useGame, VISION } from '@/skins/moba/shell/game-context';
import { useAnimationGate } from '@/skins/moba/shell/use-animation-gate';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';
import { WORLD, type Pt } from '@/skins/moba/world/geometry';

const ART = 'mb-m';

/**
 * The stage: the whole map drawn once, bigger than the window. The camera is a transform on `.mb-world` that the walker keeps on the
 * champion. A click or a tap (and a right click) on the map walks the champion there along the lanes. It is decoration for assistive
 * technology: the list of places and the keys do the same work.
 */
export function MapStage() {
  const { scale, explored, walkToPoint } = useGame();
  const placeWorld = useAttach('world');
  const reduced = useReducedMotion();
  const svg = useRef<SVGSVGElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [ping, setPing] = useState<(Pt & { n: number }) | null>(null);
  useAnimationGate(root, svg, reduced);
  const size = WORLD * scale;

  const move = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const at = {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    };
    setPing((old) => ({ ...at, n: (old?.n ?? 0) + 1 }));
    walkToPoint(at);
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
        {ping && (
          <span
            key={ping.n}
            className='mb-ping pointer-events-none absolute z-10 block size-10 -translate-x-1/2 -translate-y-1/2 rounded-full'
            style={{ left: ping.x * scale, top: ping.y * scale }}
          />
        )}
        <Champion />
      </div>
    </div>
  );
}
