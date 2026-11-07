/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { Maintenance } from '@/components/use-maintenance';
import { commonCopy } from '@/content/copy/common';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { ChannelAvatar } from '@/skins/stream/ui/channel-avatar';
import { ChannelPlayer } from '@/skins/stream/ui/channel-player';
import { StreamRoot } from '@/skins/stream/ui/stream-root';

/**
 * The screen that replaces the whole site while maintenance is on, as a player that stopped to buffer: the wheel turns, the Standard
 * words and the owner's message are on the video, the email is the link a player error leaves, and the channel is under it.
 */
export function StreamMaintenanceScreen({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  return (
    <StreamRoot role='status' className='flex flex-col'>
      <div className='flex h-14 flex-none items-center gap-2 px-4 text-xl font-bold tracking-tight'>
        <Image
          src='/logo.png'
          alt=''
          width={36}
          height={34}
          className='h-auto w-9'
          priority
        />
        {shell.name}
      </div>
      <main className='mx-auto w-full max-w-[960px] flex-1 min-[701px]:p-6'>
        <ChannelPlayer scrubber='idle' className='gap-3'>
          <div className='flex max-w-[560px] flex-col items-center gap-3'>
            <span
              aria-hidden='true'
              className='size-14 animate-[sm-wait-spin_0.9s_linear_infinite] rounded-full border-4 border-white/20 border-t-white'
            />
            <span className='inline-flex rounded-sm bg-sm-red px-2 py-0.5 text-xs font-bold tracking-wide uppercase'>
              {copy.code}
            </span>
            <h1 className='text-2xl/[1.2] font-bold min-[701px]:text-3xl/[1.2]'>
              {copy.title}
            </h1>
            <p className='text-base/[1.5] text-white/75'>{message}</p>
            {email && (
              <p className='text-sm/[1.5] text-white/75'>
                {copy.contact}{' '}
                <a
                  className='font-medium text-(--sm-glow-blue) underline underline-offset-2'
                  href={email.url}
                >
                  {email.label}
                </a>
              </p>
            )}
          </div>
        </ChannelPlayer>
        <div className='flex items-center gap-3 px-3 pt-4 min-[701px]:px-0'>
          <ChannelAvatar size={40} className='size-10' />
          <p className='font-medium'>{shell.name}</p>
        </div>
      </main>
    </StreamRoot>
  );
}
