/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  actOnScreen,
  useScreenPower,
} from '@/skins/phone/shell/use-screen-power';

/**
 * The black glass of a screen that is off: it fades in over the display in 180 ms (the camera and the glare of the display stay, they are above it) and
 * what is under it is inert and out of reach of readers. It is one button, so a click or a tap on it, and Enter or Space while it has the focus, wake the
 * screen (to the lock screen). Only drawn in a device, which has a power button.
 */
export function PhScreenOff() {
  const copy = useCopy(phoneCopy);
  const state = useScreenPower();
  const dark = state === 'off';
  return (
    <button
      type='button'
      inert={!dark}
      aria-label={copy.screenOff}
      data-ph-screen-off={dark ? 'off' : 'on'}
      onClick={() => actOnScreen('wake')}
      className={cn(
        'absolute inset-0 z-[55] cursor-pointer bg-ph-display transition-opacity duration-[180ms] ease-ph-out focus-visible:outline-offset-[-4px]',
        dark ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    />
  );
}
