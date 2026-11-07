/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { tvButton } from '@/skins/trade/ui/tv-button';
import { TV_BADGE } from '@/skins/trade/ui/tv-chip';
import { TV_POPUP } from '@/skins/trade/ui/tv-menu';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  /** a number at the end of the row (how many projects use it) */
  count?: number;
  /** shown but cannot be changed */
  locked?: boolean;
}

/**
 * A button that opens a list of checkboxes (the column chooser, the technology filter), built on the shadcn popover so focus,
 * Escape and outside clicks come with it. `badge` is a short note on the button (how many are chosen).
 */
export function DataChecklistPopover({
  label,
  title,
  badge,
  items,
  onToggle,
  footer,
}: {
  label: string;
  title: string;
  badge?: string;
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  footer?: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          tvButton({ variant: 'outline' }),
          'h-[26px] px-2.5 data-popup-open:bg-tv-hover',
        )}
      >
        {label}
        {badge && <span className={TV_BADGE}>{badge}</span>}
        <ChevronDown aria-hidden='true' className='!size-3 opacity-60' />
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={6}
        aria-label={title}
        className={cn('w-[min(260px,calc(100vw-24px))] gap-1', TV_POPUP)}
      >
        <p className='px-2 pt-1 pb-0.5 text-[11px] font-semibold text-tv-mute'>
          {title}
        </p>
        <ul className='m-0 max-h-[260px] list-none overflow-auto p-0'>
          {items.map((item) => (
            <li key={item.id}>
              <label
                className={cn(
                  'flex h-8 items-center gap-2 rounded px-2 text-[13px] pointer-coarse:min-h-11',
                  item.locked
                    ? 'text-tv-mute'
                    : 'cursor-pointer hover:bg-tv-hover active:bg-tv-hover',
                )}
              >
                <input
                  type='checkbox'
                  checked={item.checked}
                  disabled={item.locked}
                  onChange={() => onToggle(item.id)}
                  className='size-4 accent-tv-accent'
                />
                <span className='min-w-0 truncate'>{item.label}</span>
                {item.count !== undefined && (
                  <span className='ml-auto text-xs text-tv-mute tabular-nums'>
                    {item.count}
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
        {footer}
      </PopoverContent>
    </Popover>
  );
}
