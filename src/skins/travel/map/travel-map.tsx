/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { travelMapCopy } from '@/content/copy/travel-map';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  cameraTransform,
  clampCamera,
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
import { SightInfo } from '@/skins/travel/map/layers/sight-info';
import { Sprites } from '@/skins/travel/map/layers/sprites';
import { Traveller } from '@/skins/travel/map/layers/traveller';
import { Waves } from '@/skins/travel/map/layers/waves';
import { pointAt, ROUTE_ROAD, tripPath } from '@/skins/travel/map/route';
import {
  toWorld,
  WORLD,
  WORLD_OFFSET,
  GROUND_MATRIX,
} from '@/skins/travel/map/iso';
import { MapControls } from '@/skins/travel/map/map-controls';
import { MapHint } from '@/skins/travel/map/map-hint';
import { SIGHT_IDS, type SightId } from '@/skins/travel/map/sights';
import { worldOf } from '@/skins/travel/map/iso';
import type { MapFocus, MapStop } from '@/skins/travel/map/types';
import { useCamera } from '@/skins/travel/map/use-camera';
import { useDeclutter } from '@/skins/travel/map/use-declutter';
import { useRide } from '@/skins/travel/map/use-ride';
import { usePaused } from '@/skins/travel/map/use-paused';
import { useSpriteCulling } from '@/skins/travel/map/use-sprite-culling';
import { useSize } from '@/skins/travel/map/use-size';

/** From this zoom on, the details that are too small to see from afar (a waterfall) are animated. */
const CLOSE_ZOOM = 0.7;

/** The sight a hit area under the pointer belongs to (`data-hit`), or null. */
const sightUnder = (element: EventTarget | null): SightId | null => {
  const id =
    element instanceof Element
      ? element.closest('[data-hit]')?.getAttribute('data-hit')
      : null;
  return SIGHT_IDS.find((sight) => sight === id) ?? null;
};

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
  sightId,
  onSight,
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
  /** the sight whose card is open (picked in the list or by a tap), and the way to open or close one */
  sightId: SightId | null;
  onSight: (id: SightId | null) => void;
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
  // shift so the point lands in the middle of the free part of the view
  const shifted = useCallback(
    (c: Camera): Camera => {
      const dx = free.left + free.w / 2 - size.w / 2;
      const dy = free.h / 2 - size.h / 2;
      return { cx: c.cx - dx / c.z, cy: c.cy - dy / c.z, z: c.z };
    },
    [free, size],
  );
  /** The camera that shows a point of the world (a little above it, where its card is) in the free part of the view. */
  const aimAt = useCallback(
    (world: { x: number; y: number }, z: number): Camera =>
      clampCamera(shifted({ cx: world.x, cy: world.y - 50, z }), size),
    [shifted, size],
  );
  const target = useCallback(
    (f: MapFocus): Camera => {
      let c: Camera;
      if (f.kind === 'stop' && stops.some((s) => s.id === f.id)) {
        const stop = stops.find((s) => s.id === f.id);
        return aimAt(toWorld(stop?.placed.at ?? { x: 0, y: 0 }), 0.9);
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
      return shifted(c);
    },
    [stops, free, aimAt, shifted],
  );
  // the sight the mouse is over shows its card too, but only while it is over it; a tap or the list keeps one open
  const [hover, setHover] = useState<SightId | null>(null);
  const shownSight = sightId ?? hover;
  const { camera, flying, dragging, moving, restZoom, set, handlers } =
    useCamera(stage, size, target(focus), (under) => {
      const id = sightUnder(under);
      onSight(id && id !== sightId ? id : null);
    });
  // the camera rides along with the traveller from stop to stop; a hand on the map ends the ride where it is
  const view = useRef<HTMLDivElement>(null);
  // the loops of the drawings far from the screen stand still (`data-off`, see `still.css`)
  useSpriteCulling(stage, view);
  const { riding, follow, endRide } = useRide({
    view,
    stops,
    camera,
    size,
    aimAt,
    reduced,
    flying,
    set,
  });
  useEffect(() => {
    if (!sightId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSight(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sightId, onSight]);

  // a new focus (another page, another stop) makes the camera fly there
  const focusKey = JSON.stringify(focus);
  const lastFocus = useRef(focusKey);
  // the stop the traveller was at before this one: the camera starts its ride from there
  const lastActive = useRef(activeId);
  useEffect(() => {
    const was = lastActive.current;
    lastActive.current = activeId;
    if (lastFocus.current === focusKey) return;
    lastFocus.current = focusKey;
    const aim = target(focus);
    if (!follow(focus, was, aim)) set(aim, !reduced);
  }, [focusKey, focus, activeId, reduced, set, target, follow]);
  // the first measure of the view: the camera starts on the overview
  const measured = useRef(false);
  useEffect(() => {
    if (!ready || measured.current) return;
    measured.current = true;
    set(target(focus), false);
  }, [ready, focus, set, target]);

  useDeclutter(
    stage,
    ready && !moving && !flying && !riding,
    `${restZoom}|${size.w}x${size.h}|${routeOn}|${activeId}|${stops.map((stop) => stop.id).join()}`,
  );

  const route = useMemo(
    () => ROUTE_ROAD.map(([x, y]) => `${x},${y}`).join(' '),
    [],
  );
  // the way to the open stop, from the one before it: it is lit over the dashes of the whole route
  const lit = useMemo(() => {
    const i = stops.findIndex((stop) => stop.id === activeId);
    if (!routeOn || i < 0) return '';
    return tripPath(stops[i - 1]?.placed ?? null, stops[i].placed)
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  }, [stops, activeId, routeOn]);
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
      onPointerOver={(event) => {
        if (event.pointerType === 'mouse') setHover(sightUnder(event.target));
      }}
      onPointerLeave={() => setHover(null)}
      onPointerDownCapture={(event) => {
        // a press on a control (the zoom buttons, a pin) is not a hand on the map: zooming again while a fly runs adds to its end
        if (!(event.target as Element).closest('button, a')) endRide();
      }}
      onWheelCapture={endRide}
      onKeyDownCapture={(event) => {
        // the keys that move the camera (as in `useCamera`); Tab or a letter leaves the ride alone
        if (
          event.target === event.currentTarget &&
          /^(Arrow|[+=-])/.test(event.key)
        )
          endRide();
      }}
      {...handlers}
    >
      <p id='tl-map-help' className='sr-only'>
        {words.help}
      </p>
      <Sky />
      <div
        ref={view}
        className={cn('tl-view', flying && 'tl-fly', riding && 'tl-ride')}
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
              {lit && (
                <g key={activeId} className='tl-lit'>
                  <polyline
                    points={lit}
                    className='fill-none stroke-tl-solid'
                    strokeWidth={26}
                    strokeOpacity={0.85}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <polyline
                    points={lit}
                    className='fill-none stroke-tl-coral'
                    strokeWidth={13}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </g>
              )}
            </g>
          </svg>
        )}
        <Sprites words={words} />
        <SightInfo id={shownSight} words={words} />
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
      {routeOn && <MapHint text={words.hint} touchText={words.hintTouch} />}
      <p className='tl-credits'>{words.credits}</p>
    </div>
  );
}
