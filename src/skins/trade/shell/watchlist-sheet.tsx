/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { X } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { Watchlist } from '@/skins/trade/shell/watchlist';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { useState, type ReactElement } from 'react';

/**
 * The watchlist of a phone as a sheet from the bottom: the bar has room for three pages, so the button that opens this one is how every
 * page, skill and role is one tap away. It closes by itself when a page is chosen (the link navigates, the page behind is the new one).
 */
export function WatchlistSheet({
  page,
  trigger,
}: {
  page: PageKey | null;
  /** the button of the bar that opens it */
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const copy = useCopy(tradeShellCopy).watch;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent
        side='bottom'
        showCloseButton={false}
        onClickCapture={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('a[href]')
          )
            setOpen(false);
        }}
        className='data-[side=bottom]:h-[80dvh] max-h-[calc(100dvh-16px)] gap-0 overflow-y-auto rounded-t-lg border-t border-tv-line bg-tv-bg p-0 text-tv-ink'
      >
        <Watchlist
          page={page}
          className='min-h-full border-t-0'
          action={
            <SheetClose
              render={<TvButton size='icon' aria-label={copy.closeSheet} />}
            >
              <X aria-hidden='true' />
            </SheetClose>
          }
        />
      </SheetContent>
    </Sheet>
  );
}
