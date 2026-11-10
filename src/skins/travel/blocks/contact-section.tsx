/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { emailContact, phoneContact } from '@/lib/derive/contacts';
import { MapPin } from 'lucide-react';
import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { useChat } from '@/components/chat/chat-provider';
import { TlButton } from '@/skins/travel/ui/tl-button';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

/**
 * The contact band of Standard (`ContactBand`): the question, the email, where I am and the phone, and the BB Bot card when the chat is
 * switched on. It ends Home and About, as the band ends both pages in Standard; the email is the booking desk's address.
 */
export function ContactSection() {
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  const contactsQuery = useContentQuery('contacts');
  const contacts = contactsQuery.data ?? [];
  const { data: profile } = useProfileQuery();
  const email = emailContact(contacts);
  const phone = phoneContact(contacts);
  return (
    <section
      id='contact'
      aria-labelledby='tl-contact'
      className='rounded-2xl bg-[linear-gradient(135deg,var(--tl-cover-1,var(--tl-sky-1)),var(--tl-sea-3))] p-4 text-white'
    >
      <h2 id='tl-contact' className='m-0 text-[17px] font-extrabold'>
        {copy.contact.title}
      </h2>
      <TlDataState
        query={contactsQuery}
        count={contacts.length}
        empty='contact'
        subject='contact'
        level={3}
        className='mt-3 text-tl-ink'
        skeleton={<TlSkeleton className='h-16' />}
      >
        {email && (
          <a
            href={email.url}
            className='mt-2 block text-lg font-extrabold break-all underline decoration-2 underline-offset-4'
          >
            {email.label}
          </a>
        )}
        <p className='m-0 mt-2 flex flex-wrap items-center gap-x-3 text-[13px] opacity-90'>
          {profile?.location && (
            <span className='inline-flex items-center gap-1'>
              <MapPin aria-hidden='true' className='size-3.5' />
              {profile.location}
            </span>
          )}
          {phone && <span>{phone.label}</span>}
        </p>
      </TlDataState>
      {live.features.chat && (
        <div className='mt-3 rounded-xl bg-tl-solid p-3 text-tl-ink'>
          <h3 className='m-0 text-[14.5px] font-bold'>{chat.askCard.title}</h3>
          <p className='m-0 mb-2 text-[13px] text-tl-muted'>
            {chat.askCard.body}
          </p>
          <TlButton variant='solid' size='sm' onClick={openChat}>
            {chat.chatButton}
          </TlButton>
        </div>
      )}
    </section>
  );
}
