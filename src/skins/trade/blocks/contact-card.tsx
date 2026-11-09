/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { TvAskButton } from '@/skins/trade/ui/tv-ask-button';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The closing band of Home: the address to write to, where I am, and the card that points to the chat (About has its own links list). */
export function ContactCard() {
  const query = useContentQuery('contacts');
  const contacts = query.data ?? [];
  const { data: profile } = useProfileQuery();
  const { features } = useLive();
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');

  return (
    <section
      id='contact'
      aria-labelledby='tv-contact-h'
      className='flex flex-wrap items-start gap-x-10 gap-y-5 px-3.5 py-5'
    >
      <div className='min-w-0 flex-[1_1_320px]'>
        <h2
          id='tv-contact-h'
          className='max-w-[520px] text-[15px] leading-snug font-bold'
        >
          {copy.contact.title}
        </h2>
        <TvDataState
          query={query}
          count={contacts.length}
          empty='contact'
          subject='contact'
          level={3}
          className='mt-3'
          skeleton={
            <>
              <TvSkeleton className='h-7 w-[280px] max-w-full' />
              <TvSkeleton className='mt-3 h-4 w-40' />
            </>
          }
        >
          {email && (
            <a
              href={email.url}
              className='inline-block text-lg font-semibold break-all text-tv-accent-ink underline underline-offset-4 pointer-coarse:min-h-11'
            >
              {email.label}
            </a>
          )}
          <p className='mt-2 text-[13px]/[1.7] text-tv-mute'>
            {profile?.location}
            {phone && (
              <>
                <br />
                {phone.label}
              </>
            )}
          </p>
        </TvDataState>
      </div>
      {features.chat && (
        <div className='flex flex-[0_1_320px] flex-col items-start gap-2 rounded border border-tv-line bg-tv-panel p-3.5'>
          <h3 className='text-[13px] font-semibold'>{chat.askCard.title}</h3>
          <p className='text-xs/[1.5] text-tv-mute'>{chat.askCard.body}</p>
          <TvAskButton text='chat' variant='primary' />
        </div>
      )}
    </section>
  );
}
