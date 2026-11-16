/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/skins/phone/css/device.css';
import { PhDeviceEdge } from '@/skins/phone/shell/ph-device-edge';
import { PhDeviceKeys } from '@/skins/phone/shell/ph-device-keys';

/**
 * The body of the foldable device. The buttons are on the right edge, so the half that stays is the right one, and the device opens like a book
 * from its cover: the closed device is that half with the cover half in front of it. The cover of the folded state is drawn as one slab
 * (580 x 812, the same object as a half of the open one). The open device is ONE slab, 1140 x 812, with one continuous display across it, so
 * nothing but a hairline seam on the frame crosses its middle. The two halves are drawn only while a fold plays: the right one stays, the cover
 * half (left when open) swings toward the viewer about the hinge and lands flat on the left, showing its cover face first and its inner face
 * after it has turned past the vertical. Each has the hardware of a phone on its frame. It is all decoration, so it is hidden from readers and
 * from the pointer; the rig that holds it (`data-fold`, `data-phase`) says which parts show and how they move.
 */
export function PhDeviceBody() {
  return (
    <div aria-hidden='true' className='pointer-events-none'>
      <div className='ph-slab ph-cover'>
        <PhDeviceEdge part='right' />
        <PhDeviceKeys />
      </div>
      <div className='ph-slab ph-half-r'>
        <PhDeviceEdge part='right' />
        <PhDeviceKeys />
      </div>
      <div className='ph-swing'>
        <div className='ph-half-l'>
          <div className='ph-slab ph-face ph-face-front'>
            <PhDeviceEdge part='right' />
          </div>
          <div className='ph-slab ph-face ph-face-back'>
            <PhDeviceEdge part='left' />
          </div>
        </div>
      </div>
      <div className='ph-slab ph-open-body'>
        <PhDeviceEdge part='open' />
        <i className='ph-seam' />
        <PhDeviceKeys />
      </div>
    </div>
  );
}
