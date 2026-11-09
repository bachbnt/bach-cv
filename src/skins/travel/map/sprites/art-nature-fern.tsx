/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

const ANGLES = [-72, -44, -16, 14, 42, 70] as const; // degrees from straight up

/** A leaf as a lens from the origin to a tip, bent a little to the side. */
const frond = (deg: number, len: number) => {
  const a = (deg * Math.PI) / 180;
  const [dx, dy] = [Math.sin(a), -Math.cos(a)];
  const tip = [dx * len, dy * len];
  const mid = [dx * len * 0.55, dy * len * 0.55];
  const n = [-dy * len * 0.2, dx * len * 0.2];
  return `M0 0 Q${mid[0] + n[0]} ${mid[1] + n[1]} ${tip[0]} ${tip[1]} Q${mid[0] - n[0]} ${mid[1] - n[1]} 0 0z`;
};

/** A big fern or banana plant: a fan of leaves with a shaded right half and a lit left half. */
export function Fern({
  x,
  y,
  s = 1,
  leaf = 'fill-tl-leaf',
}: {
  x: number;
  y: number;
  s?: number;
  leaf?: string;
}) {
  const d = ANGLES.map((deg, i) => frond(deg, i % 2 ? 22 : 17)).join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={d} className={leaf} />
      <path
        d={frond(14, 22) + frond(42, 17) + frond(70, 22)}
        className={WASH_DARK}
        opacity={0.22}
      />
      <path
        d={frond(-44, 22) + frond(-16, 17)}
        className={WASH_LIGHT}
        opacity={0.22}
      />
    </g>
  );
}
