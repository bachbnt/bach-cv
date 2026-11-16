/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** What each tour measures once loaded (the text of a service wraps to one to three lines), one class each. */
const TOURS = [
  'h-[75px] max-md:h-[92px]',
  'h-[92px] max-md:h-[110px]',
  'h-[75px] max-md:h-[92px]',
  'h-[75px]',
  'h-[66px] max-md:h-[75px]',
] as const;

/** The five tours (an icon, the name and the description) in the list of the loaded page. */
export function TourSkeleton() {
  return (
    <ul className='m-0 grid list-none grid-cols-1 gap-2 p-0'>
      {TOURS.map((height, i) => (
        <li key={i} data-skeleton={i === 0 ? 'item' : undefined}>
          <TlSkeleton
            className={cn(
              'flex items-center gap-3 border border-tl-line bg-tl-panel-2 px-3.5',
              height,
            )}
          >
            <TlSkeletonBar className='size-11 flex-none rounded-[14px]' />
            <span className='grid grid-cols-1 min-w-0 flex-1 gap-1.5 pr-7'>
              <TlSkeletonBar className='h-[17px] w-1/2' />
              <TlSkeletonBar className='h-3.5' />
            </span>
          </TlSkeleton>
        </li>
      ))}
    </ul>
  );
}
