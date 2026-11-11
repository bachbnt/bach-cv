/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LayoutTemplate } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { skinsCopy } from '@/content/copy/skins';
import { useCopy } from '@/lib/i18n/copy';
import { useSkin } from '@/lib/skin/skin';
import { isSkinId } from '@/lib/skin/skins';
import { preloadSkin } from '@/skins/registry';

/** Header dropdown for the look of the site, built from `SKIN_IDS`: a new skin appears here by itself. */
export function SkinSwitch() {
  const copy = useCopy(skinsCopy);
  const { skin, setSkin, options, locked } = useSkin();

  if (locked) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${copy.label}: ${copy.names[skin].name}`}
        className='inline-flex size-10 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card transition-colors hover:border-foreground data-popup-open:border-foreground'
      >
        <LayoutTemplate aria-hidden='true' className='size-[18px]' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='min-w-[200px] rounded-xl bg-popover p-1.5 shadow-[0_16px_36px_rgba(0,0,0,.18)]'
      >
        <DropdownMenuRadioGroup
          value={skin}
          onValueChange={(value) => isSkinId(value) && setSkin(value)}
        >
          {options.map((id) => (
            <DropdownMenuRadioItem
              key={id}
              value={id}
              closeOnClick
              onPointerEnter={() => preloadSkin(id)}
              onFocus={() => preloadSkin(id)}
              className='min-h-10 rounded-lg pr-9 pl-3 text-[15px] font-medium data-checked:font-semibold'
            >
              <span className='flex flex-col leading-tight'>
                {copy.names[id].name}
                <small className='text-xs font-normal text-muted-foreground'>
                  {copy.names[id].hint}
                </small>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
