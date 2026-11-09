/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A grassy hill like `Mound`, without its ridge highlight, with soft terrace lines across the slope (`bands` are the heights, 0 to 1). */
export function SlopeHill({
  x,
  y,
  w,
  h,
  bands,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  bands: readonly number[];
}) {
  const body = `M${-w / 2} 0 C${-w * 0.42} ${-h * 1.1} ${w * 0.42} ${-h * 1.1} ${w / 2} 0 Q0 ${h * 0.22} ${-w / 2} 0Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={body} className='fill-tl-hill-w' />
      <path
        d={body}
        className='fill-tl-hill-s'
        transform={`translate(${-w * 0.03} ${-h * 0.03}) scale(0.9 0.86)`}
      />
      <path
        d={bands
          .map((b) => {
            const half = w * 0.5 * Math.sqrt(1 - b * b) * 0.86;
            const lift = h * 0.8 * b;
            return `M${-half} ${-lift} Q0 ${-lift - h * 0.1} ${half} ${-lift}`;
          })
          .join(' ')}
        className='fill-none stroke-tl-hill-t'
        strokeWidth={1.4}
        strokeLinecap='round'
        opacity={0.7}
      />
    </g>
  );
}
