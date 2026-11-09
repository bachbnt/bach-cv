/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { FOOTPRINT, WORLD } from '@/skins/travel/map/iso';

const pts = FOOTPRINT.map(
  (p) => `${(p.x / WORLD.width) * 100}% ${(p.y / WORLD.height) * 100}%`,
).join(',');

/**
 * One layer of a few drifting crests over the whole sea. They move by `transform` only (the compositor does it, no repaint) and are
 * clipped to the footprint; the land is drawn above them, so they only show on water. Paused by `.tl-paused` on the root.
 */
export const Waves = memo(function Waves() {
  return (
    <div
      aria-hidden='true'
      className='tl-waves pointer-events-none absolute top-0 left-0 overflow-hidden'
      style={{
        width: WORLD.width,
        height: WORLD.height,
        clipPath: `polygon(${pts})`,
      }}
    >
      <div className='tl-wave' />
    </div>
  );
});
