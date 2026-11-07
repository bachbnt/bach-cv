/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { idOf } from '@/skins/moba/map/art-ids';
import { WORLD, type Pt } from '@/skins/moba/world/geometry';

/** The fog of war: the map is dark where the champion has not been, and the places it has walked past are cleared. */
export const FogLayer = memo(function FogLayer({
  p,
  explored,
  vision,
  strength,
}: {
  p: string;
  explored: Pt[];
  vision: number;
  strength: number;
}) {
  const mask = idOf(p, 'fog-mask');
  const clear = idOf(p, 'fog-clear');
  return (
    <svg
      viewBox={`0 0 ${WORLD} ${WORLD}`}
      className='pointer-events-none absolute inset-0 size-full'
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <radialGradient id={clear}>
          <stop offset='0' stopColor='#000' />
          <stop offset='0.55' stopColor='#000' />
          <stop offset='1' stopColor='#000' stopOpacity='0' />
        </radialGradient>
        <mask
          id={mask}
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width={WORLD}
          height={WORLD}
        >
          <rect width={WORLD} height={WORLD} fill='#fff' />
          {explored.map((at) => (
            <circle
              key={`${at.x}-${at.y}`}
              cx={at.x}
              cy={at.y}
              r={vision}
              fill={`url(#${clear})`}
            />
          ))}
        </mask>
      </defs>
      <rect
        width={WORLD}
        height={WORLD}
        fill='var(--mb-m-fog)'
        opacity={strength}
        mask={`url(#${mask})`}
      />
    </svg>
  );
});
