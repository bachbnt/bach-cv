/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { devCopy } from '@/content/copy/dev';
import { skinsCopy } from '@/content/copy/skins';
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useSkin } from '@/lib/skin/skin';
import { isSkinId, SKIN_IDS } from '@/lib/skin/skins';
import { preloadSkin } from '@/skins/registry';
import { THEMES, useTheme, type Theme } from '@/lib/theme/theme';
import { DEV_PROJECT } from '@/skins/dev/config';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { emit } from '@/skins/dev/shell/devlog/store';
import { DevMenu } from '@/skins/dev/ui/dev-menu';
import { WindowDots } from '@/skins/dev/ui/window-dots';

/** The two icons of the burger sit on top of each other and cross-fade when the Explorer drawer opens. */
const NAV_ICON =
  'size-[18px] [grid-area:1/1] transition-[opacity,color] duration-200';

/**
 * The title bar of the editor window: the burger of a phone (it opens the Explorer), the window lights, the command centre with the
 * project name and the language, skin and theme menus.
 */
export function TitleBar({
  navOpen,
  onToggleNav,
}: {
  navOpen: boolean;
  onToggleNav: () => void;
}) {
  const dev = useCopy(devCopy);
  const common = useCopy(commonCopy);
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const skins = useCopy(skinsCopy);
  const { skin, setSkin } = useSkin();

  const languages = LANGS.filter((code) => shell.languages.includes(code));
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
    <div className='flex h-[30px] items-center gap-3 border-b border-line bg-chrome-2 px-3 font-sans text-[12.5px] leading-[normal] text-mute'>
      <button
        type='button'
        className='group/nav -ml-1 hidden h-[26px] w-[34px] cursor-pointer place-items-center rounded-[6px] bg-transparent text-ink transition-colors duration-150 hover:bg-hov max-[900px]:inline-grid'
        aria-expanded={navOpen}
        aria-controls='dv-explorer'
        aria-label={navOpen ? dev.closeFiles : dev.files}
        onClick={onToggleNav}
      >
        <DevIcon
          name='layout-sidebar-left-off'
          className={NAV_ICON + ' group-aria-expanded/nav:opacity-0'}
        />
        <DevIcon
          name='layout-sidebar-left'
          className={
            NAV_ICON +
            ' opacity-0 group-aria-expanded/nav:text-signal group-aria-expanded/nav:opacity-100'
          }
        />
      </button>
      <WindowDots className='max-[900px]:hidden' />
      <div className='mx-auto flex h-[22px] w-[min(46%,440px)] items-center justify-center gap-2 overflow-hidden rounded-[6px] border border-line-2 bg-editor px-3 whitespace-nowrap text-mute max-[900px]:hidden'>
        <DevIcon name='search' className='mr-1.5 size-[13px]' />
        {DEV_PROJECT}
      </div>
      <div className='flex items-center gap-1.5 text-mute max-[620px]:gap-0.5 max-[900px]:ml-auto'>
        {languages.length > 1 && (
          <DevMenu
            icon='globe'
            current={lang.toUpperCase()}
            label={common.language.label}
            value={lang}
            items={languages.map((code) => ({
              value: code,
              label: names[code],
              hint: code.toUpperCase(),
            }))}
            onSelect={(value) => {
              const next = languages.find((code) => code === value);
              if (next) setLang(next);
            }}
          />
        )}
        <DevMenu
          icon='browser'
          current={skins.names[skin].name}
          label={skins.label}
          value={skin}
          items={SKIN_IDS.map((id) => ({
            value: id,
            label: skins.names[id].name,
            hint: skins.names[id].hint,
          }))}
          onSelect={(value) => {
            if (!isSkinId(value)) return;
            // this shell goes away with the skin, so the line is written here; the log lasts while the page is open
            if (value !== skin) emit({ kind: 'setting', name: 'skin', value });
            setSkin(value);
          }}
          onPreview={(value) => isSkinId(value) && preloadSkin(value)}
        />
        <DevMenu
          icon='color-mode'
          current={themeNames[theme]}
          label={common.theme.label}
          value={theme}
          items={THEMES.map((value) => ({
            value,
            label: themeNames[value],
            hint: dev.themeHints[value],
          }))}
          onSelect={(value) => {
            const next = THEMES.find((option) => option === value);
            if (next) setTheme(next);
          }}
        />
      </div>
    </div>
  );
}
