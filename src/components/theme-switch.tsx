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
import { useTheme, type Theme } from '@/lib/theme/theme';

const ICONS: Record<Theme, ComponentType<{ className?: string }>> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

/**
 * Header control: one square icon button that shows the visitor's choice (a sun, a moon, or a screen for System), and a menu
 * with System, Light and Dark. The icon is picked by CSS from `data-theme` on <html>, which the script in <head> sets before
 * the first paint, so the icon is right from the start and never flashes.
 */
export function ThemeSwitch() {
  const copy = useCopy(commonCopy);
  const { theme, setTheme, options, locked } = useTheme();

  if (locked) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.theme.label}
        className='inline-flex size-10 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card transition-colors hover:border-foreground data-popup-open:border-foreground'
      >
        <Monitor
          aria-hidden='true'
          className='size-[18px] [html[data-theme=dark]_&]:hidden [html[data-theme=light]_&]:hidden'
        />
        <Sun
          aria-hidden='true'
          className='hidden size-[18px] [html[data-theme=light]_&]:block'
        />
        <Moon
          aria-hidden='true'
          className='hidden size-[18px] [html[data-theme=dark]_&]:block'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='min-w-[168px] rounded-xl bg-popover p-1.5 shadow-[0_16px_36px_rgba(0,0,0,.18)]'
      >
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {options.map((code) => {
            const ItemIcon = ICONS[code];
            return (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                closeOnClick
                className='min-h-10 gap-2.5 rounded-lg pr-9 pl-3 text-[15px] font-medium data-checked:font-semibold'
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
