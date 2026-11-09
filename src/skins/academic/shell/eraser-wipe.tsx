/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Ref } from 'react';
import '@/skins/academic/css/wipe.css';

/**
 * What the eraser wipe draws over the board: a haze of dust and the eraser. It is empty and hidden until a wipe runs (`use-eraser-wipe.ts`
 * moves it, frame by frame, with styles), is never read out, and cannot be clicked.
 */
export function EraserWipe({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} hidden aria-hidden='true' className='ac-wipe'>
      <div data-ac-haze className='ac-haze' />
      <div data-ac-eraser className='ac-eraser'>
        <span className='ac-eraser-felt' />
        <span className='ac-eraser-top' />
      </div>
    </div>
  );
}
