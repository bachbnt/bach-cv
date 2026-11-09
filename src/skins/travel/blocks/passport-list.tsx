/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import { travelPostcardsCopy } from '@/content/copy/travel-postcards';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { LazyLightbox } from '@/skins/travel/blocks/lazy-dialogs';
import {
  PassportStamp,
  type StampSkill,
} from '@/skins/travel/blocks/passport-stamp';
import { tlButton } from '@/skins/travel/ui/tl-button';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

function StampsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4'>
      {[0, 1, 2].map((i) => (
        <div key={i} className='flex items-center gap-3.5'>
          <TlSkeleton className='size-[88px] flex-none rounded-full' />
          <div className='grid grid-cols-1 flex-1 gap-2'>
            <TlSkeleton className='h-4 w-4/5' />
            <TlSkeleton className='h-3 w-1/2' />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The stamps of the passport, the latest first (the query already orders them), with the data states of every block, and the
 * Standard picture viewer that steps through all the certificates.
 */
export function PassportList() {
  const copy = useCopy(certificatesCopy);
  const words = useCopy(travelPostcardsCopy).passport;
  const { lang } = useLang();
  const query = useContentQuery('certificates');
  const { data: skillList = [] } = useContentQuery('skills');
  const [index, setIndex] = useState<number | null>(null);
  const items = query.data ?? [];

  const skillById = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const skillsOf = (ids: string[]): StampSkill[] =>
    ids.flatMap((id) => {
      const s = skillById.get(id);
      return s ? [{ id, name: s.name, category: s.category }] : [];
    });

  const current = index === null ? null : items[index];
  const step = (by: number) =>
    setIndex((i) => ((i ?? 0) + by + items.length) % items.length);

  return (
    <div className='px-5 pt-4 pb-5'>
      <TlDataState
        query={query}
        count={items.length}
        empty='certificates'
        subject='certificates'
        skeleton={<StampsSkeleton />}
      >
        <ul
          aria-label={words.stampsLabel}
          className='tl-ruled m-0 -mx-5 grid grid-cols-1 list-none gap-5 px-5 py-2 pb-3'
        >
          {items.map((certificate, i) => (
            <li key={certificate.id}>
              <PassportStamp
                certificate={certificate}
                skills={skillsOf(certificate.skills)}
                index={i}
                latest={i === 0}
                onOpen={() => setIndex(i)}
              />
            </li>
          ))}
        </ul>
      </TlDataState>
      {current && (
        <LazyLightbox
          open
          onOpenChange={(open) => !open && setIndex(null)}
          title={current.name}
          image={{ src: current.image, alt: copy.imageAlt(current.name) }}
          meta={
            <p>
              {copy.meta(current.issuer, formatIssued(current.issuedAt, lang))}
            </p>
          }
          closeLabel={copy.closePreview}
          actions={
            current.pdfUrl ? (
              <a
                href={current.pdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={tlButton({ variant: 'solid', size: 'sm' })}
              >
                <ExternalLink aria-hidden='true' />
                {copy.openPdfDialog}
              </a>
            ) : null
          }
          nav={
            items.length > 1
              ? {
                  onPrev: () => step(-1),
                  onNext: () => step(1),
                  prevLabel: copy.previousCertificate,
                  nextLabel: copy.nextCertificate,
                  counter: copy.counter((index ?? 0) + 1, items.length),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
