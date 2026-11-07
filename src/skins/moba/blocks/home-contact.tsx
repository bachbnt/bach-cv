/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** The closing block: the address to write to, where I am, and the card that sends a visitor to BB Bot (when the chat is on). */
export function HomeContact() {
  const copy = useCopy(homeCopy);
  const chat = useCopy(chatCopy);
  const mb = useCopy(mobaHomeCopy);
  const live = useLive();
  const { openChat } = useChat();
  const query = useContentQuery('contacts');
  const contacts = query.data ?? [];
  const { data: profile } = useProfileQuery();
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');
  return (
    <MbSection
      id='contact'
      kicker={mb.kickers.contact}
      title={copy.contact.title}
      order={5}
      className='pb-10'
    >
      <div className='grid gap-4 min-[900px]:grid-cols-[1fr_300px]'>
        <MbDataState
          query={query}
          count={contacts.length}
          empty='contact'
          subject='contact'
          level={3}
          skeleton={
            <div className='grid gap-2'>
              <MbSkeleton className='h-9 w-[300px] max-w-full' />
              <MbSkeleton className='h-5 w-40' />
            </div>
          }
        >
          <div>
            {email && (
              <a
                href={email.url}
                className='font-mb-display text-[30px] leading-tight font-bold break-all text-mb-title underline decoration-mb-gold decoration-[3px] underline-offset-8 hover:text-mb-gold-ink max-[719px]:text-[24px]'
              >
                {email.label}
              </a>
            )}
            <p className='mt-5 leading-[1.7] text-mb-mute'>
              {profile?.location}
              {phone && (
                <>
                  <br />
                  {phone.label}
                </>
              )}
            </p>
          </div>
        </MbDataState>
        {live.features.chat && (
          <MbCard className='flex flex-col items-start gap-3 p-5'>
            <h3 className='text-[22px] leading-tight text-mb-title'>
              {chat.askCard.title}
            </h3>
            <p className='text-[14.5px] leading-normal text-mb-mute'>
              {chat.askCard.body}
            </p>
            <MbButton variant='gold' onClick={openChat}>
              <MessageCircle aria-hidden='true' className='size-4' />
              {chat.chatButton}
            </MbButton>
          </MbCard>
        )}
      </div>
    </MbSection>
  );
}
