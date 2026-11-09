/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A drying rack for fish and nets: two forked posts, a pole between them and a net with mesh and a row of split fish hanging from it. */
export function DryingRack({ x, y }: { x: number; y: number }) {
  const len = 16;
  const top = -9;
  const fish = [3, 6.5, 10, 13]
    .map((k) => `M${x + k} ${y + top - k / 2 + 1}v3.4`)
    .join('');
  return (
    <g>
      <path
        d={`M${x} ${y}V${top + y}M${x + len} ${y - len / 2}V${y - len / 2 + top}M${x - 1.4} ${y + top - 0.4}L${x + len + 1.4} ${y - len / 2 + top - 0.4}`}
        className='fill-none stroke-tl-trunk'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      <path
        d={`M${x} ${y + top}L${x + len} ${y - len / 2 + top}V${y - len / 2 + top + 6}L${x} ${y + top + 6}z`}
        className='fill-tl-teal'
        opacity={0.5}
      />
      <path
        d={fish}
        className='fill-none stroke-tl-foam'
        strokeWidth={1.4}
        strokeLinecap='round'
        opacity={0.95}
      />
    </g>
  );
}
