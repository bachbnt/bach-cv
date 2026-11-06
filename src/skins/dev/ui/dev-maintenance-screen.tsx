/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { Maintenance } from '@/components/use-maintenance';
import { commonCopy } from '@/content/copy/common';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { DevLead } from '@/skins/dev/ui/dev-lead';
import { DevRoot } from '@/skins/dev/ui/dev-root';
import { DevStatusCode } from '@/skins/dev/ui/dev-status-code';
import { DevTerm, DevTermBody } from '@/skins/dev/ui/dev-term';
import { DevTermBar } from '@/skins/dev/ui/dev-term-bar';

/** The screen that replaces the whole site while maintenance is on: a terminal card with the Standard words and the same way out. */
export function DevMaintenanceScreen({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  return (
    <DevRoot
      role='status'
      className='flex flex-col items-center justify-center gap-[22px] p-6'
    >
      <div className='flex items-center gap-3 font-code text-[20px] leading-[normal] font-bold text-head'>
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
      <DevTerm className='mt-[34px] mb-1 w-[min(720px,100%)]'>
        <DevTermBar />
        <DevTermBody as='main'>
          <DevStatusCode>{copy.code}</DevStatusCode>
          <h1 className='text-[length:clamp(34px,5vw,58px)]'>{copy.title}</h1>
          <DevLead>{message}</DevLead>
          {email && (
            <DevLead>
              {copy.contact}{' '}
              <a
                data-slot='dev-maintenance-link'
                className='text-sky underline underline-offset-[3px]'
                href={email.url}
              >
                {email.label}
              </a>
            </DevLead>
          )}
        </DevTermBody>
      </DevTerm>
    </DevRoot>
  );
}
