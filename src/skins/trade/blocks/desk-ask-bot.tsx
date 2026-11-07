/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { TvAskButton } from '@/skins/trade/ui/tv-ask-button';

/** The card that points to BB Bot, gone when the chat feature is off. The same words and the same button name as Standard. */
export function DeskAskBot() {
  const { features } = useLive();
  const copy = useCopy(chatCopy);
  if (!features.chat) return null;
  return (
    <section
      aria-labelledby='tv-bot-h'
      className='flex flex-col items-start gap-2 rounded-md border border-tv-line border-l-2 border-l-tv-accent bg-tv-panel p-3'
    >
      <h2 id='tv-bot-h' className='text-[13px] font-bold'>
        {copy.askCard.title}
      </h2>
      <p className='text-xs/[1.5] text-tv-mute'>{copy.askCard.body}</p>
      <TvAskButton text='chat' variant='primary' />
    </section>
  );
}
