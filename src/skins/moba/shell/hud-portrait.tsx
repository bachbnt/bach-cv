/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { mobaCopy } from '@/content/copy/moba';
import { fill } from '@/lib/chat/fill';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { initialsOf } from '@/lib/derive/initials';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { HudBar } from '@/skins/moba/shell/hud-bar';
import { useGame } from '@/skins/moba/shell/game-context';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';

/** The left of the champion bar: the owner's photo in a gold hexagon with the years in software as its level, the name and the two bars. */
export function HudPortrait({ data }: { data: ReturnType<typeof useHudData> }) {
  const copy = useCopy(mobaCopy).hud;
  const { lang } = useLang();
  const { goToPage } = useGame();
  const headline = localize(shell, lang).headline;
  return (
    <div className='flex min-w-0 items-center gap-3 max-[719px]:gap-2'>
      <div className='relative size-[104px] flex-none max-[719px]:size-[64px] max-[1099px]:min-[720px]:size-[84px]'>
        <button
          type='button'
          aria-label={shell.name}
          onClick={() => goToPage('about')}
          className='mb-hex-gold relative size-full cursor-pointer'
        >
          <span className='mb-hex absolute inset-[4px] overflow-hidden bg-mb-well max-[719px]:inset-[3px]'>
            {shell.avatar ? (
              <Image
                src={shell.avatar}
                alt=''
                fill
                sizes='104px'
                className='object-cover object-[50%_30%]'
              />
            ) : (
              <span className='grid size-full place-items-center font-mb-display text-3xl font-bold text-mb-title'>
                {initialsOf(shell.name)}
              </span>
            )}
          </span>
        </button>
        <span
          className='mb-badge absolute -right-1 -bottom-1'
          role='img'
          aria-label={
            data.years === null
              ? undefined
              : fill(copy.levelLabel, { n: data.years })
          }
        >
          {data.years ?? '–'}
        </span>
      </div>
      <div className='min-w-0 flex-1 space-y-1.5 max-[719px]:space-y-1'>
        <div className='min-w-0'>
          <p className='truncate font-mb-display text-[21px] leading-none font-bold text-mb-title max-[719px]:text-[16px]'>
            {shell.name}
          </p>
          <p className='mt-1 truncate text-[11px] leading-none text-mb-mute max-[719px]:hidden'>
            {headline}
          </p>
          {data.years !== null && (
            <p className='mt-1 text-[10px] leading-none font-bold tracking-[0.16em] text-mb-teal-ink uppercase max-[719px]:mt-0.5'>
              {fill(copy.level, { n: data.years })}
            </p>
          )}
        </div>
        <HudBar label={copy.health} count={data.projects} tone='hp' />
        <HudBar label={copy.mana} count={data.skills} tone='mp' />
      </div>
    </div>
  );
}
