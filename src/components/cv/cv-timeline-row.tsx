/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/**
 * One row of a dashed timeline: a left column (company and dates), the rail and the content.
 * Rows that continue an entry have no `left` and no `dot`, so the rail runs through them.
 */
export function CvTimelineRow({
  left,
  dot = false,
  line,
  gap,
  children,
}: {
  left?: ReactNode;
  dot?: boolean;
  /** draw the dashed rail down to the next row */
  line: boolean;
  /** space below the row, in px; the rail reaches across it */
  gap: number;
  children: ReactNode;
}) {
  return (
    <div className='flex' style={{ marginBottom: gap }}>
      <div className='w-32 flex-none pr-2.5'>{left}</div>
      <div
        aria-hidden='true'
        className='relative flex w-4 flex-none justify-center'
      >
        {dot && (
          <span className='relative z-10 mt-[3px] size-2 rounded-full bg-brand' />
        )}
        {line && (
          <span
            className='absolute left-[7px] border-l border-dashed border-[#9aa1ae]'
            style={{ top: dot ? 6 : 0, bottom: -gap }}
          />
        )}
      </div>
      <div className='min-w-0 flex-1 pl-2.5'>{children}</div>
    </div>
  );
}
