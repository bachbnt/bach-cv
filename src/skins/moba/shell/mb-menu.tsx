/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface MbMenuItem {
  value: string;
  label: string;
  /** a short note under the label (`In-game arena`) */
  hint?: string;
}

/**
 * A drop-down of the top bar (language, skin, theme): an icon and the current value, with a menu of radio items on the shadcn dropdown
 * (focus handling, arrow keys and Escape come with it). `label` is the accessible name of the button.
 */
export function MbMenu({
  icon,
  current,
  label,
  items,
  value,
  onSelect,
  onPreview,
}: {
  icon: ReactNode;
  current?: string;
  label: string;
  items: MbMenuItem[];
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
          'mb-top-btn flex h-10 cursor-pointer items-center justify-center gap-1.5 px-2.5 text-mb-gold-ink data-popup-open:text-mb-title pointer-coarse:h-11 pointer-coarse:min-w-11',
        )}
      >
        {icon}
        {current && (
          <span
            aria-hidden='true'
            className='text-[11px] font-bold tracking-[0.12em] uppercase max-[1099px]:hidden'
          >
            {current}
          </span>
        )}
        {current && (
          <ChevronDown
            aria-hidden='true'
            className='size-3 opacity-60 max-[1099px]:hidden'
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='mb-card z-[80] min-w-[200px] rounded-none p-1.5 ring-0'
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          {items.map((item) => (
            <DropdownMenuRadioItem
              key={item.value}
              value={item.value}
              closeOnClick
              onPointerEnter={() => onPreview?.(item.value)}
              onFocus={() => onPreview?.(item.value)}
              className='min-h-10 gap-3 rounded-none pr-9 pl-3 text-[13px] font-semibold text-mb-ink pointer-coarse:min-h-11'
            >
              <span className='flex flex-col leading-tight'>
                {item.label}
                {item.hint && (
                  <small className='text-[11px] font-normal text-mb-mute'>
                    {item.hint}
                  </small>
                )}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
