/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/skins/stream/shell/use-nav-items';
import { PageIcon } from '@/skins/stream/ui/page-icon';

const row =
  'flex h-10 items-center gap-6 rounded-[10px] px-3 text-sm pointer-coarse:h-11';

/** One page of the navigation: a link (`aria-current` on the open one), or, for a page that is `soon`, a label with its Soon marker. */
export function NavRow({
  item,
  current,
  onNavigate,
}: {
  item: NavItem;
  current: PageKey | null;
  onNavigate?: () => void;
}) {
  const copy = useCopy(commonCopy);
  if (item.state === 'soon') {
    return (
      <span className={cn(row, 'text-sm-mute')}>
        <PageIcon page={item.page} className='size-6 shrink-0' />
        {item.label}
        <small className='ml-auto rounded-full bg-sm-hover px-2 py-0.5 text-xs font-medium'>
          {copy.soon}
        </small>
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={current === item.page ? 'page' : undefined}
      className={cn(
        row,
        'transition-colors hover:bg-sm-hover aria-[current=page]:bg-sm-hover aria-[current=page]:font-medium',
      )}
    >
      <PageIcon page={item.page} className='size-6 shrink-0' />
      {item.label}
    </Link>
  );
}
