/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { BoatBody } from '@/skins/travel/map/sprites/boat-body';

/** A lovely little tourist boat with a wake. */
export function BoatArt({ scale, flip }: { scale: number; flip: boolean }) {
  return (
    <svg
      viewBox='-6 -6 72 50'
      width={72 * scale}
      height={50 * scale}
      aria-hidden='true'
      focusable='false'
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        overflow: 'visible',
      }}
    >
      <BoatBody />
    </svg>
  );
}
