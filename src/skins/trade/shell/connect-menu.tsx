/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MapPin, Share2 } from 'lucide-react';
import Image from 'next/image';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commonCopy } from '@/content/copy/common';
import { CONTACT_GROUPS, localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { useWide } from '@/skins/trade/shell/use-wide';
import { TV_POPUP } from '@/skins/trade/ui/tv-menu';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvEmailRow } from '@/skins/trade/ui/tv-email-row';
import { TvLinkGroups } from '@/skins/trade/ui/tv-link-groups';

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
          {email && <TvEmailRow email={email} className='mt-3' />}
        </div>
        <div className='max-h-[min(360px,50dvh)] overflow-y-auto p-1.5'>
          <TvLinkGroups contacts={links} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
