/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { homeCopy } from '@/content/copy/home';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { lengthLabel } from '@/lib/derive/duration-label';
import { jobLength } from '@/lib/derive/career-months';
import { isCurrent } from '@/lib/derive/current-job';
import { rovingKeys } from '@/skins/trade/shell/roving-keys';
import { useTrade } from '@/skins/trade/shell/trade-context';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The Roles list of the watchlist: my jobs as a compact timeline, newest first. A press opens that job on the Resume page. */
export function WatchRoles() {
  const copy = useCopy(tradeShellCopy);
  const home = useCopy(homeCopy);
  const { lang } = useLang();
  const { showJob, jobId } = useTrade();
  const query = useContentQuery('experience');
  const [now] = useState(() => new Date());
  const jobs = query.data ?? [];
  return (
    <div className='min-h-0 flex-1 overflow-y-auto'>
      <TvDataState
        query={query}
        count={jobs.length}
        empty='work'
        subject='work'
        level={3}
        className='m-3'
        skeleton={
          <div className='grid gap-2 p-3'>
            {Array.from({ length: 4 }, (_, i) => (
              <TvSkeleton key={i} className='h-10 border-0' />
            ))}
          </div>
        }
      >
        <p className='px-3.5 pt-2 pb-1 text-[11px]/[1.45] text-tv-mute'>
          {copy.watch.rolesHint}
        </p>
        <ol className='py-1' onKeyDown={rovingKeys}>
          {jobs.map((job, i) => {
            const current = isCurrent(job);
            return (
              <li
                key={job.id}
                className='tv-rise relative before:absolute before:top-0 before:bottom-0 before:left-[21px] before:w-px before:bg-tv-line first:before:top-3.5 last:before:bottom-auto last:before:h-3.5'
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span
                  aria-hidden='true'
                  className={cn(
                    'absolute top-3 left-[17px] size-[9px] rounded-full border-2 border-tv-bg',
                    current ? 'bg-tv-up' : 'bg-tv-dim',
                  )}
                />
                <button
                  type='button'
                  data-roving=''
                  aria-current={jobId === job.id ? 'true' : undefined}
                  onClick={() => showJob(job.id)}
                  className='block min-h-[44px] w-full cursor-pointer border-l-2 border-transparent py-1.5 pr-3.5 pl-9 text-left transition-[background-color,border-color] duration-100 hover:bg-tv-hover active:bg-tv-hover aria-[current=true]:border-tv-accent aria-[current=true]:bg-tv-hover'
                >
                  <span className='flex flex-wrap items-center gap-x-2 text-[13px] font-semibold'>
                    {job.company}
                    {current && <TvChip tone='up'>{home.work.current}</TvChip>}
                  </span>
                  <span className='block truncate text-xs text-tv-ink'>
                    {job.role}
                  </span>
                  <span className='block text-[11px] text-tv-mute tabular-nums'>
                    {formatPeriod(job.startMonth, job.endMonth, lang)}
                    {' · '}
                    {lengthLabel(jobLength(job, now), copy.home)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </TvDataState>
    </div>
  );
}
