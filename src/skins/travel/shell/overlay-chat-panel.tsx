/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Send, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { chatCopy } from '@/content/copy/chat';
import { travelOverlaysCopy } from '@/content/copy/travel-overlays';
import { fill } from '@/lib/chat/fill';
import type { ChatEntry } from '@/lib/chat/messages';
import type { Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { GuideMessage } from '@/skins/travel/shell/overlay-chat-message';
import { GuideProgress } from '@/skins/travel/shell/overlay-chat-progress';
import { GuideTyping } from '@/skins/travel/shell/overlay-chat-typing';

type ChatCopy = typeof chatCopy.en;

/** The note for an error kind (`ChatErrorKind`), in the language shown now. */
const errorText = (copy: ChatCopy, kind: string): string => {
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

const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/**
 * The BB Bot as the travel guide of the trip, drawn as the road of the conversation: a head with the contour lines of a map and the
 * guide as a pin (the bot, Online and the role, a close button); the log, where the guide's answers are stops on a dashed route and the
 * visitor's questions are luggage tags; the questions not asked yet as tags to pick; a composer written like a postcard, sent with a
 * stamp; and the counter as how far along the road the visitor is. The session (limits, errors, Try again, the wait) is the Standard
 * one, passed in; this is only the look.
 */
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
  docked,
  className,
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
  /** drawn over the map as a card (a non-modal dialog); in a sheet the sheet is the dialog and names it */
  docked: boolean;
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const words = useCopy(travelOverlaysCopy).chat;
  const panelRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // a mouse user can type at once; on a phone focusing the input would raise the keyboard over the answer
  useEffect(() => {
    if (available && window.matchMedia(FINE_POINTER).matches) {
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
  // the questions not asked yet are offered after each answer (and not while one is being answered)
  const asked = new Set(
    entries.filter((e) => e.role === 'user').map((e) => e.content),
  );
  const remaining = suggestions.filter((s) => !asked.has(s.text));
  const showSuggestions =
    available && !isLimitReached && !isSending && remaining.length > 0;
  const canSend = !isSending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canSend) onSend();
  };
  const onTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <section
      ref={panelRef}
      role={docked ? 'dialog' : undefined}
      aria-label={docked ? fill(copy.panelLabel, { name: botName }) : undefined}
      tabIndex={-1}
      className={cn(
        'tl-pop flex min-h-0 flex-col text-[14px]/[1.4] text-tl-ink outline-none',
        className,
      )}
    >
      <header className='tl-guide-head flex flex-none items-center gap-3 border-b border-dashed border-tl-line py-3 pr-3 pl-4 text-tl-chip-ink'>
        <span
          aria-hidden='true'
          className='mr-1 mb-1 grid size-10 flex-none -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-white shadow-tl-card'
        >
          <Image
            src='/logo.png'
            alt=''
            width={26}
            height={24}
            className='h-auto w-[22px] rotate-45'
          />
        </span>
        <div className='min-w-0 flex-1'>
          <p
            aria-hidden='true'
            className='m-0 text-[10.5px] font-extrabold tracking-[1px] text-tl-coral uppercase'
          >
            {words.kicker}
          </p>
          <h2 className='truncate text-[16px]/[1.2] font-extrabold'>
            {botName}
          </h2>
          <small className='flex items-center gap-1.5 text-xs'>
            {available && (
              <>
                <span
                  aria-hidden='true'
                  className='tl-live relative size-2 rounded-full bg-tl-teal'
                />
                <span className='font-bold'>{copy.online}</span>
                <span aria-hidden='true'>·</span>
              </>
            )}
            <span className='truncate'>{copy.roleLabel}</span>
          </small>
        </div>
        <button
          type='button'
          aria-label={copy.close}
          onClick={onClose}
          className='grid size-10 flex-none cursor-pointer place-items-center rounded-full bg-tl-solid/70 text-tl-ink transition-transform hover:-translate-y-px active:scale-95 pointer-coarse:size-11'
        >
          <X aria-hidden='true' className='size-[18px]' />
        </button>
      </header>

      <div
        ref={logRef}
        role='log'
        aria-live='polite'
        aria-label={fill(words.messages, { name: botName })}
        className='tl-guide-log tl-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain py-4 pr-4 pl-[38px]'
      >
        <GuideMessage who='bot' tone={available ? 'plain' : 'error'}>
          {available
            ? fill(copy.greeting, { name: botName })
            : copy.unavailable}
        </GuideMessage>
        {entries.map((entry, i) => (
          <GuideMessage
            key={entry.id}
            who={entry.role === 'user' ? 'visitor' : 'bot'}
            tone={entry.role === 'error' ? 'error' : 'plain'}
          >
            {entry.role === 'error'
              ? errorText(copy, entry.content)
              : entry.content}
            {entry.role === 'error' && i === lastIndex && !isSending && (
              <button
                type='button'
                onClick={onRetry}
                className='mt-1.5 block cursor-pointer rounded-sm text-sm font-bold underline underline-offset-[3px] active:opacity-70 pointer-coarse:min-h-11 pointer-coarse:py-2'
              >
                {copy.errors.tryAgain}
              </button>
            )}
          </GuideMessage>
        ))}
        {isSending && <GuideTyping name={botName} />}
        {showSuggestions && (
          <div
            role='group'
            aria-label={copy.suggestionsLabel}
            className='flex flex-wrap gap-2 pt-0.5'
          >
            {remaining.map((s) => (
              <button
                key={s.id}
                type='button'
                onClick={() => onPick(s.text)}
                // a tag to pick: the ring is the hole of its string
                className='tl-rise relative cursor-pointer rounded-xl rounded-l-sm border-2 border-dashed border-tl-line bg-tl-solid py-2 pr-3 pl-8 text-left text-[13.5px] font-semibold text-tl-chip-ink transition-[transform,border-color] before:absolute before:top-1/2 before:left-2.5 before:size-2.5 before:-translate-y-1/2 before:rounded-full before:border-2 before:border-tl-coral hover:-translate-y-px hover:border-tl-coral active:scale-[0.97] pointer-coarse:min-h-11'
              >
                {s.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLimitReached ? (
        <p className='m-0 flex-none border-t border-tl-line px-4 py-3.5 text-center text-sm text-tl-muted'>
          {copy.limitReached}
        </p>
      ) : (
        <form
          onSubmit={submit}
          className='flex flex-none items-end gap-2.5 border-t border-dashed border-tl-line bg-tl-chip/40 p-3'
        >
          <Textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            maxLength={maxInputLength}
            disabled={!available}
            placeholder={copy.placeholder}
            aria-label={copy.messageLabel}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onTextKeyDown}
            className='max-h-28 min-h-10 resize-none rounded-xl border-tl-line bg-tl-solid px-3.5 py-2 text-[15px]/[1.4] text-tl-ink placeholder:text-tl-muted focus-visible:border-tl-coral focus-visible:ring-0 pointer-coarse:min-h-11 pointer-coarse:text-base md:text-[15px] dark:bg-tl-solid'
          />
          <button
            type='submit'
            aria-label={copy.send}
            disabled={!available || !canSend || !draft.trim()}
            // a stamp: a square with a dashed edge inside it, a little turned
            className='relative grid size-10 flex-none rotate-3 cursor-pointer place-items-center rounded-md bg-gradient-to-br from-tl-coral to-tl-coral-grad text-tl-on-coral shadow-[0_8px_18px_-8px_var(--tl-coral)] transition-[transform,opacity] before:absolute before:inset-[3px] before:rounded-[3px] before:border before:border-dashed before:border-tl-on-coral/70 hover:-translate-y-px active:scale-95 disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-11'
          >
            <Send aria-hidden='true' className='size-[18px]' />
          </button>
        </form>
      )}

      <div className='flex flex-none flex-col gap-1 px-4 pt-1.5 pb-2.5 text-xs text-tl-muted'>
        <p className='m-0 flex items-center gap-3'>
          <span className='flex-none tabular-nums'>
            {fill(copy.count, { used: userCount, max: maxUserMessages })}
          </span>
          <GuideProgress used={userCount} max={maxUserMessages} />
        </p>
        <p className='m-0'>{copy.disclaimer}</p>
      </div>
    </section>
  );
}
