/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import type { Ref } from 'react';
import { servicesCopy } from '@/content/copy/services';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { MbButton } from '@/skins/moba/ui/mb-button';

/** Shown in place of the form once the message is sent. The heading takes focus so a screen reader lands on it. */
export function ServicesSent({
  name,
  email,
  headingRef,
  onAgain,
}: {
  name: string;
  email: string;
  headingRef: Ref<HTMLHeadingElement>;
  onAgain: () => void;
}) {
  const copy = useCopy(servicesCopy).sent;
  return (
    <div className='flex flex-col items-start gap-3 py-2'>
      <span
        aria-hidden='true'
        data-art='app'
        className='relative block size-16'
      >
        <span className='mb-emblem absolute inset-0 grid place-items-center'>
          <Check
            className='mb-emblem-icon relative z-[1] size-7'
            strokeWidth={2.4}
          />
        </span>
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='text-[28px] leading-tight mb-svc-title focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mb-teal-ink'
      >
        {copy.title}
      </h3>
      <p className='text-[15.5px] leading-[1.6] text-mb-ink/90'>
        {fill(copy.body, { name, email })}
      </p>
      <MbButton variant='ghost' onClick={onAgain} className='mb-focus-in'>
        {copy.again}
      </MbButton>
    </div>
  );
}
