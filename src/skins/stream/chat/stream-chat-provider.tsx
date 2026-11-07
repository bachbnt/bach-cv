/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useChatSession } from '@/components/chat/use-chat-session';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';
import {
  StreamChatContext,
  type StreamChatValue,
} from '@/skins/stream/chat/stream-chat-context';

const ChatSheet = dynamic(
  () => import('@/skins/stream/chat/chat-sheet').then((m) => m.ChatSheet),
  { ssr: false },
);

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;

/**
 * Holds the one conversation of the skin (the Standard `useChatSession`: same limits, same errors), so it lasts when the sheet is shut
 * and from one page to the next. The panel is either docked by the Projects page or in the sheet, and the sheet's code loads when it
 * first opens. Nothing is shown when the `chat` feature is off.
 */
export function StreamChatProvider({ children }: { children: ReactNode }) {
  const copy = useCopy(chatCopy);
  const enabled = useLive().features.chat;
  const { isOpen } = useChat();
  const [draft, setDraft] = useState('');
  const [docked, setDocked] = useState(false);
  const visible = enabled && (isOpen || docked);

  // the settings are read when the chat is first on screen, not on page load
  const { data: settings } = useQuery({
    ...settingsQueryOptions(),
    enabled: visible,
  });
  const chat = settings?.chat ?? DEFAULT_CHAT;

  const session = useChatSession({
    maxUserMessages: chat.maxUserMessages,
    maxInputLength: chat.maxInputLength,
  });
  const { warmUp } = session;

  useEffect(() => {
    if (visible) warmUp();
  }, [visible, warmUp]);

  const value = useMemo<StreamChatValue>(
    () => ({
      enabled,
      docked,
      setDocked,
      panel: {
        botName: chat.botName,
        entries: session.entries,
        isSending: session.isSending,
        available: session.available,
        isLimitReached: session.isLimitReached,
        userCount: session.userCount,
        maxUserMessages: chat.maxUserMessages,
        maxInputLength: chat.maxInputLength,
        suggestions: resolveSuggestions(
          chat.suggestions,
          copy.defaultSuggestions,
        ),
        draft,
        onDraftChange: setDraft,
        onSend: () => {
          if (session.send(draft)) setDraft('');
        },
        onPick: (text) => session.send(text),
        onRetry: session.retry,
      },
    }),
    [enabled, docked, chat, session, draft, copy.defaultSuggestions],
  );

  return (
    <StreamChatContext.Provider value={value}>
      {children}
      {enabled && isOpen && !docked && <ChatSheet />}
    </StreamChatContext.Provider>
  );
}
