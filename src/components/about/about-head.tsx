/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { Tag } from '@/components/tag';
import { aboutCopy } from '@/content/copy/about';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from 'cn';

const photo = 'size-full rounded-[20px] bg-border object-cover';

/** The tinted head of About: the profile summary, the specialty chips and the photo grid. */
export function AboutHead() {
  const copy = useCopy(aboutCopy);
  const { data: profile } = useProfileQuery();
  const specialties = (profile?.specialties ?? []).filter((s) => s.visible);
  const [top, bottom] = profile?.covers ?? [];

  return (
    <div className='rounded-b-[40px] bg-page-tint'>
      <section className='mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-14 px-5 pt-14 pb-20 min-[721px]:px-12'>
        <div className='flex min-w-0 flex-[1_1_460px] flex-col gap-6'>
          <h1 className='text-[38px] leading-[1.04] min-[721px]:text-[60px]'>
            {copy.title}
            <span
              aria-hidden='true'
              className='mt-[18px] block h-1.5 w-16 rounded-[3px] bg-page'
            />
          </h1>
          {profile?.summary && (
            <p className='max-w-[560px] text-xl leading-[1.6] text-[#3a404c]'>
              {profile.summary}
            </p>
          )}
          {specialties.length > 0 && (
            <ul className='m-0 flex list-none flex-wrap gap-2.5 p-0'>
              {specialties.map((s) => (
                <li key={s.name}>
                  <Tag
                    tone={s.tone === 'primary' ? 'neutral' : s.tone}
                    className={cn(
                      'px-3.5 py-[7px] text-[15px]',
                      s.tone === 'primary' && 'bg-night text-white',
                    )}
                  >
                    {s.name}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='grid h-[520px] min-w-0 flex-[1_1_380px] grid-cols-[1.4fr_1fr] grid-rows-2 gap-4'>
          {shell.avatar && (
            <Image
              src={shell.avatar}
              alt={`${copy.avatarAlt} ${shell.name}`}
              width={600}
              height={520}
              priority
              className={cn(photo, 'row-span-2')}
            />
          )}
          {top && (
            <Image
              src={top}
              alt={`${copy.coverAlt} ${shell.name}`}
              width={400}
              height={260}
              className={photo}
            />
          )}
          {bottom && (
            <Image
              src={bottom}
              alt={`${copy.coverAlt} ${shell.name}`}
              width={400}
              height={260}
              className={photo}
            />
          )}
        </div>
      </section>
    </div>
  );
}
