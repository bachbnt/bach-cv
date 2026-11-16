/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The heading of a section of the page (the real `h2`, so the skeleton and the loaded page share it). */
export const PROJECTS_HEADING = 'text-[30px] min-[721px]:text-[40px]';

/** How many featured projects and cards the page usually holds (the seed's: `tests/fixtures/seed.json`), so the skeleton fills the place the data will take. */
const FEATURED_COUNT = 4;
const CARDS_COUNT = 10;

function FeaturedSkeleton({ first }: { first: boolean }) {
  return (
    <div
      data-skeleton={first ? 'item' : undefined}
      className='grid items-center gap-5 rounded-3xl border bg-card p-5 min-[721px]:grid-cols-[minmax(0,320px)_minmax(0,1fr)] min-[721px]:gap-8'
    >
      <Skeleton className='h-[260px] bg-border' />
      <div className='flex min-w-0 flex-col gap-3'>
        <Skeleton className='h-[26px] w-20 rounded-full bg-border' />
        <Skeleton className='h-[31px] w-3/5 bg-border' />
        <Skeleton className='h-[52px] bg-border' />
        <Skeleton className='mt-4 h-7 w-4/5 bg-border' />
        <Skeleton className='mt-1 h-10 w-2/5 bg-border' />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className='flex min-h-[575px] flex-col gap-2.5 rounded-2xl border bg-card px-4 pt-4 pb-7'>
      <Skeleton className='h-[220px] bg-border' />
      <Skeleton className='mt-2 h-[26px] w-20 rounded-full bg-border' />
      <Skeleton className='h-[26px] w-3/5 bg-border' />
      <Skeleton className='h-[74px] bg-border' />
      <Skeleton className='mt-4 h-7 w-4/5 bg-border' />
      <Skeleton className='mt-auto h-10 w-2/5 bg-border' />
    </div>
  );
}

/** The page as it will be: the two headings are real, then the featured cards, the controls and the grid of cards with the sizes and columns of the loaded ones. */
export function ProjectsSkeleton() {
  const copy = useCopy(projectsCopy);
  return (
    <>
      <h2 className={PROJECTS_HEADING}>{copy.featured}</h2>
      <div className='mt-6 flex flex-col gap-6'>
        {Array.from({ length: FEATURED_COUNT }, (_, i) => (
          <FeaturedSkeleton key={i} first={i === 0} />
        ))}
      </div>
      <h2 className={cn(PROJECTS_HEADING, 'mt-20')}>{copy.all}</h2>
      <div
        data-skeleton='toolbar'
        className='mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-3'
      >
        <Skeleton className='h-11 w-[230px] rounded-full max-[520px]:w-full min-[721px]:h-10' />
        <Skeleton className='h-11 w-[127px] rounded-full min-[721px]:h-10' />
        <Skeleton className='h-11 w-[145px] rounded-full min-[721px]:h-10' />
        <Skeleton className='h-[23px] w-28 min-[721px]:ml-auto' />
      </div>
      <div className='mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6'>
        {Array.from({ length: CARDS_COUNT }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
