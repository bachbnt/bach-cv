/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One quick setting as a tile of the shade: its glyph, its name and the choice in use. The button has the name Standard's menu button has
 * (`Language: English`, `Skin: Phone`, `Theme`) and opens the choices below the tiles.
 */
export function PhShadeTile({
  name,
  icon: Icon,
  title,
  current,
  open,
  controls,
  onToggle,
}: {
  /** the accessible name of the tile, the one Standard gives its menu button */
  name: string;
  icon: LucideIcon;
  title: string;
  /** the words under the name: the choice in use */
  current: string;
  open: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type='button'
      aria-label={name}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        'flex min-h-[5.5rem] min-w-0 cursor-pointer flex-col items-start justify-between gap-2 rounded-ph-panel p-3 text-left transition-[scale,background-color] duration-100 hover:bg-ph-sheet-3 active:scale-[0.97]',
        open ? 'bg-ph-accent text-ph-on-accent' : 'bg-ph-sheet-2',
      )}
    >
      <Icon aria-hidden='true' className='size-6 shrink-0' strokeWidth={2} />
      <span className='flex w-full min-w-0 flex-col'>
        <span className='truncate text-[14px] leading-tight font-semibold'>
          {title}
        </span>
        <span
          className={cn(
            'truncate text-[13px] leading-tight',
            open ? 'text-ph-on-accent' : 'text-ph-mute',
          )}
        >
          {current}
        </span>
      </span>
    </button>
  );
}
