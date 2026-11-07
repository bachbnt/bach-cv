/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';
import { hexPath } from '@/skins/moba/world/shapes';

const ORIGIN = { x: 0, y: 0 };

/** The nexus: a crystal on a hexagonal plinth, with a halo that breathes. */
export function NexusArt({
  p,
  team,
  scale = 1,
}: {
  p: string;
  team: 'blue' | 'red';
  scale?: number;
}) {
  const color = `var(--mb-team-${team})`;
  return (
    <g transform={`scale(${scale})`}>
      <circle r='86' fill={refOf(p, `glow-${team}`)} className='mb-pulse' />
      <ellipse cx='7' cy='16' rx='46' ry='18' fill={refOf(p, 'shade')} />
      <path
        d={hexPath(ORIGIN, 42, Math.PI / 6)}
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2.5'
      />
      <path
        d={hexPath(ORIGIN, 35, Math.PI / 6)}
        fill={refOf(p, 'stone')}
        stroke='var(--mb-gold)'
        strokeOpacity='0.6'
        strokeWidth='1.5'
      />
      <path
        d={hexPath(ORIGIN, 26, 0)}
        fill={color}
        fillOpacity='0.28'
        stroke={color}
        strokeWidth='2'
      />
      <path
        d='M0 -27 L11 -9 L27 0 L11 9 L0 27 L-11 9 L-27 0 L-11 -9Z'
        fill={color}
        stroke='var(--mb-gold-hi)'
        strokeOpacity='0.8'
        strokeWidth='1.6'
      />
      <path d='M0 -27 L11 -9 L0 0 L-11 -9Z' fill='#fff' fillOpacity='0.45' />
      <circle r='5' fill='#fff' fillOpacity='0.9' />
    </g>
  );
}
