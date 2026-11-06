/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Message, MessageContent } from '@/components/ui/message';
import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ChatPrompt, LINE, SPEAKER } from '@/skins/dev/shell/chat/chat-line';

/** `bb-bot ❯` and a blinking caret while the answer is on its way; a screen reader hears "BB Bot is typing". */
export function DevChatTyping({ botName }: { botName: string }) {
  const copy = useCopy(chatCopy);
  return (
    <Message className={cn(LINE, SPEAKER.bot)}>
      <ChatPrompt>bb-bot ❯</ChatPrompt>
      <MessageContent>
        <Bubble variant='ghost' className='w-full max-w-full'>
          <BubbleContent className='border-0 text-[14px]/[1.6] wrap-anywhere whitespace-pre-wrap text-inherit'>
            <i
              className='inline-block h-[1.1em] w-[0.6em] animate-[dv-blink_1.06s_steps(1)_infinite] bg-signal align-text-bottom'
              aria-hidden='true'
            />
            <span className='sr-only'>
              {fill(copy.typing, { name: botName })}
            </span>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
