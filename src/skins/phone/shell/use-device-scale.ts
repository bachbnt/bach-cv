/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect } from 'react';
import { deviceScale } from '@/skins/phone/shell/fold-mode';

/**
 * Keeps `--ph-scale` of the stage at the factor that fits the device in the window (never above 1). It is set on the element itself, not
 * in state: the device is not drawn again when the window is resized, only scaled. `active` is false where there is no device.
 */
export function useDeviceScale(stage: HTMLElement | null, active: boolean) {
  useLayoutEffect(() => {
    if (!stage || !active) return;
    const fit = () =>
      stage.style.setProperty(
        '--ph-scale',
        String(deviceScale(window.innerWidth, window.innerHeight)),
      );
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [stage, active]);
}
