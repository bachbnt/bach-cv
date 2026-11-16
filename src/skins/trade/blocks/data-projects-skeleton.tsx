/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { tradeDataCopy } from '@/content/copy/trade-data';
import { useCopy } from '@/lib/i18n/copy';
import { PROJECT_COLUMNS } from '@/lib/derive/project-view';
import {
  gridStyle,
  shownColumns,
} from '@/skins/trade/blocks/data-projects-grid';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The height of a row of the table in the compact density, which is the one it opens in. */
const ROW = 'h-[59px]';

/**
 * The screener while the projects load, laid out as the loaded one is: the filter bar (its controls in their sizes, wrapping where they
 * wrap), the table with its real column names inside the same scrolling box and grid, a row for each of the ten projects of a typical
 * list, and the line of keys. Only the data is blank.
 */
export function DataProjectsSkeleton({ count = 10 }: { count?: number }) {
  const { projects: words } = useCopy(tradeDataCopy);
  const shown = shownColumns(new Set(PROJECT_COLUMNS));
  return (
    <>
      <div
        aria-hidden='true'
        data-skeleton='toolbar'
        className='flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-tv-line px-3.5 py-2'
      >
        <TvSkeleton className='h-8 w-[200px]' />
        <TvSkeleton className='h-[26px] w-[123px]' />
        <TvSkeleton className='h-[26px] w-24' />
        <TvSkeleton className='h-[26px] w-[142px]' />
        <div className='ml-auto flex flex-wrap items-center gap-2'>
          <TvSkeleton className='h-[30px] w-[174px]' />
          <TvSkeleton className='h-[26px] w-[94px]' />
        </div>
        <div className='flex basis-full items-center'>
          <TvSkeleton className='h-4 w-24' />
        </div>
      </div>
      <div className='overflow-x-auto'>
        <div style={gridStyle(shown)}>
          <div className='grid grid-cols-(--tv-cols) gap-x-3 border-b border-tv-line px-3 text-xs text-tv-mute'>
            {shown.map((column) => (
              <span
                key={column}
                className='inline-flex h-8 items-center whitespace-nowrap'
              >
                {words.columns[column]}
              </span>
            ))}
          </div>
          {Array.from({ length: count }, (_, i) => (
            <TvSkeleton
              key={i}
              data-skeleton={i === 0 ? 'item' : undefined}
              className={`${ROW} rounded-none border-0 border-b`}
            />
          ))}
        </div>
      </div>
      <p className='px-3.5 pt-1 pb-4 text-xs text-tv-dim max-[1100px]:hidden'>
        {words.keys}
      </p>
    </>
  );
}
