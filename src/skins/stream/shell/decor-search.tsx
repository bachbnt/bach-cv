/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Search } from 'lucide-react';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useLang } from '@/lib/i18n/language';

/**
 * The search field of a video site. Standard has no search, so this one only dresses the top bar: it is hidden from assistive
 * technology, cannot be focused, and shows the headline of the site (a real value) where a query would be.
 */
export function DecorSearch() {
  const { lang } = useLang();
  return (
    <div
      aria-hidden='true'
      inert
      className='mx-auto hidden h-10 w-full max-w-[640px] min-w-0 flex-1 items-center overflow-hidden rounded-full border border-sm-line text-base text-sm-mute min-[701px]:flex'
    >
      <span className='min-w-0 flex-1 truncate px-4'>
        {localize(shell, lang).headline}
      </span>
      <span className='grid h-full w-16 flex-none place-items-center border-l border-sm-line bg-sm-hover'>
        <Search className='size-5 text-sm-ink' />
      </span>
    </div>
  );
}
