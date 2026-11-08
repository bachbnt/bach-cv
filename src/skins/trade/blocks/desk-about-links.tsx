/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import { commonCopy } from '@/content/copy/common';
import { homeCopy } from '@/content/copy/home';
import { useClipboard } from '@/hooks/use-clipboard';
import { CONTACT_GROUPS } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvCopyIcon } from '@/skins/trade/ui/tv-copy-icon';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

const ROW =
  'group/row flex min-h-10 items-center gap-2.5 rounded px-2 py-1.5 transition-colors duration-100 hover:bg-tv-hover focus-visible:bg-tv-hover active:bg-tv-hover pointer-coarse:min-h-11';

/**
 * The links of the symbol page: the email with a Copy action, the phone and the place, then the Professional, Messaging and Social links, the
 * same data and groups as the Standard Connect menu. The section is the `#contact` anchor of the page.
 */
export function DeskAboutLinks() {
  const title = useCopy(homeCopy).contact.title;
  const connect = useCopy(commonCopy).connect;
  const query = useContentQuery('contacts');
  const contacts = query.data ?? [];
  const { data: profile } = useProfileQuery();
  const { copied, copy } = useClipboard();
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <DeskSection id='tv-links' anchor='contact' title={title}>
      <TvDataState
        query={query}
        count={contacts.length}
        empty='contact'
        subject='contact'
        level={3}
        skeleton={
          <div className='grid gap-2'>
            <TvSkeleton className='h-10' />
            <TvSkeleton className='h-10' />
            <TvSkeleton className='h-10' />
          </div>
        }
      >
        {email && (
          <div className='mb-1 flex items-center gap-2.5 rounded border border-tv-line bg-tv-bg p-2'>
            <BrandIcon platform='email' className='size-4 flex-none' />
            <div className='flex min-w-0 flex-1 flex-col'>
              <span className='text-[11px] text-tv-mute'>{connect.email}</span>
              <a
                href={email.url}
                data-slot='tv-link'
                className='truncate text-[13px] font-semibold text-tv-accent-ink underline underline-offset-[3px] pointer-coarse:py-3.5'
              >
                {email.label}
              </a>
            </div>
            <TvButton variant='outline' onClick={() => void copy(email.label)}>
              <TvCopyIcon
                copied={copied}
                className={copied ? 'text-tv-up-ink' : undefined}
              />
              {copied ? connect.copied : connect.copy}
            </TvButton>
          </div>
        )}
        {phone && (
          <a href={phone.url} className={ROW}>
            <BrandIcon platform='phone' className='size-4 flex-none' />
            <span className='text-[13px] font-medium tabular-nums'>
              {phone.label}
            </span>
          </a>
        )}
        {profile?.location && (
          <p className='flex min-h-10 items-center gap-2.5 px-2 py-1.5 text-[13px] text-tv-mute'>
            <MapPin aria-hidden='true' className='size-4 flex-none' />
            {profile.location}
          </p>
        )}
        {CONTACT_GROUPS.map((group) => {
          const items = social.filter((c) => c.menuGroup === group);
          if (!items.length) return null;
          return (
            <div key={group} className='mt-2'>
              <h3 className='mx-2 mb-1 text-[11px] font-bold tracking-wide text-tv-mute uppercase'>
                {connect.groups[group]}
              </h3>
              <ul className='m-0 grid list-none gap-0.5 p-0'>
                {items.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ color: brandColor(c.platform) }}
                      className={ROW}
                    >
                      <BrandIcon
                        platform={c.platform}
                        className='size-4 flex-none'
                      />
                      <span className='flex min-w-0 flex-1 flex-col text-tv-ink'>
                        <span className='text-[13px] font-semibold'>
                          {brandName(c.platform)}
                        </span>
                        <span className='truncate text-xs text-tv-mute'>
                          {c.label}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden='true'
                        className='size-3.5 text-tv-mute opacity-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100'
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </TvDataState>
    </DeskSection>
  );
}
