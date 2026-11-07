/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, Keyboard, MessageSquare, Share2, X } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { PlacesList } from '@/skins/moba/shell/places-list';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbButton } from '@/skins/moba/ui/mb-button';

/**
 * The menu of a phone, where there is no list of places on the left: the places as rows, and the actions of the champion bar that the
 * page panel covers (Connect, the chat, Download CV).
 */
export function MenuDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const common = useCopy(commonCopy);
  const chat = useCopy(chatCopy);
  const copy = useCopy(mobaCopy);
  const live = useLive();
  const { openChat } = useChat();
  const { openCv, setConnectOpen, setKeysOpen } = useOverlays();
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        showCloseButton={false}
        className='mb-card w-[min(320px,86vw)] gap-0 rounded-none border-0 p-0 text-mb-ink'
      >
        <SheetTitle className='border-b border-mb-line px-4 py-4 font-mb-display text-2xl font-bold text-mb-title'>
          {copy.topbar.places}
        </SheetTitle>
        <SheetClose
          aria-label={copy.topbar.menuClose}
          className='mb-top-btn absolute top-3 right-3 grid size-10 cursor-pointer place-items-center text-mb-gold-ink pointer-coarse:size-11'
        >
          <X aria-hidden='true' className='size-5' />
        </SheetClose>
        <SheetDescription className='sr-only'>{copy.map.hint}</SheetDescription>
        <div className='min-h-0 flex-1 overflow-y-auto p-3'>
          <PlacesList layout='rows' onNavigate={close} />
        </div>
        <div className='grid gap-2 border-t border-mb-line p-3'>
          {live.features.cvDownload && (
            <MbButton
              onClick={() => {
                close();
                openCv();
              }}
            >
              <Download aria-hidden='true' className='size-4' />
              {common.downloadCv}
            </MbButton>
          )}
          {live.features.connectMenu && (
            <MbButton
              onClick={() => {
                close();
                // the popover of Connect opens over the stage once the drawer has gone
                setTimeout(() => setConnectOpen(true), 120);
              }}
            >
              <Share2 aria-hidden='true' className='size-4' />
              {common.connect.button}
            </MbButton>
          )}
          {live.features.chat && (
            <MbButton
              onClick={() => {
                close();
                openChat();
              }}
            >
              <MessageSquare aria-hidden='true' className='size-4' />
              {chat.open}
            </MbButton>
          )}
          <MbButton
            onClick={() => {
              close();
              setKeysOpen(true);
            }}
          >
            <Keyboard aria-hidden='true' className='size-4' />
            {copy.keys.button}
          </MbButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
