/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { homeCopy } from '@/content/copy/home';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { lengthLabel } from '@/lib/derive/duration-label';
import { jobLength } from '@/lib/derive/career-months';
import { isCurrent } from '@/lib/derive/current-job';
import { jobBadge } from '@/lib/derive/job-badge';
import { ShellWidget } from '@/skins/trade/ui/shell-widget';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

const LIMIT = 4;

/**
 * "Where I've worked": the newest roles that appear in the CV as a compact timeline (company, role, tagline, period and how long it
 * lasted, from the dates), each a link to the Resume page, and the link to all of it.
 */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  const words = useCopy(tradeShellCopy).home;
  const { lang } = useLang();
  const [now] = useState(() => new Date());
  const query = useContentQuery('experience');
  const rows = (query.data ?? []).slice(0, LIMIT);
  return (
    <ShellWidget
      id='tv-home-work'
      titleId='tv-work-h'
      title={copy.work.title}
      action={
        <Link
          href='/resume'
          data-slot='tv-link'
          className='text-[13px] font-medium text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
        >
          {copy.work.all}
        </Link>
      }
    >
      <TvDataState
        query={query}
        count={rows.length}
        empty='work'
        subject='work'
        level={3}
        className='m-3'
        skeleton={
          <div className='grid gap-2 p-3'>
            {Array.from({ length: LIMIT }, (_, i) => (
              <TvSkeleton key={i} className='h-16' />
            ))}
          </div>
        }
      >
        <ol className='py-1'>
          {rows.map((job, i) => {
            const current = isCurrent(job);
            return (
              <li
                key={job.id}
                className='tv-rise relative pl-9 before:absolute before:top-0 before:bottom-0 before:left-[19px] before:w-px before:bg-tv-line first:before:top-6 last:before:bottom-auto last:before:h-6'
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  aria-hidden='true'
                  className={cn(
                    'absolute top-[19px] left-[14px] size-[11px] rounded-full border-2 border-tv-panel',
                    current ? 'bg-tv-up' : 'bg-tv-dim',
                  )}
                />
                <Link
                  href='/resume'
                  data-slot='tv-link'
                  className='grid items-center gap-x-4 gap-y-1 py-2.5 pr-3.5 transition-[background-color] duration-100 hover:bg-tv-hover active:bg-tv-hover min-[560px]:grid-cols-[48px_minmax(0,1fr)_auto]'
                >
                  {job.logo ? (
                    <Image
                      src={job.logo}
                      alt={job.company}
                      width={112}
                      height={80}
                      className='h-9 w-12 rounded object-cover'
                    />
                  ) : (
                    <span
                      aria-hidden='true'
                      className='grid h-9 w-12 place-items-center rounded bg-tv-accent text-xs font-bold text-white'
                    >
                      {jobBadge(job)}
                    </span>
                  )}
                  <span className='min-w-0'>
                    <h3 className='flex flex-wrap items-center gap-x-2 text-[13px] font-semibold'>
                      {job.company}
                      {current && (
                        <TvChip tone='up'>{copy.work.current}</TvChip>
                      )}
                    </h3>
                    <span className='block text-[13px]'>{job.role}</span>
                    {job.tagline && (
                      <span className='block text-xs/[1.5] text-tv-mute'>
                        {job.tagline}
                      </span>
                    )}
                  </span>
                  <span className='text-xs text-tv-mute tabular-nums min-[560px]:text-right'>
                    {formatPeriod(job.startMonth, job.endMonth, lang)}
                    <span className='block'>
                      {lengthLabel(jobLength(job, now), words)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </TvDataState>
    </ShellWidget>
  );
}
