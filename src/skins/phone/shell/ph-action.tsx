/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { commonCopy } from '@/content/copy/common';
import { phoneCopy } from '@/content/copy/phone';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ACTION_ICONS } from '@/skins/phone/config';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

type Kind = 'chat' | 'connect' | 'cv' | 'settings';

/**
 * One of the four things the header of Standard has besides the menus: Ask BB Bot, Connect, Download CV (each off with its `site/live`
 * switch) and, in the Phone skin, Settings, which holds the three menus. `dock` is an app of the home screen (a tile and its name on one
 * line), `icon` a round button of a bar with the name as its accessible name, `quick` a tile of the quick settings (it closes them, then
 * opens its own). The names are the Standard ones.
 */
export function PhAction({
  kind,
  layout,
  className,
}: {
  kind: Kind;
  layout: 'dock' | 'icon' | 'quick';
  className?: string;
}) {
  const live = useLive();
  const chat = useCopy(chatCopy);
  const common = useCopy(commonCopy);
  const phone = useCopy(phoneCopy);
  const { openChat } = useChat();
  const { openCv, openConnect, openSettings, closeSettings } = usePhOverlays();

  const on =
    kind === 'chat'
      ? live.features.chat
      : kind === 'connect'
        ? live.features.connectMenu
        : kind === 'cv'
          ? live.features.cvDownload
          : true;
  if (!on) return null;

  const label =
    kind === 'chat'
      ? chat.askButton
      : kind === 'connect'
        ? common.connect.button
        : kind === 'cv'
          ? common.downloadCv
          : phone.settings;
  const press =
    kind === 'chat'
      ? openChat
      : kind === 'connect'
        ? openConnect
        : kind === 'cv'
          ? openCv
          : openSettings;
  const Icon = ACTION_ICONS[kind];

  if (layout === 'dock')
    return (
      <button
        type='button'
        onClick={press}
        aria-haspopup='dialog'
        className={cn(
          'group flex w-[72px] cursor-pointer flex-col items-center gap-1.5 rounded-ph-inner p-1 text-[12px]/[1.15] font-semibold text-ph-glass-ink transition-[scale] duration-100 active:scale-[0.95]',
          className,
        )}
      >
        <PhIconTile tile={kind} className='size-[58px]' />
        <span className='w-full truncate text-center'>{label}</span>
      </button>
    );

  if (layout === 'quick')
    return (
      <button
        type='button'
        onClick={() => {
          closeSettings();
          press();
        }}
        aria-haspopup='dialog'
        className={cn(
          'group flex min-h-[5.5rem] min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-ph-panel bg-ph-sheet-2 px-1.5 py-3 text-[12px]/[1.15] font-semibold text-ph-ink transition-[scale,background-color] duration-100 hover:bg-ph-sheet-3 active:scale-[0.96]',
          className,
        )}
      >
        <PhIconTile tile={kind} className='size-11' />
        <span className='w-full truncate text-center'>{label}</span>
      </button>
    );

  return (
    <button
      type='button'
      onClick={press}
      aria-haspopup='dialog'
      aria-label={label}
      data-ph-tip={label}
      className={cn(
        // a 44 px target with a 36 px circle drawn in it, in a quiet fill of the ink (a tint, not a grey slab)
        'ph-tip relative inline-grid size-11 cursor-pointer place-items-center rounded-full text-ph-ink transition-[scale] duration-100 before:absolute before:inset-1 before:rounded-full before:bg-ph-ink/8 before:transition-[background-color] before:duration-100 hover:before:bg-ph-ink/14 active:scale-[0.94]',
        className,
      )}
    >
      <Icon aria-hidden='true' className='relative size-5' strokeWidth={2} />
    </button>
  );
}
