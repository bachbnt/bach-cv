/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useChat } from './chat-provider';

/** A button that opens the BB Bot panel. It disappears when the chat feature is off. */
export function AskBotButton({
  text = 'ask',
  variant = 'outline',
  className,
}: {
  /** `ask` reads "Ask BB Bot", `chat` reads "Chat with BB Bot" (in the visitor's language) */
  text?: 'ask' | 'chat';
  variant?: 'outline' | 'default';
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  if (!live.features.chat) return null;

  return (
    <Button
      variant={variant}
      size='lg'
      onClick={openChat}
      className={className}
    >
      <MessageCircle aria-hidden='true' />
      {text === 'chat' ? copy.chatButton : copy.askButton}
    </Button>
  );
}
