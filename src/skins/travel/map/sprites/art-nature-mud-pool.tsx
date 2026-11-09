/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** A sunken mud bath: a stone rim with joints, grey-brown mud with a few bubbles, and two bathers up to their shoulders. */
export function MudPool({ x, y, rx }: { x: number; y: number; rx: number }) {
  const ry = rx / 2;
  const joints = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    return `M${x + (rx - 1) * c} ${y + (ry - 0.5) * s} L${x + (rx + 3.4) * c} ${y + (ry + 1.7) * s}`;
  }).join(' ');
  return (
    <g>
      <ellipse
        cx={x}
        cy={y + 3.5}
        rx={rx + 4}
        ry={ry + 2.4}
        className='fill-tl-rock'
      />
      <ellipse
        cx={x}
        cy={y}
        rx={rx + 4}
        ry={ry + 2.4}
        className='fill-tl-rock-2'
      />
      <path
        d={joints}
        className='fill-none stroke-tl-rock'
        strokeOpacity={0.55}
        strokeWidth={0.8}
      />
      <ellipse
        cx={x}
        cy={y}
        rx={rx}
        ry={ry}
        className={WASH_DARK}
        opacity={0.5}
      />
      <ellipse
        cx={x}
        cy={y + 1.8}
        rx={rx}
        ry={ry - 0.4}
        className='fill-tl-soil'
      />
      <ellipse
        cx={x}
        cy={y + 1.8}
        rx={rx}
        ry={ry - 0.4}
        className='fill-tl-rock'
        opacity={0.34}
      />
      <ellipse
        cx={x + rx * 0.25}
        cy={y + ry * 0.7}
        rx={rx * 0.6}
        ry={ry * 0.4}
        className={WASH_DARK}
        opacity={0.18}
      />
      <path
        d={`M${x - rx * 0.7} ${y + ry * 0.05} q${rx * 0.25} ${-ry * 0.35} ${rx * 0.55} ${-ry * 0.25} M${x + rx * 0.15} ${y + ry * 0.55} q${rx * 0.2} ${ry * 0.15} ${rx * 0.4} ${-ry * 0.05}`}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.45}
        strokeWidth={1.1}
        strokeLinecap='round'
      />
      <g className='fill-tl-rock-2'>
        <circle cx={x + rx * 0.5} cy={y + ry * 0.1} r={1.5} />
        <circle cx={x + rx * 0.62} cy={y + ry * 0.38} r={1} />
        <circle cx={x - rx * 0.05} cy={y + ry * 0.62} r={1.1} />
      </g>
      <g className='fill-tl-soil-2'>
        <ellipse cx={x - rx * 0.42} cy={y + ry * 0.42} rx={4.6} ry={2.6} />
        <circle cx={x - rx * 0.42} cy={y + ry * 0.1} r={2.7} />
        <ellipse cx={x + rx * 0.02} cy={y + ry * 0.62} rx={4} ry={2.2} />
        <circle cx={x + rx * 0.02} cy={y + ry * 0.34} r={2.4} />
      </g>
    </g>
  );
}
