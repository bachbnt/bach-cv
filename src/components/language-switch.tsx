/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { commonCopy } from '@/content/copy/common';
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from 'cn';

/** Header dropdown: a globe, the language code and a chevron, then the languages the site has. */
export function LanguageSwitch() {
  const copy = useCopy(commonCopy);
  const { lang, setLang } = useLang();
  const options = LANGS.filter((code) => shell.languages.includes(code));
  const names: Record<Lang, string> = {
    en: copy.language.english,
    vi: copy.language.vietnamese,
  };

  if (options.length < 2) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.language.label}
        className='group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-white px-3 text-sm font-semibold transition-colors hover:border-foreground'
      >
        <Globe aria-hidden='true' className='size-[18px]' />
        {lang.toUpperCase()}
        <ChevronDown
          aria-hidden='true'
          className={cn(
            'size-3.5 transition-transform duration-200 group-data-popup-open:rotate-180',
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='min-w-[168px] rounded-xl bg-white p-1.5 shadow-[0_16px_36px_rgba(27,31,39,.16)]'
      >
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(value) => setLang(value as Lang)}
        >
          {options.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              className='min-h-10 rounded-lg px-3 text-[15px] font-medium data-checked:font-semibold'
            >
              {names[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
