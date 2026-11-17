/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { TripLuggageHead } from '@/skins/travel/blocks/trip-luggage-head';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

const CHIP_WIDTHS = ['w-20', 'w-[75px]', 'w-40', 'w-[89px]', 'w-[125px]'];

/** Rows of chips inside a fixed height (the loaded chips wrap to as many rows as their names need). */
function ChipRows({ className }: { className: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5 overflow-hidden', className)}>
      {Array.from({ length: 24 }, (_, i) => (
        <TlSkeletonBar
          key={i}
          className={cn('h-7 flex-none rounded-full', CHIP_WIDTHS[i % 5])}
        />
      ))}
    </div>
  );
}

/** What each group of skills measures once loaded (the heading and the rows of its chips), one class each. */
const GROUPS = [
  'h-[87px] max-[359px]:h-[121px]',
  'h-[155px] max-md:h-[189px] max-[359px]:h-[258px]',
  'h-[121px] max-[359px]:h-[155px]',
  'h-[121px] max-[359px]:h-[155px]',
] as const;

/**
 * The core stack and, unless `coreOnly`, its title and lead and the four groups of skills, as tall as the loaded luggage. About brings its
 * own heading, so it asks for the chips of the core stack alone.
 */
export function LuggageSkeleton({ coreOnly = false }: { coreOnly?: boolean }) {
  return (
    <TlSkeleton data-skeleton='item' className='bg-transparent'>
      {!coreOnly && <TripLuggageHead />}
      <ChipRows className='h-[62px] max-[359px]:h-[97px]' />
      {!coreOnly &&
        GROUPS.map((height, i) => (
          <div key={i} className={cn('mt-4 overflow-hidden', height)}>
            <TlSkeletonBar className='mb-1.5 h-[18px] w-24' />
            <ChipRows className='h-full' />
          </div>
        ))}
    </TlSkeleton>
  );
}
