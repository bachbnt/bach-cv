/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { chatCopy } from '@/content/copy/chat';
import { useCopy } from '@/lib/i18n/copy';
import { useLive } from '@/hooks/use-live';
import { CHAT_PROXY_URL, chatEndpoint } from '@/lib/chat/chat-api';
import { useChat } from './chat-provider';
import { useKeyboardInset } from './use-keyboard-inset';

/** The conversation and its panel (the session, the limits, the transport) come with the first opening, not with the page. */
const loadDock = () => import('./chat-dock').then((m) => m.ChatDock);
const ChatDock = dynamic(loadDock, { ssr: false });

/** The assistant can be reached when the address of the chat proxy is set. */
const AVAILABLE = chatEndpoint(CHAT_PROXY_URL) !== null;

/** How long a visitor can leave the button alone before it calls attention to itself, once. */
const NUDGE_AFTER_MS = 20_000;

/**
 * The floating BB Bot button and its panel. Nothing is rendered when the `chat` feature is off.
 * Only the button is in the first load of the page: the panel and the conversation (`ChatDock`) are loaded when the chat is opened, or
 * when the pointer or the focus comes to the button, and stay mounted after that so closing the panel keeps the chat.
 */
export function ChatWidget() {
  const copy = useCopy(chatCopy);
  const live = useLive();
  const { isOpen, openChat, closeChat } = useChat();
  const fabRef = useRef<HTMLButtonElement>(null);
  const [dockLoaded, setDockLoaded] = useState(false);
  if (isOpen && !dockLoaded) setDockLoaded(true);
  const inset = useKeyboardInset(isOpen);
  // the button hops and sends out its ring one more time if the chat has not been opened after a while (once per page load)
  const [nudged, setNudged] = useState(false);
  const everOpened = useRef(false);

  useEffect(() => {
    if (isOpen) everOpened.current = true;
  }, [isOpen]);

  useEffect(() => {
    if (nudged || everOpened.current) return;
    const timer = setTimeout(() => {
      if (!everOpened.current) setNudged(true);
    }, NUDGE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [nudged]);

  const close = () => {
    closeChat();
    fabRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeChat();
      fabRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeChat]);

  if (!live.features.chat) return null;

  return (
    <div
      style={{ '--chat-inset': `${inset}px` } as CSSProperties}
      className='fixed right-6 bottom-[calc(1.5rem+var(--chat-inset,0px))] z-40 flex flex-col items-end gap-3 max-[720px]:right-4 max-[720px]:bottom-[calc(1rem+var(--chat-inset,0px))]'
    >
      {dockLoaded && <ChatDock isOpen={isOpen} onClose={close} />}
      <button
        ref={fabRef}
        type='button'
        aria-expanded={isOpen}
        aria-label={isOpen ? copy.close : copy.open}
        onClick={isOpen ? close : openChat}
        onPointerEnter={() => void loadDock()}
        onFocus={() => void loadDock()}
        data-nudge={nudged && !isOpen ? '' : undefined}
        className={`bb-fab group/fab relative inline-flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(179,48,31,.35)] transition-[transform,translate,scale,filter,box-shadow] duration-200 outline-none hover:brightness-[.92] focus-visible:shadow-[0_0_0_3px_var(--foreground)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 motion-safe:hover:-translate-y-[3px] motion-safe:hover:shadow-[0_16px_32px_rgba(179,48,31,.42)] motion-reduce:transition-none`}
      >
        <span
          // the nudge restarts the ring: a new key plays its animation again
          key={nudged ? 'nudge' : 'first'}
          aria-hidden='true'
          className={`bb-ring pointer-events-none absolute inset-0 rounded-full border-2 border-brand`}
        />
        {AVAILABLE && !isOpen && (
          // the assistant can be reached (the chat address is set): a small green dot, breathing like the one of the Current job
          <span
            aria-hidden='true'
            className='pointer-events-none absolute top-px right-px grid size-4 place-items-center rounded-full bg-background'
          >
            <span className='current-dot' />
          </span>
        )}
        <span aria-hidden='true' className='relative size-6'>
          <MessageCircle
            className={`bb-glyph bb-chat motion-safe:group-hover/fab:data-[on=true]:-rotate-12`}
            data-on={!isOpen}
            size={24}
          />
          <X
            className={`bb-glyph bb-close`}
            data-on={isOpen}
            size={24}
            strokeWidth={2.2}
          />
        </span>
      </button>
    </div>
  );
}
