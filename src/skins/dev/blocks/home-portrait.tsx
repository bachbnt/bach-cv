/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { aboutCopy } from '@/content/copy/about';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';

/** The photo with who I am beside it (under it on a narrow screen): name, current role, city and the latest degree, all read from the data. */
export function HomePortrait() {
  const copy = useCopy(aboutCopy);
  const { data: profile } = useProfileQuery();
  const { data: experience = [] } = useContentQuery('experience');
  const { data: education = [] } = useContentQuery('education');
  const job = experience.find((j) => !j.endMonth) ?? experience[0];
  const degree = [...education].sort((a, b) =>
    b.startMonth.localeCompare(a.startMonth),
  )[0];

  return (
    <div className='flex flex-1 overflow-hidden rounded-[8px] border border-line-2 bg-chrome max-[520px]:flex-col'>
      {shell.avatar && (
        <div className='group/photo relative min-h-[170px] w-[42%] overflow-hidden flex-none border-r border-line-2 max-[520px]:h-[170px] max-[520px]:w-full max-[520px]:border-r-0 max-[520px]:border-b'>
          <Image
            src={shell.avatar}
            alt={`${copy.avatarAlt} ${shell.name}`}
            fill
            sizes='(min-width: 901px) 230px, (min-width: 521px) 40vw, 100vw'
            priority
            className='object-cover object-[50%_22%] transition-transform duration-[600ms] ease-out motion-safe:group-hover/photo:scale-[1.05]'
          />
        </div>
      )}
      <p className='m-0 min-w-0 flex-1 self-center px-4 py-3 max-[520px]:self-stretch max-[520px]:text-left text-[14px] leading-[1.6] text-mute'>
        <b className='font-code text-head'>{profile?.fullName || shell.name}</b>
        {job && (
          <>
            <br />
            <span className='font-code text-[13px] text-signal'>
              {job.role} · {job.company}
            </span>
          </>
        )}
        {profile?.location && (
          <>
            <br />
            {profile.location}
          </>
        )}
        {degree && (
          <>
            <br />
            {degree.degree} · {degree.major}
          </>
        )}
      </p>
    </div>
  );
}
