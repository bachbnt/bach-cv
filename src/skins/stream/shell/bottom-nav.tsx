/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { commonCopy } from '@/content/copy/common';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { splitTabs } from '@/skins/stream/config';
import { useNavItems } from '@/skins/stream/shell/use-nav-items';
import { PageIcon } from '@/skins/stream/ui/page-icon';

// the sheet only opens on a tap, so its code waits until then
const MoreSheet = dynamic(
  () => import('@/skins/stream/shell/more-sheet').then((m) => m.MoreSheet),
  { ssr: false },
);

const tab =
  'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] leading-tight text-sm-mute aria-[current=page]:font-bold aria-[current=page]:text-sm-ink';

/** The navigation of a phone: four pages as tabs and a Menu tab whose sheet holds the other pages and the settings. */
export function BottomNav({ current }: { current: PageKey | null }) {
  const copy = useCopy(commonCopy);
  const { tabs, more } = splitTabs(useNavItems());
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label={copy.mainNav}
      className='fixed inset-x-0 bottom-0 z-30 flex h-14 border-t border-sm-line bg-sm-bg [view-transition-name:sm-bottom] min-[701px]:hidden'
    >
      {tabs.map((item) =>
        item.state === 'soon' ? (
          <span key={item.page} className={tab}>
            <PageIcon page={item.page} className='size-6' />
            {item.label}
          </span>
        ) : (
          <Link
            key={item.page}
            href={item.href}
            aria-current={current === item.page ? 'page' : undefined}
            className={tab}
          >
            <PageIcon page={item.page} className='size-6' />
            {item.label}
          </Link>
        ),
      )}
      <button
        type='button'
        aria-haspopup='dialog'
        aria-label={copy.menu.open}
        onClick={() => setOpen(true)}
        className={tab}
      >
        <Menu aria-hidden='true' className='size-6' />
        {copy.menu.label}
      </button>
      {open && (
        <MoreSheet
          open={open}
          onOpenChange={setOpen}
          items={more}
          current={current}
        />
      )}
    </nav>
  );
}
