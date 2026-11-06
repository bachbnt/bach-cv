/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { chatCopy } from '@/content/copy/chat';
import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { SkillIcon } from '@/components/skills/skill-icon';
import { CodeWindow } from '@/skins/dev/blocks/code-window';
import { DevAskBotButton } from '@/skins/dev/ui/dev-ask-bot-button';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevButtonGroup } from '@/skins/dev/ui/dev-button';

/** The closing band: the address to write to, where I am, and the way to the chat. */
export function DevContactBand() {
  const contactsQuery = useContentQuery('contacts');
  const contacts = contactsQuery.data ?? [];
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
      className='mt-16 grid grid-cols-[1.3fr_1fr] items-center gap-6 rounded-[8px] border border-line-2 bg-chrome p-[26px] font-code max-[900px]:grid-cols-1'
      data-reveal
    >
      <div>
        <h2 id='contact-h' className='mb-3 text-[29px] leading-[1.15]'>
          {copy.contact.title}
        </h2>
        <DevDataState
          query={contactsQuery}
          count={contacts.length}
          empty='contact'
          subject='contact'
          level={3}
          skeleton={
            <>
              <DevSkeleton className='h-8 w-[280px] max-w-full' />
              <DevSkeleton className='mt-3 h-[18px] w-[200px] max-w-full' />
            </>
          }
        >
          {email && (
            <a
              // `dev-` slot: the plain-link default of dev.css leaves it its own colour
              data-slot='dev-mail'
              className='border-b-2 border-b-k3 text-[20px] text-signal [overflow-wrap:anywhere]'
              href={email.url}
            >
              {email.label}
            </a>
          )}
          <small className='mt-2.5 block font-sans text-mute'>
            {[profile?.location, phone?.label].filter(Boolean).join(' · ')}
          </small>
        </DevDataState>
        {live.features.chat && (
          <DevButtonGroup>
            <DevAskBotButton text='chat' />
          </DevButtonGroup>
        )}
      </div>
      {live.features.chat && (
        <CodeWindow
          icon={
            <SkillIcon
              icon='vuedotjs'
              name='Vue'
              className='size-4 flex-none text-[#41b883]'
            />
          }
          file='BbBot.vue'
          language='Vue'
          lines={[
            <>
              &lt;<span className='dv-tg'>template</span>&gt;
            </>,
            <>
              {'  '}&lt;<span className='dv-tg'>Chat</span>{' '}
              <span className='dv-at'>@ask</span>=
              <span className='dv-str'>&quot;askBbBot&quot;</span> /&gt;
            </>,
            <>
              &lt;/<span className='dv-tg'>template</span>&gt;
            </>,
            <>
              &lt;<span className='dv-tg'>script</span>{' '}
              <span className='dv-at'>setup</span>&gt;
            </>,
            <>
              <span className='dv-cmt'>{`// ${chat.askCard.title}`}</span>
            </>,
            <>
              <span className='dv-cmt'>{`// ${chat.askCard.body}`}</span>
            </>,
            <>
              &lt;/<span className='dv-tg'>script</span>&gt;
            </>,
          ]}
        />
      )}
    </section>
  );
}
