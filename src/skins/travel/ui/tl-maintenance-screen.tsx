/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { Maintenance } from '@/components/use-maintenance';
import { commonCopy } from '@/content/copy/common';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { TlStateArt } from '@/skins/travel/ui/tl-art';
import { TlRoot } from '@/skins/travel/ui/tl-root';

/** The screen that replaces the whole site while maintenance is on: a road barrier, the Standard words and the same way out. */
export function TlMaintenanceScreen({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  const trip = useCopy(travelShellCopy).states;
  return (
    <TlRoot
      role='status'
      className='tl-sky-screen flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center'
    >
      <div className='flex items-center gap-3 text-xl font-extrabold'>
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
      <main className='flex w-[min(520px,100%)] flex-col items-center gap-3 rounded-3xl border border-tl-line bg-tl-panel p-8 shadow-tl-card'>
        <TlStateArt art='maintenance' className='h-28 w-full max-w-[240px]' />
        <p className='m-0 text-[11.5px] font-extrabold tracking-[1px] text-tl-coral uppercase'>
          {copy.code} · {trip.maintenance}
        </p>
        <h1 className='m-0 text-[clamp(26px,5vw,38px)]/[1.1] font-extrabold'>
          {copy.title}
        </h1>
        <p className='m-0 text-tl-muted'>{message}</p>
        {email && (
          <p className='m-0 text-tl-muted'>
            {copy.contact}{' '}
            <a
              data-slot='tl-maintenance-link'
              className='font-bold text-tl-chip-ink underline underline-offset-[3px]'
              href={email.url}
            >
              {email.label}
            </a>
          </p>
        )}
      </main>
    </TlRoot>
  );
}
