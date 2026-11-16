/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { YearsText } from '@/components/years-text';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** What Standard says under its title (the years in software worked out from the roles) and its two buttons: the CV and BB Bot. */
export function HomeIntro() {
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  const { openCv } = usePhOverlays();
  const { cvDownload, chat: chatOn } = live.features;

  return (
    <HomeGlass>
      <p className='text-[16px]/[1.6]'>
        <YearsText withYears={copy.intro} withoutYears={copy.introUndated} />
      </p>
      {(cvDownload || chatOn) && (
        <div className='mt-4 flex flex-wrap gap-2.5'>
          {cvDownload && (
            <PhButton variant='solid' aria-haspopup='dialog' onClick={openCv}>
              <Download aria-hidden='true' className='size-[18px]' />
              {copy.downloadCv}
            </PhButton>
          )}
          {chatOn && (
            <PhButton aria-haspopup='dialog' onClick={openChat}>
              <MessageCircle aria-hidden='true' className='size-[18px]' />
              {chat.askButton}
            </PhButton>
          )}
        </div>
      )}
    </HomeGlass>
  );
}
