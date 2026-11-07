/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef, type ReactNode } from 'react';
import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatSuggestions } from '@/components/chat/chat-suggestions';
import { chatCopy } from '@/content/copy/chat';
import { streamCopy } from '@/content/copy/stream';
import { fill } from '@/lib/chat/fill';
import type { ChatEntry } from '@/lib/chat/messages';
import type { Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { chatErrorText } from '@/skins/stream/chat/chat-error-text';
import { ChatLine } from '@/skins/stream/chat/chat-line';
import { ChatTypingLine } from '@/skins/stream/chat/chat-typing-line';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** What the panel needs from the conversation (the session of `useChatSession` plus the settings), the same as the Standard panel. */
export interface StreamChatPanelProps {
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
}

/**
 * The live chat of the skin: a header with the assistant (name, the green dot and "Online" while it can be reached), the lines, the
 * questions not asked yet, the message box and the counter. Every state and limit is the Standard chat's. Docked beside the reel on
 * a wide screen, or in a sheet: `labelled` names the region only when no dialog around it does.
 */
export function StreamChatPanel({
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
  labelled = false,
  focusOnOpen = false,
  headerAction,
  className,
}: StreamChatPanelProps & {
  labelled?: boolean;
  /** put the cursor in the message box when it opens (a mouse user can type at once; a phone would raise the keyboard) */
  focusOnOpen?: boolean;
  /** a control at the end of the header (the close button of the sheet) */
  headerAction?: ReactNode;
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const you = useCopy(streamCopy).chat.you;
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusOnOpen && available && window.matchMedia(FINE_POINTER).matches)
      textareaRef.current?.focus();
  }, [focusOnOpen, available]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries, isSending]);

  const lastIndex = entries.length - 1;
  const asked = new Set(
    entries.filter((e) => e.role === 'user').map((e) => e.content),
  );
  const remaining = suggestions.filter((s) => !asked.has(s.text));
  const showSuggestions =
    available && !isLimitReached && !isSending && remaining.length > 0;

  return (
    <section
      aria-label={
        labelled ? fill(copy.panelLabel, { name: botName }) : undefined
      }
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-sm-line bg-sm-bg',
        className,
      )}
    >
      <header className='flex flex-none items-center gap-3 border-b border-sm-line px-4 py-3'>
        <span
          aria-hidden='true'
          className='grid size-8 flex-none place-items-center rounded-full bg-white'
        >
          <Image
            src='/logo.png'
            alt=''
            width={20}
            height={20}
            className='size-5 object-contain'
          />
        </span>
        <div className='min-w-0'>
          <strong className='block truncate text-sm/[1.3] font-medium'>
            {botName}
          </strong>
          <small className='flex items-center gap-1.5 text-xs text-sm-mute'>
            {available && (
              <>
                <span
                  aria-hidden='true'
                  className='size-[7px] animate-[sm-pulse_1.4s_infinite] rounded-full bg-live'
                />
                <span className='font-medium text-sm-ink'>{copy.online}</span>
                <span aria-hidden='true'>·</span>
              </>
            )}
            <span className='truncate'>{copy.roleLabel}</span>
          </small>
        </div>
        {headerAction && (
          <div className='ml-auto flex-none'>{headerAction}</div>
        )}
      </header>

      <div
        ref={logRef}
        role='log'
        aria-live='polite'
        className='flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 py-3'
      >
        <ChatLine
          role={available ? 'bot' : 'error'}
          name={available ? botName : undefined}
        >
          {available
            ? fill(copy.greeting, { name: botName })
            : copy.unavailable}
        </ChatLine>
        {entries.map((entry, i) => (
          <ChatLine
            key={entry.id}
            role={entry.role}
            name={
              entry.role === 'bot'
                ? botName
                : entry.role === 'user'
                  ? you
                  : undefined
            }
            onRetry={i === lastIndex && !isSending ? onRetry : undefined}
          >
            {entry.role === 'error'
              ? chatErrorText(copy, entry.content)
              : entry.content}
          </ChatLine>
        ))}
        {isSending && <ChatTypingLine botName={botName} />}
        {showSuggestions && (
          <ChatSuggestions
            suggestions={remaining}
            disabled={false}
            onPick={onPick}
          />
        )}
      </div>

      {isLimitReached ? (
        <p className='flex-none border-t border-sm-line px-4 py-3.5 text-center text-sm text-sm-mute'>
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

      <p className='m-0 flex flex-none justify-between gap-2 px-4 pb-2.5 text-xs text-sm-mute'>
        <span>
          {fill(copy.count, { used: userCount, max: maxUserMessages })}
        </span>
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
