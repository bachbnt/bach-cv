/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { commonCopy } from '@/content/copy/common';
import { type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { offeredLanguages } from '@/lib/derive/offered-languages';

/**
 * Header dropdown: the "language" mark and the current language code (so the choice is always visible), then the languages
 * the site has. Same height and look as the theme button; the full name of the current language is in the accessible name.
 */
export function LanguageSwitch() {
  const copy = useCopy(commonCopy);
  const { lang, setLang } = useLang();
  const options = offeredLanguages(shell.languages);
  const names: Record<Lang, string> = {
    en: copy.language.english,
    vi: copy.language.vietnamese,
  };

  if (options.length < 2) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${copy.language.label}: ${names[lang]}`}
        className='inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-card px-3 text-sm font-semibold transition-colors hover:border-foreground data-popup-open:border-foreground'
      >
        <Languages aria-hidden='true' className='size-[18px]' />
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='min-w-[168px] rounded-xl bg-popover p-1.5 shadow-[0_16px_36px_rgba(0,0,0,.18)]'
      >
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(value) => setLang(value as Lang)}
        >
          {options.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              closeOnClick
              className='min-h-10 rounded-lg pr-9 pl-3 text-[15px] font-medium data-checked:font-semibold'
            >
              {names[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
