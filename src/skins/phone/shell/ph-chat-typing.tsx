/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { PhChatRow } from '@/skins/phone/shell/ph-chat-row';

/** Three dots in a bubble of the assistant while the answer is on its way; readers hear that it is typing, once. */
export function PhChatTyping({
  botName,
  joined,
}: {
  botName: string;
  /** the message before is the assistant's: the bubble sits closer and shares a tight corner */
  joined: boolean;
}) {
  const copy = useCopy(chatCopy);
  return (
    <PhChatRow side='left' avatar='show' joined={joined}>
      <div
        className={cn(
          'rounded-ph-panel rounded-bl-[0.3rem] bg-ph-sheet-3 px-4 py-3.5',
          joined && 'rounded-tl-[0.3rem]',
        )}
      >
        <span aria-hidden='true' className='flex h-2 items-center gap-1.5'>
          {[0, 1, 2].map((n) => (
            <i
              key={n}
              className='ph-overlay-dot block size-2 rounded-full bg-ph-mute'
              style={{ animationDelay: `${n * 0.16}s` }}
            />
          ))}
        </span>
        <span className='sr-only'>{fill(copy.typing, { name: botName })}</span>
      </div>
    </PhChatRow>
  );
}
