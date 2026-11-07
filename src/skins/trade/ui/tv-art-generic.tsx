/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A service with no drawing of its own: an empty chart, a quiet line with a crosshair on its last point. */
export function TvArtGeneric() {
  return (
    <>
      <path
        d='M0 32 H176 M0 64 H176 M0 96 H176 M44 0 V128 M88 0 V128 M132 0 V128'
        fill='none'
        className='stroke-tv-line/70'
      />
      <path
        d='M14 78 C34 70 46 84 66 74 S96 56 114 64 S142 50 160 46'
        pathLength='1'
        fill='none'
        strokeWidth='1.6'
        strokeLinecap='round'
        className='animate-[tv-art-draw_1.6s_ease-out_both] stroke-tv-dim [stroke-dasharray:1]'
      />
      <path
        d='M160 14 V114 M20 46 H168'
        fill='none'
        strokeDasharray='3 3'
        className='stroke-tv-dim/60'
      />
      <circle
        cx='160'
        cy='46'
        r='3.6'
        className='animate-[tv-pulse_1.8s_ease-in-out_infinite] fill-tv-mute'
      />
    </>
  );
}
