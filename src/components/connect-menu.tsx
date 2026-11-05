/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpRight, MapPin, Share2, X } from 'lucide-react';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import { buttonVariants } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useClipboard } from '@/hooks/use-clipboard';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { CONTACT_GROUPS, type Doc } from '@/lib/content/schema';
import { cn } from 'cn';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';

/** Handle shown under a link: the label without a leading URL scheme. */
const handleOf = (c: Doc<'contacts'>) => c.label;

export function ConnectMenu() {
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const text = useCopy(commonCopy);

  const email = contacts.find((c) => c.kind === 'email');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants(), 'cursor-pointer')}>
        <span className='relative size-[18px]'>
          <Share2
            aria-hidden='true'
            className='absolute inset-0 transition-[scale,rotate,opacity] duration-300 group-data-popup-open/button:scale-60 group-data-popup-open/button:rotate-90 group-data-popup-open/button:opacity-0'
          />
          <X
            aria-hidden='true'
            className='absolute inset-0 scale-60 -rotate-90 opacity-0 transition-[scale,rotate,opacity] duration-300 group-data-popup-open/button:scale-100 group-data-popup-open/button:rotate-0 group-data-popup-open/button:opacity-100'
          />
        </span>
        {text.connect.button}
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={10}
        className='w-[372px] max-w-[calc(100vw-32px)] gap-0 rounded-3xl p-3 pt-[18px] shadow-[0_24px_56px_rgba(27,31,39,.18)]'
      >
        <p className='font-heading mx-2 mb-3 text-xl font-bold tracking-[-0.01em]'>
          {text.connect.title}
        </p>

        {email && (
          <div className='mb-1.5 flex items-center gap-3 rounded-[14px] bg-page-tint p-3'>
            <span className='flex size-9 flex-none items-center justify-center rounded-[10px] bg-card text-brand-ink'>
              <BrandIcon platform='email' className='size-[18px]' />
            </span>
            <div className='flex min-w-0 flex-1 flex-col'>
              <span className='text-[15px] font-semibold'>
                {text.connect.email}
              </span>
              <a
                className='truncate text-sm font-medium underline underline-offset-[3px]'
                href={email.url}
              >
                {email.label}
              </a>
            </div>
            <button
              type='button'
              onClick={() => copy(email.label)}
              className='min-h-9 flex-none cursor-pointer rounded-[10px] border-[1.5px] border-foreground bg-card px-3.5 text-sm font-semibold transition-colors hover:bg-secondary'
            >
              {copied ? text.connect.copied : text.connect.copy}
            </button>
          </div>
        )}

        {CONTACT_GROUPS.map((group) => {
          const items = social.filter((c) => c.menuGroup === group);
          if (!items.length) return null;
          return (
            <div key={group} className='mt-2.5'>
              <p className='mx-2 mb-1 text-xs font-semibold tracking-[0.02em] text-muted-foreground'>
                {text.connect.groups[group]}
              </p>
              <ul className='grid gap-0.5'>
                {items.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target='_blank'
                      rel='noopener'
                      style={
                        { '--c': brandColor(c.platform) } as React.CSSProperties
                      }
                      className='group/item flex min-h-[52px] items-center gap-3 rounded-xl p-2 transition-colors hover:bg-background focus-visible:bg-background'
                    >
                      <span className='flex size-9 flex-none items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--c)_12%,var(--card))] text-[color-mix(in_srgb,var(--c)_70%,var(--foreground))] transition-colors group-hover/item:bg-(--c) group-hover/item:text-white group-focus-visible/item:bg-(--c) group-focus-visible/item:text-white'>
                        <BrandIcon
                          platform={c.platform}
                          className='size-[18px]'
                        />
                      </span>
                      <span className='flex min-w-0 flex-1 flex-col'>
                        <span className='text-[15px] font-semibold'>
                          {brandName(c.platform)}
                        </span>
                        <span className='truncate text-[13px] text-muted-foreground'>
                          {handleOf(c)}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden='true'
                        className='size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-[translate,opacity] group-hover/item:translate-0 group-hover/item:opacity-100 group-focus-visible/item:translate-0 group-focus-visible/item:opacity-100'
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {profile?.location && (
          <p className='mx-2 mt-3 flex items-center gap-2 border-t pt-3 text-[13px] text-muted-foreground'>
            <MapPin aria-hidden='true' className='size-4' />
            {profile.location}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
