/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '@/components/chat/chat-provider';
import { useChatSession } from '@/components/chat/use-chat-session';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';
import { CHAT_TRIGGER_ID } from '@/skins/trade/shell/icon-rail';
import { ChatPanel } from '@/skins/trade/shell/overlay-chat-panel';
import { useTrade } from '@/skins/trade/shell/trade-context';
import { useWide } from '@/skins/trade/shell/use-wide';

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;

/**
 * The BB Bot of the Trade skin: the Standard conversation (`useChatSession`: the same limits, errors and Try again), shown as a
 * widget panel that takes the place of the watchlist while it is open (the shell makes room for it and gives this a place to draw
 * in), or as a bottom sheet on a phone. It stays mounted once it has been opened, so the conversation lasts from page to page and
 * closing the panel does not lose it.
 */
export function TradeChat() {
  const copy = useCopy(chatCopy);
  const { features } = useLive();
  const { isOpen, closeChat } = useChat();
  const { dock } = useTrade();
  const wide = useWide();
  const [draft, setDraft] = useState('');
  const inset = useKeyboardInset(isOpen && !wide);

  // the settings are read when the chat first opens, not on page load
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

  const close = () => {
    closeChat();
    document.getElementById(CHAT_TRIGGER_ID)?.focus();
  };

  // Esc closes the panel wherever the focus is (after a send the focus can be on nothing), unless a window or a menu is open on top
  const docked = isOpen && wide;
  useEffect(() => {
    if (!docked) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (document.querySelector('[role="dialog"][data-open], [role="menu"]'))
        return;
      closeChat();
      document.getElementById(CHAT_TRIGGER_ID)?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [docked, closeChat]);

  if (!features.chat) return null;
  const panel = (
    docked: boolean,
    extra?: {
      className?: string;
    },
  ) => (
    <ChatPanel
      {...extra}
      docked={docked}
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
      onSend={() => {
        if (session.send(draft)) setDraft('');
      }}
      onPick={(text) => session.send(text)}
      onRetry={session.retry}
      onClose={close}
    />
  );

  if (wide)
    return isOpen && dock
      ? createPortal(
          panel(true, {
            className:
              'h-full tv-rise border-l border-tv-line min-[1101px]:animate-[tv-slide-r_.28s_cubic-bezier(.2,.7,.2,1)_both]',
          }),
          dock,
        )
      : null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeChat();
      }}
    >
      <SheetContent
        side='bottom'
        showCloseButton={false}
        finalFocus={() => document.getElementById(CHAT_TRIGGER_ID)}
        aria-label={fill(copy.panelLabel, { name: chat.botName })}
        style={{ bottom: inset } as CSSProperties}
        className='data-[side=bottom]:h-[80dvh] max-h-[calc(100dvh-16px)] gap-0 rounded-t-lg border-t border-tv-line bg-tv-bg p-0 text-tv-ink'
      >
        {panel(false, { className: 'h-full' })}
      </SheetContent>
    </Sheet>
  );
}
