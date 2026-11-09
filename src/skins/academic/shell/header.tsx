/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { academicCopy } from '@/content/copy/academic';
import { commonCopy } from '@/content/copy/common';
import { skinsCopy } from '@/content/copy/skins';
import { type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useSkin } from '@/lib/skin/skin';
import { isSkinId, SKIN_IDS } from '@/lib/skin/skins';
import { THEMES, useTheme, type Theme } from '@/lib/theme/theme';
import { AcConnectMenu } from '@/skins/academic/shell/ac-connect-menu';
import { AcCvButton } from '@/skins/academic/shell/ac-cv-button';
import { preloadSkin } from '@/skins/registry';
import { AcMenu } from '@/skins/academic/ui/ac-menu';
import { initialOf } from '@/lib/derive/initials';
import { offeredLanguages } from '@/lib/derive/offered-languages';

/**
 * The top of the board: the name and what this is, then the tags that change the language, the skin and the theme (in that order, as in every
 * skin), Connect and the CV. The theme tag says "Chalkboard" or "Whiteboard" in the words of the Standard theme menu (Dark, Light, System).
 */
export function Header() {
  const common = useCopy(commonCopy);
  const copy = useCopy(academicCopy);
  const skins = useCopy(skinsCopy);
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { skin, setSkin } = useSkin();

  const languages = offeredLanguages(shell.languages);
  const names: Record<Lang, string> = {
    en: common.language.english,
    vi: common.language.vietnamese,
  };
  const themeNames: Record<Theme, string> = {
    system: common.theme.system,
    light: common.theme.light,
    dark: common.theme.dark,
  };

  return (
    <div className='mx-auto flex max-w-[1120px] flex-wrap items-center gap-3.5 px-5 pt-[calc(var(--ac-frame-w,14px)+16px)] pb-3.5 max-[760px]:gap-2.5 max-[760px]:px-3.5'>
      <Link
        href='/'
        aria-label={fill(common.homeLink, { name: shell.name })}
        className='flex items-center gap-3 no-underline'
      >
        <span
          aria-hidden='true'
          className='inline-grid size-[34px] rotate-[-3deg] place-items-center rounded-[9px_4px_10px_5px/5px_10px_4px_9px] border-[2.4px] border-ac-accent font-ac-chalk text-[25px]/none text-ac-accent'
        >
          {initialOf(shell.name)}
        </span>
        <b className='ac-glow font-ac-chalk text-[34px]/none font-normal tracking-[0.01em]'>
          {shell.name}
        </b>
        <small className='border-l-2 border-dashed border-ac-rule pl-3 text-[0.8em] leading-[1.1] text-ac-mute italic max-[760px]:hidden'>
          {copy.brandNote}
        </small>
      </Link>
      <div className='ml-auto flex flex-wrap items-center gap-2 max-[760px]:gap-1.5'>
        {languages.length > 1 && (
          <AcMenu
            label={common.language.label}
            current={lang.toUpperCase()}
            value={lang}
            items={languages.map((code) => ({
              value: code,
              label: names[code],
              hint: code.toUpperCase(),
              lang: code,
            }))}
            onSelect={(value) => {
              const next = languages.find((code) => code === value);
              if (next) setLang(next);
            }}
          />
        )}
        <AcMenu
          label={skins.label}
          current={skins.names[skin].name}
          value={skin}
          items={SKIN_IDS.map((id) => ({
            value: id,
            label: skins.names[id].name,
            hint: skins.names[id].hint,
          }))}
          onSelect={(value) => isSkinId(value) && setSkin(value)}
          onPreview={(value) => isSkinId(value) && preloadSkin(value)}
        />
        <AcMenu
          label={common.theme.label}
          current={themeNames[theme]}
          value={theme}
          items={THEMES.map((value) => ({
            value,
            label: themeNames[value],
          }))}
          onSelect={(value) => {
            const next = THEMES.find((option) => option === value);
            if (next) setTheme(next);
          }}
        />
        <AcConnectMenu />
        <AcCvButton />
      </div>
    </div>
  );
}
