/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { commonCopy } from '@/content/copy/common';
import { tradeCopy } from '@/content/copy/trade';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { careerYears } from '@/lib/derive/career-years';
import { currentJob } from '@/lib/derive/current-job';

/**
 * The Details widget under the watchlist: my photo, name and headline, the years in software, the role and company I am in now and
 * where I live (the facts Standard states), and the rights line of the Standard footer.
 */
export function WatchDetails() {
  const copy = useCopy(tradeCopy).details;
  const common = useCopy(commonCopy);
  const { lang } = useLang();
  const [now] = useState(() => new Date());
  const { data: jobs = [] } = useContentQuery('experience');
  const { data: profile } = useProfileQuery();
  const years = careerYears(
    jobs.map((job) => job.startMonth),
    now,
  );
  const current = currentJob(jobs);
  const facts = [
    [copy.role, current?.role],
    [copy.company, current?.company],
    [copy.location, profile?.location],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <section aria-label={copy.title} className='border-b border-tv-line p-3.5'>
      <div className='flex items-center gap-2.5'>
        {shell.avatar && (
          <Image
            src={shell.avatar}
            alt=''
            width={36}
            height={36}
            unoptimized
            className='size-9 flex-none rounded-full object-cover object-[50%_25%]'
          />
        )}
        <div className='min-w-0'>
          <p className='text-[15px] font-bold'>{shell.name}</p>
          <p className='truncate text-xs text-tv-mute'>
            {localize(shell, lang).headline}
          </p>
        </div>
      </div>
      {years !== null && (
        <p className='mt-2.5 text-[26px] leading-tight font-semibold tabular-nums'>
          {years}
          <small className='ml-1.5 text-xs font-normal text-tv-mute'>
            {years === 1 ? copy.yearsOne : copy.yearsMany}
          </small>
        </p>
      )}
      {facts.length > 0 && (
        <dl className='mt-3 grid grid-cols-2 gap-x-3.5 gap-y-2.5'>
          {facts.map(([label, value]) => (
            <div key={label} className='min-w-0 text-[11px] text-tv-mute'>
              <dt>{label}</dt>
              <dd className='text-[13px] font-medium text-tv-ink'>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className='mt-3 text-[11px] text-tv-dim'>
        &copy; {now.getFullYear()} {shell.name}. {common.footer.rights}
      </p>
    </section>
  );
}
