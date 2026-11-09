/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commonCopy } from '@/content/copy/common';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLive } from '@/hooks/use-live';
import { CONTACT_GROUPS } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AC_FONT_VARS } from '@/skins/academic/ui/ac-fonts';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/**
 * The Connect menu of the header: a tag that opens a slip of paper with the email (and a button that copies it), the social links by group
 * and where I am. The same links as Standard's menu, and it is not there when the `connectMenu` switch is off.
 */
export function AcConnectMenu() {
  const live = useLive();
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const text = useCopy(commonCopy);

  if (!live.features.connectMenu) return null;
  const email = contacts.find((c) => c.kind === 'email');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <Popover>
      <PopoverTrigger className='inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[8px_4px_9px_5px/5px_9px_4px_8px] border-2 border-ac-link bg-transparent px-3 font-ac-note text-[17px]/none whitespace-nowrap text-ac-link transition-colors outline-none hover:bg-ac-link/15 data-popup-open:bg-ac-link/15 pointer-coarse:min-h-11'>
        {text.connect.button}
        <AcIcon name='chevronDown' className='size-4' />
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={8}
        className={cn(
          'ac-scope ac-paper font-ac-serif w-[372px] max-w-[calc(100vw-24px)] rotate-[0.5deg] gap-0 rounded-[2px] p-3.5 text-ac-ink ring-0',
          AC_FONT_VARS,
        )}
      >
        <p className='ac-line mx-1 mb-3.5 w-fit font-ac-chalk text-[28px]/[1.1] [--ul:var(--ac-accent)] [--ac-line-y:-4px]'>
          {text.connect.title}
        </p>

        {email && (
          <div className='mb-2 flex items-center gap-3 rounded-[2px] bg-ac-hit p-2.5'>
            <span className='flex size-9 flex-none items-center justify-center text-ac-accent'>
              <BrandIcon platform='email' className='size-[20px]' />
            </span>
            <div className='flex min-w-0 flex-1 flex-col'>
              <span className='font-ac-note text-[16px]/[1.2] font-bold'>
                {text.connect.email}
              </span>
              <a
                className='truncate text-[16px] text-ac-link underline underline-offset-[3px]'
                href={email.url}
              >
                {email.label}
              </a>
            </div>
            <AcButton
              variant='quiet'
              size='sm'
              onClick={() => void copy(email.label)}
            >
              {copied ? text.connect.copied : text.connect.copy}
            </AcButton>
          </div>
        )}

        {CONTACT_GROUPS.map((group) => {
          const items = social.filter((c) => c.menuGroup === group);
          if (!items.length) return null;
          return (
            <div key={group} className='mt-2.5'>
              <p className='mx-1 mb-1 font-ac-note text-[15px] text-ac-mute'>
                {text.connect.groups[group]}
              </p>
              <ul className='m-0 grid list-none gap-0.5 p-0'>
                {items.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target='_blank'
                      rel='noopener'
                      className='group/item flex min-h-[48px] items-center gap-3 rounded-[2px] p-2 no-underline transition-colors hover:bg-ac-link/10 focus-visible:bg-ac-link/10'
                    >
                      <span
                        className='flex size-8 flex-none items-center justify-center'
                        style={{ color: brandColor(c.platform) }}
                      >
                        <BrandIcon
                          platform={c.platform}
                          className='size-[20px]'
                        />
                      </span>
                      <span className='flex min-w-0 flex-1 flex-col'>
                        <span className='font-ac-note text-[17px]/[1.2] font-bold'>
                          {brandName(c.platform)}
                        </span>
                        <span className='truncate text-[15px] text-ac-mute'>
                          {c.label}
                        </span>
                      </span>
                      <AcIcon
                        name='external'
                        className='size-4 text-ac-mute opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100'
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {profile?.location && (
          <p className='mx-1 mt-3 flex items-center gap-2 border-t-2 border-dashed border-ac-rule pt-3 text-[15px] text-ac-mute'>
            <AcIcon name='pin' className='size-4' />
            {profile.location}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
