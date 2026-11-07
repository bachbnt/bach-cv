/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Send, X } from 'lucide-react';
import Image from 'next/image';
import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Textarea } from '@/components/ui/textarea';
import { chatCopy } from '@/content/copy/chat';
import { travelOverlaysCopy } from '@/content/copy/travel-overlays';
import { fill } from '@/lib/chat/fill';
import type { ChatEntry } from '@/lib/chat/messages';
import type { Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

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

/** One message: the guide's on the left in a soft teal bubble, the visitor's on the right in coral, a problem in a warm note. */
function Bubble({
  who,
  tone = 'plain',
  children,
}: {
  who: 'bot' | 'visitor';
  tone?: 'plain' | 'error';
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'tl-rise max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[14.5px]/[1.5] wrap-break-word whitespace-pre-wrap select-text',
        who === 'visitor' &&
          'self-end rounded-br-md bg-[color-mix(in_srgb,var(--tl-coral)_80%,black)] text-tl-solid dark:bg-tl-coral',
        who === 'bot' &&
          tone === 'plain' &&
          'self-start rounded-bl-md bg-tl-chip text-tl-ink',
        who === 'bot' &&
          tone === 'error' &&
          'self-start rounded-bl-md border border-tl-danger bg-tl-coral-2 text-tl-ink',
      )}
    >
      {children}
    </div>
  );
}

/** The three dots shown while the answer is on its way. */
function Typing({ name }: { name: string }) {
  const copy = useCopy(chatCopy);
  return (
    <div className='max-w-[86%] self-start rounded-2xl rounded-bl-md bg-tl-chip px-3.5 py-3'>
      <span
        aria-hidden='true'
        className='inline-flex h-[18px] items-center gap-1.5'
      >
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            style={{ animationDelay: `${i * 160}ms` }}
            className='block size-[7px] animate-[tl-hop_1.1s_ease-in-out_infinite] rounded-full bg-tl-muted'
          />
        ))}
      </span>
      <span className='sr-only'>{fill(copy.typing, { name })}</span>
    </div>
  );
}

/**
 * The BB Bot as the travel guide of the trip: a header (the bot, Online and the role, a close button), the conversation as bubbles, the
 * questions not asked yet as chips, and a composer with the send button, the counter and the note that answers may be inaccurate. The
 * session (limits, errors, Try again, the typing wait) is the Standard one, passed in; this is only the look.
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
      <header className='flex flex-none items-center gap-3 border-b border-dashed border-tl-line bg-tl-chip py-3 pr-3 pl-4 text-tl-chip-ink'>
        <span
          aria-hidden='true'
          className='grid size-10 flex-none place-items-center rounded-full bg-white shadow-tl-card'
        >
          <Image
            src='/logo.png'
            alt=''
            width={26}
            height={24}
            className='h-auto w-[26px]'
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
                  className='tl-live size-2 rounded-full bg-tl-teal'
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
          className='grid size-10 flex-none cursor-pointer place-items-center rounded-full bg-tl-solid/60 text-tl-ink transition-transform hover:-translate-y-px active:scale-95 pointer-coarse:size-11'
        >
          <X aria-hidden='true' className='size-[18px]' />
        </button>
      </header>

      <div
        ref={logRef}
        role='log'
        aria-live='polite'
        aria-label={fill(words.messages, { name: botName })}
        className='tl-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain p-4'
      >
        <Bubble who='bot' tone={available ? 'plain' : 'error'}>
          {available
            ? fill(copy.greeting, { name: botName })
            : copy.unavailable}
        </Bubble>
        {entries.map((entry, i) => (
          <Bubble
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
          </Bubble>
        ))}
        {isSending && <Typing name={botName} />}
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
                className='tl-rise cursor-pointer rounded-full border border-tl-line bg-tl-solid px-3 py-2 text-left text-[13.5px] font-semibold text-tl-chip-ink transition-[transform,border-color] hover:-translate-y-px hover:border-tl-coral active:scale-[0.97] pointer-coarse:min-h-11'
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
          className='flex flex-none items-end gap-2 border-t border-tl-line p-3'
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
            className='max-h-28 min-h-10 resize-none rounded-2xl border-tl-line bg-tl-solid px-3.5 py-2 text-[15px]/[1.4] text-tl-ink placeholder:text-tl-muted focus-visible:border-tl-coral focus-visible:ring-0 pointer-coarse:min-h-11 pointer-coarse:text-base md:text-[15px] dark:bg-tl-solid'
          />
          <button
            type='submit'
            aria-label={copy.send}
            disabled={!available || !canSend || !draft.trim()}
            className='grid size-10 flex-none cursor-pointer place-items-center rounded-full bg-gradient-to-br from-tl-coral to-[color-mix(in_srgb,var(--tl-coral)_65%,#ffb44d)] text-tl-solid shadow-[0_8px_18px_-8px_var(--tl-coral)] transition-[transform,opacity] hover:-translate-y-px active:scale-95 disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-11'
          >
            <Send aria-hidden='true' className='size-[18px]' />
          </button>
        </form>
      )}

      <p className='m-0 flex flex-none justify-between gap-2 px-4 pb-2.5 text-xs text-tl-muted'>
        <span className='tabular-nums'>
          {fill(copy.count, { used: userCount, max: maxUserMessages })}
        </span>
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
