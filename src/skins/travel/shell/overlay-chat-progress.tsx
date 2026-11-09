/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How far along the road of questions the visitor is: a dashed stretch that fills with coral as the limit of messages comes near. */
export function GuideProgress({ used, max }: { used: number; max: number }) {
  const share = max > 0 ? Math.min(1, used / max) * 100 : 0;
  return (
    <span aria-hidden='true' className='relative block h-3 min-w-8 flex-1'>
      <span className='absolute inset-x-0 top-1/2 border-t-2 border-dashed border-tl-line' />
      <span
        className='absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-tl-coral'
        style={{ width: `${share}%` }}
      />
      <span
        className='absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tl-coral ring-2 ring-tl-solid'
        style={{ left: `${share}%` }}
      />
    </span>
  );
}
