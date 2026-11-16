/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/**
 * The card heights of a typical list of three certificates: on a phone the picture sits over the text, so a card is taller; from 720px of the box
 * the date rail comes in and a card is one height.
 */
const CARDS = [
  'h-[184px] @[720px]:h-[140px]',
  'h-[206px] @[720px]:h-[140px]',
  'h-[206px] @[720px]:h-[140px]',
];

/**
 * The certificates while they load, laid out as the loaded page is: the control row (the issuer chips, the order and density switches, the
 * count line) and the timeline with a card for each certificate, beside the rail of dates from 720px.
 */
export function DataCertsSkeleton() {
  return (
    <>
      <div
        aria-hidden='true'
        data-skeleton='toolbar'
        className='flex flex-wrap items-center gap-x-2.5 gap-y-2 px-3.5 py-2'
      >
        <div className='flex flex-wrap gap-1.5'>
          {['w-[37px]', 'w-[131px]', 'w-[81px]'].map((width) => (
            <TvSkeleton key={width} className={cn('h-[26px]', width)} />
          ))}
        </div>
        <div className='ml-auto flex flex-wrap items-center gap-2'>
          <TvSkeleton className='h-[30px] w-[184px]' />
          <TvSkeleton className='h-[30px] w-[174px]' />
        </div>
        <div className='basis-full'>
          <TvSkeleton className='h-4 w-24' />
        </div>
      </div>
      <div className='@container border-t border-tv-line'>
        <div className='grid gap-1 p-3.5'>
          <div>
            {CARDS.map((height, i) => (
              <div key={i} className='pb-3 last:pb-0'>
                <TvSkeleton
                  data-skeleton={i === 0 ? 'item' : undefined}
                  className={cn('@[720px]:ml-[108px]', height)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
