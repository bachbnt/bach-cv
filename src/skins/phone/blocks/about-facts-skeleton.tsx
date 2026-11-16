/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneHomeCopy } from '@/content/copy/phone-home';
import { useCopy } from '@/lib/i18n/copy';
import { FactRow } from '@/skins/phone/blocks/fact-row';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/**
 * The facts that are not there yet: the card of `AboutFacts` with the names of the facts it has when it is full (the company, the place, the
 * years, the first role, the areas, the languages) and a bar for each value; the values come from the roles and the skills.
 */
export function AboutFactsSkeleton() {
  const copy = useCopy(phoneHomeCopy).about.facts;
  return (
    <PhCard aria-hidden='true' className='p-0'>
      <dl className='m-0'>
        <FactRow label={copy.company}>
          <PhSkeletonLine line='h-6' className='w-2/5' />
        </FactRow>
        <FactRow label={copy.location}>
          <PhSkeletonLine line='h-6' className='w-3/5' />
          <PhSkeletonLine
            line='hidden h-6 @max-[449px]:flex'
            className='w-1/3'
          />
        </FactRow>
        <FactRow label={copy.experience}>
          <PhSkeletonLine line='h-6' className='w-1/4' />
        </FactRow>
        <FactRow label={copy.firstRole}>
          <PhSkeletonLine line='h-6' className='w-1/6' />
          <PhSkeletonLine line='h-6' className='w-4/5' />
          <PhSkeletonLine
            line='hidden h-6 @max-[449px]:flex'
            className='w-1/2'
          />
        </FactRow>
        <FactRow label={copy.areas}>
          <span className='flex flex-wrap gap-1.5'>
            <PhSkeleton className='h-7 w-18' />
            <PhSkeleton className='h-7 w-40' />
            <PhSkeleton className='h-7 w-36' />
          </span>
        </FactRow>
        <FactRow label={copy.languages}>
          <PhSkeletonLine line='h-6' className='w-1/2' />
        </FactRow>
      </dl>
    </PhCard>
  );
}
