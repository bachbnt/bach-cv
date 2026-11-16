/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award, CalendarDays, ExternalLink, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { certificateLayout } from '@/skins/phone/blocks/certificate-layout';
import { phButtonVariants } from '@/skins/phone/ui/ph-button';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/** The faces of the passes of the Wallet, spelled out so the build finds the classes; all dark enough for white text (see `phone-contrast`). */
const FACES = [
  'from-ph-tile-resume-b to-ph-tile-about-b',
  'from-ph-tile-home-b to-ph-tile-resume-b',
  'from-ph-tile-about-b to-ph-tile-payment-b',
];

/**
 * One certificate as a pass of the Wallet: a coloured face with who issued it, the name and the date, then the picture (it opens the viewer),
 * what it covers and Open PDF. `wide` puts the picture beside the face on a tablet. `skills` are the skills of the certificate, already looked up; `tone` picks the face.
 */
export function CertificateCard({
  certificate,
  skills,
  latest,
  wide,
  tone,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  skills: Doc<'skills'>[];
  latest: boolean;
  wide: boolean;
  tone: number;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl } = certificate;
  // the picture is what the second half is for: without one the pass is a plain card
  const split = wide && !!image;
  const layout = certificateLayout({ wide, split });

  return (
    <article
      data-testid='certificate'
      aria-label={name}
      className={cn(layout.card, 'bg-ph-sheet-2')}
    >
      <div
        className={cn(
          'relative flex flex-col gap-5 overflow-hidden bg-linear-to-br p-5 text-ph-on-tile ring-1 ring-ph-on-tile/20 ring-inset',
          FACES[tone % FACES.length],
          layout.face,
        )}
      >
        {/* the gloss of a card: a light from the corner and a round highlight */}
        <span
          aria-hidden='true'
          className='absolute inset-0 bg-linear-to-br from-ph-on-tile/25 via-transparent to-transparent'
        />
        <span
          aria-hidden='true'
          className='absolute -top-20 -right-14 size-52 rounded-full bg-ph-on-tile/10'
        />
        <div className='relative flex items-start justify-between gap-3'>
          {issuer && (
            <p className='flex min-w-0 items-start gap-2 text-[13px]/[1.35] font-semibold tracking-[0.04em] uppercase'>
              <Award
                aria-hidden='true'
                className='mt-px size-[18px] shrink-0'
              />
              <span className='min-w-0 [overflow-wrap:anywhere]'>{issuer}</span>
            </p>
          )}
          {latest && (
            <PhChip className='ml-auto bg-ph-on-tile text-ph-tile-resume-b'>
              {copy.latest}
            </PhChip>
          )}
        </div>
        <div className='relative flex flex-1 flex-col justify-between gap-2'>
          <h2 className='text-[22px]/[1.2] font-bold [overflow-wrap:anywhere]'>
            {name}
          </h2>
          <p className='flex items-center gap-2 text-[14px]/[1.4] font-medium'>
            <CalendarDays aria-hidden='true' className='size-4 shrink-0' />
            <span>{copy.issued(formatIssued(issuedAt, lang))}</span>
          </p>
        </div>
      </div>
      {image && (
        <div className={cn('relative', layout.picture)}>
          <button
            type='button'
            onClick={onOpen}
            aria-label={copy.viewLabel(name)}
            className='group relative flex h-full w-full cursor-zoom-in items-center justify-center bg-ph-sheet-3 p-4'
          >
            <Image
              src={image}
              alt={copy.imageAlt(name)}
              width={800}
              height={600}
              unoptimized
              // the first card is the first thing on the page: load it at once
              priority={latest}
              className='block aspect-[4/3] h-auto w-full rounded-ph-inner object-contain'
            />
            <span
              aria-hidden='true'
              className='absolute right-6 bottom-6 inline-flex h-8 items-center gap-1.5 rounded-full bg-ph-ink px-3 text-[13px] font-semibold text-ph-sheet shadow-ph-icon transition-[scale] duration-100 group-active:scale-95'
            >
              <ZoomIn className='size-4' strokeWidth={2.2} />
              {copy.enlarge}
            </span>
          </button>
        </div>
      )}
      {(skills.length > 0 || pdfUrl) && (
        <div
          className={cn('flex min-w-0 flex-1 flex-col gap-4 p-5', layout.body)}
        >
          {skills.length > 0 && (
            <ul
              aria-label={copy.skillsLabel}
              className='m-0 flex list-none flex-wrap gap-2 p-0'
            >
              {skills.map((skill) => (
                <li key={skill.id}>
                  <PhChip hue={skillHue(skill.category)}>{skill.name}</PhChip>
                </li>
              ))}
            </ul>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                phButtonVariants({ variant: 'solid' }),
                'mt-auto w-full @min-[600px]:w-fit',
              )}
            >
              {copy.openPdf}
              <ExternalLink aria-hidden='true' className='size-4' />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
