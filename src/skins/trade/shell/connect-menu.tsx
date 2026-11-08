/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpRight, Copy, Check, MapPin, Share2 } from 'lucide-react';
import Image from 'next/image';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commonCopy } from '@/content/copy/common';
import { useClipboard } from '@/hooks/use-clipboard';
import { CONTACT_GROUPS, localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { useWide } from '@/skins/trade/shell/use-wide';
import { TV_POPUP } from '@/skins/trade/ui/tv-menu';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/**
 * Connect, in the rail: the same email, the same links (each with its group) and the same place as the Standard Connect menu, laid out
 * as the card of a profile on a trading site: who it is, a primary "email" row, then ONE flat list of the links with the group of each as a
 * tag, like a symbol list with its exchange. A popover built on the shadcn one; it opens to the left of the rail, or above it on a phone.
 */
export function ConnectMenu() {
  const text = useCopy(commonCopy).connect;
  const { lang } = useLang();
  const wide = useWide();
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const email = contacts.find((c) => c.kind === 'email');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);
  // the order of the groups, then the order of the contacts inside a group
  const links = CONTACT_GROUPS.flatMap((group) =>
    social.filter((c) => c.menuGroup === group),
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <TvButton
            variant='ghost'
            size='icon'
            aria-label={text.button}
            className='size-9 data-popup-open:bg-tv-hover'
          />
        }
      >
        <Share2 aria-hidden='true' className='size-5' strokeWidth={1.4} />
      </PopoverTrigger>
      <PopoverContent
        side={wide ? 'left' : 'top'}
        align='end'
        sideOffset={8}
        className={cn(
          'w-[340px] max-w-[calc(100vw-24px)] gap-0 overflow-hidden p-0',
          TV_POPUP,
        )}
      >
        <div className='border-b border-tv-line p-3'>
          <p className='mb-2.5 text-[11px] font-bold tracking-wide text-tv-mute uppercase'>
            {text.title}
          </p>
          <div className='flex items-center gap-3'>
            {shell.avatar && (
              <Image
                src={shell.avatar}
                alt=''
                width={44}
                height={44}
                unoptimized
                className='size-11 flex-none rounded-full object-cover object-[50%_25%]'
              />
            )}
            <div className='min-w-0'>
              <p className='truncate text-[15px] leading-tight font-bold'>
                {shell.name}
              </p>
              <p className='truncate text-xs text-tv-mute'>
                {localize(shell, lang).headline}
              </p>
              {profile?.location && (
                <p className='mt-0.5 flex items-center gap-1 text-xs text-tv-mute'>
                  <MapPin aria-hidden='true' className='size-3 flex-none' />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
          {email && (
            <div className='mt-3 flex h-9 overflow-hidden rounded bg-tv-accent pointer-coarse:h-11'>
              <a
                href={email.url}
                className='flex min-w-0 flex-1 items-center gap-2 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-tv-accent-hover focus-visible:bg-tv-accent-hover focus-visible:-outline-offset-2'
              >
                <BrandIcon platform='email' className='size-4 flex-none' />
                <span className='truncate'>{email.label}</span>
              </a>
              <button
                type='button'
                aria-label={text.copy}
                title={copied ? text.copied : text.copy}
                onClick={() => copy(email.label)}
                className='grid w-9 flex-none cursor-pointer place-items-center border-l border-white/25 text-white transition-colors hover:bg-tv-accent-hover focus-visible:bg-tv-accent-hover focus-visible:-outline-offset-2 pointer-coarse:w-11 [&_svg]:size-4'
              >
                {copied ? (
                  <Check aria-hidden='true' />
                ) : (
                  <Copy aria-hidden='true' />
                )}
              </button>
              <span role='status' className='sr-only'>
                {copied ? text.copied : ''}
              </span>
            </div>
          )}
        </div>
        <ul className='grid max-h-[min(360px,50dvh)] overflow-y-auto p-1.5'>
          {links.map((c) => (
            <li key={c.id}>
              <a
                href={c.url}
                target='_blank'
                rel='noopener'
                className='group/item flex min-h-10 items-center gap-2.5 rounded px-1.5 py-1 hover:bg-tv-hover focus-visible:bg-tv-hover pointer-coarse:min-h-11'
              >
                <span
                  aria-hidden='true'
                  style={{ color: brandColor(c.platform) }}
                  className='grid size-7 flex-none place-items-center rounded bg-tv-hover'
                >
                  <BrandIcon platform={c.platform} className='size-4' />
                </span>
                <span className='flex min-w-0 flex-1 flex-col'>
                  <span className='text-[13px] font-semibold'>
                    {brandName(c.platform)}
                  </span>
                  <span className='truncate text-xs text-tv-mute'>
                    {c.label}
                  </span>
                </span>
                {c.menuGroup && (
                  <TvChip size='sm' className='flex-none'>
                    {text.groups[c.menuGroup]}
                  </TvChip>
                )}
                <ArrowUpRight
                  aria-hidden='true'
                  className='size-3.5 flex-none text-tv-mute opacity-0 group-hover/item:opacity-100 group-focus-visible/item:opacity-100'
                />
              </a>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
