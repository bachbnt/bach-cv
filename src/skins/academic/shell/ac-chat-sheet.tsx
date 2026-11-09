/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { DialogTitle } from '@/components/ui/dialog';
import { academicOverlaysCopy } from '@/content/copy/academic-overlays';
import { chatCopy } from '@/content/copy/chat';
import { errorText } from '@/lib/chat/error-text';
import { fill } from '@/lib/chat/fill';
import { hasFinePointer } from '@/lib/chat/fine-pointer';
import type { ChatEntry } from '@/lib/chat/messages';
import { remainingSuggestions, type Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { lineInput } from '@/skins/academic/ui/ac-line-input';
import { AC_FONT_VARS } from '@/skins/academic/ui/ac-fonts';
import '@/skins/academic/css/overlays.css';

/** What the notepad says for a message: who speaks, in ink (blue for the bot, red for the visitor). */
function Line({
  who,
  tone,
  children,
}: {
  who: string;
  tone: 'bot' | 'you';
  children: string;
}) {
  return (
    <p className='m-0 font-ac-note text-[20px]/[36px] wrap-break-word whitespace-pre-wrap'>
      <b
        className={cn(
          'mr-2 font-ac-note text-[21px]/[36px] font-bold',
          tone === 'bot' ? 'text-ac-link' : 'text-ac-accent',
        )}
      >
        {who}
      </b>
      {children}
    </p>
  );
}

/**
 * The open chat as a sheet of lined notepaper that unfolds from the slip on the ledge (or from where the screen's middle is when it was
 * opened by something else): the name and state of the assistant, the messages, the questions not asked yet, a ruled line to write on, the
 * counter and the note about accuracy. Same data and limits as Standard's panel.
 */
export function AcChatSheet({
  style,
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
  style: CSSProperties;
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
  const extra = useCopy(academicOverlaysCopy).chat;
  const pad = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // the notepad opens from the slip that was pressed: the offset from the middle of the screen to the slip is what the unfold starts from
  useLayoutEffect(() => {
    const slip = document.querySelector<HTMLElement>('[data-ac-slip]');
    if (!slip || !pad.current) return;
    const box = slip.getBoundingClientRect();
    pad.current.style.setProperty(
      '--dx',
      `${Math.round(box.left + box.width / 2 - window.innerWidth / 2)}px`,
    );
    pad.current.style.setProperty(
      '--dy',
      `${Math.round(box.top + box.height / 2 - window.innerHeight / 2)}px`,
    );
  }, []);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, isSending]);

  const last = entries.length - 1;
  const remaining = remainingSuggestions(entries, suggestions);
  const showSuggestions =
    available && !isLimitReached && !isSending && remaining.length > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isSending) onSend();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (!isSending) onSend();
    }
  };

  return (
    <DialogPrimitive.Popup
      data-slot='ac-chat'
      // a mouse user can type at once; on a phone focusing the field would raise the keyboard over the answer
      initialFocus={() =>
        available && hasFinePointer() ? textarea.current : true
      }
      style={style}
      className={cn(
        'ac-scope font-ac-serif fixed top-1/2 left-1/2 z-50 w-[min(580px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 outline-none max-[720px]:top-3 max-[720px]:translate-y-0',
        AC_FONT_VARS,
      )}
    >
      <div
        ref={pad}
        className='ac-paper ac-notepad ac-unfold relative max-h-[calc(100dvh-24px-var(--chat-inset,0px))] overflow-y-auto rounded-[2px] py-5 pr-[30px] pl-[74px] max-[720px]:pr-4 max-[720px]:pl-[58px]'
      >
        <header className='flex flex-wrap items-baseline gap-x-3 pr-10'>
          <DialogTitle className='ac-line mb-2.5 inline-block font-ac-chalk text-[34px]/9 font-normal [--ul:var(--ac-accent)] [--ac-line-y:-3px] max-[720px]:text-[30px]'>
            <span aria-hidden='true'>{botName}</span>
            {/* the name of the window is the Standard one (`BB Bot, AI assistant`) */}
            <span className='sr-only'>
              {fill(copy.panelLabel, { name: botName })}
            </span>
          </DialogTitle>
          <small className='flex items-center gap-1.5 font-ac-note text-[15px] text-ac-mute'>
            {available && (
              <>
                <span
                  aria-hidden='true'
                  className='size-2 animate-pulse rounded-full bg-[#16703a]'
                />
                <span className='font-bold text-ac-ink'>{copy.online}</span>
                <span aria-hidden='true'>·</span>
              </>
            )}
            <span>{copy.roleLabel}</span>
          </small>
        </header>
        <DialogPrimitive.Close
          aria-label={copy.close}
          onClick={onClose}
          className='absolute top-3 right-3.5 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-transparent text-ac-mute transition-colors hover:border-ac-mute pointer-coarse:size-11'
        >
          <X aria-hidden='true' className='size-5' strokeWidth={2.2} />
        </DialogPrimitive.Close>

        <div
          ref={log}
          role='log'
          aria-live='polite'
          aria-label={extra.messages}
          className='ac-ruled-log max-h-[min(46vh,330px)] min-h-36 overflow-y-auto overscroll-contain'
        >
          {available ? (
            <Line who={botName} tone='bot'>
              {fill(copy.greeting, { name: botName })}
            </Line>
          ) : (
            <p className='m-0 font-ac-note text-[20px]/[36px] text-ac-accent'>
              {copy.unavailable}
            </p>
          )}
          {entries.map((entry, i) =>
            entry.role === 'error' ? (
              <p
                key={entry.id}
                className='m-0 font-ac-note text-[20px]/[36px] text-ac-accent'
              >
                {errorText(copy, entry.content)}
                {i === last && !isSending && (
                  <>
                    {' '}
                    <button
                      type='button'
                      onClick={onRetry}
                      className='cursor-pointer font-bold underline underline-offset-[3px] pointer-coarse:min-h-11'
                    >
                      {copy.errors.tryAgain}
                    </button>
                  </>
                )}
              </p>
            ) : (
              <Line
                key={entry.id}
                who={entry.role === 'user' ? extra.you : botName}
                tone={entry.role === 'user' ? 'you' : 'bot'}
              >
                {entry.content}
              </Line>
            ),
          )}
          {isSending && (
            <p className='m-0 font-ac-note text-[20px]/[36px]'>
              <b className='mr-2 font-ac-note text-[21px]/[36px] font-bold text-ac-link'>
                {botName}
              </b>
              <span aria-hidden='true' className='inline-flex gap-1'>
                {[0, 1, 2].map((n) => (
                  <i
                    key={n}
                    className='inline-block size-[7px] animate-[ac-typing_1.1s_ease-in-out_infinite] rounded-full bg-ac-ink'
                    style={{ animationDelay: `${n * 0.16}s` }}
                  />
                ))}
              </span>
              <span className='sr-only'>
                {fill(copy.typing, { name: botName })}
              </span>
            </p>
          )}
        </div>

        {showSuggestions && (
          <div
            role='group'
            aria-label={copy.suggestionsLabel}
            className='flex flex-wrap gap-2 pt-2.5'
          >
            {remaining.map((s) => (
              <button
                key={s.id}
                type='button'
                onClick={() => onPick(s.text)}
                className='min-h-8 cursor-pointer rounded-[16px_11px_15px_12px/12px_15px_11px_16px] border-2 border-ac-rule bg-transparent px-3 pt-0.5 pb-1 text-left font-ac-note text-[16px]/[1.3] text-ac-ink transition-colors hover:border-ac-mute hover:bg-ac-faint pointer-coarse:min-h-11'
              >
                {s.text}
              </button>
            ))}
          </div>
        )}

        {isLimitReached ? (
          <p
            role='status'
            className='m-0 pt-3 font-ac-note text-[18px]/[1.4] text-ac-mute'
          >
            {copy.limitReached}
          </p>
        ) : (
          <form onSubmit={submit} className='flex items-end gap-3 pt-2'>
            <textarea
              ref={textarea}
              rows={1}
              value={draft}
              maxLength={maxInputLength}
              disabled={!available}
              placeholder={copy.placeholder}
              aria-label={copy.messageLabel}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={onKeyDown}
              className={cn(
                lineInput,
                'max-h-24 min-w-0 flex-1 resize-none disabled:opacity-60 max-[720px]:text-[18px] pointer-coarse:min-h-11',
              )}
            />
            <AcButton
              type='submit'
              size='sm'
              aria-label={copy.send}
              disabled={!available || isSending || !draft.trim()}
            >
              {extra.send} ✎
            </AcButton>
          </form>
        )}

        <p className='m-0 flex flex-wrap justify-between gap-x-3 pt-2 text-[14px] text-ac-mute'>
          <span>
            {fill(copy.count, { used: userCount, max: maxUserMessages })}
          </span>
          <span>{copy.disclaimer}</span>
        </p>
      </div>
    </DialogPrimitive.Popup>
  );
}
