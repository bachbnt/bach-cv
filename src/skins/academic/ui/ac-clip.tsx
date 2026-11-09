/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A paper clip, drawn with a round pen like the other marks (`ac-icon`), holding a note to the board. Decoration. */
export function AcClip() {
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      viewBox='0 0 34 62'
      className='ac-clip pointer-events-none absolute -top-6 left-6 z-[1] h-[62px] w-[34px]'
    >
      <path
        d='M9 54V13a8 8 0 0 1 16 0v33a5 5 0 0 1-10 0V17'
        fill='none'
        stroke='currentColor'
        strokeWidth={3.2}
        strokeLinecap='round'
      />
    </svg>
  );
}
