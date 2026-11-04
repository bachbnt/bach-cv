/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';

/** The three dots shown while the answer is on its way. */
export function ChatTyping({ botName }: { botName: string }) {
  const copy = useCopy(chatCopy);
  return (
    <div
      className={`bb-bubble max-w-[86%] self-start rounded-2xl rounded-bl-[6px] border bg-card px-3.5 py-2.5`}
    >
      <span
        aria-hidden='true'
        className='inline-flex h-[22px] items-center gap-[5px]'
      >
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            className={`bb-dot block size-[7px] rounded-full bg-[#8a92a0]`}
          />
        ))}
      </span>
      <span className='sr-only'>{fill(copy.typing, { name: botName })}</span>
    </div>
  );
}
