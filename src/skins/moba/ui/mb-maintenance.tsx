/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { shell } from '@/lib/content/shell';
import type { Maintenance } from '@/components/use-maintenance';
import { useCopy } from '@/lib/i18n/copy';
import { MbRoot } from '@/skins/moba/ui/mb-root';
import { MbStateScreen } from '@/skins/moba/ui/mb-state-screen';

/** The screen that replaces the whole site while maintenance is on: the arena is closed for the server's maintenance. */
export function MbMaintenance({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  const mb = useCopy(mobaCopy).states;
  return (
    <MbRoot role='status' className='mb-closed flex flex-col'>
      <div className='mx-auto flex w-full max-w-[960px] items-center gap-3 px-6 py-6 font-mb-display text-2xl font-bold text-mb-title'>
        <Image
          src='/logo.png'
          alt=''
          width={36}
          height={34}
          priority
          className='h-auto w-9 bg-white p-0.5'
        />
        {shell.name}
      </div>
      <main className='mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center overflow-y-auto pb-20'>
        <MbStateScreen
          inPanel={false}
          code={copy.code}
          kicker={mb.maintenanceKicker}
          title={copy.title}
          body={message}
        >
          {email && (
            <p className='text-base text-mb-mute'>
              {copy.contact}{' '}
              <a
                href={email.url}
                className='font-semibold text-mb-title underline underline-offset-4'
              >
                {email.label}
              </a>
            </p>
          )}
        </MbStateScreen>
      </main>
    </MbRoot>
  );
}
