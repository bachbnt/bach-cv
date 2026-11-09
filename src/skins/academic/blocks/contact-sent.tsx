/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { Ref } from 'react';
import { fill } from '@/components/services/message-form';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { AcButton } from '@/skins/academic/ui/ac-button';

/** Shown in place of the form once the message is sent: a check drawn in a circle. The heading takes the focus so screen readers land on it. */
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
    <div className='flex flex-col items-start gap-3 py-2 motion-safe:animate-[ac-lift_0.34s_ease_both]'>
      <span
        aria-hidden='true'
        className='grid size-12 -rotate-6 place-items-center rounded-[52%_46%_55%_44%/46%_54%_44%_55%] border-[3px] border-ac-mc font-ac-chalk text-[30px]/none text-ac-mc'
      >
        ✓
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='ac-line inline-block font-ac-chalk text-[32px]/[1.1] font-normal [--ul:var(--ac-mc)] focus:outline-none focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-offset-4 focus-visible:outline-ac-accent'
      >
        {copy.title}
      </h3>
      <p>{fill(copy.body, { name, email })}</p>
      <AcButton variant='quiet' size='sm' onClick={onAgain}>
        {copy.again}
      </AcButton>
    </div>
  );
}
