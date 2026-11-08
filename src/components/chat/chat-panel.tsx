/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { chatCopy } from '@/content/copy/chat';
import { errorText } from '@/lib/chat/error-text';
import { fill } from '@/lib/chat/fill';
import { hasFinePointer } from '@/lib/chat/fine-pointer';
import { useCopy } from '@/lib/i18n/copy';
import type { ChatEntry } from '@/lib/chat/messages';
import { remainingSuggestions, type Suggestion } from '@/lib/chat/suggestions';
import { ChatBubble } from './chat-bubble';
import { ChatComposer } from './chat-composer';
import { ChatSuggestions } from './chat-suggestions';
import { ChatTyping } from './chat-typing';

/** The open chat: header, messages, suggested questions, input and the counter. */
export function ChatPanel({
  botName,
  entries,
  isSending,
  available,
  isLimitReached,
  userCount,
  maxUserMessages,
  maxInputLength,
  suggestions,
  draft,
  onDraftChange,
  onSend,
  onPick,
  onRetry,
  onClose,
}: {
  botName: string;
  entries: ChatEntry[];
  isSending: boolean;
  available: boolean;
  isLimitReached: boolean;
  userCount: number;
  maxUserMessages: number;
  maxInputLength: number;
  suggestions: Suggestion[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onPick: (text: string) => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const copy = useCopy(chatCopy);
  const panelRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // a mouse user can type at once; on a phone focusing the input would raise the keyboard over the answer
  useEffect(() => {
    if (available && hasFinePointer()) {
      textareaRef.current?.focus();
    } else {
      panelRef.current?.focus({ preventScroll: true });
    }
  }, [available]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries, isSending]);

  const lastIndex = entries.length - 1;
  // the design offers the questions not asked yet, after each answer (and not while one is being answered)
  const remaining = remainingSuggestions(entries, suggestions);
  const showSuggestions =
    available && !isLimitReached && !isSending && remaining.length > 0;

  return (
    <section
      ref={panelRef}
      role='dialog'
      aria-label={fill(copy.panelLabel, { name: botName })}
      tabIndex={-1}
      className={`bb-panel flex h-[520px] max-h-[calc(100dvh-120px-var(--chat-inset,0px))] w-[360px] origin-bottom-right flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_24px_56px_rgba(27,31,39,.25)] outline-none max-[720px]:h-[min(72dvh,560px)] max-[720px]:w-[calc(100vw-32px)]`}
    >
      <header className='flex flex-none items-center gap-3 bg-night py-3.5 pr-3 pl-4 text-white'>
        <Image
          src='/logo.png'
          alt=''
          width={28}
          height={26}
          className='h-auto w-7 flex-none'
        />
        <div className='min-w-0'>
          <strong className='block font-heading text-base leading-tight font-bold tracking-[-0.01em]'>
            {botName}
          </strong>
          <small className='flex items-center gap-1.5 text-xs text-night-foreground'>
            {available && (
              // the assistant can be reached (the chat address is set): a breathing green dot and the word, like a chat app
              <>
                <span aria-hidden='true' className='current-dot' />
                <span className='font-semibold text-white'>{copy.online}</span>
                <span aria-hidden='true'>·</span>
              </>
            )}
            <span>{copy.roleLabel}</span>
          </small>
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label={copy.close}
          onClick={onClose}
          className='ml-auto size-9 text-white hover:bg-white/12 active:bg-white/20 pointer-coarse:size-11'
        >
          <X strokeWidth={2.2} aria-hidden='true' />
        </Button>
      </header>

      <div
        ref={logRef}
        role='log'
        aria-live='polite'
        className='flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain bg-background p-4'
      >
        <ChatBubble role={available ? 'bot' : 'error'}>
          {available
            ? fill(copy.greeting, { name: botName })
            : copy.unavailable}
        </ChatBubble>
        {entries.map((entry, i) => (
          <ChatBubble
            key={entry.id}
            role={entry.role}
            onRetry={i === lastIndex && !isSending ? onRetry : undefined}
          >
            {entry.role === 'error'
              ? errorText(copy, entry.content)
              : entry.content}
          </ChatBubble>
        ))}
        {isSending && <ChatTyping botName={botName} />}
        {showSuggestions && (
          <ChatSuggestions
            suggestions={remaining}
            disabled={false}
            onPick={onPick}
          />
        )}
      </div>

      {isLimitReached ? (
        <p className='flex-none border-t bg-card px-4 py-3.5 text-center text-sm text-muted-foreground'>
          {copy.limitReached}
        </p>
      ) : (
        <ChatComposer
          value={draft}
          onChange={onDraftChange}
          onSend={onSend}
          maxLength={maxInputLength}
          disabled={!available}
          canSend={!isSending}
          textareaRef={textareaRef}
        />
      )}

      <p className='m-0 flex flex-none justify-between gap-2 bg-card px-3.5 pb-2.5 text-xs text-muted-foreground'>
        <span>
          {fill(copy.count, { used: userCount, max: maxUserMessages })}
        </span>
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
