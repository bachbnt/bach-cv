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
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import {
  ICON_BUTTON,
  MENU_CONTENT,
  MENU_ITEM,
} from '@/skins/stream/ui/icon-button-class';
import { cn } from '@/lib/utils';

/** The language menu: the mark and the code of the current language, then the languages the site has. Same name as the Standard one. */
export function LanguageMenu() {
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
        aria-label={`${copy.language.label}: ${names[lang]}`}
        className={cn(ICON_BUTTON, 'px-3 text-sm font-medium')}
      >
        <Languages aria-hidden='true' />
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className={MENU_CONTENT}>
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(value) => setLang(value as Lang)}
        >
          {options.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              closeOnClick
              className={MENU_ITEM}
            >
              {names[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
