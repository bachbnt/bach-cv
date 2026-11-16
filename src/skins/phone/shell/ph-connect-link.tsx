/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ArrowUpRight } from 'lucide-react';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';

/** One of the accounts: its brand mark (tinted with the brand colour, kept readable on both surfaces), its name and its handle. */
export function PhConnectLink({
  contact,
}: {
  contact: { url: string; label: string; platform: string };
}) {
  const color = brandColor(contact.platform);
  return (
    <a
      href={contact.url}
      target='_blank'
      rel='noopener'
      className='flex min-h-14 items-center gap-3 px-3 py-2 text-ph-ink no-underline transition-[background-color] duration-100 hover:bg-ph-sheet-3 active:bg-ph-sheet-3'
    >
      <span
        className='inline-grid size-10 shrink-0 place-items-center rounded-ph-inner'
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 14%, var(--ph-sheet-3))`,
          color: `color-mix(in srgb, ${color} 70%, var(--ph-ink))`,
        }}
      >
        <BrandIcon platform={contact.platform} className='size-5' />
      </span>
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='text-[16px]/[1.3] font-semibold'>
          {brandName(contact.platform)}
        </span>
        <span className='text-[14px]/[1.35] wrap-anywhere text-ph-mute'>
          {contact.label}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden='true'
        className='size-5 shrink-0 text-ph-mute'
      />
    </a>
  );
}
