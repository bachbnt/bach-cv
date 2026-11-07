/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { StreamButton } from '@/skins/stream/ui/stream-button';

/** A button that opens the BB Bot chat, with the Standard words. It disappears when the chat feature is off. */
export function StreamAskBotButton({
  text = 'ask',
  variant = 'tonal',
  className,
}: {
  /** `ask` reads "Ask BB Bot", `chat` reads "Chat with BB Bot" (in the visitor's language) */
  text?: 'ask' | 'chat';
  variant?: 'tonal' | 'solid' | 'blue';
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  if (!live.features.chat) return null;

  return (
    <StreamButton variant={variant} onClick={openChat} className={className}>
      <MessageCircle aria-hidden='true' />
      {text === 'chat' ? copy.chatButton : copy.askButton}
    </StreamButton>
  );
}
