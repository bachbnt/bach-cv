/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useChatSession } from '@/components/chat/use-chat-session';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import { chatCopy } from '@/content/copy/chat';
import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';
import { useModKey } from '@/skins/dev/shell/chat/use-mod-key';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import { DevKbd } from '@/skins/dev/ui/dev-kbd';

const DevChatPanel = dynamic(
  () =>
    import('@/skins/dev/shell/chat/dev-chat-panel').then((m) => m.DevChatPanel),
  { ssr: false },
);

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;

/**
 * The BB Bot launcher (a terminal prompt) and its window. It holds the conversation, so closing the window keeps the chat; the
 * window's code loads when the chat first opens. Open or closed is the shared `useChat()` state, which the Ask BB Bot buttons set.
 * Nothing is rendered when the `chat` feature is off.
 */
export function DevChat() {
  const copy = useCopy(chatCopy);
  const extra = useCopy(devOverlaysCopy).chat;
  const live = useLive();
  const mod = useModKey();
  const { isOpen, openChat, closeChat } = useChat();
  const { viewer, cvOpen } = useDevOverlays();
  const fabRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState('');
  const inset = useKeyboardInset(isOpen);
  const modalOpen = viewer !== null || cvOpen;
  const enabled = live.features.chat;

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

  useEffect(() => {
    if (!enabled || modalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeChat();
        fabRef.current?.focus();
      } else if (event.key === '/' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (isOpen) {
          closeChat();
          fabRef.current?.focus();
        } else {
          openChat();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, modalOpen, isOpen, openChat, closeChat]);

  if (!enabled) return null;

  const close = () => {
    closeChat();
    fabRef.current?.focus();
  };
  const sendDraft = () => {
    if (session.send(draft)) setDraft('');
  };

  return (
    <div style={{ '--chat-inset': `${inset}px` } as CSSProperties}>
      {isOpen && (
        <DevChatPanel
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
        data-slot='dev-chat-fab'
        className='group/fab fixed right-6 bottom-[calc(var(--bottom)+18px+var(--chat-inset,0px))] z-95 inline-flex h-[46px] cursor-pointer items-center gap-[10px] rounded-[12px] border border-line-2 bg-chrome pr-2 pl-[7px] text-head shadow-[0_12px_30px_rgba(0,0,0,0.4),0_0_0_0_color-mix(in_srgb,var(--brand)_35%,transparent)] [transition:transform_0.25s_cubic-bezier(0.34,1.56,0.64,1),border-color_0.2s,box-shadow_0.3s] after:pointer-events-none after:absolute after:-inset-px after:animate-[dv-bbring_2.6s_1.6s_ease-out_3] after:rounded-[12px] after:border-2 after:border-brand after:opacity-0 after:content-[""] hover:border-brand hover:shadow-[0_16px_36px_rgba(0,0,0,0.45),0_0_0_4px_color-mix(in_srgb,var(--brand)_22%,transparent)] hover:[transform:translateY(-3px)] active:[transform:translateY(0)_scale(0.97)] aria-expanded:border-signal max-[520px]:right-[14px] max-[520px]:w-12 max-[520px]:justify-center max-[520px]:rounded-[14px] max-[520px]:p-0'
        aria-expanded={isOpen}
        aria-haspopup='dialog'
        aria-keyshortcuts='Control+/ Meta+/'
        aria-label={isOpen ? copy.close : copy.open}
        title={fill(extra.shortcut, { keys: `${mod}/` })}
        inert={modalOpen}
        onClick={isOpen ? close : openChat}
      >
        <span className="relative grid size-8 flex-none place-items-center rounded-[9px] bg-white after:absolute after:-top-[3px] after:-right-[3px] after:size-[10px] after:animate-[dv-bbonline_2.4s_ease-in-out_infinite] after:rounded-full after:border-2 after:border-chrome after:bg-signal after:content-['']">
          <Image
            src='/logo.png'
            alt=''
            width={21}
            height={21}
            className='size-[21px] object-contain'
          />
        </span>
        <span
          className='inline-flex items-center whitespace-nowrap max-[520px]:hidden'
          aria-hidden='true'
        >
          <span className='mr-[7px] text-signal'>➜</span>bb-bot
          <span className='ml-1 inline-block h-[15px] w-2 animate-[dv-blink_1.05s_steps(1)_infinite] bg-signal' />
        </span>
        <span
          className='max-w-0 overflow-hidden font-medium whitespace-nowrap text-mute [transition:max-width_0.3s_ease,margin_0.3s] group-hover/fab:-ml-0.5 group-hover/fab:max-w-[70px] group-focus-visible/fab:-ml-0.5 group-focus-visible/fab:max-w-[70px] max-[520px]:hidden'
          aria-hidden='true'
        >
          --ask
        </span>
        <DevKbd variant='shortcut' aria-hidden='true'>
          <span className='group-aria-expanded/fab:hidden'>{mod}/</span>
          <span className='hidden group-aria-expanded/fab:inline'>esc</span>
        </DevKbd>
      </button>
    </div>
  );
}
