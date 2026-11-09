/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { refOf } from '@/skins/moba/map/art-ids';
import { CLEARINGS } from '@/skins/moba/world/decor';
import { LANE_IDS, LANES, RIVER, WORLD } from '@/skins/moba/world/geometry';
import { TRAILS } from '@/skins/moba/world/nav';
import { blobPath, smoothOpen } from '@/skins/moba/world/shapes';

/** The ground: the canopy that fills the walls, the clearings of the jungle, the river, the lanes and the trails. */
export const TerrainLayer = memo(function TerrainLayer({
  p,
  full,
}: {
  p: string;
  full: boolean;
}) {
  const river = smoothOpen(RIVER);
  const trails = TRAILS;
  return (
    <g>
      <rect width={WORLD} height={WORLD} fill={refOf(p, 'void')} />
      <rect
        width={WORLD}
        height={WORLD}
        fill={full ? refOf(p, 'canopy') : 'var(--mb-m-wall)'}
      />
      {/* a vignette that darkens the corners, so the eye stays on the lanes */}
      <rect
        width={WORLD}
        height={WORLD}
        fill={refOf(p, 'void')}
        opacity='0.35'
      />
      {CLEARINGS.map((c) => {
        const d = blobPath(c.centre, c.rx, c.ry, c.seed);
        return (
          <g key={c.id}>
            <path
              d={d}
              fill='none'
              stroke='#000'
              strokeOpacity='0.35'
              strokeWidth='34'
              strokeLinejoin='round'
            />
            <path
              d={d}
              fill='none'
              stroke='var(--mb-m-rock-2)'
              strokeWidth='16'
              strokeLinejoin='round'
            />
            <path d={d} fill={refOf(p, 'floor')} />
            {full && <path d={d} fill={refOf(p, 'tufts')} />}
            <path
              d={d}
              fill='none'
              stroke='var(--mb-m-rock-1)'
              strokeOpacity='0.55'
              strokeWidth='2.5'
              transform='translate(-2 -3)'
            />
          </g>
        );
      })}
      {trails.map((line) => {
        const d = line
          .map((pt, i) => `${i ? 'L' : 'M'}${pt.x} ${pt.y}`)
          .join('');
        return (
          <g key={d}>
            <path
              d={d}
              fill='none'
              stroke='var(--mb-m-trail)'
              strokeOpacity='0.7'
              strokeWidth='22'
              strokeLinecap='round'
            />
            <path
              d={d}
              fill='none'
              stroke='var(--mb-m-lane-1)'
              strokeOpacity='0.35'
              strokeWidth='2'
              strokeDasharray='2 12'
              strokeLinecap='round'
            />
          </g>
        );
      })}
      {/* the river: a carved bed, its banks, the water and the foam that drifts down it */}
      <g>
        <path
          d={river}
          fill='none'
          stroke='var(--mb-m-wall)'
          strokeWidth='212'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d={river}
          fill='none'
          stroke='var(--mb-m-rock-2)'
          strokeWidth='188'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d={river}
          fill='none'
          stroke='var(--mb-m-floor-2)'
          strokeWidth='168'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d={river}
          fill='none'
          stroke='var(--mb-m-river-3)'
          strokeWidth='126'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d={river}
          fill='none'
          stroke='var(--mb-m-river-2)'
          strokeWidth='98'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d={river}
          fill='none'
          stroke='var(--mb-m-river-1)'
          strokeOpacity='0.55'
          strokeWidth='52'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        {full && (
          <>
            <path
              d={river}
              className='mb-flow'
              fill='none'
              stroke='var(--mb-m-foam)'
              strokeOpacity='0.55'
              strokeWidth='3'
              strokeDasharray='26 54'
              strokeLinecap='round'
              transform='translate(-22 22)'
            />
            <path
              d={river}
              className='mb-flow mb-flow-slow'
              fill='none'
              stroke='var(--mb-m-foam)'
              strokeOpacity='0.4'
              strokeWidth='2'
              strokeDasharray='14 70'
              strokeLinecap='round'
              transform='translate(20 -20)'
            />
          </>
        )}
      </g>
      {LANE_IDS.map((lane) => (
        <g key={lane}>
          <path
            d={LANES[lane].d}
            fill='none'
            stroke='#000'
            strokeOpacity='0.4'
            strokeWidth='108'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d={LANES[lane].d}
            fill='none'
            stroke='var(--mb-m-lane-edge)'
            strokeWidth='94'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d={LANES[lane].d}
            fill='none'
            stroke={full ? refOf(p, 'cobble') : refOf(p, 'lane')}
            strokeWidth='80'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d={LANES[lane].d}
            fill='none'
            stroke='var(--mb-gold-hi)'
            strokeOpacity='0.22'
            strokeWidth='2'
            strokeDasharray='3 15'
            strokeLinecap='round'
          />
        </g>
      ))}
    </g>
  );
});
