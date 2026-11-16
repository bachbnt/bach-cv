/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { isCurrent } from '@/lib/derive/current-job';
import { HOME_ROLES, latestRoles } from '@/lib/derive/home-lists';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { ResumeRoleMark } from '@/skins/phone/blocks/resume-role-mark';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/**
 * "Where I've worked": the newest roles, each with the logo of its company (or its letters), the Current chip on the one that is not over
 * and its period; each opens that role on the resume, and the link in the head opens the whole of it, as in Standard.
 */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  const { lang } = useLang();
  const live = useLive();
  const query = useContentQuery('experience');
  const rows = latestRoles(query.data ?? []);
  const linked = live.pages.resume === 'on';

  return (
    <HomeGlass as='section' aria-labelledby='ph-work-h'>
      <HomeCardHead
        id='ph-work-h'
        title={copy.work.title}
        href={linked ? '/resume' : undefined}
        all={copy.work.all}
      />
      <PhDataState
        query={query}
        count={rows.length}
        empty='work'
        subject='work'
        level={3}
        skeleton={
          <ul aria-hidden='true' className='m-0 -mt-1 list-none p-0'>
            {Array.from({ length: HOME_ROLES }, (_, index) => (
              <li key={index} className={cn(ROW_SEPARATOR, '[--inset:62px]')}>
                <div className='flex items-start gap-3.5 py-3.5'>
                  <PhSkeleton className='size-12 shrink-0 rounded-ph-inner' />
                  <div className='min-w-0 flex-1'>
                    <PhSkeletonLine line='h-[20.8px]' className='w-2/5' />
                    <PhSkeletonLine line='mt-0.5 h-[21px]' className='w-3/5' />
                    <PhSkeletonLine
                      line='hidden h-[21px] @max-[359px]:flex'
                      className='w-2/5'
                    />
                    <div className='mt-0.5'>
                      <PhSkeletonLine line='h-[20.3px]' className='w-full' />
                      <PhSkeletonLine line='h-[20.3px]' className='w-1/2' />
                    </div>
                    <PhSkeletonLine line='mt-1 h-[18.2px]' className='w-1/3' />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        }
      >
        <ul className='m-0 -mt-1 list-none p-0'>
          {rows.map((job) => {
            const row = (
              <>
                <ResumeRoleMark job={job} />
                <span className='min-w-0 flex-1'>
                  <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                    <span className='text-[16px]/[1.3] font-semibold [overflow-wrap:anywhere]'>
                      {job.company}
                    </span>
                    {isCurrent(job) && (
                      <PhChip tone='ok'>{copy.work.current}</PhChip>
                    )}
                  </span>
                  <span className='mt-0.5 block text-[15px]/[1.4] [overflow-wrap:anywhere]'>
                    {job.role}
                  </span>
                  {job.tagline && (
                    <span className='mt-0.5 line-clamp-2 text-[14px]/[1.45] text-ph-mute'>
                      {job.tagline}
                    </span>
                  )}
                  <span className='mt-1 block text-[13px]/[1.4] text-ph-mute'>
                    {formatPeriod(job.startMonth, job.endMonth, lang)}
                  </span>
                </span>
              </>
            );
            return (
              <li key={job.id} className={cn(ROW_SEPARATOR, '[--inset:62px]')}>
                {linked ? (
                  <Link
                    href={`/resume#role-${job.id}`}
                    data-row
                    className='flex items-start gap-3.5 py-3.5 text-ph-ink no-underline'
                  >
                    {row}
                    <ChevronRight
                      aria-hidden='true'
                      className='mt-3 size-5 shrink-0 text-ph-mute'
                    />
                  </Link>
                ) : (
                  <div className='flex items-start gap-3.5 py-3.5'>{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </PhDataState>
    </HomeGlass>
  );
}
