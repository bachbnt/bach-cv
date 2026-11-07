/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { THEMES, useTheme, type Theme } from '@/lib/theme/theme';
import {
  ICON_BUTTON,
  MENU_CONTENT,
  MENU_ITEM,
} from '@/skins/stream/ui/icon-button-class';

const ICONS: Record<Theme, ComponentType<{ className?: string }>> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

/** The theme menu: one round button whose icon follows `data-theme` on <html> (so it is right before the first paint), and System, Light, Dark. */
export function ThemeMenu() {
  const copy = useCopy(commonCopy);
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.theme.label}
        className={ICON_BUTTON}
      >
        <Monitor
          aria-hidden='true'
          className='[html[data-theme=dark]_&]:hidden [html[data-theme=light]_&]:hidden'
        />
        <Sun
          aria-hidden='true'
          className='hidden [html[data-theme=light]_&]:block'
        />
        <Moon
          aria-hidden='true'
          className='hidden [html[data-theme=dark]_&]:block'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className={MENU_CONTENT}>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {THEMES.map((code) => {
            const ItemIcon = ICONS[code];
            return (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                closeOnClick
                className={MENU_ITEM}
              >
                <ItemIcon aria-hidden='true' className='size-4' />
                {copy.theme[code]}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
