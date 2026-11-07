/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { ChatComposer } from '@/components/chat/chat-composer';
import { useChat } from '@/components/chat/chat-provider';
import { ChatSuggestions } from '@/components/chat/chat-suggestions';
import { ChatTyping } from '@/components/chat/chat-typing';
import { useChatSession } from '@/components/chat/use-chat-session';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import { chatCopy } from '@/content/copy/chat';
import { mobaCopy } from '@/content/copy/moba';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** The note for an error kind, in the language shown now. */
const errorText = (copy: (typeof chatCopy)['en'], kind: string): string => {
  switch (kind) {
    case 'network':
      return copy.errors.network;
    case 'rate-limit':
      return copy.errors.rateLimit;
    case 'daily-limit':
      return copy.errors.dailyLimit;
    case 'unavailable':
      return copy.unavailable;
    default:
      return copy.errors.generic;
  }
};

/**
 * The BB Bot window (the F spell): an "all chat" window above the champion bar. It holds the conversation, so closing it keeps the chat.
 * The messages, the suggestions, the composer, the limits and the errors with Try again are the Standard ones; only the frame is this
 * skin's. Nothing is rendered while the `chat` switch of the site is off.
 */
export function ChatWindow() {
  const copy = useCopy(chatCopy);
  const mb = useCopy(mobaCopy);
  const live = useLive();
  const { isOpen, closeChat } = useChat();
  const [draft, setDraft] = useState('');
  const inset = useKeyboardInset(isOpen);
  const panel = useRef<HTMLElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

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

  // a mouse user can type at once; on a phone focusing the input would raise the keyboard over the answer
  useEffect(() => {
    if (!isOpen) return;
    if (session.available && window.matchMedia(FINE_POINTER).matches)
      textarea.current?.focus();
    else panel.current?.focus({ preventScroll: true });
  }, [isOpen, session.available]);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.entries, session.isSending, isOpen]);

  if (!live.features.chat || !isOpen) return null;

  const asked = new Set(
    session.entries.filter((e) => e.role === 'user').map((e) => e.content),
  );
  const remaining = resolveSuggestions(
    chat.suggestions,
    copy.defaultSuggestions,
  ).filter((s) => !asked.has(s.text));
  const showSuggestions =
    session.available &&
    !session.isLimitReached &&
    !session.isSending &&
    remaining.length > 0;
  const lastIndex = session.entries.length - 1;

  return (
    <section
      ref={panel}
      role='dialog'
      aria-label={fill(copy.panelLabel, { name: chat.botName })}
      data-mb-chat=''
      tabIndex={-1}
      style={{ '--chat-inset': `${inset}px` } as CSSProperties}
      className='mb-card mb-chat absolute z-[60] flex flex-col overflow-hidden outline-none min-[720px]:bottom-[190px] min-[720px]:left-4 min-[720px]:h-[min(540px,calc(100dvh-270px))] min-[720px]:w-[392px] max-[719px]:inset-x-2 max-[719px]:bottom-[calc(8px+var(--chat-inset,0px))] max-[719px]:h-[min(76dvh,600px)]'
    >
      <header className='mb-panel-head flex flex-none items-center gap-3 py-2.5 pr-2 pl-4'>
        <span className='grid size-9 flex-none place-items-center bg-white'>
          <Image
            src='/logo.png'
            alt=''
            width={24}
            height={22}
            className='h-auto w-6'
          />
        </span>
        <div className='min-w-0 flex-1'>
          <strong className='block truncate font-mb-display text-[20px] leading-none font-bold text-mb-title'>
            {chat.botName}
          </strong>
          <small className='mt-1 flex items-center gap-1.5 text-[11px] leading-none text-mb-mute'>
            {session.available && (
              <>
                <span aria-hidden='true' className='current-dot' />
                <span className='font-bold text-mb-ink'>{copy.online}</span>
                <span aria-hidden='true'>·</span>
              </>
            )}
            <span>{copy.roleLabel}</span>
          </small>
        </div>
        <span className='mr-1 text-[10px] font-bold tracking-[0.16em] text-mb-gold-ink uppercase max-[719px]:hidden'>
          {mb.chat.title}
        </span>
        <button
          type='button'
          aria-label={copy.close}
          onClick={closeChat}
          className='mb-top-btn grid size-10 flex-none cursor-pointer place-items-center text-mb-gold-ink hover:text-mb-title pointer-coarse:size-11'
        >
          <X aria-hidden='true' className='size-5' />
        </button>
      </header>
      <div
        ref={log}
        role='log'
        aria-live='polite'
        className='flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain bg-mb-well/70 p-4'
      >
        <ChatBubble role={session.available ? 'bot' : 'error'}>
          {session.available
            ? fill(copy.greeting, { name: chat.botName })
            : copy.unavailable}
        </ChatBubble>
        {session.entries.map((entry, i) => (
          <ChatBubble
            key={entry.id}
            role={entry.role}
            onRetry={
              i === lastIndex && !session.isSending ? session.retry : undefined
            }
          >
            {entry.role === 'error'
              ? errorText(copy, entry.content)
              : entry.content}
          </ChatBubble>
        ))}
        {session.isSending && <ChatTyping botName={chat.botName} />}
        {showSuggestions && (
          <ChatSuggestions
            suggestions={remaining}
            disabled={false}
            onPick={(text) => session.send(text)}
          />
        )}
      </div>
      {session.isLimitReached ? (
        <p className='flex-none border-t border-mb-line bg-mb-panel px-4 py-3.5 text-center text-sm text-mb-mute'>
          {copy.limitReached}
        </p>
      ) : (
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSend={() => {
            if (session.send(draft)) setDraft('');
          }}
          maxLength={chat.maxInputLength}
          disabled={!session.available}
          canSend={!session.isSending}
          textareaRef={textarea}
        />
      )}
      <p className='m-0 flex flex-none justify-between gap-2 bg-mb-panel px-3.5 pb-2.5 text-xs text-mb-mute'>
        <span>
          {fill(copy.count, {
            used: session.userCount,
            max: chat.maxUserMessages,
          })}
        </span>
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
