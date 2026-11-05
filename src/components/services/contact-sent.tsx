/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import type { Ref } from 'react';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { fill } from '@/components/services/message-form';

/** Shown in place of the form once the message is sent. The heading takes focus so screen readers land on it. */
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
    <div className='flex animate-in flex-col items-start gap-3 py-2 duration-500 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none'>
      <span
        aria-hidden='true'
        className='flex size-12 items-center justify-center rounded-full bg-mobile text-mobile-foreground'
      >
        <Check className='size-6' strokeWidth={2.5} />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='text-2xl focus:outline-none focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-foreground'
      >
        {copy.title}
      </h3>
      <p className='leading-[1.55] text-body'>
        {fill(copy.body, { name, email })}
      </p>
      <button
        type='button'
        onClick={onAgain}
        className='text-[15px] font-medium underline underline-offset-4 hover:text-brand-ink active:text-brand-ink max-[720px]:min-h-11 pointer-coarse:min-h-11'
      >
        {copy.again}
      </button>
    </div>
  );
}
