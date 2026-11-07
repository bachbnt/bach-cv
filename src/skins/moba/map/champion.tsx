/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { shell } from '@/lib/content/shell';
import { initialsOf } from '@/lib/derive/initials';
import { useAttach, useGame } from '@/skins/moba/shell/game-context';

/**
 * The champion on the map: the owner's photo in a gold hexagon, a name plate and two bars, and a ring on the ground. The walker moves
 * the outer element with a transform; nothing here renders while it walks.
 */
export function Champion() {
  const { recalling } = useGame();
  const place = useAttach('champion');
  return (
    <div
      ref={place}
      className='mb-champion pointer-events-none absolute top-0 left-0 z-20'
      data-recalling={recalling || undefined}
    >
      <div className='absolute -translate-x-1/2 -translate-y-[calc(100%-18px)]'>
        <div className='mb-plate mx-auto mb-1 w-max max-w-[150px] truncate px-2.5 py-0.5 text-center font-mb-display text-[13px] leading-tight font-bold tracking-wide text-mb-title'>
          {shell.name}
        </div>
        <div className='mx-auto mb-1.5 w-[72px] space-y-[2px]'>
          <div className='h-[5px] bg-black/60 p-px'>
            <div className='h-full w-full bg-mb-hp' />
          </div>
          <div className='h-[3px] bg-black/60 p-px'>
            <div className='h-full w-full bg-mb-mp' />
          </div>
        </div>
        <div className='mb-hex-gold relative mx-auto size-[58px]'>
          <div className='mb-hex absolute inset-[3px] overflow-hidden bg-mb-well'>
            {shell.avatar ? (
              <Image
                src={shell.avatar}
                alt=''
                fill
                sizes='58px'
                className='object-cover object-[50%_30%]'
              />
            ) : (
              <span className='grid size-full place-items-center font-mb-display text-lg font-bold text-mb-title'>
                {initialsOf(shell.name)}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className='mb-ground absolute top-0 left-0 block h-[22px] w-[64px] -translate-x-1/2 -translate-y-1/2 rounded-[50%]' />
      <span className='mb-recall absolute top-0 left-0 block size-[84px] -translate-x-1/2 -translate-y-1/2 rounded-full' />
    </div>
  );
}
