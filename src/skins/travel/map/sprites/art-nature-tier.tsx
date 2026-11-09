/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/**
 * One step of the Ba Ho falls: a sheet of water that drops from `top` to `bottom` between two widths, and the clear pool it lands
 * in (a rock rim, a lit pool and the foam of the splash). The strokes are the water that moves when the map is zoomed in (`tl-fall`).
 */
export function Tier({
  x,
  top,
  bottom,
  wTop,
  wBottom,
  pool,
  gradient,
}: {
  x: number;
  top: number;
  bottom: number;
  wTop: number;
  wBottom: number;
  pool: { rx: number; ry: number };
  gradient: string;
}) {
  const { rx, ry } = pool;
  const lines = [-0.3, 0.1, 0.35]
    .map((k) => `M${x + k * wTop} ${top + 2} L${x + k * wBottom} ${bottom - 1}`)
    .join(' ');
  return (
    <g>
      <ellipse
        cx={x}
        cy={bottom + 3}
        rx={rx + 4}
        ry={ry + 2.5}
        className='fill-tl-rock'
      />
      <ellipse
        cx={x}
        cy={bottom + 1}
        rx={rx + 4}
        ry={ry + 2.5}
        className='fill-tl-rock-2'
      />
      <ellipse
        cx={x}
        cy={bottom + 2}
        rx={rx}
        ry={ry}
        className='fill-tl-river'
      />
      <ellipse
        cx={x - rx * 0.1}
        cy={bottom + 2.6}
        rx={rx * 0.74}
        ry={ry * 0.6}
        className='fill-tl-glass'
      />
      <ellipse
        cx={x + rx * 0.3}
        cy={bottom + 3.4}
        rx={rx * 0.5}
        ry={ry * 0.35}
        className={WASH_DARK}
        opacity={0.12}
      />
      <path
        d={`M${x - wTop / 2} ${top} L${x - wBottom / 2} ${bottom} Q${x} ${bottom + 3} ${x + wBottom / 2} ${bottom} L${x + wTop / 2} ${top}z`}
        fill={`url(#${gradient})`}
      />
      <path
        d={lines}
        className='tl-fall fill-none stroke-tl-teal'
        strokeOpacity={0.8}
        strokeWidth={1.1}
        strokeLinecap='round'
      />
      <ellipse
        cx={x}
        cy={bottom + 1.5}
        rx={wBottom * 0.62}
        ry={ry * 0.5}
        className='fill-tl-foam'
        opacity={0.85}
      />
    </g>
  );
}
