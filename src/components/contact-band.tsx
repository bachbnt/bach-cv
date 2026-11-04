/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { AskBotButton } from '@/components/chat/ask-bot-button';
import { chatCopy } from '@/content/copy/chat';
import { useLive } from '@/hooks/use-live';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';

/** The dark closing band: the address to write to and where I am. */
export function ContactBand() {
  const { data: contacts = [] } = useContentQuery('contacts');
  const { data: profile } = useProfileQuery();
  const live = useLive();
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');

  return (
    <section
      id='contact'
      aria-labelledby='contact-h'
      className='bg-night py-24 text-white'
    >
      <div className='mx-auto flex w-full max-w-[1200px] flex-wrap items-end justify-between gap-12 px-5 min-[721px]:px-12'>
        <div className='min-w-0 flex-[1_1_520px]'>
          <h2
            id='contact-h'
            className='max-w-[560px] text-[30px] leading-[1.1] text-white min-[721px]:text-[40px]'
          >
            {copy.contact.title}
          </h2>
          {email && (
            <a
              href={email.url}
              className='mt-6 inline-block font-heading text-2xl font-bold tracking-[-0.02em] break-all text-white underline decoration-[#f28b7a] decoration-[3px] underline-offset-8 hover:text-[#f5a99b] min-[401px]:text-[32px]'
            >
              {email.label}
            </a>
          )}
          <p className='mt-6 leading-[1.7] text-[#b4bac6]'>
            {profile?.location}
            {phone && (
              <>
                <br />
                {phone.label}
              </>
            )}
          </p>
        </div>
        {live.features.chat && (
          <div className='flex flex-[0_1_340px] flex-col gap-4 rounded-2xl bg-white p-7 text-foreground'>
            <h3 className='text-[22px]'>{chat.askCard.title}</h3>
            <p className='leading-normal text-muted-foreground'>
              {chat.askCard.body}
            </p>
            <AskBotButton
              text='chat'
              variant='default'
              className='self-start'
            />
          </div>
        )}
      </div>
    </section>
  );
}
