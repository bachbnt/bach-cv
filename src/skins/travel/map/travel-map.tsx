/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react';
import { travelMapCopy } from '@/content/copy/travel-map';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  cameraTransform,
  fitBox,
  showsWholeMap,
  spriteScale,
  zoomAt,
  type Camera,
} from '@/skins/travel/map/camera';
import { City } from '@/skins/travel/map/layers/city';
import { Land, Sea } from '@/skins/travel/map/layers/ground';
import { Shore } from '@/skins/travel/map/layers/shore';
import { Pins } from '@/skins/travel/map/layers/pins';
import { Sky } from '@/skins/travel/map/layers/sky';
import { Sprites } from '@/skins/travel/map/layers/sprites';
import { Traveller } from '@/skins/travel/map/layers/traveller';
import { Waves } from '@/skins/travel/map/layers/waves';
import { pointAt, ROUTE_ROAD } from '@/skins/travel/map/route';
import {
  toWorld,
  WORLD,
  WORLD_OFFSET,
  GROUND_MATRIX,
} from '@/skins/travel/map/iso';
import { MapControls } from '@/skins/travel/map/map-controls';
import { worldOf } from '@/skins/travel/map/iso';
import type { MapFocus, MapStop } from '@/skins/travel/map/types';
import { useCamera } from '@/skins/travel/map/use-camera';
import { useDeclutter } from '@/skins/travel/map/use-declutter';
import { usePaused } from '@/skins/travel/map/use-paused';
import { useSize } from '@/skins/travel/map/use-size';

/** From this zoom on, the details that are too small to see from afar (a waterfall) are animated. */
const CLOSE_ZOOM = 0.7;

/** The route as a dashed line on the ground, from the first stop to the last (the same road the traveller rides). */
const [A, B, C, D] = GROUND_MATRIX;
const GROUND = `matrix(${A} ${B} ${C} ${D} ${WORLD_OFFSET.x} ${WORLD_OFFSET.y})`;

