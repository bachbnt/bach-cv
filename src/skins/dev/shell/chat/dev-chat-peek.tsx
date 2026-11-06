/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { ChatPrompt, SPEAKER } from '@/skins/dev/shell/chat/chat-line';

export type ChatPeek = {
  kind: 'you' | 'bot' | 'warn' | 'error';
  text: string;
  /** who spoke, for a screen reader (the prompt in front of the text is decoration) */
  speaker?: string;
};

const PROMPT = {
  you: 'you ❯',
  bot: 'bb-bot ❯',
  warn: 'warn:',
  error: 'error:',
};

/** The last line of the conversation, shown when the chat window is folded. */
export function DevChatPeek({ kind, text, speaker }: ChatPeek) {
  return (
    <div
      className={cn(
        'line-clamp-3 bg-editor px-[14px] py-3 font-sans text-[14px]/[1.5] wrap-anywhere whitespace-pre-wrap text-ink shadow-[inset_2px_0_0_var(--spk)] animate-[dv-bbpop_0.3s_cubic-bezier(0.2,0.8,0.2,1)_both]',
        SPEAKER[kind],
      )}
      aria-live='polite'
    >
      <ChatPrompt className='mr-[10px]'>{PROMPT[kind]}</ChatPrompt>
      {speaker && <span className='sr-only'>{speaker}: </span>}
      <span>{text}</span>
    </div>
  );
}
