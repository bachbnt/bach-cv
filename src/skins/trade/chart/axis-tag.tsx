/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Frame } from '@/skins/trade/chart/frame';

/** The tag on the price scale at height `y`. */
export function AxisTag({
  frame,
  y,
  text,
  className,
}: {
  frame: Frame;
  y: number;
  text: string;
  className: string;
}) {
  const { plotWidth, padRight } = frame.layout;
  return (
    <>
      <rect
        x={plotWidth}
        y={y - 9}
        width={padRight}
        height={18}
        className={className}
        stroke='none'
      />
      <text x={plotWidth + 6} y={y + 4} className='fill-white' stroke='none'>
        {text}
      </text>
    </>
  );
}
