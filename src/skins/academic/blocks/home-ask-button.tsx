/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** A button that opens the BB Bot chat; it is not there when the `chat` switch is off. Same words as Standard's (`ask`: "Ask BB Bot", `chat`: "Chat with BB Bot"). */
export function HomeAskButton({
  text = 'ask',
  variant = 'quiet',
  className,
}: {
  text?: 'ask' | 'chat';
  variant?: 'pen' | 'quiet';
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  if (!live.features.chat) return null;
  return (
    <AcButton variant={variant} className={className} onClick={openChat}>
      {text === 'chat' ? copy.chatButton : copy.askButton}
      <AcIcon name='pencil' />
    </AcButton>
  );
}
