/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { aboutCopy } from '@/content/copy/about';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { HomePolaroid } from '@/skins/academic/blocks/home-polaroid';
import { visibleSpecialties } from '@/lib/derive/specialties';

/** How a specialty is written: the area it belongs to is the colour of its chalk; the main one is filled in. */
const TONE = {
  primary: 'border-ac-ink bg-ac-ink text-ac-board',
  mobile: 'border-ac-mc text-ac-mc',
  web: 'border-ac-ma text-ac-ma',
  ai: 'border-ac-mb text-ac-mb',
} as const;

/**
 * Under the title of About: the summary of the profile with the specialties written as hand-drawn tags, and the photographs (the portrait and the two
 * covers of the profile) taped beside them. The same words and pictures as Standard's head.
 */
export function AboutHead() {
  const copy = useCopy(aboutCopy);
  const mine = useCopy(academicHomeAboutCopy).about;
  const { data: profile } = useProfileQuery();
  const specialties = visibleSpecialties(profile);
  const [top, bottom] = profile?.covers ?? [];

  return (
    <HomeCol>
      <div className='flex flex-wrap items-start gap-x-10 gap-y-8'>
        <div className='min-w-0 flex-[1_1_320px]'>
          {profile?.summary && (
            <p className='m-0 mb-5 max-w-[56ch] text-[1.05em]'>
              {profile.summary}
            </p>
          )}
          {specialties.length > 0 && (
            <ul
              aria-label={mine.expertise}
              className='m-0 flex list-none flex-wrap gap-2.5 p-0'
            >
              {specialties.map((s) => (
                <li
                  key={s.name}
                  className={cn(
                    'rounded-[16px_11px_15px_12px/12px_15px_11px_16px] border-2 px-3.5 pt-1 pb-[5px] font-ac-note text-[17px]/[1.15]',
                    TONE[s.tone],
                  )}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='grid w-[min(100%,260px)] flex-none grid-cols-2 gap-x-3 gap-y-5'>
          {shell.avatar && (
            <HomePolaroid
              src={shell.avatar}
              alt={`${copy.avatarAlt} ${shell.name}`}
              caption={shell.name}
              aspect='aspect-[4/5]'
              tilt={-2}
              sizes='(min-width: 900px) 260px, 70vw'
              priority
              className='col-span-2'
            />
          )}
          {top && (
            <HomePolaroid
              src={top}
              alt={`${copy.coverAlt} ${shell.name}`}
              tilt={1.8}
              sizes='130px'
              className='pb-2'
            />
          )}
          {bottom && (
            <HomePolaroid
              src={bottom}
              alt={`${copy.coverAlt} ${shell.name}`}
              tilt={-1.4}
              sizes='130px'
              className='pb-2'
            />
          )}
        </div>
      </div>
    </HomeCol>
  );
}
