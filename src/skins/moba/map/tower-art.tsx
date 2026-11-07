/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';
import { hexPath } from '@/skins/moba/world/shapes';

const ORIGIN = { x: 0, y: 0 };

/** A tower seen from above: a round stone base, a plinth and the crystal of its team on top. */
export function TowerArt({
  p,
  team,
  scale = 1,
  broken = false,
}: {
  p: string;
  team: 'blue' | 'red';
  scale?: number;
  /** a tower the visitor has taken: it goes out */
  broken?: boolean;
}) {
  const color = `var(--mb-team-${team})`;
  return (
    <g transform={`scale(${scale})`} opacity={broken ? 0.9 : 1}>
      <circle
        r='36'
        fill={refOf(p, `glow-${team}`)}
        opacity={broken ? 0.25 : 0.9}
      />
      <ellipse cx='6' cy='13' rx='24' ry='10' fill={refOf(p, 'shade')} />
      <path
        d={hexPath(ORIGIN, 21, Math.PI / 6)}
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2'
      />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return (
          <rect
            key={i}
            x='-3.2'
            y='-3.2'
            width='6.4'
            height='6.4'
            rx='1'
            transform={`translate(${Math.cos(a) * 18} ${Math.sin(a) * 18}) rotate(${(a * 180) / Math.PI})`}
            fill='var(--mb-m-rock-1)'
            stroke='var(--mb-gold-lo)'
            strokeWidth='0.8'
          />
        );
      })}
      <circle
        r='13.5'
        fill={refOf(p, 'stone')}
        stroke='var(--mb-gold)'
        strokeOpacity='0.6'
        strokeWidth='1.2'
      />
      <path
        d={hexPath(ORIGIN, 10.5, 0)}
        fill={color}
        fillOpacity={broken ? 0.4 : 1}
        stroke='var(--mb-gold-hi)'
        strokeOpacity='0.75'
        strokeWidth='1'
      />
      <path
        d='M0 -10.5 L9.1 -5.25 L0 0Z M9.1 5.25 L0 10.5 L-9.1 5.25 L0 0Z'
        fill='#fff'
        fillOpacity='0.22'
      />
      <circle r='4.4' fill='#fff' fillOpacity='0.9' />
    </g>
  );
}

/** An inhibitor: a diamond crystal on a small plate. */
export function InhibitorArt({ p, team }: { p: string; team: 'blue' | 'red' }) {
  const color = `var(--mb-team-${team})`;
  return (
    <g>
      <circle r='28' fill={refOf(p, `glow-${team}`)} opacity='0.8' />
      <ellipse cx='4' cy='9' rx='16' ry='6' fill={refOf(p, 'shade')} />
      <circle
        r='13'
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='1.5'
      />
      <path
        d='M0 -11 L8 0 L0 11 L-8 0Z'
        fill={color}
        stroke='var(--mb-gold-hi)'
        strokeOpacity='0.8'
        strokeWidth='1.2'
      />
      <path d='M0 -11 L8 0 L0 0Z' fill='#fff' fillOpacity='0.4' />
    </g>
  );
}
