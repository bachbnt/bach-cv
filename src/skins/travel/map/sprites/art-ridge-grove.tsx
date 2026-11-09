/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/**
 * A clump of tree crowns seen from the side of a mountain: one body of merged round crowns, with a pale highlight on a lit slope.
 * A clump in shade has none, the dark flank drawn over it shades it. It stands on (x, y) and is `w` wide.
 */
export function Grove({
  x,
  y,
  w,
  lit = true,
  tone = 'fill-tl-leaf',
}: {
  x: number;
  y: number;
  w: number;
  lit?: boolean;
  tone?: string;
}) {
  const bumps = Math.max(2, Math.round(w / 5.5));
  const rx = w / bumps / 2;
  const drop = w * 0.3;
  let d = `M${-w / 2} ${-drop}`;
  for (let i = 0; i < bumps; i++) {
    d += ` a${rx} ${i % 2 === 0 ? rx * 1.3 : rx * 1.05} 0 0 1 ${rx * 2} 0`;
  }
  d += ` Q${w / 2} 0 0 0 Q${-w / 2} 0 ${-w / 2} ${-drop}z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} className={tone} />
      {lit && (
        <ellipse
          cx={-w * 0.2}
          cy={-drop - rx * 0.9}
          rx={w * 0.22}
          ry={rx * 0.5}
          className={WASH_LIGHT}
          opacity={0.3}
        />
      )}
    </g>
  );
}
