/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { chatCopy } from '@/content/copy/chat';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { ChatPanel } from './chat-panel';
import { useChatSession } from './use-chat-session';

/**
 * The conversation of the Standard BB Bot and its panel. It is loaded the first time the chat is opened (`next/dynamic` in `ChatWidget`),
 * not with the page, and stays mounted from then on: the conversation is kept here, so closing the panel keeps the chat.
 */
export function ChatDock({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const copy = useCopy(chatCopy);
  const [draft, setDraft] = useState('');
  const chat = useChatSettings(isOpen);
  const session = useChatSession({
    maxUserMessages: chat.maxUserMessages,
    maxInputLength: chat.maxInputLength,
  });

  if (!isOpen) return null;
  return (
    <ChatPanel
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
      onSend={() => {
        if (session.send(draft)) setDraft('');
      }}
      onPick={(text) => session.send(text)}
      onRetry={session.retry}
      onClose={onClose}
    />
  );
}
