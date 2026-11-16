/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DialogDescription } from '@/components/ui/dialog';
import { commonCopy } from '@/content/copy/common';
import { phoneOverlaysCopy } from '@/content/copy/phone-overlays';
import { useLive } from '@/hooks/use-live';
import {
  emailContact,
  socialByGroup,
  socialContacts,
} from '@/lib/derive/contacts';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhConnectCard } from '@/skins/phone/shell/ph-connect-card';
import { PhConnectLink } from '@/skins/phone/shell/ph-connect-link';
import { PhConnectEmail } from '@/skins/phone/shell/ph-connect-email';
import { PhOverlayBar } from '@/skins/phone/shell/ph-overlay-bar';
import { PhOverlayFrame } from '@/skins/phone/shell/ph-overlay-frame';

/**
 * Connect as a contact card in a sheet: who I am and where (the large initials tile, the name, the headline, the place), then the actions
 * as rows: the email (with a button that copies it) and the social links by group. The same links as Standard's menu, and nothing is
 * rendered when the `connectMenu` switch is off.
 */
export function PhConnectSheet() {
  const live = useLive();
  const { connectOpen, closeConnect } = usePhOverlays();
  const text = useCopy(commonCopy);
  const words = useCopy(phoneOverlaysCopy).connect;
  const { data: contacts = [] } = useContentQuery('contacts');

  if (!live.features.connectMenu) return null;
  const email = emailContact(contacts);
  const groups = socialByGroup(socialContacts(contacts));

  return (
    <PhOverlayFrame
      open={connectOpen}
      onOpenChange={(open) => {
        if (!open) closeConnect();
      }}
      kind='sheet'
      data-slot='ph-connect-sheet'
      className='@min-[900px]:max-w-[520px]'
    >
      <PhOverlayBar title={text.connect.title} closeLabel={words.close} />
      <DialogDescription className='sr-only'>
        {words.description}
      </DialogDescription>
      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]'>
        <PhConnectCard />
        {email && (
          <ul className='m-0 list-none overflow-hidden rounded-ph-panel bg-ph-sheet-2 p-0'>
            <li>
              <PhConnectEmail contact={email} />
            </li>
          </ul>
        )}
        {groups.map(({ group, items }) => (
          <section key={group} className='mt-4'>
            <h3 className='mb-1.5 px-2 text-[13px] font-semibold tracking-[0.06em] text-ph-mute uppercase'>
              {text.connect.groups[group]}
            </h3>
            <ul className='m-0 list-none overflow-hidden rounded-ph-panel bg-ph-sheet-2 p-0'>
              {items.map((c) => (
                <li
                  key={c.id}
                  className='border-b border-ph-line last:border-b-0'
                >
                  <PhConnectLink contact={c} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PhOverlayFrame>
  );
}
