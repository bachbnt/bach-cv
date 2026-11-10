/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '@/components/chat/chat-provider';
import { useChatSession } from '@/components/chat/use-chat-session';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { chatCopy } from '@/content/copy/chat';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { useCopy } from '@/lib/i18n/copy';
import { CHAT_TRIGGER_ID } from '@/skins/trade/shell/icon-rail';
import { ChatPanel } from '@/skins/trade/shell/overlay-chat-panel';
import { useTrade } from '@/skins/trade/shell/trade-context';
import { useWide } from '@/skins/trade/shell/use-wide';

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

  const chat = useChatSettings(isOpen);
  const session = useChatSession({
    maxUserMessages: chat.maxUserMessages,
    maxInputLength: chat.maxInputLength,
  });

  const close = useCallback(() => {
    closeChat();
    document.getElementById(CHAT_TRIGGER_ID)?.focus();
  }, [closeChat]);

  // Esc closes the panel wherever the focus is (after a send the focus can be on nothing), unless a window or a menu is open on top
  const docked = isOpen && wide;
  useEffect(() => {
    if (!docked) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (document.querySelector('[role="dialog"][data-open], [role="menu"]'))
        return;
      close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [docked, close]);

  if (!features.chat) return null;
  const panel = (inDock: boolean, className: string) => (
    <ChatPanel
      className={className}
      docked={inDock}
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
          // no `tv-rise` here: an unlayered animation would beat the slide-in
          panel(true, 'h-full animate-tv-slide-r border-l border-tv-line'),
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
        style={{ bottom: inset }}
        className='data-[side=bottom]:h-[80dvh] max-h-[calc(100dvh-16px)] gap-0 overflow-hidden rounded-t-lg border-t border-tv-line bg-tv-bg p-0 text-tv-ink'
      >
        {panel(false, 'h-full')}
      </SheetContent>
    </Sheet>
  );
}
