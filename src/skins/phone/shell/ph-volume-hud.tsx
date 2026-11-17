/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useScreenPower } from '@/skins/phone/shell/use-screen-power';
import { useVolume } from '@/skins/phone/shell/use-volume';
import { MAX_VOLUME, volumeGlyph } from '@/skins/phone/shell/volume';

const GLYPHS = { muted: VolumeX, low: Volume1, high: Volume2 } as const;

/**
 * The volume HUD: a vertical glass pill on the right edge INSIDE the display, with a speaker that changes (crossed at 0, one wave, two waves) and a
 * level bar, which slides in with a press of a volume key and goes 1.4 s after the last one (`translate` and `opacity` only). At the end of the range
 * the pill shakes by 2 px for 120 ms. It is for the eye; a polite live region says `Volume 9 of 15` once for each press, and only for a press.
 * It does not change any sound: the site has none.
 */
export function PhVolumeHud() {
  const copy = useCopy(phoneCopy);
  const awake = useScreenPower() !== 'off';
  const { level, shown, shakes, said } = useVolume();
  const Icon = GLYPHS[volumeGlyph(level)];
  const visible = shown && awake;
  return (
    <>
      <div
        aria-hidden='true'
        data-ph-hud={visible ? 'shown' : 'hidden'}
        data-level={level}
        className={cn(
          'pointer-events-none absolute top-1/2 right-3 z-[57] w-9 -translate-y-1/2 transition-[opacity,translate] duration-[180ms] ease-ph-out',
          visible ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0',
        )}
      >
        <div
          key={shakes}
          className={cn(
            'flex flex-col items-center gap-2.5 rounded-full border border-ph-glass-line bg-ph-glass py-3 text-ph-glass-ink shadow-ph-float',
            shakes > 0 && 'ph-hud-shake',
          )}
        >
          <Icon className='size-5' strokeWidth={2.2} />
          <span className='relative block h-28 w-1.5 overflow-hidden rounded-full bg-ph-glass-ink/25'>
            <span
              className='absolute inset-0 origin-bottom rounded-full bg-ph-glass-ink transition-transform duration-100 ease-ph-out'
              style={{ transform: `scaleY(${level / MAX_VOLUME})` }}
            />
          </span>
        </div>
      </div>
      <p
        role='status'
        aria-live='polite'
        data-ph-volume-said=''
        className='sr-only'
      >
        {said > 0 ? copy.volumeLevel(level, MAX_VOLUME) : ''}
      </p>
    </>
  );
}
