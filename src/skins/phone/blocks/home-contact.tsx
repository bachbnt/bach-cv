/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { emailContact, phoneContact } from '@/lib/derive/contacts';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { PhButton } from '@/skins/phone/ui/ph-button';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** The closing of Standard's Home: the address to write to and where I am, and the card that sends to BB Bot (off with the `chat` switch). */
export function HomeContact() {
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
    <HomeGlass as='section' id='contact' aria-labelledby='ph-contact-h'>
      <HomeCardHead id='ph-contact-h' title={copy.contact.title} />
      <PhDataState
        query={contactsQuery}
        count={contacts.length}
        empty='contact'
        subject='contact'
        level={3}
        skeleton={
          <div aria-hidden='true'>
            <PhSkeletonLine line='h-[28.6px]' className='w-52' />
            <div className='mt-3'>
              <PhSkeletonLine line='h-6' className='w-44' />
              <PhSkeletonLine line='h-6' className='w-36' />
            </div>
          </div>
        }
      >
        {email && (
          <a
            href={email.url}
            className='relative inline-block text-[22px]/[1.3] font-bold tracking-[-0.01em] text-ph-accent-ink underline decoration-2 underline-offset-4 [overflow-wrap:anywhere] after:absolute after:-inset-y-2 after:inset-x-0 after:content-[""]'
          >
            {email.label}
          </a>
        )}
        <p className='mt-3 text-[15px]/[1.6] text-ph-mute'>
          {profile?.location}
          {phone && (
            <>
              <br />
              {phone.label}
            </>
          )}
        </p>
      </PhDataState>
      {live.features.chat && (
        <div className='mt-4 rounded-ph-inner bg-ph-sheet-2 p-4'>
          <h3 className='text-[16px]/[1.35] font-semibold'>
            {chat.askCard.title}
          </h3>
          <p className='mt-1 text-[15px]/[1.55] text-ph-mute'>
            {chat.askCard.body}
          </p>
          <PhButton
            variant='solid'
            className='mt-3.5'
            aria-haspopup='dialog'
            onClick={openChat}
          >
            <MessageCircle aria-hidden='true' className='size-[18px]' />
            {chat.chatButton}
          </PhButton>
        </div>
      )}
    </HomeGlass>
  );
}
