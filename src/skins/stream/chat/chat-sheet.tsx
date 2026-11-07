/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { useKeyboardInset } from '@/components/chat/use-keyboard-inset';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { chatCopy } from '@/content/copy/chat';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useStreamChat } from '@/skins/stream/chat/stream-chat-context';
import { StreamChatPanel } from '@/skins/stream/chat/stream-chat-panel';
import { ICON_BUTTON } from '@/skins/stream/ui/icon-button-class';
import { useMediaQuery } from '@/skins/stream/shell/use-media-query';

/** The chat in a sheet, for the pages and widths where it is not docked: from the right on a tablet, up from the bottom on a phone. */
export function ChatSheet() {
  const copy = useCopy(chatCopy);
  const { closeChat } = useChat();
  const { panel } = useStreamChat();
  const inset = useKeyboardInset(true);
  const side = useMediaQuery('(min-width: 701px)') ? 'right' : 'bottom';

  return (
    <Sheet open onOpenChange={(open) => !open && closeChat()}>
      <SheetContent
        side={side}
        showCloseButton={false}
        style={{ '--chat-inset': `${inset}px` } as CSSProperties}
        className={cn(
          'gap-0 p-0 data-[side=right]:w-[min(402px,100vw)] data-[side=right]:sm:max-w-[402px]',
          'data-[side=bottom]:bottom-(--chat-inset) data-[side=bottom]:h-[min(82dvh,640px)] data-[side=bottom]:rounded-t-2xl',
        )}
      >
        <SheetTitle className='sr-only'>
          {fill(copy.panelLabel, { name: panel.botName })}
        </SheetTitle>
        <StreamChatPanel
          {...panel}
          focusOnOpen
          className='h-full rounded-none border-0'
          headerAction={
            <SheetClose aria-label={copy.close} className={ICON_BUTTON}>
              <X aria-hidden='true' />
            </SheetClose>
          }
        />
      </SheetContent>
    </Sheet>
  );
}
