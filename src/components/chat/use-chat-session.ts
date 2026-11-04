/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
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
import { buildSystemPrompt, type ChatContext } from '@/lib/chat/system-prompt';
import { shell } from '@/lib/content/shell';
import { useLang } from '@/lib/i18n/language';
import { contentQueryOptions, profileQueryOptions } from '@/lib/query/options';

let counter = 0;
const nextId = () => `m${++counter}`;

/**
 * The conversation: what was said, what is being waited for, and the limits.
 * The site content that the assistant answers from is read through the shared query cache the first
 * time it is needed (`warmUp` when the panel opens, or on the first question), never on page load.
 */
export function useChatSession({
  maxUserMessages,
  maxInputLength,
}: {
  maxUserMessages: number;
  maxInputLength: number;
}) {
  const queryClient = useQueryClient();
  const { lang } = useLang();
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [isSending, setSending] = useState(false);
  const busy = useRef(false);
  const abort = useRef<AbortController | null>(null);

  const available = chatEndpoint(CHAT_PROXY_URL) !== null;
  const userCount = countUserMessages(entries);
  const isLimitReached = userCount >= maxUserMessages;

  useEffect(() => () => abort.current?.abort(), []);

  const warmUp = useCallback(() => {
    void queryClient.prefetchQuery(profileQueryOptions());
    for (const name of [
      'skills',
      'experience',
      'education',
      'projects',
      'certificates',
      'services',
      'contacts',
    ] as const) {
      void queryClient.prefetchQuery(contentQueryOptions(name));
    }
  }, [queryClient]);

  const loadContext = useCallback(async (): Promise<ChatContext> => {
    const read = <T>(promise: Promise<T>) => promise.catch(() => undefined);
    const [
      profile,
      skills,
      experience,
      education,
      projects,
      certificates,
      services,
      contacts,
    ] = await Promise.all([
      read(queryClient.ensureQueryData(profileQueryOptions())),
      read(queryClient.ensureQueryData(contentQueryOptions('skills'))),
      read(queryClient.ensureQueryData(contentQueryOptions('experience'))),
      read(queryClient.ensureQueryData(contentQueryOptions('education'))),
      read(queryClient.ensureQueryData(contentQueryOptions('projects'))),
      read(queryClient.ensureQueryData(contentQueryOptions('certificates'))),
      read(queryClient.ensureQueryData(contentQueryOptions('services'))),
      read(queryClient.ensureQueryData(contentQueryOptions('contacts'))),
    ]);
    return {
      shell,
      profile,
      skills,
      experience,
      education,
      projects,
      certificates,
      services,
      contacts,
    };
  }, [queryClient]);

  /** Asks the Worker about `history` (which already ends with the visitor's question) and appends the outcome. */
  const ask = useCallback(
    async (history: ChatEntry[]) => {
      busy.current = true;
      setSending(true);
      const controller = new AbortController();
      abort.current = controller;
      try {
        const systemPrompt = buildSystemPrompt(await loadContext(), lang);
        const text = await sendChat(
          { messages: toWireMessages(history), systemPrompt },
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
    [lang, loadContext],
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
    warmUp,
  };
}
