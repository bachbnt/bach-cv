/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Languages } from 'lucide-react';
import { commonCopy } from '@/content/copy/common';
import { type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { ToolbarMenu } from '@/skins/trade/shell/toolbar-menu';
import { offeredLanguages } from '@/lib/derive/offered-languages';

/** The language menu of the toolbar: same languages and same accessible name as the Standard header (`Language: English`). */
export function LanguageMenu() {
  const copy = useCopy(commonCopy);
  const { lang, setLang } = useLang();
  const options = offeredLanguages(shell.languages);
  const names: Record<Lang, string> = {
    en: copy.language.english,
    vi: copy.language.vietnamese,
  };
  if (options.length < 2) return null;
  return (
    <ToolbarMenu
      icon={<Languages aria-hidden='true' />}
      current={lang.toUpperCase()}
      label={`${copy.language.label}: ${names[lang]}`}
      value={lang}
      items={options.map((code) => ({ value: code, label: names[code] }))}
      onSelect={(value) => {
        const next = options.find((code) => code === value);
        if (next) setLang(next);
      }}
    />
  );
}
