/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PhDeviceKey } from '@/skins/phone/shell/ph-device-key';
import {
  holdVolume,
  pressVolume,
  stopVolume,
} from '@/skins/phone/shell/use-volume';
import type { VolumeKey } from '@/skins/phone/shell/volume';

/**
 * A key of the volume rocker. A press with a pointer steps the volume and, held, repeats (`use-volume.ts`); Enter and Space on the focused key step it
 * once (the click that has no pointer), and the arrow keys step it up and down from either key. While the screen is off the keys do nothing.
 */
export function PhVolumeKey({
  direction,
  name,
  enabled,
}: {
  direction: VolumeKey;
  name: string;
  enabled: boolean;
}) {
  return (
    <PhDeviceKey
      name={name}
      className={direction === 'up' ? 'ph-key-up' : 'ph-key-down'}
      onPointerDown={(event) => {
        if (event.button !== 0 || !enabled) return;
        // the key is let go wherever the pointer is by then
        event.currentTarget.setPointerCapture(event.pointerId);
        holdVolume(direction);
      }}
      onPointerUp={stopVolume}
      onPointerCancel={stopVolume}
      onLostPointerCapture={stopVolume}
      // a click with a pointer has been counted at its press; one from the keyboard has no pointer (`detail` is 0)
      onClick={(event) => {
        if (event.detail === 0 && enabled) pressVolume(direction);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        if (enabled) pressVolume(event.key === 'ArrowUp' ? 'up' : 'down');
      }}
    />
  );
}
