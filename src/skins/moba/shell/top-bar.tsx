/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Keyboard, Menu } from 'lucide-react';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import { pageName } from '@/skins/moba/map/page-name';
import { useGame } from '@/skins/moba/shell/game-context';
import { LanguageMenu } from '@/skins/moba/shell/language-menu';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { Scoreboard } from '@/skins/moba/shell/scoreboard';
import { SkinMenu } from '@/skins/moba/shell/skin-menu';
import { ThemeMenu } from '@/skins/moba/shell/theme-menu';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';

/**
 * The top bar: where the champion is (the place and its page), the scoreboard in the middle, and the menus of the site on the right in
 * the order of every skin: Language, Skin, Theme. On a phone the left is the button that opens the list of places.
 */
export function TopBar({
  data,
  onMenu,
  menuOpen,
}: {
  data: ReturnType<typeof useHudData>;
  onMenu: () => void;
  menuOpen: boolean;
}) {
  const common = useCopy(commonCopy);
  const copy = useCopy(mobaCopy);
  const { current, walkingTo } = useGame();
  const { setKeysOpen } = useOverlays();
  const place = copy.places[current];
  return (
    <header className='mb-top absolute inset-x-0 top-0 z-50 flex h-[56px] items-center gap-2 px-3 max-[719px]:h-[52px] max-[719px]:gap-1 max-[719px]:px-2'>
      <button
        type='button'
        className='mb-top-btn grid size-10 flex-none cursor-pointer place-items-center text-mb-gold-ink min-[1100px]:hidden pointer-coarse:size-11'
        aria-label={copy.topbar.menu}
        aria-expanded={menuOpen}
        onClick={onMenu}
      >
        <Menu aria-hidden='true' className='size-5' />
      </button>
      <div className='min-w-0 flex-1 max-[1099px]:hidden'>
        <p className='truncate text-[10px] leading-none font-bold tracking-[0.2em] text-mb-teal-ink uppercase'>
          {walkingTo
            ? copy.map.walking.replace('{place}', copy.places[walkingTo.page])
            : copy.nav.current}
        </p>
        <p className='mt-1 truncate font-mb-display text-[22px] leading-none font-bold text-mb-title'>
          {pageName(current, common, copy)}
          <span className='ml-2 text-[15px] font-semibold text-mb-mute'>
            {place}
          </span>
        </p>
      </div>
      <div className='mx-auto max-[1099px]:ml-1'>
        <Scoreboard data={data} />
      </div>
      <div className='flex flex-1 items-center justify-end gap-1 max-[719px]:flex-none'>
        <LanguageMenu />
        <SkinMenu />
        <ThemeMenu />
        <button
          type='button'
          className='mb-top-btn grid size-10 cursor-pointer place-items-center text-mb-gold-ink max-[719px]:hidden pointer-coarse:size-11'
          aria-label={copy.keys.button}
          aria-keyshortcuts='?'
          onClick={() => setKeysOpen(true)}
        >
          <Keyboard aria-hidden='true' className='size-[18px]' />
        </button>
      </div>
    </header>
  );
}
