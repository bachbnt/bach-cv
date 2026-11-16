/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useLang } from '@/lib/i18n/language';
import { useProfileQuery } from '@/lib/query/use-content';

/**
 * The top of a contact card: a large paper-white tile with the logo of the site (the same image as the maintenance screen and the header
 * of Standard; white in both themes, so the red of the logo keeps its contrast), the name, the headline of the site and where I am. The
 * logo is decoration (the name is next to it).
 */
export function PhConnectCard() {
  const { lang } = useLang();
  const { data: profile } = useProfileQuery();
  return (
    <div className='flex flex-col items-center px-4 pt-1 pb-5 text-center'>
      <span className='grid size-24 place-items-center rounded-[30%] bg-ph-paper shadow-ph-icon ring-1 ring-ph-line'>
        <Image
          src='/logo.png'
          alt=''
          width={36}
          height={34}
          className='h-auto w-[60%]'
        />
      </span>
      <p className='mt-3 mb-0 text-[22px]/[1.2] font-bold tracking-[-0.01em] wrap-anywhere'>
        {shell.name}
      </p>
      <p className='mt-1 mb-0 text-[15px]/[1.4] wrap-anywhere text-ph-mute'>
        {localize(shell, lang).headline}
      </p>
      {profile?.location && (
        <p className='mt-1.5 mb-0 flex items-center gap-1.5 text-[14px] text-ph-mute'>
          <MapPin aria-hidden='true' className='size-4 shrink-0' />
          {profile.location}
        </p>
      )}
    </div>
  );
}
