/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import type { Ref } from 'react';
import { fill } from '@/components/services/message-form';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { TvButton } from '@/skins/trade/ui/tv-button';

/** The ticket after the message is sent: a check that pops in, "Message sent" (which takes focus) and the way to send another. */
export function DeskTicketSent({
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
    <div className='flex flex-col items-start gap-2.5 py-2'>
      <span
        aria-hidden='true'
        className='grid size-11 animate-[tv-pop_0.5s_cubic-bezier(0.2,1.4,0.4,1)_both] place-items-center rounded-full bg-tv-up-bg text-tv-up'
      >
        <Check
          className='size-6 animate-[tv-fade-in_0.3s_ease-out_0.25s_both]'
          strokeWidth={2.5}
        />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='text-lg font-bold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tv-accent'
      >
        {copy.title}
      </h3>
      <p className='text-[13px]/[1.55] text-tv-mute'>
        {fill(copy.body, { name, email })}
      </p>
      <TvButton variant='outline' onClick={onAgain}>
        {copy.again}
      </TvButton>
    </div>
  );
}
