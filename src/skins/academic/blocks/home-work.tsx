/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { homeCopy } from '@/content/copy/home';
import { isCurrent } from '@/lib/derive/current-job';
import { HOME_ROLES, latestRoles } from '@/lib/derive/home-lists';
import { jobBadge } from '@/lib/derive/job-badge';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { AcTimeline } from '@/skins/academic/blocks/ac-timeline';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/**
 * "Where I've worked": Figure 1 (all the roles and studies in time), then the newest roles one by one, each a line of the results with the logo
 * of the company, the "Current" stamp on the one that is not over and its period; each leads to the resume, as in Standard.
 */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  const { lang } = useLang();
  const query = useContentQuery('experience');
  const rows = latestRoles(query.data ?? []);

  return (
    <section aria-labelledby='work-h' className='mt-16'>
      <HomeCol className='mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
        <AcHeading id='work-h'>{copy.work.title}</AcHeading>
        <Link
          href='/resume'
          className='font-ac-note text-[19px] text-ac-link underline underline-offset-4 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
        >
          {copy.work.all}
        </Link>
      </HomeCol>
      <HomeCol className='mb-8'>
        <AcTimeline />
      </HomeCol>
      <HomeCol>
        <AcDataState
          query={query}
          count={rows.length}
          empty='work'
          subject='work'
          level={3}
          skeleton={
            <div className='grid gap-4'>
              {Array.from({ length: HOME_ROLES - 1 }, (_, i) => (
                <AcSkeleton key={i} className='h-20' />
              ))}
            </div>
          }
        >
          <ul className='m-0 list-none border-t-2 border-dashed border-ac-faint p-0'>
            {rows.map((job) => (
              <li key={job.id}>
                <Link
                  href='/resume'
                  data-row
                  className='group/row flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-dashed border-ac-faint px-1 py-5 no-underline transition-colors hover:bg-ac-faint/40'
                >
                  {job.logo ? (
                    <span className='ac-wind relative block h-[66px] w-[92px] flex-none -rotate-[1.5deg] overflow-hidden bg-ac-polaroid p-1 shadow-ac-photo-sm'>
                      <Image
                        src={job.logo}
                        alt={job.company}
                        width={112}
                        height={80}
                        className='size-full object-cover'
                      />
                    </span>
                  ) : (
                    <span
                      aria-hidden='true'
                      className='grid h-[66px] w-[92px] flex-none -rotate-[1.5deg] place-items-center rounded-[10px_5px_11px_6px/6px_11px_5px_10px] border-2 border-ac-rule font-ac-chalk text-[28px]/none'
                    >
                      {jobBadge(job)}
                    </span>
                  )}
                  <div className='min-w-0 flex-[1_1_220px]'>
                    <h3 className='ac-glow m-0 font-ac-chalk text-[26px]/[1.15] font-normal'>
                      {job.company}
                      {isCurrent(job) && (
                        <span className='ml-3 inline-block -translate-y-0.5 rotate-[-4deg] rounded-[8px_3px_9px_4px/4px_9px_3px_8px] border-2 border-ac-mb px-2 font-ac-note text-[15px]/[1.35] text-ac-mb'>
                          {copy.work.current}
                        </span>
                      )}
                    </h3>
                    <p className='m-0 font-semibold'>{job.role}</p>
                    <p className='m-0 mt-0.5 font-ac-note text-[16.5px] text-ac-mute'>
                      {formatPeriod(job.startMonth, job.endMonth, lang)}
                    </p>
                  </div>
                  {job.tagline && (
                    <p className='m-0 min-w-0 flex-[1_1_240px] text-[0.94em] text-ac-mute italic'>
                      {job.tagline}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </AcDataState>
      </HomeCol>
    </section>
  );
}
