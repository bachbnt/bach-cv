/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A tiny boat seen from the front left: hull, white rail, cabin and a canopy. Stands on (x, y) at the waterline. */
export function Dinghy({
  x,
  y,
  s = 1,
  canopy = 'fill-tl-coral',
}: {
  x: number;
  y: number;
  s?: number;
  canopy?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse
        cx={0}
        cy={5.4}
        rx={11}
        ry={2.4}
        className='fill-none stroke-tl-foam'
        strokeWidth={1}
        opacity={0.8}
      />
      <path d='M-9 0 H9 L6 5 Q0 6.6 -6 5z' className='fill-tl-hull' />
      <path d='M-9 0 H9 l-0.6 1.8 H-8.4z' className='fill-tl-foam' />
      <rect x={-3} y={-5} width={7} height={5} className='fill-tl-wall' />
      <rect
        x={-4.5}
        y={-7}
        width={10}
        height={2.4}
        rx={1.2}
        className={canopy}
      />
    </g>
  );
}
