/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The buttons on the right edge of a half as the slabs draw them: the volume rocker (two keys with a hairline between them) and, below it, the power
 * button, a plain key of the same metal. They stand out of the frame a few px. This is the DECORATION: it is what is seen while a
 * fold plays, when the slabs move; at rest it is hidden and the real keys (`ph-device-keys.tsx`, which look the same) are drawn in its place.
 */
export function PhDeviceKeysDecor() {
  return (
    <span aria-hidden='true' className='contents'>
      <i className='ph-volume' />
      <i className='ph-power' />
    </span>
  );
}
