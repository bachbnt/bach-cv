/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { certificateLayout } from '@/skins/phone/blocks/certificate-layout';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** One pass that is not there yet: the parts sit where the loaded card puts them (`certificateLayout`), with the heights of its lines. */
export function CertificateSkeletonCard({
  lines,
  latest,
  wide,
}: {
  /** the lines of the name */
  lines: number;
  latest: boolean;
  wide: boolean;
}) {
  const layout = certificateLayout({ wide, split: wide });
  return (
    <div className={cn(layout.card, 'bg-ph-sheet-2')}>
      <div className={cn('flex flex-col gap-5 bg-ph-sheet-3 p-5', layout.face)}>
        <PhSkeletonLine
          line={latest ? 'h-6' : 'h-[19px]'}
          className='w-1/3 bg-ph-line'
        />
        <div className='flex flex-1 flex-col justify-between gap-2'>
          <div>
            {Array.from({ length: lines + 1 }, (_, index) => (
              <PhSkeletonLine
                key={index}
                line={cn(
                  'h-[26.4px]',
                  // the name takes one more line on a phone's screen
                  index === lines && 'hidden @max-[449px]:flex',
                )}
                className={cn('bg-ph-line', index === 0 ? 'w-4/5' : 'w-3/5')}
              />
            ))}
          </div>
          <PhSkeletonLine line='h-5' className='w-2/5 bg-ph-line' />
        </div>
      </div>
      <div
        className={cn(
          'flex items-center justify-center bg-ph-sheet-3 p-4',
          layout.picture,
        )}
      >
        <PhSkeleton className='aspect-[4/3] h-auto w-full rounded-ph-inner bg-ph-line' />
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-4 bg-ph-sheet-2 p-5',
          layout.body,
        )}
      >
        <div className='flex gap-2'>
          <PhSkeleton className='h-[25px] w-16' />
          <PhSkeleton className='h-[25px] w-20' />
          <PhSkeleton className='h-[25px] w-14' />
        </div>
        <PhSkeleton className='mt-auto h-11 w-full @min-[600px]:w-[135px]' />
      </div>
    </div>
  );
}
