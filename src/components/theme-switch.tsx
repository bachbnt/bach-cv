/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
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
import { cn } from 'cn';

const ICONS: Record<Theme, ComponentType<{ className?: string }>> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

/** Header dropdown: the icon of the current choice and a chevron, then Light, Dark and System. */
export function ThemeSwitch() {
  const copy = useCopy(commonCopy);
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={copy.theme.label}
        className='group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-card px-3 text-sm font-semibold transition-colors hover:border-foreground'
      >
        <Icon aria-hidden='true' className='size-[18px]' />
        <ChevronDown
          aria-hidden='true'
          className={cn(
            'size-3.5 transition-transform duration-200 group-data-popup-open:rotate-180',
          )}
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
          {THEMES.map((code) => {
            const ItemIcon = ICONS[code];
            return (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                className='min-h-10 gap-2.5 rounded-lg px-3 text-[15px] font-medium data-checked:font-semibold'
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
