/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAT_PROXY_URL,
  ChatError,
  chatEndpoint,
  sendChat,
} from '@/lib/chat/chat-api';
import {
  countUserMessages,
  toWireMessages,
  type ChatEntry,
} from '@/lib/chat/messages';
import { useLang } from '@/lib/i18n/language';

let counter = 0;
const nextId = () => `m${++counter}`;

/**
 * The conversation: what was said, what is being waited for, and the limits.
 * The assistant answers from the site content, which the Worker reads and turns into the system prompt: the browser only says the
 * language.
 */
export function useChatSession({
  maxUserMessages,
  maxInputLength,
}: {
  maxUserMessages: number;
  maxInputLength: number;
}) {
  const { lang } = useLang();
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [isSending, setSending] = useState(false);
  const busy = useRef(false);
  const abort = useRef<AbortController | null>(null);

  const available = chatEndpoint(CHAT_PROXY_URL) !== null;
  const userCount = countUserMessages(entries);
  const isLimitReached = userCount >= maxUserMessages;

  useEffect(() => () => abort.current?.abort(), []);

  /** Asks the Worker about `history` (which already ends with the visitor's question) and appends the outcome. */
  const ask = useCallback(
    async (history: ChatEntry[]) => {
      busy.current = true;
      setSending(true);
      const controller = new AbortController();
      abort.current = controller;
      try {
        const text = await sendChat(
          { messages: toWireMessages(history), lang },
          { signal: controller.signal },
        );
        setEntries((prev) => [
          ...prev,
          { id: nextId(), role: 'bot', content: text },
        ]);
      } catch (error) {
        if (controller.signal.aborted) return;
        setEntries((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'error',
            content: error instanceof ChatError ? error.kind : 'server',
          },
        ]);
      } finally {
        busy.current = false;
        setSending(false);
      }
    },
    [lang],
  );

  /** Returns true when the text was accepted (so the caller can clear its input). */
  const send = useCallback(
    (raw: string): boolean => {
      const content = raw.trim().slice(0, maxInputLength);
      if (!content || busy.current || !available || isLimitReached)
        return false;
      const next = [
        ...entries,
        { id: nextId(), role: 'user' as const, content },
      ];
      setEntries(next);
      void ask(next);
      return true;
    },
    [ask, available, entries, isLimitReached, maxInputLength],
  );

  /** Tries the last question again, without counting it twice. */
  const retry = useCallback(() => {
    if (busy.current || !available) return;
    const withoutError = entries.filter((e) => e.role !== 'error');
    if (withoutError[withoutError.length - 1]?.role !== 'user') return;
    setEntries(withoutError);
    void ask(withoutError);
  }, [ask, available, entries]);

  return {
    entries,
    isSending,
    available,
    userCount,
    isLimitReached,
    send,
    retry,
  };
}
