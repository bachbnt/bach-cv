/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award, CalendarDays, ExternalLink, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import { mobaCertificatesCopy } from '@/content/copy/moba-certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { mbButton } from '@/skins/moba/ui/mb-button';
import { MbChip } from '@/skins/moba/ui/mb-chip';

/**
 * The details of the chosen certificate, as the card of an item: the picture (it opens the viewer), the name, the issuer, the date, the
 * skills it covers and its links (the PDF, and the credential page when there is one).
 */
export function CertificateDetail({
  certificate,
  skills,
  latest,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  skills: Doc<'skills'>[];
  /** the latest issued one carries the Latest tag, as on Standard */
  latest: boolean;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const mb = useCopy(mobaCertificatesCopy);
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl, credentialUrl } = certificate;
  return (
    <article
      data-testid='certificate'
      aria-labelledby='mb-cert-detail-h'
      className='mb-plaque mb-swap grid gap-5 p-4 @[620px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @[620px]:gap-7 @[620px]:p-5'
    >
      {image && (
        <button
          type='button'
          aria-label={copy.viewLabel(name)}
          onClick={onOpen}
          className='group/media relative block aspect-[4/3] w-full cursor-zoom-in self-start overflow-hidden bg-mb-well'
        >
          <Image
            src={image}
            alt={copy.imageAlt(name)}
            fill
            sizes='(min-width: 680px) 380px, 90vw'
            unoptimized
            className='object-contain p-2'
          />
          <span
            aria-hidden='true'
            className='mb-chip absolute right-2 bottom-2 inline-flex items-center gap-1.5 bg-mb-void/90 px-3 py-2 text-[12px] leading-none font-bold text-mb-gold-ink transition-transform group-hover/media:-translate-y-0.5 motion-reduce:transition-none'
          >
            <ZoomIn className='size-3.5' />
            {copy.enlarge}
          </span>
        </button>
      )}
      <div className='flex min-w-0 flex-col gap-3.5'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-[10px] leading-none font-bold tracking-[0.22em] text-mb-teal-ink uppercase'>
            {mb.kickers.item}
          </p>
          {latest && <MbChip tone='teal'>{copy.latest}</MbChip>}
        </div>
        <h2
          id='mb-cert-detail-h'
          className='text-[26px] leading-[1.15] text-mb-gold-ink'
        >
          {name}
        </h2>
        <p className='flex items-center gap-2 text-[14.5px] text-mb-mute'>
          <CalendarDays
            aria-hidden='true'
            className='size-4 flex-none text-mb-gold-ink'
          />
          {copy.issued(formatIssued(issuedAt, lang))}
        </p>
        {issuer && (
          <MbChip tone='gold' className='self-start text-[13px]'>
            <Award aria-hidden='true' className='size-4' />
            {issuer}
          </MbChip>
        )}
        {skills.length > 0 && (
          <ul
            aria-label={copy.skillsLabel}
            className='m-0 flex list-none flex-wrap gap-1.5 p-0'
          >
            {skills.map((skill) => (
              <li key={skill.id}>
                <MbChip tone={skill.category}>{skill.name}</MbChip>
              </li>
            ))}
          </ul>
        )}
        {(pdfUrl || credentialUrl) && (
          <div className='mt-auto flex flex-wrap gap-2 pt-2'>
            {pdfUrl && (
              <a
                href={pdfUrl}
                data-slot='mb-button'
                target='_blank'
                rel='noopener noreferrer'
                className={mbButton({ variant: 'gold', size: 'sm' })}
              >
                {copy.openPdf}
                <ExternalLink aria-hidden='true' className='size-3.5' />
              </a>
            )}
            {credentialUrl && (
              <a
                href={credentialUrl}
                data-slot='mb-button'
                target='_blank'
                rel='noopener noreferrer'
                className={mbButton({ variant: 'ghost', size: 'sm' })}
              >
                {mb.credential}
                <ExternalLink aria-hidden='true' className='size-3.5' />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
