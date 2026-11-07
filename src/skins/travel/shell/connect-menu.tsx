/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpRight, Check, Copy, MapPin, Share2 } from 'lucide-react';
import Image from 'next/image';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commonCopy } from '@/content/copy/common';
import { travelOverlaysCopy } from '@/content/copy/travel-overlays';
import { useClipboard } from '@/hooks/use-clipboard';
import { CONTACT_GROUPS, localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { TlButton } from '@/skins/travel/ui/tl-button';

/**
 * Connect, a postcard: the same email (with Copy and Copied), the same links by group and the same place as the Standard Connect menu,
 * written as a postcard from the trip. An airmail edge, the owner's photo as the stamp, the address (the email) with its copy button,
 * the links as lines of a list under the heading of their group, and the place as the postmark. A popover built on the shadcn one, so
 * the focus is handled; it opens under the header button.
 */
export function ConnectMenu() {
  const text = useCopy(commonCopy).connect;
  const words = useCopy(travelOverlaysCopy).connect;
  const { lang } = useLang();
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const email = contacts.find((c) => c.kind === 'email');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <TlButton
            variant='ghost'
            aria-label={text.button}
            className='data-popup-open:bg-tl-chip max-md:size-10 max-md:px-0'
          />
        }
      >
        <Share2 aria-hidden='true' />
        <span aria-hidden='true' className='max-lg:hidden'>
          {text.button}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={10}
        className='tl-pop w-[372px] max-w-[calc(100vw-24px)] gap-0 overflow-hidden rounded-3xl border border-tl-line bg-tl-solid p-0 text-tl-ink shadow-tl-pop ring-0'
      >
        <div aria-hidden='true' className='tl-airmail h-2 flex-none' />
        <div className='flex max-h-[min(640px,calc(100dvh-90px))] flex-col overflow-y-auto overscroll-contain p-4'>
          <div className='flex items-start gap-3.5'>
            <div className='min-w-0 flex-1'>
              <p
                aria-hidden='true'
                className='m-0 text-[11px] font-extrabold tracking-[1px] text-tl-coral uppercase'
              >
                {words.kicker}
              </p>
              <p className='m-0 mt-0.5 text-[21px]/[1.2] font-extrabold'>
                {text.title}
              </p>
              <p className='m-0 mt-1 truncate text-[13px] text-tl-muted'>
                {localize(shell, lang).headline}
              </p>
            </div>
            {shell.avatar && (
              <span
                aria-hidden='true'
                className='tl-stamp relative size-[68px] flex-none rotate-3 bg-tl-chip p-1.5'
              >
                <Image
                  src={shell.avatar}
                  alt=''
                  width={56}
                  height={56}
                  unoptimized
                  className='size-full rounded-[3px] object-cover object-[50%_25%]'
                />
              </span>
            )}
          </div>

          {email && (
            <div className='mt-4 flex items-center gap-3 rounded-2xl bg-tl-chip p-3'>
              <span className='grid size-9 flex-none place-items-center rounded-full bg-tl-solid text-tl-coral'>
                <BrandIcon platform='email' className='size-[18px]' />
              </span>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='text-[13px] font-bold text-tl-chip-ink'>
                  {text.email}
                </span>
                <a
                  className='truncate text-[14.5px] font-semibold text-tl-ink underline underline-offset-[3px]'
                  href={email.url}
                >
                  {email.label}
                </a>
              </div>
              <button
                type='button'
                onClick={() => void copy(email.label)}
                className='inline-flex min-h-10 flex-none cursor-pointer items-center gap-1.5 rounded-full bg-tl-solid px-3.5 text-[13px] font-bold text-tl-ink shadow-tl-card transition-transform hover:-translate-y-px active:scale-95 pointer-coarse:min-h-11'
              >
                {copied ? (
                  <Check aria-hidden='true' className='size-4 text-tl-teal' />
                ) : (
                  <Copy aria-hidden='true' className='size-4' />
                )}
                {copied ? text.copied : text.copy}
              </button>
              <span role='status' className='sr-only'>
                {copied ? text.copied : ''}
              </span>
            </div>
          )}

          {CONTACT_GROUPS.map((group) => {
            const items = social.filter((c) => c.menuGroup === group);
            if (!items.length) return null;
            return (
              <div key={group} className='mt-4'>
                <p className='m-0 mb-1 flex items-center gap-2 px-1 text-xs font-extrabold tracking-[0.5px] text-tl-muted uppercase'>
                  <span>{text.groups[group]}</span>
                  <span
                    aria-hidden='true'
                    className='h-px flex-1 border-t border-dashed border-tl-line'
                  />
                </p>
                <ul className='m-0 grid list-none gap-0.5 p-0'>
                  {items.map((c) => (
                    <li key={c.id}>
                      <a
                        href={c.url}
                        target='_blank'
                        rel='noopener'
                        style={
                          {
                            '--c': brandColor(c.platform),
                          } as React.CSSProperties
                        }
                        className='group/item flex min-h-[52px] items-center gap-3 rounded-2xl p-2 text-tl-ink no-underline transition-colors hover:bg-tl-chip focus-visible:bg-tl-chip pointer-coarse:min-h-14'
                      >
                        <span
                          aria-hidden='true'
                          className='grid size-9 flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--c)_14%,var(--tl-solid))] text-[color-mix(in_srgb,var(--c)_72%,var(--tl-ink))]'
                        >
                          <BrandIcon
                            platform={c.platform}
                            className='size-[18px]'
                          />
                        </span>
                        <span className='flex min-w-0 flex-1 flex-col'>
                          <span className='text-[14.5px] font-bold'>
                            {brandName(c.platform)}
                          </span>
                          <span className='truncate text-[13px] text-tl-muted'>
                            {c.label}
                          </span>
                        </span>
                        <ArrowUpRight
                          aria-hidden='true'
                          className='size-4 flex-none text-tl-muted'
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {profile?.location && (
            <p className='m-0 mt-4 flex items-center gap-2 border-t border-dashed border-tl-line pt-3 text-[13px] text-tl-muted'>
              <MapPin
                aria-hidden='true'
                className='size-4 flex-none text-tl-coral'
              />
              {profile.location}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
