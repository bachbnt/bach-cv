/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useTrade } from '@/skins/trade/shell/trade-context';

/**
 * The symbol of the terminal, as in a chart toolbar: my photo, my name and my headline on a button that opens the symbol search. The
 * accessible name says what the button does; the name and the headline are what it shows.
 */
export function SymbolButton() {
  const copy = useCopy(tradeShellCopy).search;
  const { lang } = useLang();
  const { openSearch } = useTrade();
  return (
    <button
      type='button'
      data-slot='tv-symbol'
      aria-label={copy.button}
      aria-haspopup='dialog'
      aria-keyshortcuts='Control+K Meta+K /'
      onClick={openSearch}
      className='group flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded border border-tv-line px-2 text-[13px] whitespace-nowrap transition-[background-color,scale] duration-100 hover:bg-tv-hover active:scale-[.98] active:bg-tv-hover pointer-coarse:min-h-11 pointer-coarse:min-w-11'
    >
      {shell.avatar && (
        <Image
          src={shell.avatar}
          alt=''
          width={22}
          height={22}
          unoptimized
          className='size-[22px] flex-none rounded-full object-cover object-[50%_25%]'
        />
      )}
      <span aria-hidden='true' className='font-bold max-[560px]:hidden'>
        {shell.name}
      </span>
      <span
        aria-hidden='true'
        className='truncate text-xs text-tv-mute max-[1250px]:hidden'
      >
        {localize(shell, lang).headline}
      </span>
      <Search
        aria-hidden='true'
        className='size-4 flex-none text-tv-mute group-hover:text-tv-ink'
      />
      <kbd
        aria-hidden='true'
        className='rounded border border-tv-line px-1 font-sans text-[11px] leading-4 text-tv-mute max-[1100px]:hidden'
      >
        /
      </kbd>
    </button>
  );
}
