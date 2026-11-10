/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { travelMapCopy } from '@/content/copy/travel-map';
import { useNow } from '@/hooks/use-now';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';

/** The line at the end of every card, as in Standard's footer: the year, the owner's name and the rights. It scrolls with the page, so it never covers a control of the map. */
export function TlFooter() {
  const copy = useCopy(commonCopy);
  const credit = useCopy(travelMapCopy).credits;
  const now = useNow();
  return (
    <footer className='px-4 pt-1 pb-4 text-[12px] text-tl-muted md:px-5'>
      <p className='m-0'>
        &copy; {now.getFullYear()} {shell.name}. {copy.footer.rights}
      </p>
      {/* on a phone the sheet covers the credit line of the map (at the bottom of the map), so it is said here, as ODbL asks */}
      <p className='m-0 mt-1 md:hidden'>{credit}</p>
    </footer>
  );
}
