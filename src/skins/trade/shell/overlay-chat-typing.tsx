/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { ChatRow } from '@/skins/trade/shell/overlay-chat-row';

/** The three dots shown while the answer is on its way. */
export function ChatTyping({ name }: { name: string }) {
  const copy = useCopy(chatCopy);
  return (
    <ChatRow who='bot' name={name}>
      <span
        aria-hidden='true'
        className='inline-flex h-[22px] items-center gap-1'
      >
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            style={{ animationDelay: `${i * 160}ms` }}
            className='block size-1.5 animate-[tv-dot_1.1s_ease-in-out_infinite] rounded-full bg-tv-mute'
          />
        ))}
      </span>
      <span className='sr-only'>{fill(copy.typing, { name })}</span>
    </ChatRow>
  );
}
