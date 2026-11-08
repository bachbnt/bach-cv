/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tvButton } from '@/skins/trade/ui/tv-button';
import { TV_MENU_ITEM, TV_POPUP } from '@/skins/trade/ui/tv-menu';
import { cn } from '@/lib/utils';

interface ToolbarMenuItem {
  value: string;
  label: string;
  /** a short note after the label (`Trading chart`) */
  hint?: string;
}

/**
 * A drop-down of the toolbar (language, skin, theme): an icon and the current value, with a menu of radio items built on the shadcn
 * dropdown (focus handling, arrow keys and Escape come with it). `label` is the accessible name of the button.
 */
export function ToolbarMenu({
  icon,
  current,
  label,
  items,
  value,
  onSelect,
  onPreview,
}: {
  icon: ReactNode;
  /** what the button shows next to the icon; empty for an icon-only button */
  current?: string;
  label: string;
  items: ToolbarMenuItem[];
  value: string;
  onSelect: (value: string) => void;
  /** called when an item is pointed at or focused (the skin menu starts loading that skin) */
  onPreview?: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          tvButton({ variant: 'ghost', size: current ? 'default' : 'icon' }),
          'px-2 data-popup-open:bg-tv-hover',
        )}
      >
        {icon}
        {current && (
          <span aria-hidden='true' className='max-[720px]:hidden'>
            {current}
          </span>
        )}
        {current && (
          <ChevronDown
            aria-hidden='true'
            className='size-3 opacity-60 max-[720px]:hidden'
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={6}
        className={cn('min-w-[190px]', TV_POPUP)}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          {items.map((item) => (
            <DropdownMenuRadioItem
              key={item.value}
              value={item.value}
              closeOnClick
              onPointerEnter={() => onPreview?.(item.value)}
              onFocus={() => onPreview?.(item.value)}
              className={TV_MENU_ITEM}
            >
              {item.label}
              {item.hint && (
                <small className='text-xs text-tv-mute'>{item.hint}</small>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
