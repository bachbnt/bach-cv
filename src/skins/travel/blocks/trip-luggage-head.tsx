/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';

/** The title and the lead of the core stack inside the luggage (the same words while the skills load). */
export function TripLuggageHead() {
  const copy = useCopy(resumeCopy).skills;
  return (
    <>
      <h3 className='m-0 text-[13px] font-extrabold tracking-[0.9px] text-tl-muted uppercase'>
        {copy.core.title}
      </h3>
      <p className='m-0 mb-2 text-[12.5px] text-tl-muted'>{copy.core.lead}</p>
    </>
  );
}
