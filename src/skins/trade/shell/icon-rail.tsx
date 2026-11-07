/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ConnectMenu } from '@/skins/trade/shell/connect-menu';
import { TvButton } from '@/skins/trade/ui/tv-button';

/** The id of the chat button, so the panel can give the focus back to it when it closes. */
export const CHAT_TRIGGER_ID = 'tv-chat-trigger';

/**
 * The icon rail on the right edge: the BB Bot chat and Connect, with the same switches as Standard (`chat`, `connectMenu`). On a
 * phone, where there is no rail, it is a row under the watchlist.
 */
export function IconRail({ className }: { className?: string }) {
  const copy = useCopy(chatCopy);
  const { features } = useLive();
  const { isOpen, openChat, closeChat } = useChat();
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 border-tv-line bg-tv-bg py-1.5 max-[1100px]:justify-end max-[1100px]:border-t max-[1100px]:px-3 min-[1101px]:flex-col min-[1101px]:justify-start min-[1101px]:border-l min-[1101px]:pt-2',
        className,
      )}
    >
      {features.chat && (
        <TvButton
          id={CHAT_TRIGGER_ID}
          size='icon'
          aria-pressed={isOpen}
          aria-label={isOpen ? copy.close : copy.open}
          onClick={isOpen ? closeChat : openChat}
          className={cn('size-9', isOpen && 'bg-tv-hover text-tv-accent-ink')}
        >
          <MessageCircle
            aria-hidden='true'
            className='size-5'
            strokeWidth={1.4}
          />
        </TvButton>
      )}
      {features.connectMenu && <ConnectMenu />}
    </div>
  );
}
