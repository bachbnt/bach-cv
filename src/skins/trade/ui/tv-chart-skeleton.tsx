/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from '@/lib/utils';
import { useLoopGate } from '@/hooks/use-loop-gate';

/** The heights, in percent, of the bars of the loading chart: a fixed pattern, so the placeholder never jumps between renders. */
const BARS = [38, 52, 44, 61, 55, 70, 48, 66, 58, 76, 62, 50, 68, 80, 57, 72];

/**
 * A placeholder shaped like a chart that is loading: grid lines and a row of bars that breathe, with a line that sweeps across. Decoration:
 * the block around it announces "Loading". The motion stops for reduced motion.
 */
export function TvChartSkeleton({ className }: { className?: string }) {
  const gate = useLoopGate();
  return (
    <div
      ref={gate}
      aria-hidden='true'
      className={cn(
        'relative overflow-hidden rounded-md border border-tv-line bg-tv-panel bg-[linear-gradient(var(--tv-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tv-grid)_1px,transparent_1px)] bg-[size:100%_25%,12.5%_100%]',
        className,
      )}
    >
      <div className='absolute inset-x-3 top-3 bottom-0 flex items-end gap-1'>
        {BARS.map((height, i) => (
          <span
            key={i}
            style={{ height: `${height}%`, animationDelay: `${i * 90}ms` }}
            className='flex-1 origin-bottom animate-[tv-bar_1.6s_ease-in-out_infinite] rounded-t-sm bg-tv-hover'
          />
        ))}
      </div>
      <span className='absolute inset-y-0 left-0 w-1/3 animate-[tv-sweep_1.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,var(--tv-hover),transparent)] opacity-60' />
    </div>
  );
}
