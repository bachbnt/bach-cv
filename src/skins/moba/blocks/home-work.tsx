/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { homeCopy } from '@/content/copy/home';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { formatPeriod } from '@/lib/format';
import { jobBadge } from '@/lib/derive/job-badge';
import { isCurrent } from '@/lib/derive/current-job';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { MbChip } from '@/skins/moba/ui/mb-chip';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** The newest roles show on Home, as on Standard. */
const ROLES = 4;

/** "Where I've worked" as a match history: a row for each of the newest roles (the current one marked), each a link to the Resume. */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  const mb = useCopy(mobaHomeCopy);
  const { lang } = useLang();
  const query = useContentQuery('experience');
  const rows = (query.data ?? []).slice(0, ROLES);
  return (
    <MbSection
      id='work'
      kicker={mb.kickers.work}
      title={copy.work.title}
      order={2}
      aside={
        <Link
          href='/resume'
          className='inline-flex min-h-9 items-center gap-1.5 text-sm font-bold text-mb-gold-ink underline underline-offset-4 hover:text-mb-title pointer-coarse:min-h-11'
        >
          {copy.work.all}
          <ArrowRight aria-hidden='true' className='size-4' />
        </Link>
      }
    >
      <MbDataState
        query={query}
        count={rows.length}
        empty='work'
        subject='work'
        level={3}
        skeleton={
          <div className='grid gap-2'>
            {Array.from({ length: ROLES - 1 }, (_, i) => (
              <MbSkeleton key={i} className='h-[76px]' />
            ))}
          </div>
        }
      >
        <ul className='m-0 grid list-none gap-2 p-0'>
          {rows.map((job) => (
            <li key={job.id}>
              <Link
                href='/resume'
                data-row=''
                className='mb-row group/row flex items-center gap-4 px-3 py-3 max-[719px]:flex-wrap max-[719px]:gap-x-3'
              >
                {job.logo ? (
                  <span className='relative h-14 w-20 flex-none overflow-hidden bg-white max-[719px]:h-12 max-[719px]:w-16'>
                    <Image
                      src={job.logo}
                      alt={job.company}
                      fill
                      sizes='80px'
                      className='object-cover'
                    />
                  </span>
                ) : (
                  <span
                    aria-hidden='true'
                    className='grid h-14 w-20 flex-none place-items-center bg-mb-teal/30 font-mb-display text-xl font-bold text-mb-ink max-[719px]:h-12 max-[719px]:w-16'
                  >
                    {jobBadge(job)}
                  </span>
                )}
                <span className='min-w-0 flex-1'>
                  <span className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
                    <span className='font-mb-display text-[22px] leading-none font-bold text-mb-title'>
                      {job.company}
                    </span>
                    {isCurrent(job) && (
                      <MbChip tone='teal'>
                        <span aria-hidden='true' className='current-dot' />
                        {copy.work.current}
                      </MbChip>
                    )}
                  </span>
                  <span className='mt-1 block text-[15px] font-semibold text-mb-ink'>
                    {job.role}
                  </span>
                  {job.tagline && (
                    <span className='mt-0.5 block text-[14px] leading-snug text-mb-mute'>
                      {job.tagline}
                    </span>
                  )}
                </span>
                <span className='flex-none text-[13px] font-semibold text-mb-mute max-[719px]:basis-full'>
                  {formatPeriod(job.startMonth, job.endMonth, lang)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MbDataState>
    </MbSection>
  );
}
