/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { TvButton } from '@/skins/trade/ui/tv-button';

/** The button that opens the BB Bot panel, in the skin's own button family. It disappears when the chat feature is off. */
export function TvAskButton({
  text = 'ask',
  variant = 'outline',
  size,
}: {
  /** `ask` reads "Ask BB Bot", `chat` reads "Chat with BB Bot" (the Standard words, in the visitor's language) */
  text?: 'ask' | 'chat';
  variant?: 'outline' | 'primary';
  size?: 'default' | 'lg';
}) {
  const copy = useCopy(chatCopy);
  const { features } = useLive();
  const { openChat } = useChat();
  if (!features.chat) return null;
  return (
    <TvButton variant={variant} size={size} onClick={openChat}>
      <MessageCircle aria-hidden='true' />
      {text === 'chat' ? copy.chatButton : copy.askButton}
    </TvButton>
  );
}
