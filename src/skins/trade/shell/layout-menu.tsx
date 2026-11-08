/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown, PanelsTopLeft, RotateCcw } from 'lucide-react';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DEFAULT_LAYOUT, type Layout } from '@/skins/trade/blocks/shell-layout';
import { useTrade } from '@/skins/trade/shell/trade-context';
import { tvButton } from '@/skins/trade/ui/tv-button';
import { TV_MENU_ITEM, TV_POPUP } from '@/skins/trade/ui/tv-menu';

const PARTS = [
  'watchlist',
  'panel',
  'tools',
  'tape',
] as const satisfies readonly (keyof Layout)[];

/** The parts a phone has no place for: the watchlist is a sheet there and the page is always shown. */
const WIDE_ONLY: readonly (typeof PARTS)[number][] = ['watchlist', 'panel'];

/**
 * The Layout menu: which parts of the terminal show (the watchlist, the page panel, the tool rail, the ticker tape), and puts the sizes and the parts back as they were at first. The choice is kept in the
 * browser. A phone has no watchlist column and always shows the page, so there the menu has the tool strip and the ticker tape, and
 * Reset layout.
 */
export function LayoutMenu() {
  const copy = useCopy(tradeShellCopy).toolbar;
  const { layout, setLayout } = useTrade();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.layoutLabel}
        className={cn(
          tvButton({ variant: 'ghost' }),
          'px-2 data-popup-open:bg-tv-hover',
        )}
      >
        <PanelsTopLeft aria-hidden='true' />
        <span aria-hidden='true' className='max-[1250px]:hidden'>
          {copy.layout}
        </span>
        <ChevronDown
          aria-hidden='true'
          className='size-3 opacity-60 max-[1250px]:hidden'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={6}
        className={cn('min-w-[190px]', TV_POPUP)}
      >
        {PARTS.map((part) => (
          <DropdownMenuCheckboxItem
            key={part}
            checked={layout[part]}
            onCheckedChange={(checked) => setLayout({ [part]: checked })}
            className={cn(
              TV_MENU_ITEM,
              WIDE_ONLY.includes(part) && 'max-[1100px]:hidden',
            )}
          >
            {copy[part]}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator className='bg-tv-line' />
        <DropdownMenuItem
          data-testid='tv-reset-layout'
          onClick={() => setLayout(DEFAULT_LAYOUT)}
          className={cn(TV_MENU_ITEM, 'pr-2.5')}
        >
          <RotateCcw aria-hidden='true' className='size-3.5' />
          {copy.resetLayout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
