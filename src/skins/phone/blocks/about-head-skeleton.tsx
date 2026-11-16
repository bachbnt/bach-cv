/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LoadingBlock } from '@/components/loading-block';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { useCopy } from '@/lib/i18n/copy';
import { PhSection } from '@/skins/phone/ui/ph-section';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** The summary of the profile and the specialties that are not there yet, under the card of the owner (the title of the group is the page's). */
export function AboutHeadSkeleton() {
  const words = useCopy(phoneHomeCopy).about;
  return (
    <LoadingBlock className='flex flex-col gap-6'>
      <div aria-hidden='true' className='px-1'>
        {[0, 1, 2, 3].map((line) => (
          <PhSkeletonLine
            key={line}
            line='h-[26.4px]'
            className={line === 3 ? 'w-2/3' : 'w-full'}
          />
        ))}
      </div>
      <PhSection title={words.specialties} className='mt-0'>
        <div aria-hidden='true' className='flex flex-wrap gap-2'>
          <PhSkeleton className='h-8 w-36' />
          <PhSkeleton className='h-8 w-20' />
          <PhSkeleton className='h-8 w-16' />
          <PhSkeleton className='h-8 w-12' />
        </div>
      </PhSection>
    </LoadingBlock>
  );
}
