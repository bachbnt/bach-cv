/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

const WIDTH = 64;
const HEIGHT = 18;

/** The path of a line through `values` (and the same line closed along the bottom, for the soft area under it). */
function sparkPaths(values: number[]): { line: string; area: string } {
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? WIDTH / (values.length - 1) : WIDTH;
  const points = values.map(
    (value, i) =>
      `${(i * step).toFixed(1)},${(HEIGHT - 1 - (value / max) * (HEIGHT - 3)).toFixed(1)}`,
  );
  const line = `M${points.join(' L')}`;
  return { line, area: `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z` };
}

/**
 * A small line of how many roles used a technology in each year. Decoration: the numbers behind it are in the legend of the list, so
 * it is hidden from assistive technology. It grows from the baseline once when it first shows.
 */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  // a technology no role lists has nothing to draw: the space stays so the numbers line up
  if (!values.some((value) => value > 0))
    return <span aria-hidden='true' className='h-[18px] w-16 flex-none' />;
  const { line, area } = sparkPaths(values);
  return (
    <svg
      aria-hidden='true'
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn(
        'h-[18px] w-16 flex-none origin-bottom animate-tv-spark overflow-visible',
        className,
      )}
    >
      <path d={area} className='fill-tv-accent/15' />
      <path
        d={line}
        fill='none'
        strokeWidth='1.5'
        strokeLinejoin='round'
        strokeLinecap='round'
        className='stroke-tv-accent-ink'
      />
    </svg>
  );
}
