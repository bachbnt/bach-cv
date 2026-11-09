/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type CSSProperties } from 'react';
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
import { CHAT_TRIGGER_ID } from '@/skins/travel/shell/header';
import { ChatPanel } from '@/skins/travel/shell/overlay-chat-panel';
import { useWide } from '@/skins/travel/shell/overlay-use-wide';

/** Until `site/settings` arrives (or if it cannot be read) the defaults of the schema apply. */
const DEFAULT_CHAT = settingsSchema.parse({}).chat;

/**
 * The BB Bot of the Travel skin: the Standard conversation (`useChatSession`: the same limits, errors and Try again), shown as a card
 * docked at the bottom right of the map (under the map controls), or as a bottom sheet with the keyboard inset on a phone. It stays
 * mounted once it has been opened, so the conversation lasts from page to page and closing the card does not lose it.
 */
export function TravelChat() {
  const copy = useCopy(chatCopy);
  const { features } = useLive();
  const { isOpen, closeChat } = useChat();
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

  // Esc closes the card wherever the focus is (after a send the focus can be on nothing), unless a window or a menu is open on top
  const docked = isOpen && wide;
  useEffect(() => {
    if (!docked) return;
    const onKeyDown = (event: KeyboardEvent) => {
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
  const panel = (isDocked: boolean, className?: string) => (
    <ChatPanel
      className={className}
      docked={isDocked}
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
    return isOpen ? (
      <div
        // the height leaves the header, the map controls at the top right and the edge of the map free
        className='tl-rise fixed right-4 bottom-7 z-40 flex h-[min(560px,calc(100dvh-60px-28px-220px))] w-[min(380px,calc(100vw-116px))] flex-col overflow-hidden rounded-3xl border border-tl-line bg-tl-panel shadow-tl-pop'
      >
        {panel(true, 'h-full')}
      </div>
    ) : null;

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
        className='tl-pop max-h-[calc(100dvh-16px)] gap-0 overflow-hidden rounded-t-[26px] border-tl-line bg-tl-solid p-0 text-tl-ink data-[side=bottom]:h-[80dvh]'
      >
        {panel(false, 'h-full')}
      </SheetContent>
    </Sheet>
  );
}
