/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phonePayCopy } from '@/content/copy/phone-pay';
import { fill } from '@/lib/chat/fill';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ServiceIcon } from '@/skins/phone/blocks/service-icon';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** The grid of the rows of the list: one column, two on a tablet (add `HINGE_PANES` for an open device). */
export const SERVICE_GRID =
  'm-0 grid list-none gap-3 p-0 @min-[900px]:grid-cols-2 @min-[900px]:gap-4';
/** A row: the tile, the text, and Discuss under the text on a phone or at the end of the row from 600 px. */
export const SERVICE_ROW =
  'grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 rounded-ph-panel bg-ph-sheet-2 p-4 shadow-ph-card @min-[600px]:grid-cols-[auto_minmax(0,1fr)_auto] @min-[600px]:items-center';
/** The last of an odd number of rows spans both columns of a tablet. */
export const SERVICE_WIDE = '@min-[900px]:col-span-2';

/**
 * One service as a row of the Services app, like the list of an app store: a large tile, the name and the description and, when the contact
 * form is on, Discuss, which starts the message on this topic (under the text on a phone, at the end of the row from a tablet). It is the last
 * of an odd number of rows, so in two columns it may span both (`wide`).
 */
export function ServiceCard({
  service,
  discussable,
  wide,
  onDiscuss,
}: {
  service: Doc<'services'>;
  /** whether the contact form is on: with it off there is nothing to discuss in */
  discussable: boolean;
  wide: boolean;
  onDiscuss: () => void;
}) {
  const own = useCopy(phonePayCopy).services;
  return (
    <li className={cn('flex', wide && SERVICE_WIDE)}>
      <article className={SERVICE_ROW}>
        <ServiceIcon art={service.art} />
        <div className='flex min-w-0 flex-col gap-1'>
          <h2 className='text-[18px]/[1.25] font-bold [overflow-wrap:anywhere]'>
            {service.name}
          </h2>
          <p className='text-[15px]/[1.5] text-ph-mute'>
            {service.description}
          </p>
        </div>
        {discussable && (
          <PhButton
            variant='tonal'
            aria-label={fill(own.discussLabel, { name: service.name })}
            onClick={onDiscuss}
            className='col-start-2 w-fit bg-ph-accent/15 text-ph-accent-ink @min-[600px]:col-start-3'
          >
            {own.discuss}
          </PhButton>
        )}
      </article>
    </li>
  );
}
