/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A band of mist caught on a slope: a soft lumpy cloud with a paler streak above its lower edge. It is centred on (x, y) and `w` wide. */
export function Mist({
  x,
  y,
  w,
  h = 7,
  opacity = 0.7,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  opacity?: number;
}) {
  const band = `M${-w / 2} 0 C${-w / 2} ${-h * 0.7} ${-w * 0.36} ${-h * 0.9} ${-w * 0.28} ${-h * 0.5} C${-w * 0.22} ${-h * 1.3} ${-w * 0.02} ${-h * 1.2} ${w * 0.04} ${-h * 0.6} C${w * 0.12} ${-h * 1.1} ${w * 0.3} ${-h * 0.9} ${w * 0.3} ${-h * 0.4} C${w * 0.44} ${-h * 0.6} ${w / 2} ${-h * 0.2} ${w / 2} 0 Q0 ${h * 0.5} ${-w / 2} 0z`;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <path d={band} className='fill-tl-cloud' />
      <path
        d={`M${-w * 0.36} ${-h * 0.1} Q${-w * 0.1} ${-h * 0.4} ${w * 0.2} ${-h * 0.1}`}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.5}
        strokeWidth={1.1}
        strokeLinecap='round'
      />
    </g>
  );
}
