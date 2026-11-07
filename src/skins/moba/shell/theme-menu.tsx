/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { THEMES, useTheme, type Theme } from '@/lib/theme/theme';
import { MbMenu } from '@/skins/moba/shell/mb-menu';

const ICONS: Record<Theme, ReactNode> = {
  system: <Monitor aria-hidden='true' className='size-[18px]' />,
  light: <Sun aria-hidden='true' className='size-[18px]' />,
  dark: <Moon aria-hidden='true' className='size-[18px]' />,
};

/** The theme menu (System, Light and Dark) with the Standard accessible name (`Theme`). */
export function ThemeMenu() {
  const copy = useCopy(commonCopy);
  const { theme, setTheme } = useTheme();
  return (
    <MbMenu
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
