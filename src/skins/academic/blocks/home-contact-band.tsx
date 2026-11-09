/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { HomeAskButton } from '@/skins/academic/blocks/home-ask-button';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcPaper } from '@/skins/academic/ui/ac-paper';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/**
 * The closing of the page, as the correspondence of a paper: the address to write to and where I am, and a sticky note that sends the visitor to the
 * chat. Used by Home and About, as in Standard; the note is not there when the `chat` switch is off.
 */
export function HomeContactBand() {
  const contactsQuery = useContentQuery('contacts');
  const contacts = contactsQuery.data ?? [];
  const { data: profile } = useProfileQuery();
  const live = useLive();
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');

  return (
    <HomeCol className='mt-20'>
      <section
        id='contact'
        aria-labelledby='contact-h'
        className='flex flex-wrap items-start gap-x-10 gap-y-8'
      >
        <div className='min-w-0 flex-[1_1_300px]'>
          <AcHeading id='contact-h'>{copy.contact.title}</AcHeading>
          <AcDataState
            query={contactsQuery}
            count={contacts.length}
            empty='contact'
            subject='contact'
            level={3}
            className='mt-6'
            skeleton={
              <>
                <AcSkeleton className='h-9 w-[320px] max-w-full' />
                <AcSkeleton className='mt-4 h-5 w-48' />
              </>
            }
          >
            {email && (
              <a
                href={email.url}
                className='mt-6 inline-block font-ac-chalk text-[28px]/[1.2] [overflow-wrap:anywhere] text-ac-link underline decoration-ac-accent decoration-[3px] underline-offset-[6px]'
              >
                {email.label}
              </a>
            )}
            <p className='mt-5 mb-0 text-ac-mute'>
              {profile?.location}
              {phone && (
                <>
                  <br />
                  {phone.label}
                </>
              )}
            </p>
          </AcDataState>
        </div>
        {live.features.chat && (
          <AcPaper
            kind='sticky'
            className='flex-[0_1_300px] [text-shadow:none]'
          >
            <h3 className='m-0 font-ac-chalk text-[26px]/[1.15] font-normal'>
              {chat.askCard.title}
            </h3>
            <p className='mt-2 mb-4 text-[0.82em]/[1.4]'>{chat.askCard.body}</p>
            <HomeAskButton text='chat' variant='pen' />
          </AcPaper>
        )}
      </section>
    </HomeCol>
  );
}
