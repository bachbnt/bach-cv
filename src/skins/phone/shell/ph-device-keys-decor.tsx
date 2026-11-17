/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The buttons on the right edge of a half: the volume rocker (two keys with a hairline between them) and, below it, the power button, which
 * has the fine ridges of a fingerprint sensor. They stand out of the frame a few px. Decoration: nothing here can be pressed.
 */
export function PhDeviceKeys() {
  return (
    <span aria-hidden='true' className='contents'>
      <i className='ph-volume' />
      <i className='ph-power' />
    </span>
  );
}
