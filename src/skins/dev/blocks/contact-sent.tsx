/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { Ref } from 'react';
import { Button } from '@/components/ui/button';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { devButtonVariants } from '@/skins/dev/ui/dev-button';
import { cn } from '@/lib/utils';

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
  const parts = copy.body.split(/(\{name\}|\{email\})/);
  return (
    <div className='animate-[dv-sent-in_0.4s_ease_both] rounded-[8px] border border-signal bg-chrome p-[26px] motion-reduce:animate-none'>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='mb-2! text-[22px] text-signal! focus:outline-none focus-visible:rounded-[2px]! focus-visible:outline-offset-4!'
      >
        {copy.title}
      </h3>
      <p className='mb-4 text-mute'>
        {parts.map((part, i) =>
          part === '{name}' ? (
            <b key={i} className='font-semibold text-head'>
              {name}
            </b>
          ) : part === '{email}' ? (
            <b key={i} className='font-semibold text-head'>
              {email}
            </b>
          ) : (
            part
          ),
        )}
      </p>
      <Button
        type='button'
        variant='outline'
        data-slot='dev-button'
        className={cn(devButtonVariants(), 'pointer-coarse:min-h-11')}
        onClick={onAgain}
      >
        {copy.again}
      </Button>
    </div>
  );
}
