/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PhDeviceGrip } from '@/skins/phone/shell/ph-device-grip';
import type { Fold } from '@/skins/phone/shell/fold-mode';

/**
 * What lies over the display of the device: the crease of an open one (a soft shade down the exact middle of the inner screen, which the
 * page does not react to except where the shell says so) and the handle on the edge. Neither takes the pointer except the handle. The
 * camera is part of the display (`css/device.css`), so it travels with the screen.
 */
export function PhDeviceDetails({
  fold,
  hinge,
  onFold,
}: {
  /** the fold the device is in or going to, which the drag on the handle answers */
  fold: Fold;
  /** whether the device is open and at rest, so that the crease shows */
  hinge: boolean;
  onFold: (next: Fold) => void;
}) {
  return (
    <>
      {hinge && <div aria-hidden='true' className='ph-crease' />}
      <PhDeviceGrip fold={fold} onFold={onFold} />
    </>
  );
}
