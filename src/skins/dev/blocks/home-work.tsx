/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { devCopy } from '@/content/copy/dev';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { formatPeriod } from '@/lib/format';
import { useContentQuery } from '@/lib/query/use-content';
import { isCurrent } from '@/lib/derive/current-job';
import { jobBadge } from '@/lib/derive/job-badge';
import { DevLivePill } from '@/skins/dev/blocks/live-pill';
import { countHint } from '@/skins/dev/ui/count-hint';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevSection } from '@/skins/dev/ui/dev-section';

const LIMIT = 4;

/** "Where I've worked": the newest roles that appear in the CV, each a link to the full resume. */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  const dev = useCopy(devCopy);
  const { lang } = useLang();
  const query = useContentQuery('experience');
  const rows = (query.data ?? []).slice(0, LIMIT);

  return (
    <DevSection
      title={copy.work.title}
      hint={
        rows.length ? countHint(dev.hints, 'roles', rows.length) : undefined
      }
      action={{ label: copy.work.all, href: '/resume' }}
    >
      <DevDataState
        query={query}
        count={rows.length}
        empty='work'
        subject='work'
        level={3}
        skeleton={
          <div className='grid gap-2'>
            {Array.from({ length: LIMIT - 1 }, (_, i) => (
              <DevSkeleton key={i} className='h-[92px]' />
            ))}
          </div>
        }
      >
        <div className='overflow-hidden rounded-[8px] border border-line-2 bg-chrome'>
          {rows.map((job) => (
            <Link
              key={job.id}
              href='/resume'
              className='grid grid-cols-[104px_210px_1fr_auto] items-center gap-5 border-b border-line px-5 py-3.5 last:border-b-0 hover:bg-hov max-[900px]:grid-cols-[90px_1fr]'
              data-reveal
            >
              <div className='grid h-16 w-[104px] place-items-center overflow-hidden rounded-[6px] border border-line-2 bg-tile'>
                {job.logo ? (
                  <Image
                    src={job.logo}
                    alt={job.company}
                    width={104}
                    height={64}
                    className='size-full object-cover'
                  />
                ) : (
                  <span
                    className='font-code text-[20px] leading-[normal] font-bold text-white'
                    aria-hidden='true'
                  >
                    {jobBadge(job)}
                  </span>
                )}
              </div>
              <h3 className='text-[17px]'>
                {job.company}
                {isCurrent(job) && (
                  <DevLivePill>{copy.work.current}</DevLivePill>
                )}
              </h3>
              <div className='max-[900px]:col-start-2'>
                <b className='block font-code text-[14px] leading-[normal] font-semibold text-sky'>
                  {job.role}
                </b>
                {job.tagline && (
                  <p className='mt-0.5 mb-0 text-[14px] text-mute'>
                    {job.tagline}
                  </p>
                )}
              </div>
              <time className='font-code text-[12.5px] leading-[normal] whitespace-nowrap text-dim max-[900px]:col-start-2'>
                {formatPeriod(job.startMonth, job.endMonth, lang)}
              </time>
            </Link>
          ))}
        </div>
      </DevDataState>
    </DevSection>
  );
}
