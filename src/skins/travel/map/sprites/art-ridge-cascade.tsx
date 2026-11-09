/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * A stream that runs down a gully into a small pool at the foot of the mountain: a dark cut in the slope, the water with a falling
 * dashed streak (`tl-fall`, it moves only when the map is zoomed in) and the foam where it lands. `path` is the course from the
 * top, `gradient` the id of a vertical gradient defined by the caller.
 */
export function Cascade({
  path,
  poolX,
  poolY,
  gradient,
}: {
  path: string;
  poolX: number;
  poolY: number;
  gradient: string;
}) {
  return (
    <g>
      <path
        d={path}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.35}
        strokeWidth={5}
        strokeLinecap='round'
      />
      <path
        d={path}
        fill='none'
        stroke={`url(#${gradient})`}
        strokeWidth={2.2}
        strokeLinecap='round'
      />
      <path
        d={path}
        className='tl-fall fill-none stroke-tl-teal'
        strokeOpacity={0.75}
        strokeWidth={1}
        strokeLinecap='round'
      />
      <ellipse
        cx={poolX}
        cy={poolY}
        rx={8}
        ry={2.6}
        className='fill-tl-river'
      />
      <ellipse
        cx={poolX - 1}
        cy={poolY - 0.5}
        rx={5}
        ry={1.5}
        className='fill-tl-foam'
        opacity={0.4}
      />
      <ellipse
        cx={poolX}
        cy={poolY - 2.2}
        rx={3.4}
        ry={1.2}
        className='fill-tl-foam'
        opacity={0.8}
      />
    </g>
  );
}
