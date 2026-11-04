/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageCircle, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { settingsSchema } from '@/lib/content/schema';
import { settingsQueryOptions } from '@/lib/query/options';
import { useLive } from '@/hooks/use-live';
import { ChatPanel } from './chat-panel';
import { useChat } from './chat-provider';
import { useChatSession } from './use-chat-session';
import { useKeyboardInset } from './use-keyboard-inset';

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;

/**
 * The floating BB Bot button and its panel. Nothing is rendered when the `chat` feature is off.
 * The panel's content and the conversation are loaded and kept here, so closing the panel keeps the chat.
 */
export function ChatWidget() {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { isOpen, openChat, closeChat } = useChat();
  const fabRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState('');
  const inset = useKeyboardInset(isOpen);

  // the settings are read when the chat first opens, not on page load
  const { data: settings } = useQuery({
    ...settingsQueryOptions(),
    enabled: isOpen,
  });
  const chat = settings?.chat ?? DEFAULT_CHAT;

  const session = useChatSession({
    maxUserMessages: chat.maxUserMessages,
    maxInputLength: chat.maxInputLength,
  });
  const { warmUp } = session;

  useEffect(() => {
    if (isOpen) warmUp();
  }, [isOpen, warmUp]);

  const close = () => {
    closeChat();
    fabRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeChat();
      fabRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeChat]);

  if (!live.features.chat) return null;

  const sendDraft = () => {
    if (session.send(draft)) setDraft('');
  };

  return (
    <div
      style={{ '--chat-inset': `${inset}px` } as CSSProperties}
      className='fixed right-6 bottom-[calc(1.5rem+var(--chat-inset,0px))] z-40 flex flex-col items-end gap-3 max-[720px]:right-4 max-[720px]:bottom-[calc(1rem+var(--chat-inset,0px))]'
    >
      {isOpen && (
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
          onSend={sendDraft}
          onPick={(text) => session.send(text)}
          onRetry={session.retry}
          onClose={close}
        />
      )}
      <button
        ref={fabRef}
        type='button'
        aria-expanded={isOpen}
        aria-label={isOpen ? copy.close : copy.open}
        onClick={isOpen ? close : openChat}
        className={`bb-fab relative inline-flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(179,48,31,.35)] transition-[transform,filter] outline-none hover:brightness-[.92] focus-visible:shadow-[0_0_0_3px_var(--foreground)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95`}
      >
        <span
          aria-hidden='true'
          className={`bb-ring pointer-events-none absolute inset-0 rounded-full border-2 border-brand`}
        />
        <span aria-hidden='true' className='relative size-6'>
          <MessageCircle
            className={`bb-glyph bb-chat`}
            data-on={!isOpen}
            size={24}
          />
          <X
            className={`bb-glyph bb-close`}
            data-on={isOpen}
            size={24}
            strokeWidth={2.2}
          />
        </span>
      </button>
    </div>
  );
}
