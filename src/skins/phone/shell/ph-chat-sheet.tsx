/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { DialogDescription } from '@/components/ui/dialog';
import { chatCopy } from '@/content/copy/chat';
import { phoneOverlaysCopy } from '@/content/copy/phone-overlays';
import { errorText } from '@/lib/chat/error-text';
import { fill } from '@/lib/chat/fill';
import { hasFinePointer } from '@/lib/chat/fine-pointer';
import type { ChatEntry } from '@/lib/chat/messages';
import { remainingSuggestions, type Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { PhChatBubble } from '@/skins/phone/shell/ph-chat-bubble';
import { PhChatComposer } from '@/skins/phone/shell/ph-chat-composer';
import { PhChatSuggestions } from '@/skins/phone/shell/ph-chat-suggestions';
import { PhChatTyping } from '@/skins/phone/shell/ph-chat-typing';
import { PhOverlayBar } from '@/skins/phone/shell/ph-overlay-bar';
import { PhOverlayFrame } from '@/skins/phone/shell/ph-overlay-frame';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

/** The assistant and the error notes are on the left, the visitor on the right. */
const isLeft = (role: ChatEntry['role']): boolean => role !== 'user';

/**
 * The open chat: a sheet on a narrow screen, a panel at the right edge of a wide one. The bar with the name and state of the assistant, the
 * messages, the questions not asked yet, the box to write in, the counter and the note about accuracy. Same data and limits as Standard's
 * panel; the keyboard lifts the whole sheet (`inset`) so the box stays in sight.
 */
export function PhChatSheet({
  open,
  onOpenChange,
  inset,
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** how far the on-screen keyboard covers the bottom of the page, in px */
  inset: number;
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
}) {
  const copy = useCopy(chatCopy);
  const words = useCopy(phoneOverlaysCopy).chat;
  const log = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // the messages are mounted after the sheet opens (the portal comes a moment later), so the end of the log is also found on arrival
  const placeLog = useCallback((element: HTMLDivElement | null) => {
    log.current = element;
    if (element) element.scrollTop = element.scrollHeight;
  }, []);
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, isSending, open]);

  // the greeting is the first message of the conversation (or, when the assistant cannot be reached, the note that says so)
  const rows: ChatEntry[] = [
    {
      id: 'greeting',
      role: available ? 'bot' : 'error',
      content: available
        ? fill(copy.greeting, { name: botName })
        : copy.unavailable,
    },
    ...entries,
  ];
  const left = (i: number) => isLeft(rows[i].role);
  const joinedAbove = (i: number) => i > 0 && left(i) === left(i - 1);
  const joinedBelow = (i: number) =>
    i < rows.length - 1 ? left(i) === left(i + 1) : isSending && left(i);
  const empty = entries.length === 0;
  const remaining = remainingSuggestions(entries, suggestions);
  const showSuggestions =
    available && !isLimitReached && !isSending && remaining.length > 0;

  return (
    <PhOverlayFrame
      open={open}
      onOpenChange={onOpenChange}
      kind='dock'
      inset={inset}
      data-slot='ph-chat'
      // a mouse user can type at once; on a phone focusing the field would raise the keyboard over the answer
      initialFocus={() =>
        available && hasFinePointer() ? textarea.current : true
      }
    >
      <PhOverlayBar
        className='border-b border-ph-line'
        leading={<PhIconTile tile='chat' className='size-11' />}
        title={
          <>
            <span aria-hidden='true'>{botName}</span>
            {/* the name of the window is the Standard one (`BB Bot, AI assistant`) */}
            <span className='sr-only'>
              {fill(copy.panelLabel, { name: botName })}
            </span>
          </>
        }
        subtitle={
          <span className='flex flex-wrap items-center gap-x-1.5'>
            {available && (
              <>
                <span
                  aria-hidden='true'
                  className='size-2 animate-ph-blink rounded-full bg-ph-ok'
                />
                <span className='font-semibold text-ph-ink'>{copy.online}</span>
                <span aria-hidden='true'>·</span>
              </>
            )}
            <span>{copy.roleLabel}</span>
          </span>
        }
        closeLabel={copy.close}
      />
      <DialogDescription className='sr-only'>
        {words.description}
      </DialogDescription>

      <div
        ref={placeLog}
        role='log'
        aria-live='polite'
        aria-label={words.messages}
        className='ph-overlay-log flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4'
      >
        {empty && (
          // what an empty conversation shows, so the room is not bare; the same words are in the description of the window
          <div
            aria-hidden='true'
            className='ph-overlay-hero flex-1 flex-col items-center justify-center gap-3 px-6 py-5 text-center'
          >
            <PhIconTile
              tile='chat'

              className={cn('size-16', !available && 'opacity-50 grayscale')}
            />
            {available && (
              <p className='m-0 max-w-[17rem] text-[15px]/[1.45] text-ph-mute'>
                {words.hint}
              </p>
            )}
          </div>
        )}
        <div className='mt-auto flex flex-col gap-2.5'>
          {rows.map((row, i) => {
            const isError = row.role === 'error';
            const sideProps = {
              joined: joinedAbove(i),
              avatar: left(i) ? (joinedBelow(i) ? 'space' : 'show') : undefined,
            } as const;
            return isError ? (
              <PhChatBubble
                key={row.id}
                who='error'
                {...sideProps}
                action={
                  i > 0 &&
                  i === rows.length - 1 &&
                  !isSending && (
                    <button
                      type='button'
                      onClick={onRetry}
                      className='mt-2 flex min-h-11 cursor-pointer items-center rounded-full text-[15px] font-semibold underline underline-offset-[3px]'
                    >
                      {copy.errors.tryAgain}
                    </button>
                  )
                }
              >
                {i === 0 ? row.content : errorText(copy, row.content)}
              </PhChatBubble>
            ) : (
              <PhChatBubble
                key={row.id}
                who={row.role === 'user' ? 'you' : 'bot'}
                {...sideProps}
                name={row.role === 'user' ? words.you : botName}
              >
                {row.content}
              </PhChatBubble>
            );
          })}
          {isSending && (
            <PhChatTyping botName={botName} joined={left(rows.length - 1)} />
          )}
          {empty && showSuggestions && (
            <PhChatSuggestions
              layout='wrap'
              suggestions={remaining}
              onPick={onPick}
            />
          )}
        </div>
      </div>

      <div className='flex shrink-0 flex-col border-t border-ph-line'>
        {!empty && showSuggestions && (
          <PhChatSuggestions
            layout='row'
            suggestions={remaining}
            onPick={onPick}
          />
        )}

        {isLimitReached ? (
          <p
            role='status'
            className='m-0 shrink-0 px-4 pt-3 text-center text-[15px] text-ph-mute'
          >
            {copy.limitReached}
          </p>
        ) : (
          <PhChatComposer
            value={draft}
            onChange={onDraftChange}
            onSend={onSend}
            maxLength={maxInputLength}
            disabled={!available}
            canSend={!isSending}
            textareaRef={textarea}
          />
        )}

        <p className='m-0 flex shrink-0 flex-wrap justify-center gap-x-3 px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-[13px]/[1.4] text-ph-mute'>
          <span>
            {fill(copy.count, { used: userCount, max: maxUserMessages })}
          </span>
          <span>{copy.disclaimer}</span>
        </p>
      </div>
    </PhOverlayFrame>
  );
}
