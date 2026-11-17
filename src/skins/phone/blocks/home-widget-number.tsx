/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCountUp } from '@/skins/phone/blocks/use-count-up';

/**
 * The large number of a stat widget of the home screen: the same size in the middle of the years ring and above the bars of the projects.
 * Once the widget plays (`play`) it counts up to `value`; the figures are tabular and the box is as wide as the final number, so nothing
 * moves, and readers get the final number only (the counting is `aria-hidden`).
 */
export function HomeWidgetNumber({
  value,
  play,
}: {
  value: number;
  play: boolean;
}) {
  const shown = useCountUp(value, play);
  return (
    <p
      data-testid='stat-number'
      className='text-[32px]/none font-extrabold tracking-[-0.02em] tabular-nums'
    >
      <span className='sr-only'>{value}</span>
      <span
        aria-hidden='true'
        className='inline-block text-center'
        style={{ minWidth: `${String(value).length}ch` }}
      >
        {shown}
      </span>
    </p>
  );
}
