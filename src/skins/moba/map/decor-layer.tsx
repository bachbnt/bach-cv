/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { refOf } from '@/skins/moba/map/art-ids';
import {
  BRUSH,
  CAMPS,
  CLEARINGS,
  edgeProps,
  type CampKind,
} from '@/skins/moba/world/decor';
import { brushBlades, rockPaths } from '@/skins/moba/world/shapes';

/** The mark inside a monster camp. */
function CampMark({ kind }: { kind: CampKind }) {
  if (kind === 'paw')
    return (
      <g fill='var(--mb-gold-hi)' fillOpacity='0.85'>
        <ellipse cx='0' cy='4' rx='6' ry='5' />
        <circle cx='-8' cy='-3' r='2.6' />
        <circle cx='-3' cy='-8' r='2.6' />
        <circle cx='3' cy='-8' r='2.6' />
        <circle cx='8' cy='-3' r='2.6' />
      </g>
    );
  if (kind === 'crystal')
    return (
      <g>
        <path
          d='M0 -11 L7 0 L0 11 L-7 0Z'
          fill='var(--mb-teal)'
          fillOpacity='0.9'
        />
        <path d='M0 -11 L7 0 L0 0Z' fill='#fff' fillOpacity='0.35' />
      </g>
    );
  return (
    <path
      d='M-9 6 Q-9 -8 -1 -10 Q-4 -3 0 -1 Q4 -3 1 -10 Q9 -8 9 6 Q4 3 0 6 Q-4 3 -9 6Z'
      fill='var(--mb-gold-hi)'
      fillOpacity='0.85'
    />
  );
}

/** Brush, rocks, big trees on the edge of the clearings, and the monster camps: all decoration. */
export const DecorLayer = memo(function DecorLayer({ p }: { p: string }) {
  return (
    <g>
      {CLEARINGS.flatMap((c) => [
        ...edgeProps(c, 8, 1).map((at, i) => {
          const rock = rockPaths(at, 12 + (i % 3) * 3, c.seed * 7 + i);
          return (
            <g key={`${c.id}-rock-${i}`}>
              <ellipse
                cx={at.x + 3}
                cy={at.y + 7}
                rx='17'
                ry='7'
                fill={refOf(p, 'shade')}
              />
              <path d={rock.shade} fill='var(--mb-m-rock-2)' />
              <path d={rock.lit} fill='var(--mb-m-rock-1)' />
            </g>
          );
        }),
        ...edgeProps(c, 7, 2).map((at, i) => (
          <g key={`${c.id}-tree-${i}`} transform={`translate(${at.x} ${at.y})`}>
            <ellipse cx='5' cy='10' rx='24' ry='9' fill={refOf(p, 'shade')} />
            <circle r={22 + (i % 3) * 3} fill={refOf(p, 'tree')} />
            <circle
              cx='-6'
              cy='-7'
              r='7'
              fill='var(--mb-m-moss)'
              opacity='0.4'
            />
          </g>
        )),
      ])}
      {BRUSH.map((at, i) => (
        <g key={`brush-${i}`}>
          <ellipse
            cx={at.x}
            cy={at.y + 6}
            rx='46'
            ry='22'
            fill='var(--mb-m-brush-2)'
            opacity='0.8'
          />
          {brushBlades(at, 24, 500 + i).map((blade, k) => (
            <path
              key={k}
              d={blade.d}
              transform={`translate(${blade.at.x} ${blade.at.y})`}
              fill={blade.shade ? 'var(--mb-m-brush-2)' : 'var(--mb-m-brush-1)'}
              stroke='var(--mb-m-wall)'
              strokeOpacity='0.5'
              strokeWidth='0.8'
            />
          ))}
        </g>
      ))}
      {CAMPS.map((camp, i) => (
        <g key={`camp-${i}`} transform={`translate(${camp.at.x} ${camp.at.y})`}>
          <circle r='34' fill={refOf(p, 'shade')} />
          <circle
            r='25'
            fill='var(--mb-m-wall)'
            fillOpacity='0.78'
            stroke='var(--mb-gold-lo)'
            strokeWidth='2'
          />
          <circle
            r='29'
            fill='none'
            stroke='var(--mb-gold)'
            strokeOpacity='0.55'
            strokeWidth='1.4'
            strokeDasharray='4 6'
          />
          <CampMark kind={camp.kind} />
        </g>
      ))}
    </g>
  );
});
