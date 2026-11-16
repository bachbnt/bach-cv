/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { SIGNAL_MAX, WIFI_MAX } from '@/skins/phone/shell/status-sim';
import { useStatusSim } from '@/skins/phone/shell/use-status-sim';

/**
 * What the glyphs of the status bar show, as words for a screen reader, in the quick settings (where the visitor goes to look at the state of the device);
 * the bar itself does not announce anything, and this is not a live region, so it is read only when it is reached. The same state as the glyphs.
 */
export function StatusSummary() {
  const copy = useCopy(phoneCopy);
  const { level, chargeMode, signal, wifi } = useStatusSim();
  return (
    <p
      data-ph-status-summary=''
      data-level={level}
      data-charge={chargeMode ?? ''}
      className='sr-only'
    >
      {chargeMode === 'fast'
        ? copy.batteryFast(level)
        : chargeMode
          ? copy.batteryCharging(level)
          : copy.batteryLevel(level)}
      . {copy.mobileData(signal, SIGNAL_MAX)}. {copy.wifi(wifi, WIFI_MAX)}.
    </p>
  );
}
