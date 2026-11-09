/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  OnFace,
  WASH_DARK,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/**
 * A low fishing-village house: lime-washed walls, a gable end facing the viewer and a roof of tin or tiles (`roof` is a `fill-tl-*`
 * class; tin has corrugations). Stands on its front corner (x, y).
 */
export function House({
  x,
  y,
  roof,
  tin = false,
  wl = 9,
  wr = 13,
  h = 7,
}: {
  x: number;
  y: number;
  roof: string;
  tin?: boolean;
  wl?: number;
  wr?: number;
  h?: number;
}) {
  const rise = 4.6;
  const over = 1.4;
  const shape: BoxShape = { cx: 0, y: 0, wl, wr, h };
  const left = `M${-wl} ${-wl / 2}L0 0V${-h}L${-wl} ${-h - wl / 2}z`;
  const right = `M0 0L${wr} ${-wr / 2}V${-h - wr / 2}L0 ${-h}z`;
  const apex = [-wl / 2, -h - wl / 4 - rise] as const;
  const slope = `M${-over} ${-h + over / 2}L${wr + over} ${-h - (wr + over) / 2 + over / 2}L${apex[0] + wr + over} ${apex[1] - (wr + over) / 2}L${apex[0] - over} ${apex[1] + over / 2}z`;
  const ribs = [0.25, 0.5, 0.75]
    .map((k) => {
      const px = k * wr;
      return `M${px} ${-h - px / 2 + 0.4}L${px + apex[0]} ${apex[1] - px / 2}`;
    })
    .join('');
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={left} className='fill-tl-wall' />
      <path d={right} className='fill-tl-wall' />
      <path d={right} className={WASH_DARK} opacity={0.27} />
      <OnFace shape={shape} side='l' at={0.55}>
        <rect
          x={-2}
          y={-5.4}
          width={4}
          height={4.4}
          rx={0.6}
          className='fill-tl-glass'
        />
      </OnFace>
      <path
        d={`M${-wl} ${-h - wl / 2}L${apex[0]} ${apex[1]}L0 ${-h}z`}
        className='fill-tl-wall'
      />
      <path d={slope} className={roof} />
      <path d={slope} className={WASH_DARK} opacity={0.22} />
      {tin && (
        <path
          d={ribs}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.3}
          strokeWidth={0.6}
        />
      )}
    </g>
  );
}
