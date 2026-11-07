/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { chatCopy } from '@/content/copy/chat';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useChat } from '@/components/chat/chat-provider';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { SPELL_KEYS } from '@/skins/moba/config';
import { ConnectPanel } from '@/skins/moba/shell/connect-panel';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';

/**
 * The two summoner spells and the trinket: Connect (D), the BB Bot chat (F) and Download CV (4). The chat only exists while the `chat`
 * switch of the site is on, and the names are the ones of the Standard header.
 */
export function HudSpells() {
  const common = useCopy(commonCopy);
  const chat = useCopy(chatCopy);
  const copy = useCopy(mobaCopy).hud;
  const live = useLive();
  const { isOpen, openChat, closeChat } = useChat();
  const { openCv } = useOverlays();
  return (
    <div
      className='flex items-end gap-1.5 max-[719px]:gap-1'
      role='group'
      aria-label={copy.spells}
    >
      {live.features.connectMenu && (
        <ConnectPanel
          trigger={
            <button
              type='button'
              className='mb-slot size-[52px] max-[1099px]:size-[44px] max-[899px]:size-[40px] max-[719px]:size-11'
              aria-keyshortcuts={SPELL_KEYS.connect}
              aria-label={common.connect.button}
              data-spell='connect'
            >
              <span className='mb-slot-in text-mb-title'>
                <Share2
                  aria-hidden='true'
                  className='size-6 max-[719px]:size-5'
                />
              </span>
              <MbKbd className='mb-slot-key'>{SPELL_KEYS.connect}</MbKbd>
            </button>
          }
        />
      )}
      {live.features.chat && (
        <button
          type='button'
          className='mb-slot size-[52px] max-[1099px]:size-[44px] max-[899px]:size-[40px] mb-hide-phone'
          data-tone='teal'
          aria-expanded={isOpen}
          aria-haspopup='dialog'
          aria-keyshortcuts={SPELL_KEYS.chat}
          aria-label={isOpen ? chat.close : chat.open}
          data-spell='chat'
          onClick={isOpen ? closeChat : openChat}
        >
          <span className='mb-slot-in bg-white'>
            <Image
              src='/logo.png'
              alt=''
              width={30}
              height={28}
              className='h-auto w-[60%]'
            />
          </span>
          <MbKbd className='mb-slot-key'>{SPELL_KEYS.chat}</MbKbd>
        </button>
      )}
      {live.features.cvDownload && (
        <button
          type='button'
          className='mb-slot size-[52px] max-[1099px]:size-[44px] max-[899px]:size-[40px] mb-hide-phone'
          aria-keyshortcuts={SPELL_KEYS.cv}
          aria-label={common.downloadCv}
          title={copy.trinket}
          data-spell='cv'
          onClick={openCv}
        >
          <span className='mb-slot-in text-mb-title'>
            <Download
              aria-hidden='true'
              className='size-6 max-[719px]:size-5'
            />
          </span>
          <MbKbd className='mb-slot-key'>{SPELL_KEYS.cv}</MbKbd>
        </button>
      )}
    </div>
  );
}
