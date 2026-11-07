/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The loading screen of a block: a gold bar that fills and a tip, as the loading screen of a match has. The tip is one of a few, picked by `seed`. */
export function MbLoading({
  seed = 0,
  className,
}: {
  seed?: number;
  className?: string;
}) {
  const copy = useCopy(mobaCopy);
  const tips = copy.tips.list;
  return (
    <div
      className={cn('flex flex-col gap-3 py-6', className)}
      data-mb-loading=''
    >
      <div className='mb-load-bar' aria-hidden='true'>
        <span />
      </div>
      <p className='text-[13px] text-mb-mute'>
        <b className='mr-2 text-[11px] font-bold tracking-[0.16em] text-mb-gold-ink uppercase'>
          {copy.tips.label}
        </b>
        {tips[seed % tips.length]}
      </p>
    </div>
  );
}
