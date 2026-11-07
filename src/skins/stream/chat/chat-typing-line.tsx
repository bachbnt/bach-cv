/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';

/** The three dots of a live chat while the answer is on its way (they stand still for reduced motion). */
export function ChatTypingLine({ botName }: { botName: string }) {
  const copy = useCopy(chatCopy);
  return (
    <div className='flex gap-[3px] pl-8'>
      <span aria-hidden='true' className='flex gap-[3px]'>
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            style={{ animationDelay: `${i * 0.15}s` }}
            className='block size-[5px] animate-[sm-blink_1.2s_infinite] rounded-full bg-sm-mute'
          />
        ))}
      </span>
      <span className='sr-only'>{fill(copy.typing, { name: botName })}</span>
    </div>
  );
}