export function TravelMap({
  stops,
  activeId,
  routeOn,
  focus,
  panel,
  avatar,
  travellerName,
  reduced,
  onSelect,
  className,
}: {
  stops: readonly MapStop[];
  activeId: string | null;
  /** show the route, the pins and the traveller (the pages that are about the trip) */
  routeOn: boolean;
  focus: MapFocus;
  /** where the page's card sits (so the map aims at the free part of the view) */
  panel: 'left' | 'right' | 'wide' | null;
  avatar: string;
  travellerName: string;
  reduced: boolean;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const words = useCopy(travelMapCopy);
  const stage = useRef<HTMLDivElement>(null);
  const { size, ready } = useSize(stage);
  const paused = usePaused(stage);

  // the part of the view the page's card leaves free: the camera aims at the middle of it, not of the whole view
  const free = useMemo(() => {
    const wide = size.w >= 768;
    const left = wide && panel === 'left' ? 440 : 0;
    const right = wide ? (panel === 'right' ? 520 : 76) : 0;
    const bottom =
      panel === 'wide'
        ? wide
          ? 360
          : size.h * 0.46
        : wide
          ? 0
          : size.h * 0.46;
    return {
      left,
      right,
      bottom,
      w: Math.max(240, size.w - left - right),
      h: Math.max(200, size.h - bottom),
    };
  }, [size, panel]);
  const target = useCallback(
    (f: MapFocus): Camera => {
      let c: Camera;
      if (f.kind === 'stop' && stops.some((s) => s.id === f.id)) {
        const stop = stops.find((s) => s.id === f.id);
        const w = toWorld(stop?.placed.at ?? { x: 0, y: 0 });
        c = { cx: w.x, cy: w.y - 50, z: 0.9 };
      } else if (f.kind === 'place') {
        const w = worldOf(f.lat, f.lng);
        c = { cx: w.x, cy: w.y, z: f.zoom };
      } else {
        // the whole trip: the coast road from its south end to its north end, with the sea beside it
        const a = toWorld(pointAt(0.02));
        const b = toWorld(pointAt(0.98));
        c = fitBox(
          { x: a.x - 520, y: b.y - 420 },
          { x: b.x + 980, y: a.y + 480 },
          free,
          1,
        );
      }
      // shift so the point lands in the middle of the free part of the view
      const dx = free.left + free.w / 2 - size.w / 2;
      const dy = free.h / 2 - size.h / 2;
      return { cx: c.cx - dx / c.z, cy: c.cy - dy / c.z, z: c.z };
    },
    [stops, size, free],
  );
  const { camera, flying, dragging, moving, restZoom, set, handlers } =
    useCamera(stage, size, target(focus));

  // a new focus (another page, another stop) makes the camera fly there
  const focusKey = JSON.stringify(focus);
  const lastFocus = useRef(focusKey);
  useEffect(() => {
    if (lastFocus.current === focusKey) return;
    lastFocus.current = focusKey;
    set(target(focus), !reduced);
  }, [focusKey, focus, reduced, set, target]);
  // the first measure of the view: the camera starts on the overview
  const measured = useRef(false);
  useEffect(() => {
    if (!ready || measured.current) return;
    measured.current = true;
    set(target(focus), false);
  }, [ready, focus, set, target]);

  useDeclutter(
    stage,
    ready && !moving && !flying,
    `${restZoom}|${size.w}x${size.h}|${routeOn}|${activeId}|${stops.map((stop) => stop.id).join()}`,
  );

  const route = useMemo(
    () => ROUTE_ROAD.map(([x, y]) => `${x},${y}`).join(' '),
    [],
  );
  const zoom = (factor: number) =>
    set(zoomAt(camera, size, factor, size.w / 2, size.h / 2), !reduced);

  return (
    <div
      ref={stage}
      role='group'
      tabIndex={0}
      aria-label={words.label}
      aria-describedby='tl-map-help'
      className={cn(
        'tl-map',
        paused && 'tl-paused',
        dragging && 'tl-dragging',
        moving && 'tl-moving',
        camera.z >= CLOSE_ZOOM && 'tl-close',
        showsWholeMap(camera.z, size) && 'tl-whole',
        className,
      )}
      {...handlers}
    >
      <p id='tl-map-help' className='sr-only'>
        {words.help}
      </p>
      <Sky />
      <div
        className={cn('tl-view', flying && 'tl-fly')}
        style={
          {
            width: WORLD.width,
            height: WORLD.height,
            transform: cameraTransform(camera, size),
            // while the camera is dragged or zoomed by hand the sprites keep their size: resizing all of them at every wheel step is what made zooming slow
            '--tl-sc': spriteScale(moving ? restZoom : camera.z),
          } as CSSProperties
        }
      >
        <Sea />
        <Waves />
        <Shore />
        <Land />
        <City />
        {routeOn && (
          <svg
            aria-hidden='true'
            focusable='false'
            width={WORLD.width}
            height={WORLD.height}
            className='tl-route absolute top-0 left-0 overflow-visible'
          >
            <g transform={GROUND}>
              <polyline
                points={route}
                className='fill-none stroke-tl-solid'
                strokeWidth={22}
                strokeOpacity={0.55}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <polyline
                points={route}
                className='tl-route-dash fill-none stroke-tl-coral'
                strokeWidth={9}
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeDasharray='2 22'
              />
            </g>
          </svg>
        )}
        <Sprites words={words} />
        {routeOn && (
          <>
            <Pins
              stops={stops}
              activeId={activeId}
              youAreHere={words.youAreHere}
              onSelect={onSelect}
            />
            <Traveller
              stops={stops}
              activeId={activeId}
              avatar={avatar}
              name={travellerName}
              reduced={reduced}
            />
          </>
        )}
      </div>
      <MapControls
        words={words}
        onZoom={zoom}
        onRecentre={() => set(target({ kind: 'overview' }), !reduced)}
      />
      <p className='tl-credits'>{words.credits}</p>
    </div>
  );
}
