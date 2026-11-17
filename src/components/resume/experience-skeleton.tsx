/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from 'cn';

/**
 * How many roles the page usually shows (the seed's visible ones: `tests/fixtures/seed.json`): the first is open, as `ExperienceList` opens
 * it, and the others are shut, so the skeleton fills the place the data will take.
 */
const ROLES_COUNT = 4;

/** The chips of the technologies: the first role has a long list, the others a few. */
const TECH_WIDTHS = [64, 56, 72, 60, 80, 52, 68, 76, 58, 64];

/**
 * A text takes more lines as its column gets narrower: a line is always there (0), or only under 1100px (1), or only under 721px (2), or only under 360px (3),
 * which are the widths where the loaded text wraps once, twice and more.
 */
type From = 0 | 1 | 2 | 3;
const SHOWN: Record<From, string> = {
  0: 'flex items-center',
  1: 'hidden max-[1099px]:flex max-[1099px]:items-center',
  2: 'hidden max-[720px]:flex max-[720px]:items-center',
  3: 'hidden max-[359px]:flex max-[359px]:items-center',
};

const SUMMARY_SHUT: From[] = [0, 0, 2];
const SUMMARY_OPEN: From[] = [0, 0, 0, 2, 2, 3, 3];
const PROJECT_LINES: From[] = [0, 0, 1, 1, 2, 3, 3];
const POINT_LINES: From[] = [0, 0, 0, 1, 1, 2, 2, 3, 3];
const POINTS_COUNT = 7;

/** Lines of text as the page sets them (`leading` is the height of a line), a bar the height of the letters in each. */
function Lines({
  lines,
  leading,
  className,
}: {
  lines: From[];
  leading: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {lines.map((from, n) => (
        <div key={n} className={cn(leading, SHOWN[from])}>
          <Skeleton
            className={cn('h-4 w-full', n === lines.length - 1 && 'w-3/5')}
          />
        </div>
      ))}
    </div>
  );
}

function Chips({ count }: { count: number }) {
  return (
    <div className='mt-4 flex flex-wrap gap-2'>
      {TECH_WIDTHS.slice(0, count).map((width, n) => (
        <Skeleton
          key={n}
          className='h-[27.5px] rounded-full'
          style={{ width }}
        />
      ))}
    </div>
  );
}

/** The button that opens the responsibilities, and under it the list when the role is open. */
function ResponsibilitiesSkeleton({ open }: { open: boolean }) {
  return (
    <div className='mt-5'>
      <div className='flex min-h-11 items-center'>
        <Skeleton className='h-4 w-44' />
      </div>
      {open && (
        <div className='flex flex-col gap-3 pt-4 pl-5'>
          {Array.from({ length: POINTS_COUNT }, (_, n) => (
            <Lines key={n} lines={POINT_LINES} leading='h-[25.6px]' />
          ))}
        </div>
      )}
    </div>
  );
}

/** A role as `ExperienceRow` lays it out (same frame, date, text column and picture), with blank shapes where the data goes. */
function RowSkeleton({ open }: { open: boolean }) {
  return (
    <div
      data-skeleton={open ? 'item' : undefined}
      className='flex flex-wrap gap-x-12 gap-y-3 border-t px-3 py-7 min-[721px]:px-6 min-[721px]:py-10'
    >
      <div className='flex-[0_0_150px] pt-2'>
        <Skeleton className='h-[23px] w-28' />
      </div>
      <div className='min-w-0 flex-[1_1_480px]'>
        <Skeleton className='h-[31px] w-2/5' />
        <Skeleton className='mt-1.5 h-[27px] w-3/5' />
        <Lines
          lines={open ? SUMMARY_OPEN : SUMMARY_SHUT}
          leading='h-[26.35px]'
          className='mt-3 max-w-[640px]'
        />
        {open && (
          <div className='mt-5 rounded-xl border bg-card px-[18px] py-4'>
            <Skeleton className='mb-2 h-[26px] w-24 rounded-full' />
            <Skeleton className='h-6 w-2/5' />
            <Lines
              lines={PROJECT_LINES}
              leading='h-[23.25px]'
              className='mt-1'
            />
          </div>
        )}
        <Chips count={open ? TECH_WIDTHS.length : 5} />
        <ResponsibilitiesSkeleton open={open} />
      </div>
      {!open && (
        <Skeleton className='mt-2 h-[200px] max-w-[280px] flex-[1_1_220px] self-start' />
      )}
    </div>
  );
}

/** The roles of the Experience section: the first open, the others shut, as the loaded list shows them. */
export function ExperienceSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: ROLES_COUNT }, (_, i) => (
        <RowSkeleton key={i} open={i === 0} />
      ))}
    </div>
  );
}
