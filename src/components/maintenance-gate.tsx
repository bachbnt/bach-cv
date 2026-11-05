/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { NEUTRAL_THEME } from '@/lib/pages';
import { useContentQuery } from '@/lib/query/use-content';

/**
 * Replaces the whole site with a maintenance screen while `site/live.maintenance.enabled` is true.
 * While the switches load (or cannot be read) the site shows, as everywhere else: it fails open.
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { maintenance } = useLive();
  const { lang } = useLang();
  const copy = useCopy(commonCopy);
  const { data: contacts = [] } = useContentQuery('contacts');

  if (!maintenance.enabled) return <>{children}</>;

  const message = localize(maintenance, lang).message || copy.maintenance.body;
  const email = contacts.find((c) => c.kind === 'email');
  return (
    <div
      role='status'
      style={
        {
          '--page-accent': NEUTRAL_THEME.accent,
          '--page-tint-base': NEUTRAL_THEME.tint,
        } as CSSProperties
      }
      className='page-theme flex min-h-screen flex-1 flex-col bg-page-tint'
    >
      <div className='mx-auto flex w-full max-w-[1200px] items-center gap-3 px-5 py-6 font-heading text-xl font-bold tracking-[-0.02em] min-[721px]:px-12'>
        <Image
          src='/logo.png'
          alt=''
          width={36}
          height={34}
          priority
          className='h-auto w-9'
        />
        {shell.name}
      </div>
      <main className='mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start justify-center gap-6 px-5 pb-24 min-[721px]:px-12'>
        <p className='font-heading text-[56px] leading-none font-bold tracking-[-0.04em] text-brand-ink min-[721px]:text-[96px]'>
          {copy.maintenance.code}
        </p>
        <h1 className='text-[36px] leading-[1.05] min-[721px]:text-5xl'>
          {copy.maintenance.title}
        </h1>
        <p className='max-w-[560px] text-xl leading-[1.55] text-body'>
          {message}
        </p>
        {email && (
          <p className='text-base text-body'>
            {copy.maintenance.contact}{' '}
            <a
              href={email.url}
              className='font-semibold underline underline-offset-4 hover:text-brand-ink'
            >
              {email.label}
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
