/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { tallyGroups } from '@/lib/derive/tally';
import { cn } from '@/lib/utils';

/**
 * Years written as tally marks, in chalk: an upright stroke for each year, four of them crossed by a fifth for five. It only decorates
 * (`aria-hidden`): the time is always written next to it. The strokes lean a little, as if drawn by hand.
 */
export function AcTally({
  years,
  className,
}: {
  years: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'inline-flex min-h-[22px] items-center align-middle',
        className,
      )}
    >
      {tallyGroups(years).map((group, g) => (
        <span key={g} className='relative mr-2 inline-flex items-center gap-1'>
          {Array.from({ length: group.strokes }, (_, i) => (
            <i
              key={i}
              className={cn(
                'block h-[19px] w-[2.5px] rounded-[2px] bg-current',
                i % 2 === 1 && 'rotate-2',
                i % 3 === 2 && '-rotate-2',
              )}
            />
          ))}
          {group.crossed && (
            <i className='absolute -inset-x-1 top-[calc(50%-1px)] h-[2.5px] -rotate-[26deg] rounded-[2px] bg-current' />
          )}
        </span>
      ))}
    </span>
  );
}
