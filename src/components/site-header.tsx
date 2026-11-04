/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectMenu } from '@/components/connect-menu';
import { LanguageSwitch } from '@/components/language-switch';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { MobileMenu } from '@/components/mobile-menu';
import { liveSchema, type PageKey } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { NAV_PAGES, PAGE_META } from '@/lib/pages';
import { liveQueryOptions } from '@/lib/query/options';
import { cn } from 'cn';

/** Until the switches arrive (or if they cannot be read) every page is on: the site fails open. */
const DEFAULT_LIVE = liveSchema.parse({});

const navLink =
  'border-b-2 border-transparent py-2 text-[15px] font-medium hover:border-brand aria-[current=page]:border-page';

export function SiteHeader({ current }: { current: PageKey | 'neutral' }) {
  const { data: live = DEFAULT_LIVE } = useQuery(liveQueryOptions());
  const copy = useCopy(commonCopy);

  return (
    <header className='mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-5 py-6 min-[721px]:px-12'>
      <Link
        href='/'
        aria-label={`${shell.name}, home`}
        className='group flex items-center gap-3 font-heading text-xl font-bold tracking-[-0.02em] whitespace-nowrap'
      >
        <Image
          src='/logo.png'
          alt=''
          width={36}
          height={34}
          priority
          className='h-auto w-9 origin-[50%_60%] transition-transform duration-[450ms] ease-[cubic-bezier(.34,1.7,.5,1)] group-hover:scale-110 group-hover:-rotate-[9deg] group-active:scale-90 group-active:rotate-[4deg] motion-reduce:transition-none'
        />
        <span className='bg-[linear-gradient(var(--page),var(--page))] bg-size-[0_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-size-[100%_2px] motion-reduce:transition-none'>
          {shell.name}
        </span>
      </Link>

      <div className='hidden items-center gap-7 min-[1200px]:flex'>
        <nav aria-label='Main' className='flex items-center gap-7'>
          {NAV_PAGES.map((page) => {
            const state = live.pages[page];
            if (state === 'hidden') return null;
            const { href } = PAGE_META[page];
            const label = copy.nav[page];
            return state === 'soon' ? (
              <span
                key={page}
                className={cn(
                  navLink,
                  'inline-flex cursor-default items-center gap-1.5 text-muted-foreground hover:border-transparent',
                )}
              >
                {label}
                <small className='rounded-full bg-secondary px-[7px] py-0.5 text-xs font-semibold'>
                  {copy.soon}
                </small>
              </span>
            ) : (
              <Link
                key={page}
                href={href}
                className={navLink}
                aria-current={current === page ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <LanguageSwitch />
        {live.features.connectMenu && <ConnectMenu />}
      </div>

      <MobileMenu current={current} live={live} />
    </header>
  );
}
