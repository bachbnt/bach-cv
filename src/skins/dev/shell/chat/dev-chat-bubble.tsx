/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Message, MessageContent } from '@/components/ui/message';
import { cn } from '@/lib/utils';
import { ChatPrompt, LINE, SPEAKER } from '@/skins/dev/shell/chat/chat-line';

/**
 * One message of the conversation as a line of a terminal log: the visitor's question (`you ❯`) or the assistant's answer
 * (`bb-bot ❯`). The prompt is decoration; `speaker` is what a screen reader hears instead.
 */
export function DevChatBubble({
  role,
  speaker,
  children,
}: {
  role: 'user' | 'bot';
  speaker: string;
  children: ReactNode;
}) {
  const user = role === 'user';
  return (
    <Message className={cn(LINE, user ? SPEAKER.you : SPEAKER.bot)}>
      <ChatPrompt>{user ? 'you ❯' : 'bb-bot ❯'}</ChatPrompt>
      <MessageContent>
        <span className='sr-only'>{speaker}: </span>
        <Bubble variant='ghost' className='w-full max-w-full'>
          <BubbleContent
            className={cn(
              'border-0 text-[14px]/[1.6] wrap-anywhere whitespace-pre-wrap',
              user ? 'text-head' : 'text-inherit',
            )}
          >
            {children}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
