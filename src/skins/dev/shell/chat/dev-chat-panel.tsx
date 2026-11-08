/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { chatCopy } from '@/content/copy/chat';
import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { fill } from '@/lib/chat/fill';
import { hasFinePointer } from '@/lib/chat/fine-pointer';
import type { ChatEntry } from '@/lib/chat/messages';
import { remainingSuggestions, type Suggestion } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ChatPrompt, SPEAKER } from '@/skins/dev/shell/chat/chat-line';
import {
  chatErrorLevel,
  chatErrorText,
} from '@/skins/dev/shell/chat/chat-error-text';
import { DevChatComposer } from '@/skins/dev/shell/chat/dev-chat-composer';
import {
  DevChatPeek,
  type ChatPeek,
} from '@/skins/dev/shell/chat/dev-chat-peek';
import { DevChatThread } from '@/skins/dev/shell/chat/dev-chat-thread';
import { touchDots } from '@/skins/dev/shell/window-chrome';
import { WindowDots } from '@/skins/dev/ui/window-dots';

type Size = 'normal' | 'folded' | 'big';

/**
 * The open chat as a small window: lights (red closes, yellow folds it to the last message and a one-line field, green makes it
 * bigger), the messages, the questions not asked yet, the field and the counter.
 */
export function DevChatPanel({
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
  const extra = useCopy(devOverlaysCopy).chat;
  const [size, setSize] = useState<Size>('normal');
  const panelRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const folded = size === 'folded';
  const big = size === 'big';

  useEffect(() => {
    if (available && hasFinePointer()) {
      textareaRef.current?.focus();
    } else {
      panelRef.current?.focus({ preventScroll: true });
    }
  }, [available]);

  const fold = () => {
    setSize(folded ? 'normal' : 'folded');
    if (!folded) textareaRef.current?.focus();
  };

  const remaining = remainingSuggestions(entries, suggestions);
  const showSuggestions =
    available && !isLimitReached && !isSending && remaining.length > 0;

  const last = entries[entries.length - 1];
  const peek: ChatPeek = isSending
    ? { kind: 'bot', text: '…', speaker: botName }
    : !last
      ? {
          kind: 'bot',
          text: fill(copy.greeting, { name: botName }),
          speaker: botName,
        }
      : last.role === 'user'
        ? { kind: 'you', text: last.content, speaker: extra.you }
        : last.role === 'error'
          ? {
              kind: chatErrorLevel(last.content),
              text: chatErrorText(copy, last.content),
            }
          : { kind: 'bot', text: last.content, speaker: botName };

  return (
    <section
      ref={panelRef}
      role='dialog'
      aria-label={fill(copy.panelLabel, { name: botName })}
      tabIndex={-1}
      className={cn(
        'fixed right-6 bottom-[calc(var(--bottom)+76px+var(--chat-inset,0px))] z-96 flex w-96 max-w-[calc(100vw-16px)] origin-bottom-right animate-[dv-bbin_0.32s_cubic-bezier(0.34,1.3,0.64,1)] flex-col overflow-hidden rounded-[14px] border border-line-2 bg-chrome shadow-[0_26px_70px_rgba(0,0,0,0.55)] [transition:width_0.25s_cubic-bezier(0.2,0.8,0.2,1),height_0.25s_cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none! max-[520px]:right-2 max-[520px]:left-2 max-[520px]:w-auto',
        folded
          ? 'h-auto'
          : 'h-[min(560px,calc(100dvh-var(--bottom)-110px-var(--chat-inset,0px)))]',
        big &&
          'w-[min(620px,calc(100vw-16px))] h-[min(760px,calc(100dvh-var(--bottom)-110px-var(--chat-inset,0px)))]',
      )}
    >
      <header className='flex h-10 flex-none items-center gap-[10px] border-b border-line bg-chrome-2 px-[14px]'>
        <WindowDots
          className={cn('flex-none', touchDots)}
          onClose={onClose}
          closeLabel={copy.close}
          onMinimize={fold}
          folded={folded}
          minimizeLabel={folded ? extra.unfold : extra.fold}
          onMaximize={() => setSize(big ? 'normal' : 'big')}
          maximized={big}
          maximizeLabel={big ? extra.smaller : extra.bigger}
        />
        <span className='relative grid size-[22px] flex-none place-items-center rounded-full bg-white shadow-[0_0_0_1px_var(--line-2)]'>
          <Image
            src='/logo.png'
            alt=''
            width={15}
            height={15}
            className='size-[15px] object-contain'
          />
        </span>
        <div className='flex min-w-0 items-baseline gap-2'>
          <b
            className={cn(
              'block font-code text-[13.5px] leading-[normal] font-bold whitespace-nowrap text-head',
              // the dot and the word only while the assistant can be reached (the chat address is set)
              available &&
                "after:ml-2 after:inline-block after:size-[7px] after:animate-[dv-bbonline_2.4s_ease-in-out_infinite] after:rounded-full after:bg-signal after:align-[1px] after:content-['']",
            )}
          >
            {botName}
          </b>
          {available && (
            <span className='font-code text-[12px] leading-[normal] text-signal'>
              {copy.online}
            </span>
          )}
          <span className='truncate text-[12px] leading-[normal] text-mute'>
            {copy.roleLabel}
          </span>
        </div>
      </header>

      {folded && <DevChatPeek {...peek} />}

      {!folded && (
        <DevChatThread
          botName={botName}
          available={available}
          entries={entries}
          isSending={isSending}
          suggestions={showSuggestions ? remaining : []}
          onPick={onPick}
          onRetry={onRetry}
        />
      )}

      {isLimitReached ? (
        <Marker
          role='status'
          className={cn(
            'items-baseline justify-start gap-[10px] border-t border-line bg-chrome px-[14px] py-[10px] font-sans text-[13px]/[1.5] text-ink',
            SPEAKER.warn,
            folded && 'hidden',
          )}
        >
          <ChatPrompt className='w-auto'>warn:</ChatPrompt>
          <MarkerContent>{copy.limitReached}</MarkerContent>
        </Marker>
      ) : (
        <DevChatComposer
          value={draft}
          onChange={onDraftChange}
          onSend={onSend}
          maxLength={maxInputLength}
          disabled={!available}
          canSend={!isSending}
          textareaRef={textareaRef}
        />
      )}

      <p
        className={cn(
          'm-0 flex justify-between gap-[10px] bg-chrome px-[14px] pb-[9px] font-code text-[11px] leading-[normal] text-dim',
          folded && 'hidden',
        )}
      >
        <span>
          {fill(copy.count, { used: userCount, max: maxUserMessages })}
        </span>
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
