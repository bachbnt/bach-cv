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
import { isSkinId, SKIN_IDS } from '@/lib/skin/skins';
import { preloadSkin } from '@/skins/registry';
import {
  ICON_BUTTON,
  MENU_CONTENT,
  MENU_ITEM,
} from '@/skins/stream/ui/icon-button-class';

/** The Skin menu, built from `SKIN_IDS`: it is how a visitor leaves this look, so it is in the top bar and in the phone's "more" sheet. */
export function SkinMenu() {
  const copy = useCopy(skinsCopy);
  const { skin, setSkin } = useSkin();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${copy.label}: ${copy.names[skin].name}`}
        className={ICON_BUTTON}
      >
        <LayoutTemplate aria-hidden='true' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={8} className={MENU_CONTENT}>
        <DropdownMenuRadioGroup
          value={skin}
          onValueChange={(value) => isSkinId(value) && setSkin(value)}
        >
          {SKIN_IDS.map((id) => (
            <DropdownMenuRadioItem
              key={id}
              value={id}
              closeOnClick
              onPointerEnter={() => preloadSkin(id)}
              onFocus={() => preloadSkin(id)}
              className={MENU_ITEM}
            >
              <span className='flex flex-col leading-tight'>
                {copy.names[id].name}
                <small className='text-xs font-normal text-sm-mute'>
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
