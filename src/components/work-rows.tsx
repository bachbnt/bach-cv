/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DataState } from '@/components/data-state';
import { RowsSkeleton } from '@/components/skeletons';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { formatPeriod } from '@/lib/format';
import { useContentQuery } from '@/lib/query/use-content';

const LIMIT = 4;

/** The newest roles that appear in the CV, as the Home page lists them. */
export function WorkRows() {
  const copy = useCopy(homeCopy);
  const { lang } = useLang();
  const query = useContentQuery('experience');
  const rows = (query.data ?? []).slice(0, LIMIT);

  return (
    <DataState
      query={query}
      count={rows.length}
      empty='work'
      subject='work'
      level={3}
      skeleton={
        <RowsSkeleton
          count={LIMIT - 1}
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
            className='flex flex-wrap items-center gap-x-8 gap-y-3 border-b px-3 py-5 transition-colors hover:bg-white min-[721px]:px-6 min-[721px]:py-6'
          >
            {job.logo ? (
              <Image
                src={job.logo}
                alt={job.company}
                width={112}
                height={80}
                className='h-20 w-28 flex-none rounded-[10px] bg-border object-cover'
              />
            ) : (
              <div
                aria-hidden='true'
                className='flex h-20 w-28 flex-none items-center justify-center rounded-[10px] bg-[#1e5bd8] font-heading text-[26px] font-bold tracking-[-0.02em] text-white'
              >
                {job.shortName || job.company.slice(0, 3)}
              </div>
            )}
            <h3 className='min-w-[230px] flex-[0_0_230px] text-[22px]'>
              {job.company}
              {!job.endMonth && (
                <span className='relative -top-0.5 ml-2.5 inline-flex items-center rounded-full bg-night px-2.5 py-[3px] align-middle text-xs font-semibold text-white'>
                  {copy.work.current}
                </span>
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
