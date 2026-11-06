/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { devCopy } from '@/content/copy/dev';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLive } from '@/hooks/use-live';
import { cn } from '@/lib/utils';
import { GIT_PENDING } from '@/skins/dev/config';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import type { CodiconName } from '@/skins/dev/icons/codicons';

/** A button of the strip: grey, white when pointed at, and white with a bar at its left edge when it is on. */
const BUTTON =
  'relative grid size-12 cursor-pointer place-items-center bg-transparent text-[#858585] hover:text-white aria-pressed:text-white aria-pressed:before:absolute aria-pressed:before:top-2.5 aria-pressed:before:bottom-2.5 aria-pressed:before:left-0 aria-pressed:before:w-0.5 aria-pressed:before:bg-white aria-pressed:before:content-[""]';

/** The strip of icons at the left of the editor. */
export function ActivityBar({
  explorerOpen,
  onToggleExplorer,
  accountOpen,
  onToggleAccount,
}: {
  explorerOpen: boolean;
  onToggleExplorer: () => void;
  accountOpen: boolean;
  onToggleAccount: () => void;
}) {
  const copy = useCopy(devCopy);
  const connectMenu = useLive().features.connectMenu;
  const decor: { name: CodiconName; label: string; badge?: number }[] = [
    { name: 'search', label: copy.activity.search },
    {
      name: 'source-control',
      label: copy.activity.sourceControl,
      badge: GIT_PENDING,
    },
    { name: 'debug-alt', label: copy.activity.runDebug },
    { name: 'extensions', label: copy.activity.extensions },
  ];

  return (
    <nav
      className='sticky top-(--top) z-25 flex h-[calc(100vh-var(--top)-var(--bottom))] w-12 flex-none flex-col items-center bg-activity [view-transition-name:act] max-[900px]:hidden'
      aria-label={copy.activity.label}
    >
      <button
        type='button'
        className={BUTTON}
        aria-pressed={explorerOpen}
        aria-label={copy.explorer}
        title={copy.explorer}
        onClick={onToggleExplorer}
      >
        <DevIcon name='files' className='size-6' />
      </button>
      {decor.map((item) => (
        <button
          key={item.name}
          type='button'
          className={BUTTON}
          tabIndex={-1}
          aria-label={item.label}
          title={item.label}
        >
          <DevIcon name={item.name} className='size-6' />
          {item.badge !== undefined && (
            <span className='absolute right-2 bottom-[9px] h-4 min-w-4 rounded-[8px] bg-[#007acc] px-[3px] text-center font-sans text-[10px] leading-4 font-semibold text-white'>
              {item.badge}
            </span>
          )}
        </button>
      ))}
      <span className='flex-1' />
      {connectMenu ? (
        <button
          type='button'
          id='dv-acctbtn'
          className={cn(BUTTON, 'group/acct')}
          aria-haspopup='dialog'
          aria-expanded={accountOpen}
          aria-controls='dv-acctmenu'
          aria-label={`${copy.account}: ${shell.name}`}
          title={shell.name}
          onClick={onToggleAccount}
        >
          <Image
            src='/logo.png'
            alt=''
            width={28}
            height={28}
            className='size-7 rounded-full bg-white object-contain p-1 shadow-[0_0_0_2px_rgba(255,255,255,0.12)] transition-[transform,box-shadow] duration-200 group-hover/acct:shadow-[0_0_0_2px_var(--dv-accent)] group-hover/acct:[transform:scale(1.1)] group-aria-expanded/acct:shadow-[0_0_0_2px_var(--dv-accent)]'
          />
        </button>
      ) : (
        // the Connect menu is switched off (`site/live`), as in the Standard header: the avatar is only a picture
        <span className={cn(BUTTON, 'cursor-default')} aria-hidden='true'>
          <Image
            src='/logo.png'
            alt=''
            width={28}
            height={28}
            className='size-7 rounded-full bg-white object-contain p-1 shadow-[0_0_0_2px_rgba(255,255,255,0.12)]'
          />
        </span>
      )}
      <button
        type='button'
        className={BUTTON}
        tabIndex={-1}
        aria-label={copy.activity.manage}
        title={copy.activity.manage}
      >
        <DevIcon name='settings-gear' className='size-6' />
      </button>
    </nav>
  );
}
