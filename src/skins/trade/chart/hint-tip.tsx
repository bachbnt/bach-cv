/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactElement } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * The tip of a button of the terminal: its name and, when it has one, its keys ("Trend line  Alt+T"), on hover and on keyboard focus.
 * `children` is the button itself (the tip is attached to it, no wrapper). The name stays the button's own accessible name.
 */
export function HintTip({
  label,
  shortcut,
  note,
  side = 'bottom',
  children,
}: {
  label: string;
  shortcut?: string;
  /** a second line (how to keep a tool on) */
  note?: string;
  side?: 'top' | 'bottom' | 'right';
  children: ReactElement<Record<string, unknown>>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger delay={350} render={children} />
      <TooltipContent
        side={side}
        sideOffset={8}
        className='flex-col items-start gap-0.5 bg-tv-tip px-2.5 py-1.5 text-white [&>:last-child]:bg-tv-tip [&>:last-child]:fill-tv-tip'
      >
        <span className='flex items-center gap-2'>
          {label}
          {shortcut && (
            <kbd className='rounded bg-white/15 px-1.5 py-px font-sans text-[11px]'>
              {shortcut}
            </kbd>
          )}
        </span>
        {note && <span className='text-[11px] opacity-70'>{note}</span>}
      </TooltipContent>
    </Tooltip>
  );
}
