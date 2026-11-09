/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/**
 * A granite boulder with volume: a shaded body, a lit cap pushed to the upper left, a dark flank on the right, a rim light, a crack
 * and optional green lichen. It stands on (x, y), `turn` tips it a few degrees (a balanced stone) and `grounded` adds the shadow on the earth.
 */
export function Granite({
  x,
  y,
  rx,
  ry,
  turn = 0,
  lichen = false,
  grounded = false,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  turn?: number;
  lichen?: boolean;
  grounded?: boolean;
}) {
  const body = `M${-rx} ${-ry * 0.55} C${-rx * 1.02} ${-ry * 1.5} ${-rx * 0.4} ${-ry * 1.95} ${rx * 0.15} ${-ry * 1.9} C${rx * 0.8} ${-ry * 1.85} ${rx * 1.05} ${-ry * 1.2} ${rx * 0.95} ${-ry * 0.6} C${rx * 0.9} ${-ry * 0.05} ${rx * 0.4} 0 0 0 C${-rx * 0.5} 0 ${-rx * 0.98} ${-ry * 0.05} ${-rx} ${-ry * 0.55}Z`;
  const flank = `M${rx * 0.25} ${-ry * 1.88} C${rx * 0.85} ${-ry * 1.85} ${rx * 1.05} ${-ry * 1.2} ${rx * 0.95} ${-ry * 0.6} C${rx * 0.9} ${-ry * 0.05} ${rx * 0.4} 0 0 0 C${rx * 0.6} ${-ry * 0.1} ${rx * 0.78} ${-ry * 0.7} ${rx * 0.62} ${-ry * 1.3} C${rx * 0.52} ${-ry * 1.6} ${rx * 0.4} ${-ry * 1.8} ${rx * 0.25} ${-ry * 1.88}z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      {grounded && (
        <ellipse
          cx={rx * 0.12}
          cy={0}
          rx={rx * 1.1}
          ry={ry * 0.26}
          className={WASH_DARK}
          opacity={0.28}
        />
      )}
      <path d={body} className='fill-tl-rock' />
      <path
        d={body}
        className='fill-tl-rock-2'
        transform={`translate(${-rx * 0.1} ${-ry * 1.1}) scale(0.88 0.86) translate(0 ${ry})`}
      />
      <path d={flank} className={WASH_DARK} opacity={0.2} />
      <ellipse
        cx={-rx * 0.4}
        cy={-ry * 1.5}
        rx={rx * 0.26}
        ry={ry * 0.17}
        className={WASH_LIGHT}
        opacity={0.4}
        transform={`rotate(-24 ${-rx * 0.4} ${-ry * 1.5})`}
      />
      <path
        d={`M${-rx * 0.12} ${-ry * 1.7} q${rx * 0.14} ${ry * 0.4} ${-rx * 0.02} ${ry * 0.74} q${rx * 0.12} ${ry * 0.3} ${rx * 0.04} ${ry * 0.5} M${-rx * 0.1} ${-ry * 0.9} q${rx * 0.2} ${ry * 0.04} ${rx * 0.3} ${ry * 0.24}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.32}
        strokeWidth={0.8}
        strokeLinecap='round'
      />
      {lichen && (
        <ellipse
          cx={rx * 0.28}
          cy={-ry * 0.85}
          rx={rx * 0.18}
          ry={ry * 0.1}
          className='fill-tl-leaf'
          opacity={0.5}
        />
      )}
    </g>
  );
}
