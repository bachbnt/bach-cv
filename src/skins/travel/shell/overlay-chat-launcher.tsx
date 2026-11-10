/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { CHAT_PROXY_URL, chatEndpoint } from '@/lib/chat/chat-api';
import { useCopy } from '@/lib/i18n/copy';

/**
 * The Ask BB Bot button over the map, a map pin with the logo in it: at the bottom right on a wide screen (under the map controls, away from the credits at the
 * bottom left), at the top left of the map on a phone, where the page sheet fills the bottom. It is there while the chat is closed and
 * nothing is rendered when the chat feature is off.
 */
export function ChatLauncher() {
  const copy = useCopy(chatCopy);
  const { features } = useLive();
  const { isOpen, openChat } = useChat();
  if (!features.chat || isOpen) return null;
  return (
    <button
      type='button'
      aria-label={copy.open}
      onClick={openChat}
      className='fixed right-4 bottom-7 z-35 grid size-14 cursor-pointer place-items-center transition-transform hover:-translate-y-0.5 active:scale-95 max-md:top-[66px] max-md:right-auto max-md:bottom-auto max-md:left-3 max-md:size-12'
    >
      {/* a map pin: a drop turned so that its point looks down, with the logo upright in it */}
      <span
        aria-hidden='true'
        className='grid size-11 -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-gradient-to-br from-tl-coral to-tl-coral-grad shadow-[0_12px_26px_-8px_var(--tl-coral)] max-md:size-10'
      >
        <span className='grid size-[30px] rotate-45 place-items-center rounded-full bg-white max-md:size-[26px]'>
          <Image
            src='/logo.png'
            alt=''
            width={26}
            height={24}
            className='h-auto w-5 max-md:w-[17px]'
          />
        </span>
      </span>
      {chatEndpoint(CHAT_PROXY_URL) !== null && (
        // the assistant can be reached (the chat address is set): a small live dot, like Standard's button
        <span
          aria-hidden='true'
          className='tl-live absolute top-0.5 right-0.5 size-3.5 rounded-full border-2 border-tl-solid bg-tl-teal'
        />
      )}
    </button>
  );
}
