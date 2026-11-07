/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import { mobaCertificatesCopy } from '@/content/copy/moba-certificates';
import { issuedNewestFirst } from '@/lib/derive/recency';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { CertificateDetail } from '@/skins/moba/blocks/certificates-detail';
import {
  CertificateSlots,
  slotId,
} from '@/skins/moba/blocks/certificates-slots';
import { useGame } from '@/skins/moba/shell/game-context';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';
import { mbButton } from '@/skins/moba/ui/mb-button';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** The shape of the page while it loads: a row of slots and the card of an item. */
function BoardSkeleton() {
  return (
    <div className='grid gap-4 px-6 pb-8 max-[719px]:px-4'>
      <div className='grid grid-cols-2 gap-3 min-[480px]:grid-cols-4'>
        {Array.from({ length: 4 }, (_, i) => (
          <MbSkeleton key={i} className='h-[130px]' />
        ))}
      </div>
      <MbSkeleton className='h-[300px]' />
    </div>
  );
}

/**
 * The inventory at the shrine: a slot for each certificate (latest issued first) and the card of the chosen one. A visit from a slot of
 * the champion bar chooses that certificate once and scrolls to it.
 */
export function CertificatesBoard() {
  const copy = useCopy(certificatesCopy);
  const mb = useCopy(mobaCertificatesCopy);
  const { lang } = useLang();
  const query = useContentQuery('certificates');
  const { data: skillList = [] } = useContentQuery('skills');
  const { openViewer } = useOverlays();
  const { focus, clearFocus } = useGame();
  const reduced = useReducedMotion();
  const items = useMemo(
    () => issuedNewestFirst(query.data ?? []),
    [query.data],
  );
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [pingId, setPingId] = useState<string | null>(null);

  // a visit from an item slot of the champion bar: choose that certificate (state is adjusted while rendering, not in an effect)
  const asked = focus?.kind === 'certificate' ? focus.id : null;
  if (asked && items.some((c) => c.id === asked) && chosen !== asked) {
    setChosen(asked);
    setPingId(asked);
  }
  useEffect(() => {
    if (!asked || !items.length) return;
    document.getElementById(slotId(asked))?.scrollIntoView({
      block: 'nearest',
      behavior: reduced ? 'auto' : 'smooth',
    });
    clearFocus();
  }, [asked, items.length, reduced, clearFocus]);

  const selected = items.find((c) => c.id === chosen) ?? items[0];
  const index = selected ? items.indexOf(selected) : 0;

  const openViewerAt = (at: number) =>
    openViewer(
      items.map((c) => ({
        src: c.image,
        title: c.name,
        alt: copy.imageAlt(c.name),
        meta: <p>{copy.meta(c.issuer, formatIssued(c.issuedAt, lang))}</p>,
        actions: c.pdfUrl ? (
          <a
            href={c.pdfUrl}
            data-slot='mb-button'
            target='_blank'
            rel='noopener noreferrer'
            className={mbButton({ variant: 'gold', size: 'sm' })}
          >
            {copy.openPdfDialog}
          </a>
        ) : null,
        labels: {
          close: copy.closePreview,
          previous: copy.previousCertificate,
          next: copy.nextCertificate,
        },
        thumbnailLabel: c.name,
      })),
      at,
    );

  return (
    <MbDataState
      query={query}
      count={items.length}
      empty='certificates'
      subject='certificates'
      skeleton={<BoardSkeleton />}
      className='mx-6 mb-8 max-[719px]:mx-4'
    >
      {selected && (
        <>
          <MbSection
            id='inventory'
            kicker={mb.kickers.inventory}
            title={mb.inventory}
            order={1}
          >
            <div className='@container'>
              <CertificateSlots
                items={items}
                selectedId={selected.id}
                pingId={pingId}
                onSelect={(id) => {
                  setChosen(id);
                  setPingId(null);
                }}
              />
            </div>
          </MbSection>
          <section
            id='mb-cert-detail'
            data-part=''
            aria-live='polite'
            className='mb-section mb-rise px-6 py-7 max-[719px]:px-4'
            style={{ '--i': 2 } as React.CSSProperties}
          >
            <div key={selected.id} className='@container'>
              <CertificateDetail
                certificate={selected}
                skills={selected.skills.flatMap((id) => skills.get(id) ?? [])}
                latest={index === 0}
                onOpen={() => openViewerAt(index)}
              />
            </div>
          </section>
        </>
      )}
    </MbDataState>
  );
}
