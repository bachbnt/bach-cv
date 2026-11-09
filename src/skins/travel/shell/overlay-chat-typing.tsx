/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { GuideMessage } from '@/skins/travel/shell/overlay-chat-message';

/** The wait for an answer: the guide is on the road, a dot walking a short stretch of dashes (the words are for a screen reader). */
export function GuideTyping({ name }: { name: string }) {
  const copy = useCopy(chatCopy);
  return (
    <GuideMessage who='bot' bare>
      <span
        aria-hidden='true'
        className='relative mx-3.5 my-3 block h-3 w-14 overflow-visible'
      >
        <span className='absolute inset-x-0 top-1/2 border-t-2 border-dashed border-tl-muted/50' />
        <span className='tl-guide-walk absolute top-0 left-0 size-3 rounded-full bg-tl-coral' />
      </span>
      <span className='sr-only'>{fill(copy.typing, { name })}</span>
    </GuideMessage>
  );
}
