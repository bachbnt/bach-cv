/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { Maintenance } from '@/components/use-maintenance';
import { commonCopy } from '@/content/copy/common';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { AcPaper } from '@/skins/academic/ui/ac-paper';
import { AcRoot } from '@/skins/academic/ui/ac-root';

/** The screen that replaces the whole site while maintenance is on: a note pinned to the board, with the Standard words and the same way out. */
export function AcMaintenanceScreen({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  return (
    <AcRoot
      role='status'
      className='flex flex-col items-center justify-center gap-6 p-6'
    >
      <div className='flex items-center gap-3 font-ac-chalk text-[30px]/none'>
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
      <AcPaper kind='pinned' className='w-[min(620px,100%)] px-9 py-9'>
        <main>
          <p
            aria-hidden='true'
            className='font-ac-chalk text-[clamp(36px,7vw,64px)]/none font-normal text-ac-accent'
          >
            {copy.code}
          </p>
          <h1 className='mt-3 font-ac-chalk text-[clamp(30px,5vw,44px)]/[1.1] font-normal'>
            {copy.title}
          </h1>
          <p className='mt-3 text-ac-mute'>{message}</p>
          {email && (
            <p className='mt-3'>
              {copy.contact}{' '}
              <a
                href={email.url}
                className='text-ac-link underline underline-offset-[3px]'
              >
                {email.label}
              </a>
            </p>
          )}
        </main>
      </AcPaper>
    </AcRoot>
  );
}
