/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { Category } from '@/skins/trade/blocks/data-skill-heat-model';
import { SKILL_TIP_ID } from '@/components/skills/skill-tip';
import { cn } from '@/lib/utils';
import { type HeatTile } from '@/skins/trade/blocks/data-skill-heat-model';
import { useTipEvents } from '@/skins/trade/blocks/data-use-tip-taps';
import { cssVars } from '@/skins/trade/ui/css-vars';

/** Each area in a colour of the terminal mixed into the background, so the ink keeps its contrast in both themes. */
export const AREA: Record<Category, string> = {
  ai: 'border-tv-violet bg-[color-mix(in_srgb,var(--tv-violet)_30%,var(--tv-bg))]',
  mobile: 'border-tv-up bg-[color-mix(in_srgb,var(--tv-up)_30%,var(--tv-bg))]',
  web: 'border-tv-sky bg-[color-mix(in_srgb,var(--tv-sky)_30%,var(--tv-bg))]',
  tools:
    'border-tv-gold bg-[color-mix(in_srgb,var(--tv-gold)_30%,var(--tv-bg))]',
};

export function Tile({
  tile,
  area,
  rect,
  box,
  index,
  pinned,
  tabbable,
  active,
  used,
  label,
  onTip,
  onHide,
  onFocusTile,
  onPin,
}: {
  tile: HeatTile;
  area: Category;
  rect: { x: number; y: number; w: number; h: number };
  box: { width: number; height: number };
  index: number;
  pinned: boolean;
  tabbable: boolean;
  active: boolean;
  used: string;
  label: string;
  onTip: (tile: HeatTile, element: HTMLElement) => void;
  onHide: () => void;
  onFocusTile: (id: string) => void;
  onPin: (id: string) => void;
}) {
  const events = useTipEvents({
    active,
    onShow: (element) => onTip(tile, element),
    onHide,
    onPress: () => onPin(tile.skill.id),
  });
  const small = rect.w < 84 || rect.h < 56;
  const none = tile.roles.length === 0;
  return (
    <div
      className='absolute animate-tv-pop p-px [animation-delay:calc(var(--i)*25ms)]'
      style={cssVars(
        { '--i': Math.min(index, 24) },
        {
          left: `${(rect.x / box.width) * 100}%`,
          top: `${(rect.y / box.height) * 100}%`,
          width: `${(rect.w / box.width) * 100}%`,
          height: `${(rect.h / box.height) * 100}%`,
        },
      )}
    >
      <button
        type='button'
        data-heat-tile={tile.skill.id}
        aria-label={label}
        aria-pressed={pinned}
        aria-describedby={active ? SKILL_TIP_ID : undefined}
        tabIndex={tabbable ? 0 : -1}
        {...events}
        onFocus={(e) => {
          onFocusTile(tile.skill.id);
          events.onFocus(e);
        }}
        className={cn(
          'flex size-full cursor-pointer flex-col items-start justify-between gap-0.5 overflow-hidden rounded-sm border border-l-[3px] p-1.5 text-left transition-[filter,scale,box-shadow] duration-160 hover:z-10 hover:scale-[1.03] hover:brightness-125 focus-visible:z-10 focus-visible:brightness-125 active:scale-[0.98] aria-pressed:shadow-[inset_0_0_0_2px_var(--tv-ink)]',
          AREA[area],
          none && 'border-dashed opacity-70',
        )}
      >
        <span
          className={cn(
            'w-full leading-tight font-semibold text-tv-ink',
            small ? 'truncate text-[11px]' : 'line-clamp-2 text-xs',
          )}
        >
          {tile.skill.name}
        </span>
        {!small && !none && (
          <span className='text-[11px] text-tv-mute tabular-nums'>{used}</span>
        )}
      </button>
    </div>
  );
}
