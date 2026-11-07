/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check, Copy } from 'lucide-react';
import type { CSSProperties } from 'react';
import { BrandIcon, brandColor, brandName } from '@/components/brand-icon';
import { commonCopy } from '@/content/copy/common';
import { streamChannelCopy } from '@/content/copy/stream-channel';
import { useClipboard } from '@/hooks/use-clipboard';
import { CONTACT_GROUPS } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { StreamButton } from '@/skins/stream/ui/stream-button';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

const row =
  'flex min-h-12 items-center gap-3 rounded-lg py-1.5 transition-colors pointer-coarse:min-h-14';
const badge =
  'grid size-10 flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--c,var(--sm-ink))_14%,var(--sm-hover))] text-[color-mix(in_srgb,var(--c,var(--sm-ink))_75%,var(--sm-ink))] [&_svg]:size-5';

/**
 * The Links of the About panel: the same ways to reach me as the Connect menu (the email with Copy, then the profiles by group) and
 * the phone of Standard's contact band. Each is a row with its mark, its name and what it opens, as the links of a channel are.
 */
export function ChannelLinks() {
  const contactsQuery = useContentQuery('contacts');
  const contacts = contactsQuery.data ?? [];
  const { connect } = useCopy(commonCopy);
  const { about } = useCopy(streamChannelCopy);
  const { copied, copy } = useClipboard();
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <section aria-labelledby='links-h' className='border-t border-sm-line pt-6'>
      <h2 id='links-h' className='mb-3 text-lg/[1.3] font-bold'>
        {about.links}
      </h2>
      <StreamDataState
        query={contactsQuery}
        count={contacts.length}
        empty='contact'
        subject='contact'
        level={3}
        skeleton={
          <div className='flex flex-col gap-3'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='flex items-center gap-3'>
                <StreamSkeleton className='size-10 rounded-full' />
                <StreamSkeleton className='h-4 w-48 max-w-full rounded-md' />
              </div>
            ))}
          </div>
        }
      >
        <ul className='m-0 grid list-none gap-x-6 p-0 min-[701px]:grid-cols-2'>
          {email && (
            <li className={row}>
              <span className={badge}>
                <BrandIcon platform='email' />
              </span>
              <span className='flex min-w-0 flex-col'>
                <span className='text-sm font-medium'>{connect.email}</span>
                <a
                  href={email.url}
                  className='truncate text-sm text-sm-blue hover:underline'
                >
                  {email.label}
                </a>
              </span>
              <StreamButton
                aria-label={`${copied ? connect.copied : connect.copy}: ${email.label}`}
                onClick={() => void copy(email.label)}
              >
                {copied ? (
                  <Check aria-hidden='true' />
                ) : (
                  <Copy aria-hidden='true' />
                )}
                {copied ? connect.copied : connect.copy}
              </StreamButton>
            </li>
          )}
          {phone && (
            <li className={row}>
              <span className={badge}>
                <BrandIcon platform='phone' />
              </span>
              <a
                href={phone.url}
                className='min-w-0 truncate text-sm text-sm-blue hover:underline'
              >
                {phone.label}
              </a>
            </li>
          )}
        </ul>
        {CONTACT_GROUPS.map((group) => {
          const items = social.filter((c) => c.menuGroup === group);
          if (!items.length) return null;
          return (
            <div key={group} className='mt-4'>
              <h3 className='mb-1 text-xs font-medium tracking-wide text-sm-mute uppercase'>
                {connect.groups[group]}
              </h3>
              <ul className='m-0 grid list-none gap-x-6 p-0 min-[701px]:grid-cols-2'>
                {items.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target='_blank'
                      rel='noopener'
                      style={{ '--c': brandColor(c.platform) } as CSSProperties}
                      className={`${row} -mx-2 px-2 hover:bg-sm-hover`}
                    >
                      <span className={badge}>
                        <BrandIcon platform={c.platform} />
                      </span>
                      <span className='flex min-w-0 flex-col'>
                        <span className='text-sm font-medium'>
                          {brandName(c.platform)}
                        </span>
                        <span className='truncate text-sm text-sm-blue'>
                          {c.label}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </StreamDataState>
    </section>
  );
}
