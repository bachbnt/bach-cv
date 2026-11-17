/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The glass over the screen while the device folds or unfolds: a layer of the black glass of the display above the page, and under the camera and the glare,
 * whose opacity (`css/device.css`, `shell/fold-dim.ts`) makes one continuous curve over the whole motion, so that the screen dims and lights up as the angle opens or
 * closes and is never black. It is only there to be seen: no pointer and no reader. At rest it is clear. Only drawn in a device.
 */
export function PhScreenDim() {
  return <div aria-hidden='true' className='ph-screen-dim' />;
}
