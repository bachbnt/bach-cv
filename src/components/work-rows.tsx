/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CurrentBadge } from '@/components/current-badge';
import { DataState } from '@/components/data-state';
import { RowsSkeleton } from '@/components/rows-skeleton';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { formatPeriod } from '@/lib/format';
import { useContentQuery } from '@/lib/query/use-content';
import { isCurrent } from '@/lib/derive/current-job';
import { HOME_ROLES, latestRoles } from '@/lib/derive/home-lists';
import { jobBadge } from '@/lib/derive/job-badge';

/** The newest roles that appear in the CV, as the Home page lists them. */
export function WorkRows() {
  const copy = useCopy(homeCopy);
  const { lang } = useLang();
  const query = useContentQuery('experience');
  const rows = latestRoles(query.data ?? []);

  return (
    <DataState
      query={query}
      count={rows.length}
      empty='work'
      subject='work'
      level={3}
      skeleton={
        <RowsSkeleton
          count={HOME_ROLES - 1}
          className='-mx-3 border-t min-[721px]:-mx-6'
        />
      }
    >
      <div className='-mx-3 border-t min-[721px]:-mx-6'>
        {rows.map((job) => (
          <Link
            key={job.id}
            href='/resume'
            data-row
            className='group/row flex flex-wrap items-center gap-x-8 gap-y-3 border-b px-3 py-5 transition-colors hover:bg-card active:bg-card min-[721px]:px-6 min-[721px]:py-6'
          >
            {job.logo ? (
              <div className='h-20 w-28 flex-none overflow-hidden rounded-[10px] bg-border'>
                <Image
                  src={job.logo}
                  alt={job.company}
                  width={112}
                  height={80}
                  className='size-full object-cover saturate-[.85] transition-[scale,filter] duration-[600ms] ease-out group-hover/row:scale-105 group-hover/row:saturate-100 motion-reduce:transition-none motion-reduce:group-hover/row:scale-100'
                />
              </div>
            ) : (
              <div
                aria-hidden='true'
                className='flex h-20 w-28 flex-none items-center justify-center rounded-[10px] bg-tile font-heading text-[26px] font-bold tracking-[-0.02em] text-white'
              >
                {jobBadge(job)}
              </div>
            )}
            <h3 className='min-w-[230px] flex-[0_0_230px] text-[22px]'>
              {job.company}
              {isCurrent(job) && (
                <CurrentBadge>{copy.work.current}</CurrentBadge>
              )}
            </h3>
            <div className='min-w-0 flex-[1_1_320px]'>
              <p className='text-[17px] font-semibold'>{job.role}</p>
              {job.tagline && (
                <p className='mt-1 text-base leading-normal text-muted-foreground'>
                  {job.tagline}
                </p>
              )}
            </div>
            <p className='flex-[0_0_170px] text-[15px] text-muted-foreground min-[721px]:text-right'>
              {formatPeriod(job.startMonth, job.endMonth, lang)}
            </p>
          </Link>
        ))}
      </div>
    </DataState>
  );
}
