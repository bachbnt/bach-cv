/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Map as MapIcon } from 'lucide-react';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HudAbilities } from '@/skins/moba/shell/hud-abilities';
import { HudItems } from '@/skins/moba/shell/hud-items';
import { HudPortrait } from '@/skins/moba/shell/hud-portrait';
import { HudSpells } from '@/skins/moba/shell/hud-spells';
import { Minimap } from '@/skins/moba/shell/minimap';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';

/**
 * The champion bar and the minimap at the bottom of the stage. On a phone the bar is two rows (the champion, then the key skills and
 * spells), the certificates are left to their page and the minimap comes and goes with a button.
 */
export function ChampionBar({
  data,
  minimapOpen,
  onToggleMinimap,
}: {
  data: ReturnType<typeof useHudData>;
  minimapOpen: boolean;
  onToggleMinimap: () => void;
}) {
  const copy = useCopy(mobaCopy);
  return (
    <>
      <footer
        aria-label={copy.hud.label}
        className='mb-hud absolute inset-x-0 bottom-0 z-40 flex h-[176px] items-center gap-5 px-4 pr-[184px] max-[1099px]:h-[170px] max-[1099px]:gap-3 max-[1099px]:pr-[178px] max-[899px]:pr-[148px] max-[719px]:h-[150px] max-[719px]:flex-col max-[719px]:items-stretch max-[719px]:justify-center max-[719px]:gap-2 max-[719px]:px-2.5'
      >
        <div className='w-[310px] flex-none max-[1099px]:w-[220px] max-[899px]:w-[180px] max-[719px]:w-auto max-[719px]:flex-none'>
          <HudPortrait data={data} />
        </div>
        <div className='flex flex-none items-end gap-4 max-[1099px]:gap-2 max-[719px]:justify-between'>
          <HudAbilities data={data} />
          <HudSpells />
        </div>
        <div className='max-[899px]:hidden'>
          <HudItems data={data} />
        </div>
        <button
          type='button'
          className='mb-top-btn absolute top-2 right-2 hidden size-10 cursor-pointer place-items-center text-mb-gold-ink max-[719px]:grid pointer-coarse:size-11'
          aria-label={minimapOpen ? copy.map.hideMinimap : copy.map.showMinimap}
          aria-pressed={minimapOpen}
          onClick={onToggleMinimap}
        >
          <MapIcon aria-hidden='true' className='size-5' />
        </button>
      </footer>
      <Minimap
        className={cn(
          'absolute right-0 bottom-0 z-40 w-[176px] max-[1099px]:w-[170px] max-[899px]:w-[140px]',
          'max-[719px]:right-2 max-[719px]:bottom-[158px] max-[719px]:w-[132px]',
          !minimapOpen && 'max-[719px]:hidden',
        )}
      />
    </>
  );
}
