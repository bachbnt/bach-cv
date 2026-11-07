/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award } from 'lucide-react';
import Image from 'next/image';
import { mobaCertificatesCopy } from '@/content/copy/moba-certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The DOM id of a slot, so that a visit from the champion bar can scroll to it. */
export const slotId = (id: string) => `mb-cert-slot-${id}`;

/**
 * The inventory: one slot for each certificate (its picture in a gold bevel and its name under it). A slot is a button that chooses the
 * certificate whose details are shown below; the chosen one is lit teal. The button is the focus target, so its ring is never cut by the
 * cut corners of the slot inside it.
 */
export function CertificateSlots({
  items,
  selectedId,
  pingId,
  onSelect,
}: {
  items: Doc<'certificates'>[];
  selectedId: string;
  /** the slot that was asked for from the champion bar: it flashes once */
  pingId: string | null;
  onSelect: (id: string) => void;
}) {
  const mb = useCopy(mobaCertificatesCopy);
  return (
    <ul
      role='group'
      aria-label={mb.slots}
      className='m-0 grid list-none grid-cols-2 gap-3 p-0 @[440px]:grid-cols-3 @[680px]:grid-cols-4'
    >
      {items.map((certificate) => {
        const selected = certificate.id === selectedId;
        return (
          <li key={certificate.id}>
            <button
              type='button'
              id={slotId(certificate.id)}
              aria-pressed={selected}
              aria-controls='mb-cert-detail'
              onClick={() => onSelect(certificate.id)}
              className={cn(
                'group/slot relative flex w-full cursor-pointer flex-col gap-2 p-1.5 text-left',
                pingId === certificate.id && 'mb-ping',
              )}
            >
              <span
                className='mb-slot block aspect-[4/3] w-full'
                data-tone={selected ? 'teal' : undefined}
              >
                <span className='mb-slot-in'>
                  {certificate.image ? (
                    <Image
                      src={certificate.image}
                      alt=''
                      fill
                      sizes='180px'
                      unoptimized
                      className='bg-white object-cover object-top'
                    />
                  ) : (
                    <Award
                      aria-hidden='true'
                      className='size-8 text-mb-gold-ink'
                    />
                  )}
                </span>
              </span>
              <span
                className={cn(
                  'line-clamp-2 text-[13px] leading-[1.3] font-semibold',
                  selected ? 'text-mb-teal-ink' : 'text-mb-ink',
                )}
              >
                {certificate.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
