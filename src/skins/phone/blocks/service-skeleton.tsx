/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import {
  SERVICE_GRID,
  SERVICE_ROW,
  SERVICE_WIDE,
} from '@/skins/phone/blocks/service-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** What the seed has: the last of an odd number of rows spans both columns of a tablet, as in the loaded list. */
const ROWS = 5;

/** The rows of the list that are not there yet, in the grid of the loaded one: the tile, the name, the description and Discuss. */
export function ServiceSkeleton() {
  return (
    <div aria-hidden='true' className={cn(SERVICE_GRID, HINGE_PANES)}>
      {Array.from({ length: ROWS }, (_, index) => (
        <div
          key={index}
          className={cn(
            'flex',
            ROWS % 2 === 1 && index === ROWS - 1 && SERVICE_WIDE,
          )}
        >
          <div className={SERVICE_ROW}>
            <PhSkeleton className='size-16 shrink-0 rounded-[30%] [corner-shape:squircle]' />
            <div className='flex min-w-0 flex-col gap-1'>
              <PhSkeletonLine line='h-[22.5px]' className='w-2/5' />
              <div>
                <PhSkeletonLine line='h-[22.5px]' className='w-full' />
                {index < ROWS - 1 && (
                  <>
                    <PhSkeletonLine line='h-[22.5px]' className='w-4/5' />
                    <PhSkeletonLine
                      line='hidden h-[22.5px] @max-[449px]:flex @min-[900px]:flex'
                      className='w-full'
                    />
                    <PhSkeletonLine
                      line='hidden h-[22.5px] @min-[900px]:flex'
                      className='w-3/5'
                    />
                  </>
                )}
              </div>
            </div>
            <PhSkeleton className='col-start-2 h-11 w-24 @min-[600px]:col-start-3' />
          </div>
        </div>
      ))}
    </div>
  );
}
