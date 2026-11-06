/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { GoBackButton } from '@/components/go-back-button';
import { buttonVariants } from '@/components/ui/button';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from 'cn';

/** The big-number screen used by 404 and Coming soon (the design mockup, coming-soon.html). */
export function StatusScreen({ variant }: { variant: 'notFound' | 'soon' }) {
  const copy = useCopy(commonCopy);
  const text = copy.status[variant];
  return (
    <div className='band-glow rounded-b-[40px] bg-page-tint'>
      <section className='mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6 px-5 pt-24 pb-[120px] min-[721px]:px-12'>
        <p className='font-heading text-[80px] leading-none font-bold tracking-[-0.04em] text-brand-ink min-[721px]:text-[120px]'>
          {variant === 'soon' ? copy.soon : '404'}
        </p>
        <h1 className='text-[36px] leading-[1.05] min-[721px]:text-5xl'>
          {text.title}
        </h1>
        <p className='max-w-[520px] text-xl leading-[1.55] text-body'>
          {text.body}
        </p>
        <div className='mt-2 flex flex-col gap-3 max-[480px]:self-stretch min-[481px]:flex-row'>
          <Link
            href='/'
            className={cn(buttonVariants({ variant: 'brand', size: 'lg' }))}
          >
            {copy.status.home}
          </Link>
          <GoBackButton>{copy.status.back}</GoBackButton>
        </div>
      </section>
    </div>
  );
}
