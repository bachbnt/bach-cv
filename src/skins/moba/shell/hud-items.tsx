/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Coins } from 'lucide-react';
import Image from 'next/image';
import { mobaCopy } from '@/content/copy/moba';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useGame } from '@/skins/moba/shell/game-context';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';

/** The inventory has six slots, as in the game. */
const SLOTS = 6;

/** The six item slots: the latest certificates, each opening Certificates at that one, and the count of them (the gold) beside. */
export function HudItems({ data }: { data: ReturnType<typeof useHudData> }) {
  const copy = useCopy(mobaCopy).hud;
  const { showCertificate } = useGame();
  return (
    <div className='flex items-end gap-3'>
      <div
        role='group'
        aria-label={copy.inventory}
        className='grid grid-cols-3 gap-1'
      >
        {Array.from({ length: SLOTS }, (_, i) => {
          const certificate = data.certificates[i];
          if (!certificate)
            return (
              <span
                key={i}
                className='mb-slot size-[44px]'
                data-empty=''
                aria-hidden='true'
              >
                <span className='mb-slot-in' />
              </span>
            );
          return (
            <button
              key={certificate.id}
              type='button'
              className='mb-slot size-[44px]'
              aria-label={fill(copy.item, { n: i + 1, name: certificate.name })}
              onClick={() => showCertificate(certificate.id)}
            >
              <span className='mb-slot-in'>
                {certificate.image ? (
                  <Image
                    src={certificate.image}
                    alt=''
                    fill
                    sizes='44px'
                    className='bg-white object-cover'
                  />
                ) : (
                  <Coins aria-hidden='true' className='size-5' />
                )}
              </span>
              <MbKbd className='mb-slot-key'>{i + 1}</MbKbd>
            </button>
          );
        })}
      </div>
      <p className='mb-gold-count flex flex-col items-start gap-0.5 pb-1'>
        <span className='flex items-center gap-1.5 font-mb-display text-[26px] leading-none font-bold text-mb-title tabular-nums'>
          <Coins aria-hidden='true' className='size-5 text-mb-gold' />
          {data.certificateCount ?? '–'}
        </span>
        <span className='text-[10px] leading-none font-bold tracking-[0.14em] text-mb-mute uppercase'>
          {copy.gold}
        </span>
      </p>
    </div>
  );
}
