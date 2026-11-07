/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import {
  BEACHES,
  BUILT,
  LAND,
  PEAKS,
  RIVERS,
  ROADS_MAJOR,
  ROADS_MINOR,
  WATER,
  WOODS,
} from '@/skins/travel/map/geo';
import {
  FOOTPRINT,
  GROUND_MATRIX,
  WORLD,
  WORLD_OFFSET,
} from '@/skins/travel/map/iso';

/** The thickness of the slab the map sits on, and how far the land stands above the sea (pixels at zoom 1). */
const SLAB = 96;
const LIFT = 16;
const STEP = 8;

const [A, B, C, D] = GROUND_MATRIX;
const GROUND = `matrix(${A} ${B} ${C} ${D} ${WORLD_OFFSET.x} ${WORLD_OFFSET.y})`;
const pts = (list: readonly { x: number; y: number }[]) =>
  list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
const shift = (list: readonly { x: number; y: number }[], dy: number) =>
  list.map((p) => ({ x: p.x, y: p.y + dy }));

const [top, right, bottom, left] = FOOTPRINT;
const WALL_LEFT = [left, bottom, ...shift([bottom, left], SLAB)];
const WALL_RIGHT = [bottom, right, ...shift([right, bottom], SLAB)];
/** The footprint and the two walls: where the slab's land cross-section may show. */
const SLAB_SHAPE = [top, right, ...shift([right, bottom, left], SLAB), left];

/** A hill is a soft light patch on the ground; the mountain itself is a sprite standing on it. */
const hillRadius = (metres: number) => 90 + metres * 0.32;

/** The sea and the slab of the map with its cross-section (static, never re-rendered). */
export const Sea = memo(function Sea() {
  const deep = Array.from(
    { length: Math.ceil(SLAB / (STEP * 1.5)) + 1 },
    (_, i) => i * STEP * 1.5,
  );
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      className='tl-ground absolute top-0 left-0 block overflow-visible'
    >
      <defs>
        <path id='tl-land' d={LAND} vectorEffect='non-scaling-stroke' />
        <clipPath id='tl-slab-clip'>
          <polygon points={pts(SLAB_SHAPE)} />
        </clipPath>
        <clipPath id='tl-top-clip'>
          <polygon points={pts(FOOTPRINT)} />
        </clipPath>
        <clipPath id='tl-walls-clip'>
          <polygon points={pts(WALL_LEFT)} />
          <polygon points={pts(WALL_RIGHT)} />
        </clipPath>
        <linearGradient
          id='tl-sea-fill'
          gradientUnits='userSpaceOnUse'
          x1={left.x}
          y1={top.y}
          x2={right.x}
          y2={bottom.y}
        >
          <stop offset='0' style={{ stopColor: 'var(--tl-sea-1)' }} />
          <stop offset='0.55' style={{ stopColor: 'var(--tl-sea-2)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-sea-3)' }} />
        </linearGradient>
        <linearGradient id='tl-wall-shade' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#000' stopOpacity='0' />
          <stop offset='1' stopColor='#000' stopOpacity='0.42' />
        </linearGradient>
        <radialGradient id='tl-hill-fill'>
          <stop
            offset='0'
            style={{ stopColor: 'var(--tl-hill-t)' }}
            stopOpacity='0.85'
          />
          <stop
            offset='0.55'
            style={{ stopColor: 'var(--tl-hill-s)' }}
            stopOpacity='0.45'
          />
          <stop
            offset='1'
            style={{ stopColor: 'var(--tl-hill-w)' }}
            stopOpacity='0'
          />
        </radialGradient>
      </defs>

      {/* the slab: the sea on top, its two visible walls below */}
      <polygon points={pts(FOOTPRINT)} fill='url(#tl-sea-fill)' />
      <polygon points={pts(WALL_LEFT)} className='fill-tl-sea-3' />
      <polygon points={pts(WALL_RIGHT)} className='fill-tl-sea-2' />
      {/* the earth of the slab under the land */}
      <g clipPath='url(#tl-walls-clip)'>
        {deep.map((dy) => (
          <g key={dy} transform={`translate(0 ${dy}) ${GROUND}`}>
            <use
              href='#tl-land'
              className='fill-tl-soil stroke-tl-soil'
              strokeWidth={STEP * 1.6}
              strokeLinejoin='round'
            />
          </g>
        ))}
      </g>
      <polygon points={pts(WALL_LEFT)} fill='url(#tl-wall-shade)' />
      <polygon points={pts(WALL_RIGHT)} fill='url(#tl-wall-shade)' />

      <g clipPath='url(#tl-slab-clip)'>
        {/* shallow water and foam around the coast */}
        <g transform={GROUND}>
          <use
            href='#tl-land'
            className='fill-none stroke-tl-sea-1'
            strokeWidth={64}
            strokeOpacity={0.3}
            strokeLinejoin='round'
          />
          <use
            href='#tl-land'
            className='fill-none stroke-tl-sea-1'
            strokeWidth={30}
            strokeOpacity={0.5}
            strokeLinejoin='round'
          />
        </g>
        <g transform={`translate(0 ${LIFT}) ${GROUND}`}>
          <use
            href='#tl-land'
            className='fill-none stroke-tl-foam'
            strokeWidth={6}
            strokeOpacity={0.9}
          />
        </g>
      </g>
    </svg>
  );
});

/** The land: its edge (the earth under the top), the top and what lies on it. Drawn over the waves. */
export const Land = memo(function Land() {
  const sweep = Array.from({ length: LIFT / STEP + 1 }, (_, i) => i * STEP);
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      className='tl-ground absolute top-0 left-0 block overflow-visible'
    >
      <g clipPath='url(#tl-slab-clip)'>
        {/* the land stands LIFT pixels above the sea: its edge is the earth */}
        {sweep.map((dy) => (
          <g key={dy} transform={`translate(0 ${LIFT - dy}) ${GROUND}`}>
            <use
              href='#tl-land'
              className={
                dy
                  ? 'fill-tl-soil stroke-tl-soil'
                  : 'fill-tl-soil-2 stroke-tl-soil-2'
              }
              strokeWidth={STEP * 1.6}
              strokeLinejoin='round'
            />
          </g>
        ))}
      </g>

      {/* the top of the land */}
      <g clipPath='url(#tl-top-clip)'>
        <g transform={GROUND}>
          <use href='#tl-land' className='fill-tl-land-1' />
          {PEAKS.map(([x, y, metres]) => (
            <ellipse
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              rx={hillRadius(metres)}
              ry={hillRadius(metres)}
              fill='url(#tl-hill-fill)'
            />
          ))}
          <path d={WOODS} className='fill-tl-wood' fillOpacity={0.75} />
          <path d={BUILT} className='fill-tl-built' fillOpacity={0.9} />
          <path
            d={BEACHES}
            className='fill-tl-sand stroke-tl-sand-2'
            strokeWidth={3}
          />
          <path d={WATER} className='fill-tl-river' />
          <path
            d={RIVERS}
            className='fill-none stroke-tl-river'
            strokeWidth={9}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <g fill='none' strokeLinecap='round' strokeLinejoin='round'>
            <path d={ROADS_MINOR} className='stroke-tl-walk' strokeWidth={7} />
            <path d={ROADS_MAJOR} className='stroke-tl-walk' strokeWidth={15} />
            <path d={ROADS_MAJOR} className='stroke-tl-road' strokeWidth={11} />
            <path
              d={ROADS_MAJOR}
              className='stroke-tl-lane'
              strokeWidth={1.4}
              strokeDasharray='10 14'
            />
          </g>
        </g>
      </g>
    </svg>
  );
});
