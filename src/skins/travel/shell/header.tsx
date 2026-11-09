/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { chatCopy } from '@/content/copy/chat';
import { commonCopy } from '@/content/copy/common';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { useChat } from '@/components/chat/chat-provider';
import { useLive } from '@/hooks/use-live';
import { shell } from '@/lib/content/shell';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { localize } from '@/lib/content/schema';
import { ConnectMenu } from '@/skins/travel/shell/connect-menu';
import { LanguageMenu, SkinMenu, ThemeMenu } from '@/skins/travel/shell/menus';
import { useTravel } from '@/skins/travel/shell/travel-context';
import { TlButton } from '@/skins/travel/ui/tl-button';

export const CHAT_TRIGGER_ID = 'tl-chat-trigger';
export const CV_TRIGGER_ID = 'tl-cv-trigger';

/** The header: the name of the trip, then the actions of Standard in the order of every skin (Language, Skin, Theme after the page actions). */
export function Header() {
  const common = useCopy(commonCopy);
  const chat = useCopy(chatCopy);
  const trip = useCopy(travelShellCopy);
  const { features } = useLive();
  const { lang } = useLang();
  const { openChat } = useChat();
  const { openCv } = useTravel();
  const headline = localize(shell, lang).headline;
  return (
    <header className='tl-header relative z-30 flex items-center gap-2 border-b border-tl-line bg-tl-panel px-3 md:col-span-2 md:gap-3 md:px-4'>
      <Link
        href='/'
        aria-label={fill(common.homeLink, { name: shell.name })}
        className='flex min-w-0 items-center gap-2.5 rounded-xl'
      >
        {/* the owner's mark as a stamp stuck on the bar */}
        <span
          aria-hidden='true'
          className='grid size-10 flex-none -rotate-3 place-items-center rounded-[5px] border-2 border-dashed border-tl-coral/60 bg-tl-solid shadow-tl-card'
        >
          <Image
            src='/logo.png'
            alt=''
            width={30}
            height={28}
            priority
            className='h-auto w-[26px]'
          />
        </span>
        <span className='flex min-w-0 flex-col max-sm:hidden'>
          <b className='truncate text-[15px]/[1.2] font-extrabold'>
            {shell.name}
          </b>
          <span className='truncate text-[11.5px] text-tl-muted'>
            {trip.brandTagline}
          </span>
        </span>
      </Link>
      <span className='sr-only'>{headline}</span>
      <div className='flex-1' />
      {features.cvDownload && (
        <TlButton
          id={CV_TRIGGER_ID}
          variant='solid'
          aria-haspopup='dialog'
          onClick={openCv}
          aria-label={common.downloadCv}
          className='max-md:size-10 max-md:px-0'
        >
          <Download aria-hidden='true' />
          <span className='max-md:hidden'>{common.downloadCv}</span>
        </TlButton>
      )}
      {features.chat && (
        <TlButton
          id={CHAT_TRIGGER_ID}
          variant='ghost'
          onClick={openChat}
          aria-label={chat.askButton}
          className='max-md:size-10 max-md:px-0'
        >
          <MessageCircle aria-hidden='true' />
          <span className='max-lg:hidden'>{chat.askButton}</span>
        </TlButton>
      )}
      {features.connectMenu && <ConnectMenu />}
      <LanguageMenu />
      <SkinMenu />
      <ThemeMenu />
      {/* the road of the trip along the bottom edge of the bar */}
      <span aria-hidden='true' className='tl-road' />
    </header>
  );
}
