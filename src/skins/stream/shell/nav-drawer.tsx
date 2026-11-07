/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DownloadCv } from '@/components/download-cv';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { commonCopy } from '@/content/copy/common';
import { fill } from '@/lib/chat/fill';
import type { PageKey } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { NavList } from '@/skins/stream/shell/nav-list';
import { CV_ROW } from '@/skins/stream/shell/side-nav';

/** The sidebar as a drawer, for the widths where it does not sit in the layout: opened by the burger of the top bar. */
export function NavDrawer({
  open,
  onOpenChange,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: PageKey | null;
}) {
  const copy = useCopy(commonCopy);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        className='w-[min(280px,88vw)] gap-0 overflow-y-auto p-3 data-[side=left]:sm:max-w-[280px]'
      >
        <Link
          href='/'
          onClick={() => onOpenChange(false)}
          aria-label={fill(copy.homeLink, { name: shell.name })}
          className='mb-3 flex min-h-11 items-center gap-2 self-start rounded-lg px-1 pr-3'
        >
          <Image
            src='/logo.png'
            alt=''
            width={36}
            height={34}
            className='h-auto w-9'
          />
          <SheetTitle className='text-xl font-bold tracking-tight'>
            {shell.name}
          </SheetTitle>
        </Link>
        <nav aria-label={copy.mainNav}>
          <NavList current={current} onNavigate={() => onOpenChange(false)} />
        </nav>
        <hr className='mt-3 border-0 border-t border-sm-line' />
        <DownloadCv label={copy.downloadCv} className={CV_ROW} />
      </SheetContent>
    </Sheet>
  );
}
