/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DownloadCv } from '@/components/download-cv';
import { commonCopy } from '@/content/copy/common';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { NavList } from '@/skins/stream/shell/nav-list';

/** The classes that make the Download CV button of Standard a row of the navigation (the colours come from the tokens). */
export const CV_ROW =
  'mt-3 h-10 w-full justify-start gap-6 rounded-[10px] bg-transparent px-3 text-sm font-normal text-sm-ink hover:bg-sm-hover hover:brightness-100 pointer-coarse:h-11 [&_svg]:size-6';

/** The sidebar of a wide screen: the pages, then Download CV. */
export function SideNav({ current }: { current: PageKey | null }) {
  const copy = useCopy(commonCopy);
  return (
    <nav aria-label={copy.mainNav} className='p-3'>
      <NavList current={current} />
      <hr className='mt-3 border-0 border-t border-sm-line' />
      <DownloadCv label={copy.downloadCv} className={CV_ROW} />
    </nav>
  );
}
