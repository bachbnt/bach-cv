/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LoadingBlock } from '@/components/loading-block';
import { homeCopy } from '@/content/copy/home';
import { shell } from '@/lib/content/shell';
import { fill } from '@/lib/chat/fill';
import { isCurrent, latestJob } from '@/lib/derive/current-job';
import { useCopy } from '@/lib/i18n/copy';
import { useLive } from '@/hooks/use-live';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { OwnerAvatar } from '@/skins/phone/blocks/owner-avatar';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/**
 * The widget of the role I am in: my photo, the role, the company and the place. It is the role that is not over (or the one that ended
 * last), and it opens the resume. If the roles cannot be read the card of work further down says so, so this one is simply left out.
 */
export function HomeNow() {
  const copy = useCopy(homeCopy);
  const live = useLive();
  const jobs = useContentQuery('experience');
  const { data: profile } = useProfileQuery();
  const job = latestJob(jobs.data ?? []);

  if (jobs.isPending)
    return (
      <LoadingBlock>
        <HomeGlass className='flex items-center gap-3.5'>
          <PhSkeleton className='size-14 shrink-0 rounded-full' />
          <div className='min-w-0 flex-1'>
            <PhSkeleton className='mb-1.5 h-6 w-16' />
            <PhSkeletonLine line='h-[21.25px]' className='w-3/4' />
            <div className='mt-0.5'>
              <PhSkeletonLine line='h-[19.6px]' className='w-1/2' />
              <PhSkeletonLine
                line='hidden h-[19.6px] @max-[449px]:flex'
                className='w-1/3'
              />
            </div>
          </div>
        </HomeGlass>
      </LoadingBlock>
    );
  if (!job) return null;

  const place = [job.company, profile?.location].filter(Boolean).join(' · ');
  const body = (
    <>
      <OwnerAvatar
        alt={fill(copy.avatarAlt, { name: shell.name })}
        pixels={112}
        className='size-14 text-[19px]'
      />
      <span className='min-w-0'>
        {isCurrent(job) && (
          <PhChip tone='ok' className='mb-1.5'>
            {copy.work.current}
          </PhChip>
        )}
        <span className='block text-[17px]/[1.25] font-bold [overflow-wrap:anywhere]'>
          {job.role}
        </span>
        <span className='mt-0.5 block text-[14px]/[1.4] text-ph-mute'>
          {place}
        </span>
      </span>
    </>
  );
  const className = 'flex items-center gap-3.5';
  return live.pages.resume === 'on' ? (
    <HomeGlass className='p-0'>
      <Link
        href='/resume'
        className={cn(
          className,
          'rounded-ph-panel p-4 no-underline transition-[scale] duration-100 active:scale-[0.99]',
        )}
      >
        {body}
        <ChevronRight
          aria-hidden='true'
          className='ml-auto size-5 shrink-0 text-ph-mute'
        />
      </Link>
    </HomeGlass>
  ) : (
    <HomeGlass className={className}>{body}</HomeGlass>
  );
}
