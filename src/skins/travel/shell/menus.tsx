/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LayoutTemplate, Languages, Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { skinsCopy } from '@/content/copy/skins';
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useSkin } from '@/lib/skin/skin';
import { isSkinId, SKIN_IDS } from '@/lib/skin/skins';
import { THEMES, useTheme, type Theme } from '@/lib/theme/theme';
import { preloadSkin } from '@/skins/registry';
import { TlMenu } from '@/skins/travel/ui/tl-menu';

/** The language menu of the header: same languages and same accessible name as the Standard header (`Language: English`). */
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
    <TlMenu
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

/** The Skin menu, built from `SKIN_IDS` like the Standard one (`Skin: Travel`): it is how a visitor leaves this skin. */
export function SkinMenu() {
  const copy = useCopy(skinsCopy);
  const { skin, setSkin } = useSkin();
  return (
    <TlMenu
      icon={<LayoutTemplate aria-hidden='true' />}
      label={`${copy.label}: ${copy.names[skin].name}`}
      value={skin}
      items={SKIN_IDS.map((id) => ({
        value: id,
        label: copy.names[id].name,
        hint: copy.names[id].hint,
      }))}
      onSelect={(value) => isSkinId(value) && setSkin(value)}
      onPreview={(value) => isSkinId(value) && preloadSkin(value)}
    />
  );
}

const ICONS: Record<Theme, ReactNode> = {
  system: <Monitor aria-hidden='true' />,
  light: <Sun aria-hidden='true' />,
  dark: <Moon aria-hidden='true' />,
};

/** The theme menu: System, Light and Dark (day and night on the map), with the Standard accessible name (`Theme`). */
export function ThemeMenu() {
  const copy = useCopy(commonCopy);
  const { theme, setTheme } = useTheme();
  return (
    <TlMenu
      icon={ICONS[theme]}
      label={copy.theme.label}
      value={theme}
      items={THEMES.map((value) => ({ value, label: copy.theme[value] }))}
      onSelect={(value) => {
        const next = THEMES.find((code) => code === value);
        if (next) setTheme(next);
      }}
    />
  );
}
