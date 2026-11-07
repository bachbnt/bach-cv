/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Languages } from 'lucide-react';
import { commonCopy } from '@/content/copy/common';
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { MbMenu } from '@/skins/moba/shell/mb-menu';

/** The language menu: the same languages and the same accessible name as the Standard header (`Language: English`). */
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
    <MbMenu
      icon={<Languages aria-hidden='true' className='size-[18px]' />}
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
