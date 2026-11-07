/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { Maintenance } from '@/components/use-maintenance';
import { commonCopy } from '@/content/copy/common';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { TvRoot } from '@/skins/trade/ui/tv-root';
import { TvStatusBody } from '@/skins/trade/ui/tv-status-screen';

/** The screen that replaces the whole site while maintenance is on: the Standard words and the same way out. */
export function TvMaintenanceScreen({
  message,
  email,
}: Pick<Maintenance, 'message' | 'email'>) {
  const copy = useCopy(commonCopy).maintenance;
  const closed = useCopy(tradeDeskCopy).states.closedKicker;
  return (
    <TvRoot
      role='status'
      className='flex min-h-screen flex-col bg-[linear-gradient(var(--tv-grid)_1px,transparent_1px),linear-gradient(90deg,var(--tv-grid)_1px,transparent_1px)] bg-[size:48px_48px]'
    >
      <div className='flex h-[38px] items-center gap-2 border-b border-tv-line bg-tv-bg px-3 font-bold'>
        <Image
          src='/logo.png'
          alt=''
          width={22}
          height={21}
          className='h-auto w-[22px]'
          priority
        />
        {shell.name}
      </div>
      <main className='flex flex-1'>
        <TvStatusBody
          code={copy.code}
          title={copy.title}
          body={message}
          kicker={closed}
          art='closed'
        >
          {email && (
            <p className='text-sm text-tv-mute'>
              {copy.contact}{' '}
              <a
                data-slot='tv-maintenance-link'
                className='text-tv-accent-ink underline underline-offset-[3px]'
                href={email.url}
              >
                {email.label}
              </a>
            </p>
          )}
        </TvStatusBody>
      </main>
    </TvRoot>
  );
}
