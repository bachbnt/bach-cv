/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { academicCopy } from '@/content/copy/academic';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

/**
 * The head of a page: the term of the manuscript it stands for (small, above), the title in chalk with a line under it, and a line under that.
 * The title is the Standard name of the page; `title` and `lead` are the words of the page's own copy.
 */
export function AcPageHead({
  page,
  title,
  lead,
  children,
}: {
  page: PageKey;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  const copy = useCopy(academicCopy);
  return (
    <header className='mb-7'>
      <p
        aria-hidden='true'
        className='mb-1 font-ac-note text-[18px] tracking-[0.04em] text-ac-accent'
      >
        § {copy.terms[page]}
      </p>
      <h1 className='ac-line ac-glow mb-[18px] inline-block font-ac-chalk text-[46px]/[1.05] font-normal [--ul:var(--ac-accent)] [--ac-line-h:10px] [--ac-line-y:-8px] max-[760px]:text-[38px]'>
        {title}
      </h1>
      {lead && (
        <p className='mt-0 mb-0 max-w-[54ch] text-ac-mute italic'>{lead}</p>
      )}
      {children}
    </header>
  );
}
