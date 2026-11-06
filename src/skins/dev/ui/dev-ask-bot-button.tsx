/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevButton } from '@/skins/dev/ui/dev-button';

/** The button that opens the chat. */
export function DevAskBotButton({
  text = 'ask',
  command = './ask-bb-bot',
  className,
}: {
  /** `ask` reads "Ask BB Bot", `chat` reads "Chat with BB Bot" (the accessible name) */
  text?: 'ask' | 'chat';
  /** the shell command the button shows; decoration, the accessible name does not change */
  command?: string;
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  if (!live.features.chat) return null;
  return (
    <DevButton
      aria-label={text === 'chat' ? copy.chatButton : copy.askButton}
      className={className}
      onClick={openChat}
    >
      <DevIcon name='comment-discussion' />
      <span aria-hidden='true'>{command}</span>
    </DevButton>
  );
}
