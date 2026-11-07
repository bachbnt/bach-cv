/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUp, User, X } from 'lucide-react';
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
import { tradeOverlayCopy } from '@/content/copy/trade-overlay';
import { fill } from '@/lib/chat/fill';
import type { ChatEntry } from '@/lib/chat/messages';
import type { Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';

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

/** One line of the conversation: an avatar and a name over the text, left-aligned, no bubble. The text can be selected. */
function Row({
  who,
  name,
  tone = 'plain',
  children,
}: {
  who: 'bot' | 'visitor';
  name: string;
  tone?: 'plain' | 'error';
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'tv-rise grid grid-cols-[24px_minmax(0,1fr)] gap-x-2.5 px-3.5 py-2 transition-[background-color] duration-100 hover:bg-tv-hover/60',
        tone === 'error' && 'border-l-2 border-l-tv-down bg-tv-down-bg pl-3',
      )}
    >
      <span
        aria-hidden='true'
        className='grid size-6 place-items-center overflow-hidden rounded-full bg-tv-hover text-tv-mute'
      >
        {who === 'bot' ? (
          <Image
            src='/logo.png'
            alt=''
            width={16}
            height={15}
            className='h-auto w-4'
          />
        ) : (
          <User className='size-3.5' />
        )}
      </span>
      <div className='min-w-0 select-text'>
        <p className='text-xs leading-6 font-bold'>{name}</p>
        <div className='text-[13px]/[1.55] wrap-break-word whitespace-pre-wrap'>
          {children}
        </div>
      </div>
    </div>
  );
}

/** The three dots shown while the answer is on its way. */
function Typing({ name }: { name: string }) {
  const copy = useCopy(chatCopy);
  return (
    <Row who='bot' name={name}>
      <span
        aria-hidden='true'
        className='inline-flex h-[22px] items-center gap-1'
      >
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            style={{ animationDelay: `${i * 160}ms` }}
            className='block size-1.5 animate-[tv-dot_1.1s_ease-in-out_infinite] rounded-full bg-tv-mute'
          />
        ))}
      </span>
      <span className='sr-only'>{fill(copy.typing, { name })}</span>
    </Row>
  );
}

/**
 * The BB Bot as a widget panel of the terminal: a header (the bot, Online and the role, a close button), the conversation as compact
 * rows, the questions not asked yet as chips, and a composer with the send button, the counter and the note that answers may be
 * inaccurate. The session (limits, errors, Try again, the typing wait) is the Standard one, passed in; this is only the look.
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
  /** drawn in the terminal as a widget (a non-modal dialog); in a sheet the sheet is the dialog and names it */
  docked: boolean;
  className?: string;
}) {
  const copy = useCopy(chatCopy);
  const words = useCopy(tradeOverlayCopy).chat;
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
        'flex min-h-0 flex-col bg-tv-bg text-[13px] text-tv-ink outline-none',
        className,
      )}
    >
      <header className='flex h-[38px] flex-none items-center gap-2.5 border-b border-tv-line pr-1.5 pl-3.5'>
        <Image
          src='/logo.png'
          alt=''
          width={18}
          height={17}
          className='h-auto w-[18px] flex-none'
        />
        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[13px] leading-tight font-bold'>
            {botName}
          </h2>
        </div>
        <small className='flex flex-none items-center gap-1.5 text-[11px] text-tv-mute'>
          {available && (
            <>
              <span
                aria-hidden='true'
                className='size-1.5 rounded-full bg-tv-up shadow-[0_0_0_3px_var(--tv-up-bg)]'
              />
              <span className='font-semibold text-tv-up'>{copy.online}</span>
              <span aria-hidden='true'>·</span>
            </>
          )}
          <span>{copy.roleLabel}</span>
        </small>
        <TvButton size='icon' aria-label={copy.close} onClick={onClose}>
          <X aria-hidden='true' />
        </TvButton>
      </header>

      <div
        ref={logRef}
        role='log'
        aria-live='polite'
        aria-label={fill(words.messages, { name: botName })}
        className='min-h-0 flex-1 overflow-y-auto overscroll-contain py-2'
      >
        <Row who='bot' name={botName} tone={available ? 'plain' : 'error'}>
          {available
            ? fill(copy.greeting, { name: botName })
            : copy.unavailable}
        </Row>
        {entries.map((entry, i) => (
          <Row
            key={entry.id}
            who={entry.role === 'user' ? 'visitor' : 'bot'}
            name={entry.role === 'user' ? words.you : botName}
            tone={entry.role === 'error' ? 'error' : 'plain'}
          >
            {entry.role === 'error'
              ? errorText(copy, entry.content)
              : entry.content}
            {entry.role === 'error' && i === lastIndex && !isSending && (
              <button
                type='button'
                onClick={onRetry}
                className='mt-1 block cursor-pointer rounded-sm text-xs font-semibold text-tv-accent-ink underline underline-offset-[3px] active:opacity-70 pointer-coarse:min-h-11'
              >
                {copy.errors.tryAgain}
              </button>
            )}
          </Row>
        ))}
        {isSending && <Typing name={botName} />}
        {showSuggestions && (
          <div
            role='group'
            aria-label={copy.suggestionsLabel}
            className='flex flex-wrap gap-1.5 px-3.5 pt-2 pb-1 pl-[46px]'
          >
            {remaining.map((s) => (
              <TvToggleChip
                key={s.id}
                onClick={() => onPick(s.text)}
                className='tv-rise h-auto min-h-[26px] py-1 text-left whitespace-normal'
              >
                {s.text}
              </TvToggleChip>
            ))}
          </div>
        )}
      </div>

      {isLimitReached ? (
        <p className='flex-none border-t border-tv-line px-3.5 py-3 text-center text-xs text-tv-mute'>
          {copy.limitReached}
        </p>
      ) : (
        <form
          onSubmit={submit}
          className='flex flex-none items-end gap-1.5 border-t border-tv-line p-2.5'
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
            className={cn(
              TV_FIELD,
              'h-auto max-h-28 min-h-9 resize-none py-[7px] leading-[1.4] pointer-coarse:h-auto pointer-coarse:min-h-11',
            )}
          />
          <TvButton
            type='submit'
            variant='primary'
            size='icon'
            aria-label={copy.send}
            disabled={!available || !canSend || !draft.trim()}
            className='size-9 pointer-coarse:size-11'
          >
            <ArrowUp aria-hidden='true' strokeWidth={2.2} />
          </TvButton>
        </form>
      )}

      <p className='flex flex-none justify-between gap-2 px-3.5 pt-0.5 pb-2 text-[11px] text-tv-dim'>
        <span className='tabular-nums'>
          {fill(copy.count, { used: userCount, max: maxUserMessages })}
        </span>
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
