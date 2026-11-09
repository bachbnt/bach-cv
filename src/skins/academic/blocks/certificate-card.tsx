/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { formatIssued } from '@/components/certificates/format-issued';
import { academicCertificatesServicesCopy } from '@/content/copy/academic-certificates-services';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { AcButtonLink } from '@/skins/academic/ui/ac-button';
import { AcPaper } from '@/skins/academic/ui/ac-paper';

/**
 * One certificate as a reviewer's index card taped to the board: name, who issued it and when, what it covers, the picture (it opens the
 * viewer) and Open PDF. `latest` marks the newest one with the Standard word. `skills` are names, already looked up.
 */
export function CertificateCard({
  certificate,
  skills,
  position,
  latest,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  skills: string[];
  /** 1-based place in the list, for the small label above the card */
  position: number;
  latest: boolean;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const own = useCopy(academicCertificatesServicesCopy).certificates;
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl } = certificate;

  return (
    <AcPaper
      kind='card'
      role='article'
      aria-label={name}
      data-testid='certificate'
      className='grid gap-x-8 gap-y-4 min-[700px]:grid-cols-[minmax(0,1fr)_auto]'
    >
      <div className='min-w-0'>
        <p
          aria-hidden='true'
          className='mb-1 font-ac-note text-[17px] text-ac-accent'
        >
          {fill(own.reviewer, { n: position })}
        </p>
        {latest && (
          <span className='mb-1.5 inline-block -rotate-3 rounded-[10px_4px_12px_5px/5px_12px_4px_10px] border-2 border-ac-accent px-3 pt-px pb-0.5 font-ac-note text-[19px]/[1.2] font-bold text-ac-accent'>
            {copy.latest}
          </span>
        )}
        <h2 className='mb-1.5 font-ac-chalk text-[29px]/[1.12] font-normal'>
          {name}
        </h2>
        {issuer && (
          <p className='text-[0.94em] text-ac-mute'>
            <b className='mr-1.5 font-ac-note text-[1.06em] font-normal text-ac-md'>
              {own.issuedBy}
            </b>
            {issuer}
          </p>
        )}
        <p className='text-[0.94em] text-ac-mute'>
          {copy.issued(formatIssued(issuedAt, lang))}
        </p>
        {skills.length > 0 && (
          <div className='mt-2.5 text-[0.95em]'>
            <b className='mr-2 font-ac-note text-[1.04em] font-normal text-ac-md'>
              {copy.skillsLabel}
            </b>
            <ul
              aria-label={copy.skillsLabel}
              className='m-0 inline list-none p-0'
            >
              {skills.map((skill) => (
                <li
                  key={skill}
                  className='inline after:mx-1.5 after:content-["·"] last:after:content-none'
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
        {pdfUrl && (
          <p className='mt-3.5'>
            <AcButtonLink variant='quiet' size='sm' href={pdfUrl}>
              {copy.openPdf} ↗
            </AcButtonLink>
          </p>
        )}
      </div>
      {image && (
        <button
          type='button'
          onClick={onOpen}
          aria-label={copy.viewLabel(name)}
          className='group/shot relative h-fit w-full max-w-[210px] cursor-zoom-in justify-self-start rotate-[1.6deg] bg-ac-polaroid p-2 pb-8 shadow-[0_6px_14px_rgba(0,0,0,.34)] transition-transform min-[700px]:justify-self-end hover:rotate-0'
        >
          <Image
            src={image}
            alt={copy.imageAlt(name)}
            width={800}
            height={600}
            unoptimized
            className='block h-auto max-h-[150px] w-full bg-ac-faint object-contain'
          />
          <span
            aria-hidden='true'
            className='absolute inset-x-1 bottom-1 truncate text-center font-ac-note text-[18px]/[1.1] text-ac-ink'
          >
            {copy.enlarge}
          </span>
        </button>
      )}
    </AcPaper>
  );
}
