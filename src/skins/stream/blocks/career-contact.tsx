/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { StreamAskBotButton } from '@/skins/stream/ui/stream-ask-bot-button';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * The close of Home: the question of Standard's contact band, the email to write to, the phone and where I am, and the Ask BB Bot
 * card (gone when the chat switch is off). The contact lines have the loading, empty and error states of every data block.
 */
export function CareerContact() {
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const contactsQuery = useContentQuery('contacts');
  const contacts = contactsQuery.data ?? [];
  const { data: profile } = useProfileQuery();
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');

  return (
    <section
      id='contact'
      aria-labelledby='contact-h'
      className='mx-3 mt-10 mb-4 flex flex-wrap items-start gap-x-10 gap-y-6 rounded-2xl bg-sm-surface p-5 min-[701px]:mx-0 min-[701px]:p-8'
    >
      <div className='min-w-0 flex-[1_1_360px]'>
        <StreamHeading id='contact-h' className='mb-4'>
          {copy.contact.title}
        </StreamHeading>
        <StreamDataState
          query={contactsQuery}
          count={contacts.length}
          empty='contact'
          subject='contact'
          level={3}
          skeleton={
            <div className='flex flex-col gap-3'>
              <StreamSkeleton className='h-8 w-72 max-w-full rounded-md' />
              <StreamSkeleton className='h-5 w-44 rounded-md' />
              <StreamSkeleton className='h-5 w-36 rounded-md' />
            </div>
          }
        >
          <ul className='m-0 flex list-none flex-col gap-3 p-0'>
            {email && (
              <li className='flex items-center gap-3'>
                <Mail
                  aria-hidden='true'
                  className='size-5 flex-none text-sm-mute'
                />
                <a
                  href={email.url}
                  className='text-xl/[1.3] font-bold break-all text-sm-blue hover:underline min-[701px]:text-2xl'
                >
                  {email.label}
                </a>
              </li>
            )}
            {phone && (
              <li className='flex items-center gap-3'>
                <Phone
                  aria-hidden='true'
                  className='size-5 flex-none text-sm-mute'
                />
                <span>{phone.label}</span>
              </li>
            )}
            {profile?.location && (
              <li className='flex items-center gap-3'>
                <MapPin
                  aria-hidden='true'
                  className='size-5 flex-none text-sm-mute'
                />
                <span>{profile.location}</span>
              </li>
            )}
          </ul>
        </StreamDataState>
      </div>
      {live.features.chat && (
        <div className='flex flex-[0_1_340px] flex-col items-start gap-2 rounded-xl bg-sm-hover p-5'>
          <h3 className='text-base font-bold'>{chat.askCard.title}</h3>
          <p className='text-sm text-sm-mute'>{chat.askCard.body}</p>
          <StreamAskBotButton text='chat' variant='blue' className='mt-2' />
        </div>
      )}
    </section>
  );
}
