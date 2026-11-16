/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PROJECT_ENTRY_GRID } from '@/skins/academic/blocks/project-entry';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';
import { cn } from '@/lib/utils';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** The widths of the lines of a summary. */
const SUMMARY = [
  'w-full',
  'w-11/12',
  'w-full',
  'w-5/6',
  'w-full',
  'w-11/12',
  'w-full',
  'w-5/6',
  'w-3/5',
];

/**
 * An entry that is not written yet, with the grid, the margin note, the taped cover and the heights of a typical entry (a name, the kind, a
 * summary of two lines, a row of technologies and a row of links; the cover with its caption and the button for the screenshots).
 */
export function ProjectSkeletonEntry({
  featured,
  long = false,
}: {
  featured: boolean;
  /** the entry of a long summary (five lines), as most of the entries of the list are once the first one is past */
  long?: boolean;
}) {
  const note = featured ? (
    <>
      <AcNoteBig>
        <AcSkeleton className='h-[34px] w-28' />
      </AcNoteBig>
      <AcNoteCap>
        <AcSkeleton className='h-[21px] w-36' />
      </AcNoteCap>
    </>
  ) : undefined;

  return (
    <AcRow note={note} tone='c'>
      <div
        aria-hidden='true'
        className={cn(PROJECT_ENTRY_GRID, !note && 'min-[900px]:pr-[308px]')}
      >
        <div className='min-w-0'>
          <AcSkeleton className='h-9 w-2/5' />
          <AcSkeleton className='mt-1 mb-2 h-[26px] w-20' />
          {/* the summary: lines of text of which as many show as the column takes (it is narrower the narrower the page, up to the page that stacks the cover under the text) */}
          <div
            className={cn(
              'my-2 overflow-hidden',
              long
                ? 'h-[7.9em] min-[761px]:max-[899px]:h-[4.74em] min-[900px]:max-[1023px]:h-[14.22em] min-[1024px]:max-[1189px]:h-[12.64em]'
                : 'h-[3.16em] min-[761px]:max-[899px]:h-[1.58em]',
            )}
          >
            {SUMMARY.map((width, i) => (
              <AcSkeletonLine
                key={i}
                className='h-[1.58em]'
                barClassName={width}
              />
            ))}
          </div>
          <div className='my-2 flex h-[1.7em] items-center gap-3 text-[0.95em]'>
            <AcSkeleton className='w-16' />
            <AcSkeleton className='w-24' />
          </div>
          <div className='my-2 flex h-[1.7em] items-center gap-3 text-[0.95em]'>
            <AcSkeleton className='w-12' />
            <AcSkeleton className='w-28' />
          </div>
        </div>
        <div className='min-w-0'>
          <div
            className={cn(
              'relative m-0 mt-2 max-w-[320px]',
              featured && 'ac-tape',
            )}
          >
            <div className='aspect-[16/10] border-[6px] border-ac-polaroid bg-ac-polaroid shadow-ac-photo'>
              <AcSkeleton className='size-full' />
            </div>
            <AcSkeleton className='mt-2 h-[25px] w-3/5' />
          </div>
          <AcSkeleton className='mt-2.5 h-9 w-[131px]' />
        </div>
      </div>
    </AcRow>
  );
}
