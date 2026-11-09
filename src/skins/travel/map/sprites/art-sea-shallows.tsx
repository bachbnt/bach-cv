/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Shallow water around an island: a foam halo, a turquoise disc and a dashed shoreline ring. */
export function Shallows({
  rx,
  ry,
  cy = 146,
  tone = 'fill-tl-sea-1',
}: {
  rx: number;
  ry: number;
  cy?: number;
  tone?: string;
}) {
  return (
    <g>
      <ellipse
        cx={80}
        cy={cy}
        rx={rx + 6}
        ry={ry + 2.5}
        className='fill-tl-foam'
        opacity={0.5}
      />
      <ellipse cx={80} cy={cy} rx={rx} ry={ry} className={tone} />
      <ellipse
        cx={80}
        cy={cy - 1.5}
        rx={rx}
        ry={ry}
        className='fill-none stroke-tl-foam'
        strokeWidth={1.3}
        strokeDasharray='6 5'
        opacity={0.7}
      />
    </g>
  );
}
