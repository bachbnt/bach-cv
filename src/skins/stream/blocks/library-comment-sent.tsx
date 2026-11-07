/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import type { Ref } from 'react';
import { fill } from '@/components/services/message-form';
import { servicesCopy } from '@/content/copy/services';
import { streamLibraryCopy } from '@/content/copy/stream-library';
import { useCopy } from '@/lib/i18n/copy';
import { LibraryVisitorAvatar } from '@/skins/stream/blocks/library-visitor-avatar';
import { StreamButton } from '@/skins/stream/ui/stream-button';

/**
 * What the composer shows once the message is sent: the visitor's own text as the comment they posted, then Standard's words (the
 * heading takes the focus so a screen reader lands on it) and the way to write another.
 */
export function LibraryCommentSent({
  name,
  email,
  message,
  headingRef,
  onAgain,
}: {
  name: string;
  email: string;
  message: string;
  headingRef: Ref<HTMLHeadingElement>;
  onAgain: () => void;
}) {
  const copy = useCopy(servicesCopy).sent;
  const library = useCopy(streamLibraryCopy).community;
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-3'>
        <LibraryVisitorAvatar name={name} />
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-medium'>
            {name}
            <span className='ml-2 font-normal text-sm-mute'>
              {library.postedBy}
            </span>
          </p>
          <p className='mt-1 text-sm/[1.5] whitespace-pre-line [overflow-wrap:anywhere]'>
            {message.trim()}
          </p>
        </div>
      </div>
      <div className='flex items-start gap-3 rounded-xl bg-sm-surface p-4'>
        <span
          aria-hidden='true'
          className='grid size-8 flex-none place-items-center rounded-full bg-sm-blue text-sm-bg'
        >
          <Check className='size-4' strokeWidth={3} />
        </span>
        <div className='min-w-0'>
          <h3
            ref={headingRef}
            tabIndex={-1}
            className='text-base font-bold focus:outline-none focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sm-blue'
          >
            {copy.title}
          </h3>
          <p className='mt-1 text-sm/[1.5] text-sm-mute'>
            {fill(copy.body, { name, email })}
          </p>
          <StreamButton
            variant='tonal'
            onClick={onAgain}
            className='mt-3 bg-sm-hover2'
          >
            {copy.again}
          </StreamButton>
        </div>
      </div>
    </div>
  );
}
