/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BrandIcon } from '@/components/brand-icon';
import { commonCopy } from '@/content/copy/common';
import { useClipboard } from '@/hooks/use-clipboard';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** The email address as a row: a link, with a button that copies it and says `Copied` for a moment. */
export function PhConnectEmail({
  contact,
}: {
  contact: { url: string; label: string };
}) {
  const text = useCopy(commonCopy);
  const { copied, copy } = useClipboard();
  return (
    <div className='flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2'>
      <span className='inline-grid size-11 shrink-0 place-items-center rounded-ph-inner bg-ph-accent/15 text-ph-accent-ink'>
        <BrandIcon platform='email' className='size-5' />
      </span>
      <div className='flex min-w-0 flex-1 basis-40 flex-col'>
        <span className='text-[13px] font-semibold text-ph-mute'>
          {text.connect.email}
        </span>
        <a
          href={contact.url}
          // the 44 px of a finger: the row is taller than the link, so the target grows into it
          className='relative text-[16px]/[1.35] font-semibold wrap-anywhere text-ph-ink underline decoration-ph-line underline-offset-[3px] after:absolute after:inset-x-0 after:-inset-y-3 after:content-[""]'
        >
          {contact.label}
        </a>
      </div>
      <PhButton
        variant='tonal'
        onClick={() => void copy(contact.label)}
        className='@max-[359px]:w-full'
      >
        {copied ? text.connect.copied : text.connect.copy}
      </PhButton>
    </div>
  );
}
