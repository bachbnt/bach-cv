/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { useTheme, type Theme } from '@/lib/theme/theme';
import { ToolbarMenu } from '@/skins/trade/shell/toolbar-menu';

const ICONS: Record<Theme, ReactNode> = {
  system: <Monitor aria-hidden='true' />,
  light: <Sun aria-hidden='true' />,
  dark: <Moon aria-hidden='true' />,
};

/** The theme menu of the toolbar: System, Light and Dark, with the Standard accessible name (`Theme`). */
export function ThemeMenu() {
  const copy = useCopy(commonCopy);
  const { theme, setTheme, options, locked } = useTheme();
  if (locked) return null;
  return (
    <ToolbarMenu
      icon={ICONS[theme]}
      label={copy.theme.label}
      value={theme}
      items={options.map((value) => ({ value, label: copy.theme[value] }))}
      onSelect={(value) => {
        const next = options.find((code) => code === value);
        if (next) setTheme(next);
      }}
    />
  );
}
