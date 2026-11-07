/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectMenu } from '@/components/connect-menu';
import { chatCopy } from '@/content/copy/chat';
import { commonCopy } from '@/content/copy/common';
import { useChat } from '@/components/chat/chat-provider';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useStreamChat } from '@/skins/stream/chat/stream-chat-context';
import { DecorSearch } from '@/skins/stream/shell/decor-search';
import { LanguageMenu } from '@/skins/stream/shell/language-menu';
import { SkinMenu } from '@/skins/stream/shell/skin-menu';
import { ThemeMenu } from '@/skins/stream/shell/theme-menu';
import { ICON_BUTTON } from '@/skins/stream/ui/icon-button-class';

/**
 * The top bar: the burger, the logo, the (decorative) search field and, at the end, the language, theme and Skin menus, the chat and
 * Connect. A phone has the menus in the sheet of its bottom navigation, so only the logo, the chat and Connect stay.
 */
export function TopBar({
  menuExpanded,
  onToggleMenu,
}: {
  /** whether the navigation the burger controls is showing (the sidebar, or the drawer) */
  menuExpanded: boolean;
  onToggleMenu: () => void;
}) {
  const copy = useCopy(commonCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const { isOpen, openChat, closeChat } = useChat();
  const { enabled, docked } = useStreamChat();

  return (
    <header className='sticky top-0 z-40 flex h-14 items-center gap-2 bg-sm-bg px-2 [view-transition-name:sm-top] min-[701px]:gap-4 min-[701px]:px-4'>
      <button
        type='button'
        aria-label={copy.menu.label}
        aria-expanded={menuExpanded}
        onClick={onToggleMenu}
        className={`${ICON_BUTTON} max-[700px]:hidden`}
      >
        <Menu aria-hidden='true' />
      </button>
      <Link
        href='/'
        aria-label={fill(copy.homeLink, { name: shell.name })}
        className='flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-xl font-bold tracking-tight whitespace-nowrap'
      >
        <Image
          src='/logo.png'
          alt=''
          width={36}
          height={34}
          priority
          className='h-auto w-9'
        />
        <span className='max-[700px]:hidden'>{shell.name}</span>
      </Link>
      <DecorSearch />
      <div className='ml-auto flex items-center gap-1 min-[701px]:gap-2'>
        <div className='flex items-center gap-1 max-[700px]:hidden'>
          <LanguageMenu />
          <SkinMenu />
          <ThemeMenu />
        </div>
        {enabled && !docked && (
          <button
            type='button'
            aria-label={isOpen ? chat.close : chat.open}
            aria-expanded={isOpen}
            aria-haspopup='dialog'
            onClick={isOpen ? closeChat : openChat}
            className={ICON_BUTTON}
          >
            <MessageCircle aria-hidden='true' />
          </button>
        )}
        {live.features.connectMenu && (
          <div className='[&_[data-slot=popover-trigger]]:rounded-full'>
            <ConnectMenu />
          </div>
        )}
      </div>
    </header>
  );
}
