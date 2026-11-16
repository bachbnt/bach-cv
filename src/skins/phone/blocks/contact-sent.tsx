/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { Ref } from 'react';
import { servicesCopy } from '@/content/copy/services';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton } from '@/skins/phone/ui/ph-button';

/**
 * Shown in place of the form once the message is sent, as the confirmation a system gives: a check mark in a ring, the title, who it was sent
 * as and where the reply goes. The heading takes the focus so screen readers land on it.
 */
export function ContactSent({
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
    <div
      role='status'
      className='flex animate-ph-pop flex-col items-center gap-3 py-4 text-center'
    >
      <svg
        aria-hidden='true'
        viewBox='0 0 64 64'
        className='size-20 fill-none'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle
          cx='32'
          cy='32'
          r='29'
          strokeWidth='3'
          className='fill-ph-ok/15 stroke-ph-ok'
        />
        <path
          d='M20 33.5 28.5 42 44.5 23'
          strokeWidth='5'
          className='stroke-ph-ok'
        />
      </svg>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='rounded-ph-mark text-[24px]/[1.2] font-bold outline-none focus-visible:outline-2'
      >
        {copy.title}
      </h3>
      <p className='text-[16px]/[1.55] [overflow-wrap:anywhere]'>
        {fill(copy.body, { name, email })}
      </p>
      <PhButton variant='tonal' onClick={onAgain} className='mt-2'>
        {copy.again}
      </PhButton>
    </div>
  );
}
