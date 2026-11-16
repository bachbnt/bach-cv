/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { Maintenance } from '@/components/use-maintenance';
import { commonCopy } from '@/content/copy/common';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhRoot } from '@/skins/phone/ui/ph-root';

/** The screen that replaces the whole site while maintenance is on: a system alert on the home screen, with the Standard words and the same way out. */
export function PhMaintenanceScreen({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  return (
    <PhRoot
      role='status'
      className='ph-wallpaper flex flex-col items-center justify-center gap-6 p-6'
    >
      <div className='flex items-center gap-3 text-[22px]/none font-bold text-ph-glass-ink'>
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
      <PhCard className='w-[min(520px,100%)] p-7 text-center'>
        <main>
          <p
            aria-hidden='true'
            className='text-[clamp(30px,8vw,44px)]/none font-extrabold text-ph-accent-ink'
          >
            {copy.code}
          </p>
          <h1 className='mt-3 text-[26px]/[1.15] font-bold'>{copy.title}</h1>
          <p className='mt-2 text-ph-mute'>{message}</p>
          {email && (
            <p className='mt-4'>
              {copy.contact}{' '}
              <a
                href={email.url}
                className='font-semibold text-ph-accent-ink underline underline-offset-[3px]'
              >
                {email.label}
              </a>
            </p>
          )}
        </main>
      </PhCard>
    </PhRoot>
  );
}
