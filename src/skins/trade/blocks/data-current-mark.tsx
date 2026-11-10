/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useLoopGate } from '@/hooks/use-loop-gate';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/** The "Current" word of Standard for the role I am in now, with the green live dot of the terminal. */
export function DataCurrentMark() {
  const { experience } = useCopy(resumeCopy);
  const gate = useLoopGate();
  return (
    <TvChip tone='up' size='sm' className='gap-1.5 align-middle'>
      <span
        ref={gate}
        aria-hidden='true'
        className='tv-live size-1.5 rounded-full bg-tv-up [--tv-ring-to:3.3333]'
      />
      {experience.current}
    </TvChip>
  );
}
