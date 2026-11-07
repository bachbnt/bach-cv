/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { memo, type MouseEvent } from 'react';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { FogLayer } from '@/skins/moba/map/fog-layer';
import { RIFT_VIEWBOX, RiftArt } from '@/skins/moba/map/rift-art';
import { useAttach, useGame, VISION } from '@/skins/moba/shell/game-context';
import { WORLD, type Pt } from '@/skins/moba/world/geometry';
import { STATIONS, stationOfPage } from '@/skins/moba/world/stations';

const Art = memo(function Art() {
  return (
    <svg
      viewBox={RIFT_VIEWBOX}
      className='absolute inset-0 size-full'
      focusable='false'
    >
      <RiftArt p='mb-n' full={false} />
    </svg>
  );
});

const pct = (n: number) => `${(n / WORLD) * 100}%`;

/**
 * The minimap: the same map, smaller, with the fog of war (the part of the map the champion has not been near is dark), the champion, the
 * places and the towers of the career. A click or a tap walks the champion there. It is decoration for assistive technology (the list of
 * places does the same work), so it is hidden from it and out of the tab order.
 */
export function Minimap({ className }: { className?: string }) {
  const copy = useCopy(mobaCopy).map;
  const {
    explored,
    stops,
    captured,
    walkToPoint,
    walkToStation,
    current,
    walkingTo,
  } = useGame();
  const placeDot = useAttach('dot');
  const here = stationOfPage(current).id;

  const walk = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const at: Pt = {
      x: ((event.clientX - rect.left) / rect.width) * WORLD,
      y: ((event.clientY - rect.top) / rect.height) * WORLD,
    };
    walkToPoint(at);
  };

  return (
    <div
      className={cn('mb-minimap relative aspect-square', className)}
      data-minimap=''
    >
      <div
        className='absolute inset-[5px] cursor-crosshair overflow-hidden bg-mb-void'
        aria-hidden='true'
        title={copy.minimap}
        onClick={walk}
        onContextMenu={(event) => {
          event.preventDefault();
          walk(event);
        }}
      >
        <Art />
        <FogLayer
          p='mb-n'
          explored={explored}
          vision={VISION}
          strength={0.82}
        />
        {STATIONS.map((station) => (
          <button
            key={station.id}
            type='button'
            tabIndex={-1}
            aria-hidden='true'
            data-minimap-station={station.id}
            data-here={station.id === here || undefined}
            data-walking={walkingTo?.id === station.id || undefined}
            className='mb-pin absolute size-[14px] -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-coarse:size-[22px]'
            style={{ left: pct(station.at.x), top: pct(station.at.y) }}
            onClick={(event) => {
              event.stopPropagation();
              walkToStation(station.id);
            }}
          />
        ))}
        {stops.map((stop) => (
          <span
            key={stop.job.id}
            className='mb-pin-role pointer-events-none absolute -translate-x-1/2 -translate-y-1/2'
            data-nexus={stop.nexus || undefined}
            data-taken={captured.has(stop.job.id) || undefined}
            style={{ left: pct(stop.at.x), top: pct(stop.at.y) }}
          />
        ))}
        <div
          ref={placeDot}
          className='mb-me pointer-events-none absolute size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full'
        />
      </div>
    </div>
  );
}
