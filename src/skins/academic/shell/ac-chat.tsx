/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useChatSession } from '@/components/chat/use-chat-session';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { chatCopy } from '@/content/copy/chat';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { useLive } from '@/hooks/use-live';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { AcChatSheet } from '@/skins/academic/shell/ac-chat-sheet';

/**
 * The BB Bot chat. It holds the conversation, so closing the notepad keeps the chat; the open or closed state is the shared `useChat()`
 * one, which the "Ask BB Bot" slip on the ledge and the buttons of the pages set. Nothing is rendered when the `chat` switch is off.
 */
export function AcChat() {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { isOpen, closeChat } = useChat();
  const [draft, setDraft] = useState('');
  const inset = useKeyboardInset(isOpen);
  const chat = useChatSettings(isOpen);
  const session = useChatSession({
    maxUserMessages: chat.maxUserMessages,
    maxInputLength: chat.maxInputLength,
  });
  const { warmUp } = session;

  useEffect(() => {
    if (isOpen) warmUp();
  }, [isOpen, warmUp]);

  if (!live.features.chat) return null;

  const sendDraft = () => {
    if (session.send(draft)) setDraft('');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeChat();
      }}
    >
      <DialogPortal>
        <DialogOverlay className='bg-black/65 supports-backdrop-filter:backdrop-blur-none' />
        <AcChatSheet
          style={{ '--chat-inset': `${inset}px` } as CSSProperties}
          botName={chat.botName}
          entries={session.entries}
          isSending={session.isSending}
          available={session.available}
          isLimitReached={session.isLimitReached}
          userCount={session.userCount}
          maxUserMessages={chat.maxUserMessages}
          maxInputLength={chat.maxInputLength}
          suggestions={resolveSuggestions(
            chat.suggestions,
            copy.defaultSuggestions,
          )}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendDraft}
          onPick={(text) => session.send(text)}
          onRetry={session.retry}
          onClose={closeChat}
        />
      </DialogPortal>
    </Dialog>
  );
}
