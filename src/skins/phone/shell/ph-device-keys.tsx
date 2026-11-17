/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { PhDeviceKey } from '@/skins/phone/shell/ph-device-key';
import { PhVolumeKey } from '@/skins/phone/shell/ph-volume-key';
import {
  actOnScreen,
  useScreenPower,
} from '@/skins/phone/shell/use-screen-power';

/**
 * The hardware keys on the right edge of the device, as REAL buttons (device chrome, outside the display, drawn only in a device): the volume rocker,
 * which steps the volume and shows its HUD, and the power button, which turns the screen off and wakes it to the lock screen. They look as the keys
 * of the slabs do (those are drawn only while a fold plays) and stand where the right half's edge is, on the cover and on the open slab (`css/device.css`);
 * they come right after the Fold control in the tab order. Decoration with a visible effect: nothing real is switched off or turned down.
 */
export function PhDeviceKeys() {
  const copy = useCopy(phoneCopy);
  const awake = useScreenPower() !== 'off';
  return (
    <div className='ph-keys'>
      <span className='ph-volume-rocker'>
        <PhVolumeKey direction='up' name={copy.keyVolumeUp} enabled={awake} />
        <PhVolumeKey
          direction='down'
          name={copy.keyVolumeDown}
          enabled={awake}
        />
      </span>
      <PhDeviceKey
        name={copy.keyPower}
        className='ph-key-power'
        onClick={() => actOnScreen('power')}
      />
    </div>
  );
}
