/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BookUser } from 'lucide-react';
import Image from 'next/image';
import { certificatesCopy } from '@/content/copy/certificates';
import { travelPostcardsCopy } from '@/content/copy/travel-postcards';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useProfileQuery } from '@/lib/query/use-content';

/** The id of the page's heading: the panel is named by it. */
export const PASSPORT_TITLE_ID = 'tl-passport-title';

/**
 * The cover of the passport (the page's title and intro) and its identity page: the owner's photo, name, occupation and home, from
 * the profile and the shell the rest of the site reads. A row whose value has not arrived (or is empty) is left out.
 */
export function PassportCover() {
  const copy = useCopy(certificatesCopy);
  const words = useCopy(travelPostcardsCopy).passport;
  const { lang } = useLang();
  const { data: profile } = useProfileQuery();
  const rows = [
    [words.holder, profile?.fullName || shell.name],
    [words.occupation, localize(shell, lang).headline],
    [words.home, profile?.location ?? ''],
  ].filter(([, value]) => value);
  return (
    <>
      <header className='relative flex items-center gap-3.5 overflow-hidden bg-[linear-gradient(135deg,var(--tl-cover-1),var(--tl-cover-2))] px-5 py-4 text-white'>
        <BookUser
          aria-hidden='true'
          className='size-9 flex-none'
          strokeWidth={1.6}
        />
        <div className='min-w-0'>
          <p className='m-0 text-[10.5px] font-bold tracking-[1.4px] uppercase opacity-85'>
            {words.kicker}
          </p>
          <h1
            id={PASSPORT_TITLE_ID}
            className='m-0 text-[19px] leading-[1.2] font-extrabold tracking-[2px] uppercase'
          >
            {copy.title}
          </h1>
        </div>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -top-8 -right-8 size-[120px] rounded-full border-2 border-white/20 shadow-tl-halo'
        />
      </header>
      <div className='flex items-center gap-3.5 px-5 pt-4'>
        {shell.avatar && (
          <span className='relative block size-[74px] flex-none overflow-hidden rounded-xl border-2 border-tl-line'>
            <Image
              src={shell.avatar}
              alt=''
              fill
              sizes='74px'
              className='object-cover'
            />
          </span>
        )}
        <dl
          aria-label={words.idLabel}
          className='m-0 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-[12.5px]'
        >
          {rows.map(([label, value]) => (
            <div key={label} className='contents'>
              <dt className='font-semibold text-tl-muted'>{label}</dt>
              <dd className='m-0 font-bold'>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className='m-0 px-5 pt-3 text-[13px] text-tl-muted'>{copy.intro}</p>
    </>
  );
}
