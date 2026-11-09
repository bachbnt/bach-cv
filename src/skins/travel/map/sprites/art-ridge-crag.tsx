/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** An angular rock outcrop or cliff face: a dark body, a lit facet on the left, a shaded facet on the right and a crack. It stands on (x, y). */
export function Crag({
  x,
  y,
  w,
  h,
  lean = 0,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Shifts the top sideways so a face can tilt. */
  lean?: number;
}) {
  const top = lean;
  const body = `M${-w / 2} 0 L${-w * 0.36} ${-h * 0.66} L${top - w * 0.08} ${-h} L${top + w * 0.3} ${-h * 0.74} L${w / 2} 0z`;
  const litFacet = `M${-w / 2} 0 L${-w * 0.36} ${-h * 0.66} L${top - w * 0.08} ${-h} L${top - w * 0.02} ${-h * 0.4} L${-w * 0.1} 0z`;
  const shadeFacet = `M${top + w * 0.02} ${-h * 0.5} L${top + w * 0.3} ${-h * 0.74} L${w / 2} 0 L${w * 0.04} 0z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={body} className='fill-tl-rock' />
      <path d={litFacet} className='fill-tl-rock-2' />
      <path d={shadeFacet} className={WASH_DARK} opacity={0.24} />
      <path
        d={`M${top - w * 0.02} ${-h * 0.4} l${w * 0.08} ${h * 0.2} l${-w * 0.04} ${h * 0.2}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.35}
        strokeWidth={0.7}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
  );
}
