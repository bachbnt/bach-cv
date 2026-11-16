/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { FEATURED_CARD_GRID } from '@/skins/dev/blocks/featured-project';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** Heights of the loaded cards at the widths of the shell (the text of a card sets its height, so they are measured, not guessed). */
const FEATURED_SHORT = 'h-[262px] max-[900px]:h-[457px] max-[620px]:h-[481px]';
const FEATURED_LONG =
  'h-[300px] max-[1279px]:h-[600px] max-[900px]:h-[527px] max-[620px]:h-[643px]';
const CARD_HEIGHT =
  'h-[468px] max-[1279px]:h-[498px] max-[900px]:h-[494px] max-[620px]:h-[481px]';

/** The lines of a project card: a kind tag, the name, the summary, the technologies and the links. */
function CardText({ lines }: { lines: number }) {
  return (
    <>
      <DevSkeletonBar className='mb-2 h-[21px] w-20 rounded-full' />
      <DevSkeletonBar className='h-[26px] w-3/5' />
      <div className='mt-1.5 mb-1 grid gap-1.5'>
        {Array.from({ length: lines }, (_, i) => (
          <DevSkeletonBar
            key={i}
            className={i === lines - 1 ? 'h-[17px] w-4/5' : 'h-[17px]'}
          />
        ))}
      </div>
      <div className='mt-3 flex flex-wrap gap-[7px]'>
        <DevSkeletonBar className='h-[26px] w-16' />
        <DevSkeletonBar className='h-[26px] w-20' />
        <DevSkeletonBar className='h-[26px] w-14' />
      </div>
    </>
  );
}

/**
 * A card of the Projects page before its data arrives: the large card of a featured project (the cover at the left, the text at the
 * right; `position` is its place in the list, the last two hold more text) or a card of the grid (cover, text, links at the bottom).
 */
export function ProjectCardSkeleton({
  featured = false,
  position = 0,
  first = false,
  className,
}: {
  featured?: boolean;
  position?: number;
  /** the first unit of its list, which the tests measure */
  first?: boolean;
  className?: string;
}) {
  const mark = first ? 'item' : undefined;
  if (featured)
    return (
      <DevSkeleton
        data-skeleton={mark}
        className={cn(
          FEATURED_CARD_GRID,
          position < 2 ? FEATURED_SHORT : FEATURED_LONG,
          className,
        )}
      >
        <DevSkeletonBar className='h-full min-h-[260px] rounded-none border-r border-line-2' />
        <div className='min-w-0 self-center px-4 pt-3.5 pb-4'>
          <CardText lines={3} />
        </div>
      </DevSkeleton>
    );
  return (
    <DevSkeleton
      data-skeleton={mark}
      className={cn('flex flex-col', CARD_HEIGHT, className)}
    >
      <DevSkeletonBar className='aspect-[16/10] w-full rounded-none border-b border-line-2' />
      <div className='flex flex-1 flex-col px-4 pt-3.5 pb-4'>
        <CardText lines={4} />
        <DevSkeletonBar className='mt-auto h-[26px] w-24' />
      </div>
    </DevSkeleton>
  );
}
