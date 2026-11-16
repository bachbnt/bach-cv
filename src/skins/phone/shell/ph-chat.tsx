/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useChatSession } from '@/components/chat/use-chat-session';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import { chatCopy } from '@/content/copy/chat';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { useLive } from '@/hooks/use-live';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { PhChatSheet } from '@/skins/phone/shell/ph-chat-sheet';

/**
 * The BB Bot chat. It holds the conversation, so closing the sheet keeps the chat; the open or closed state is the shared `useChat()`
 * one, which the Ask BB Bot buttons of the home screen and of the apps set. Nothing is rendered when the `chat` switch is off.
 */
export function PhChat() {
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

  if (!live.features.chat) return null;

  const sendDraft = () => {
    if (session.send(draft)) setDraft('');
  };

  return (
    <PhChatSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeChat();
      }}
      inset={inset}
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
    />
  );
}
