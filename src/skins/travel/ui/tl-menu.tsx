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

interface TlMenuItem {
  value: string;
  label: string;
  /** a short note after the label (`Trip map of Nha Trang`) */
  hint?: string;
}

/**
 * A drop-down of the header (language, skin, theme): an icon and the current value in a round button, with a menu of radio items built
 * on the shadcn dropdown (focus handling, arrow keys and Escape come with it). `label` is the accessible name of the button.
 */
export function TlMenu({
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
  items: TlMenuItem[];
  value: string;
  onSelect: (value: string) => void;
  onPreview?: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-tl-chip text-[13px] font-bold text-tl-chip-ink transition-transform hover:-translate-y-px data-popup-open:bg-tl-coral data-popup-open:text-tl-on-coral pointer-coarse:min-h-11 [&_svg]:size-[18px]',
          current ? 'px-3.5' : 'w-10',
        )}
      >
        {icon}
        {current && (
          <span aria-hidden='true' className='max-md:hidden'>
            {current}
          </span>
        )}
        {current && (
          <ChevronDown
            aria-hidden='true'
            className='!size-3 opacity-60 max-md:hidden'
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='min-w-[190px] rounded-2xl border border-tl-line bg-tl-solid p-1.5 text-tl-ink shadow-tl-pop'
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          {items.map((item) => (
            <DropdownMenuRadioItem
              key={item.value}
              value={item.value}
              closeOnClick
              onPointerEnter={() => onPreview?.(item.value)}
              onFocus={() => onPreview?.(item.value)}
              className='min-h-10 rounded-xl pr-9 pl-3 text-[14.5px] font-medium data-checked:font-bold'
            >
              <span className='flex flex-col leading-tight'>
                {item.label}
                {item.hint && (
                  <small className='text-xs font-normal text-tl-muted'>
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
