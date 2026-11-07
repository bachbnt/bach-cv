/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpRight, MapPin, X } from 'lucide-react';
import type { CSSProperties, ReactElement } from 'react';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commonCopy } from '@/content/copy/common';
import { useClipboard } from '@/hooks/use-clipboard';
import { CONTACT_GROUPS } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbButton } from '@/skins/moba/ui/mb-button';

/**
 * The Connect menu (spell D): the e-mail with a Copy button and the social links in their three groups, as Standard lists them, in a
 * gold-framed card that opens above the champion bar. `trigger` is the slot that opens it.
 */
export function ConnectPanel({ trigger }: { trigger: ReactElement }) {
  const text = useCopy(commonCopy);
  const { connectOpen, setConnectOpen } = useOverlays();
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const email = contacts.find((c) => c.kind === 'email');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <Popover open={connectOpen} onOpenChange={setConnectOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        side='top'
        align='start'
        sideOffset={14}
        className='mb-card max-h-[min(70dvh,560px)] w-[380px] max-w-[calc(100vw-24px)] gap-0 overflow-y-auto rounded-none p-4 ring-0'
      >
        <div className='mb-3 flex items-center justify-between gap-3'>
          <p className='font-mb-display text-2xl leading-none font-bold text-mb-title'>
            {text.connect.title}
          </p>
          <button
            type='button'
            aria-label={text.connect.button}
            onClick={() => setConnectOpen(false)}
            className='grid size-8 cursor-pointer place-items-center text-mb-mute hover:text-mb-title pointer-coarse:size-11'
          >
            <X aria-hidden='true' className='size-4' />
          </button>
        </div>
        {email && (
          <div className='mb-2 flex items-center gap-3 border border-mb-line bg-mb-well p-2.5'>
            <span className='grid size-9 flex-none place-items-center bg-mb-raised text-mb-gold-ink'>
              <BrandIcon platform='email' className='size-[18px]' />
            </span>
            <div className='flex min-w-0 flex-1 flex-col'>
              <span className='text-[13px] font-bold tracking-[0.1em] text-mb-mute uppercase'>
                {text.connect.email}
              </span>
              <a
                className='truncate text-sm font-semibold text-mb-ink underline underline-offset-[3px]'
                href={email.url}
              >
                {email.label}
              </a>
            </div>
            <MbButton size='sm' onClick={() => copy(email.label)}>
              {copied ? text.connect.copied : text.connect.copy}
            </MbButton>
          </div>
        )}
        {CONTACT_GROUPS.map((group) => {
          const items = social.filter((c) => c.menuGroup === group);
          if (!items.length) return null;
          return (
            <div key={group} className='mt-2.5'>
              <p className='mb-1 text-[11px] font-bold tracking-[0.16em] text-mb-gold-ink uppercase'>
                {text.connect.groups[group]}
              </p>
              <ul className='grid gap-0.5'>
                {items.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target='_blank'
                      rel='noopener'
                      style={{ '--c': brandColor(c.platform) } as CSSProperties}
                      className='group/item flex min-h-12 items-center gap-3 p-1.5 transition-colors hover:bg-mb-raised focus-visible:bg-mb-raised'
                    >
                      <span className='grid size-9 flex-none place-items-center bg-[color-mix(in_srgb,var(--c)_16%,var(--mb-well))] text-[color-mix(in_srgb,var(--c)_60%,var(--mb-ink))] transition-colors group-hover/item:bg-(--c) group-hover/item:text-white group-focus-visible/item:bg-(--c) group-focus-visible/item:text-white'>
                        <BrandIcon
                          platform={c.platform}
                          className='size-[18px]'
                        />
                      </span>
                      <span className='flex min-w-0 flex-1 flex-col'>
                        <span className='text-[14px] font-semibold text-mb-ink'>
                          {brandName(c.platform)}
                        </span>
                        <span className='truncate text-[12.5px] text-mb-mute'>
                          {c.label}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden='true'
                        className='size-4 text-mb-mute opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100'
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {profile?.location && (
          <p className='mt-3 flex items-center gap-2 border-t border-mb-line pt-3 text-[13px] text-mb-mute'>
            <MapPin aria-hidden='true' className='size-4' />
            {profile.location}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
