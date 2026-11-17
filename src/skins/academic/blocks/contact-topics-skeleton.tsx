/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { statesCopy } from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** The widths of the topic chips of the seed (one for each service). */
const CHIPS = ['w-[156px]', 'w-[159px]', 'w-[120px]', 'w-[194px]', 'w-[120px]'];

/** The topic chips that are not written yet, so the lines under them stay where they are when the services arrive. */
export function ContactTopicsSkeleton() {
  const states = useCopy(statesCopy);
  return (
    <div
      role='status'
      aria-busy='true'
      aria-label={states.loading}
      className='mt-5 flex flex-wrap gap-2.5'
    >
      {CHIPS.map((width, i) => (
        // two chips have the same width: the width cannot be the key
        <AcSkeleton key={i} className={`h-[34px] ${width}`} />
      ))}
    </div>
  );
}
