/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import {
  STOP_OF_CATEGORY,
  stampParts,
  stampTurnClass,
  stopClass,
  stopOfIndex,
} from '@/skins/travel/blocks/postcard-model';
import { tlButton } from '@/skins/travel/ui/tl-button';

export interface StampSkill {
  id: string;
  name: string;
  category: Doc<'skills'>['category'];
}

/** The round rubber stamp: issuer, month and year, in the colour of its stop, turned a little. Decoration: the same words are in the text beside it. */
function RubberStamp({
  certificate,
  index,
  latest,
}: {
  certificate: Doc<'certificates'>;
  index: number;
  latest: boolean;
}) {
  const { lang } = useLang();
  const parts = stampParts(certificate, lang);
  return (
    <span
      aria-hidden='true'
      style={{ animationDelay: `${0.12 + index * 0.18}s` }}
      className={cn(
        latest ? '[--tl-pc:var(--tl-coral)]' : stopClass(stopOfIndex(index)),
        stampTurnClass(index),
        'tl-stamp relative grid size-[88px] flex-none place-items-center bg-[radial-gradient(circle,color-mix(in_srgb,var(--tl-pc)_10%,transparent),transparent_70%)] p-2.5 text-center text-[var(--tl-pc)] before:absolute before:inset-1.5 before:rounded-full before:border-[1.5px] before:border-[var(--tl-pc)] before:opacity-70 before:content-[""]',
      )}
    >
      <span className='block text-[9px] leading-[1.15] font-extrabold tracking-[0.6px] uppercase'>
        {parts.issuer}
        <b className='block text-[15px] tracking-normal'>{parts.month}</b>
        {parts.year}
      </span>
    </span>
  );
}

/**
 * One certificate in the passport: its rubber stamp, the name, issuer and date, the skills it covers, the Latest mark, the picture
 * that opens in the viewer and the PDF. Every action of the Standard card is here, under the same accessible names.
 */
export function PassportStamp({
  certificate,
  skills,
  index,
  latest,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  skills: StampSkill[];
  index: number;
  latest: boolean;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl } = certificate;
  return (
    <article data-testid='certificate' className='flex items-start gap-3.5'>
      <RubberStamp certificate={certificate} index={index} latest={latest} />
      <div className='flex min-w-0 flex-1 flex-col items-start gap-1.5'>
        {latest && (
          <span className='rounded-full border border-tl-coral bg-tl-coral-2 px-2 py-px text-[10.5px] font-extrabold tracking-[0.5px] text-tl-ink uppercase'>
            {copy.latest}
          </span>
        )}
        <h2 className='m-0 text-[15px] leading-[1.25] font-extrabold'>
          {name}
        </h2>
        <p className='m-0 text-[12.5px] text-tl-muted'>
          {[issuer, copy.issued(formatIssued(issuedAt, lang))]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {skills.length > 0 && (
          <ul
            aria-label={copy.skillsLabel}
            className='m-0 flex list-none flex-wrap gap-1.5 p-0'
          >
            {skills.map((skill) => (
              <li key={skill.id}>
                <span
                  className={cn(
                    stopClass(STOP_OF_CATEGORY[skill.category]),
                    'inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--tl-pc)_32%,transparent)] bg-[color-mix(in_srgb,var(--tl-pc)_15%,transparent)] px-2.5 py-1 text-xs font-bold text-tl-ink before:size-1.5 before:rotate-45 before:rounded-[2px] before:bg-[var(--tl-pc)] before:content-[""]',
                  )}
                >
                  {skill.name}
                </span>
              </li>
            ))}
          </ul>
        )}
        {(image || pdfUrl) && (
          <div className='mt-1 flex flex-wrap items-center gap-2'>
            {image && (
              <button
                type='button'
                aria-label={copy.viewLabel(name)}
                onClick={onOpen}
                className='inline-flex cursor-zoom-in items-center gap-2 rounded-xl border border-tl-line bg-tl-panel-2 py-1 pr-3 pl-1 text-[12.5px] font-semibold text-tl-ink transition-transform duration-150 active:scale-[0.97] pointer-coarse:min-h-11 hover:bg-tl-chip'
              >
                <span className='relative block h-8 w-11 flex-none overflow-hidden rounded-md border border-tl-line bg-tl-solid'>
                  <Image
                    src={image}
                    alt={copy.imageAlt(name)}
                    fill
                    sizes='44px'
                    unoptimized
                    className='object-contain'
                  />
                </span>
                <ZoomIn aria-hidden='true' className='size-4' />
                {copy.enlarge}
              </button>
            )}
            {pdfUrl && (
              <a
                href={pdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={tlButton({ variant: 'soft', size: 'sm' })}
              >
                {copy.openPdf}
                <ExternalLink aria-hidden='true' />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
