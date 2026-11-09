/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

const STEMS = [
  { dx: -4, h: 34, bend: -3 },
  { dx: 0, h: 40, bend: 2 },
  { dx: 4.5, h: 29, bend: 4 },
] as const;

/** A clump of bamboo: three jointed canes with a tuft of narrow leaves at the top of each. */
export function Bamboo({ x, y }: { x: number; y: number }) {
  const canes = STEMS.map(
    (s) =>
      `M${s.dx} 0 Q${s.dx + s.bend} ${-s.h / 2} ${s.dx + s.bend * 1.4} ${-s.h}`,
  ).join(' ');
  const joints = STEMS.map((s) =>
    [0.3, 0.55, 0.8]
      .map((k) => `M${s.dx + s.bend * 0.8 * k - 1.5} ${-s.h * k} h3`)
      .join(' '),
  ).join(' ');
  const tufts = STEMS.map((s) => {
    const tx = s.dx + s.bend * 1.4;
    return `M${tx} ${-s.h} q-9 -2 -12 4 q7 -1 12 -4 M${tx} ${-s.h} q8 -4 13 1 q-7 -1 -13 -1 M${tx} ${-s.h} q-2 -8 -7 -10 q6 3 7 10`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={canes}
        className='fill-none stroke-tl-park'
        strokeWidth={2.2}
        strokeLinecap='round'
      />
      <path
        d={joints}
        className='fill-none stroke-tl-hill-w'
        strokeWidth={0.7}
      />
      <path d={tufts} className='fill-tl-leaf' />
    </g>
  );
}
