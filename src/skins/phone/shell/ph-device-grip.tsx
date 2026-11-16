/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef } from 'react';
import { foldAfterDrag, type Fold } from '@/skins/phone/shell/fold-mode';

/**
 * The handle on the free left edge of the device: drag it to the right to fold an open device, to the left to open a folded one. Only a
 * second way to do what the Fold button does, so it is hidden from readers and from the keyboard.
 */
export function PhDeviceGrip({
  fold,
  onFold,
}: {
  fold: Fold;
  onFold: (next: Fold) => void;
}) {
  const from = useRef<number | null>(null);
  return (
    <div
      aria-hidden='true'
      className='ph-grip'
      onPointerDown={(event) => {
        from.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        const start = from.current;
        from.current = null;
        if (start === null) return;
        const next = foldAfterDrag(fold, event.clientX - start);
        if (next) onFold(next);
      }}
      onPointerCancel={() => {
        from.current = null;
      }}
    />
  );
}
