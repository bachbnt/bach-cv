/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cvCopy } from '@/content/copy/cv';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { useCopy } from '@/lib/i18n/copy';
import { FactRow } from '@/skins/phone/blocks/fact-row';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

const sub =
  'mb-2.5 text-[13px] font-semibold tracking-[0.06em] text-ph-mute uppercase';

/** The lines of the summary and of each responsibility, and the chips of the technologies (the shape of a typical role of the seed). */
const SUMMARY_LINES = 3;
const PROJECT_LINES = 4;
const BULLETS = 15;
const TAGS = [
  'w-18',
  'w-34',
  'w-12',
  'w-20',
  'w-24',
  'w-16',
  'w-28',
  'w-14',
  'w-22',
  'w-16',
  'w-20',
];

/**
 * The role beside the list that is not there yet: the same parts as the loaded one, in the same order and with the heights of its lines. The
 * names of the facts and the two small titles are the page's own words, so they are shown.
 */
export function ResumeRoleDetailSkeleton() {
  const words = useCopy(phoneHomeCopy).resume;
  const { labels } = useCopy(cvCopy);
  return (
    <PhCard className='p-5'>
      <div className='flex items-center gap-4'>
        <PhSkeleton className='size-16 shrink-0 rounded-ph-inner' />
        <div className='min-w-0 flex-1'>
          <PhSkeletonLine line='h-[26.4px]' className='w-3/5' />
          <PhSkeletonLine line='mt-1 h-[22.4px]' className='w-2/5' />
          <PhSkeleton className='mt-2 h-6 w-20' />
        </div>
      </div>
      <dl className='m-0 mt-5 overflow-hidden rounded-ph-inner bg-ph-sheet'>
        <FactRow label={words.detail.period}>
          <PhSkeletonLine line='h-6' className='w-40' />
        </FactRow>
        <FactRow label={words.detail.length}>
          <PhSkeletonLine line='h-6' className='w-28' />
        </FactRow>
        <FactRow label={words.detail.team}>
          <PhSkeletonLine line='h-6' className='w-20' />
        </FactRow>
      </dl>
      <div className='mt-5'>
        {Array.from({ length: SUMMARY_LINES }, (_, index) => (
          <PhSkeletonLine
            key={index}
            line='h-[26.4px]'
            className={index === SUMMARY_LINES - 1 ? 'w-3/5' : 'w-full'}
          />
        ))}
      </div>
      <div className='mt-5 rounded-ph-inner bg-ph-sheet p-4'>
        <PhSkeleton className='mb-2 h-6 w-24' />
        <PhSkeletonLine line='h-[21.6px]' className='w-1/2' />
        <div className='mt-1'>
          {Array.from({ length: PROJECT_LINES }, (_, line) => (
            <PhSkeletonLine
              key={line}
              line='h-6'
              className={line === PROJECT_LINES - 1 ? 'w-2/3' : 'w-full'}
            />
          ))}
        </div>
      </div>
      <div className='mt-6'>
        <h4 className={sub}>{labels.technologies}</h4>
        <div className='flex flex-wrap gap-2'>
          {TAGS.map((width, index) => (
            <PhSkeleton key={index} className={`h-7 ${width}`} />
          ))}
        </div>
      </div>
      <div className='mt-6'>
        <h4 className={sub}>{labels.responsibilities}</h4>
        <div className='flex flex-col gap-2.5'>
          {Array.from({ length: BULLETS }, (_, index) => (
            <div key={index}>
              <PhSkeletonLine line='h-[25.6px]' className='w-full' />
              <PhSkeletonLine line='h-[25.6px]' className='w-3/5' />
            </div>
          ))}
        </div>
      </div>
    </PhCard>
  );
}
