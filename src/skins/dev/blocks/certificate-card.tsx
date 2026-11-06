/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc, Skill } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { COVER, COVER_IMAGE } from '@/skins/dev/blocks/cover-styles';
import { DevSkillChipList } from '@/skins/dev/blocks/skill-chip-list';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevBadge } from '@/skins/dev/ui/dev-badge';
import { DevButtonLink } from '@/skins/dev/ui/dev-button';
import { DevKind } from '@/skins/dev/ui/dev-kind';

/**
 * One certificate: the image (opens the viewer), name, issue date, issuer, the skills it covers and Open PDF, which sits at the
 * bottom of the card. `featured` is the large layout of the latest one.
 */
export function DevCertificateCard({
  certificate,
  skills,
  featured = false,
  index,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  skills: Map<string, Skill>;
  featured?: boolean;
  index: number;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl } = certificate;

  return (
    <article
      data-testid='certificate'
      className={cn(
        'overflow-hidden rounded-[8px] border border-line-2 bg-chrome transition-[transform,border-color] duration-200 ease-[ease] hover:border-signal hover:[transform:translateY(-3px)]',
        featured
          ? 'col-[1/-1] grid grid-cols-[1.1fr_1fr] max-[900px]:grid-cols-[1fr]'
          : 'flex flex-col',
      )}
      style={{ '--i': index } as CSSProperties}
      data-reveal
    >
      {image && (
        <button
          type='button'
          data-slot='dev-cover'
          className={cn(
            COVER,
            'aspect-[16/11]',
            featured && 'aspect-auto min-h-[320px] border-r border-b-0',
          )}
          aria-label={copy.viewLabel(name)}
          onClick={onOpen}
        >
          <Image
            src={image}
            alt={copy.imageAlt(name)}
            fill
            unoptimized
            priority={featured}
            sizes={
              featured
                ? '(min-width: 901px) 600px, 100vw'
                : '(min-width: 901px) 560px, 100vw'
            }
            className={cn(COVER_IMAGE, 'object-contain object-center p-[18px]')}
          />
          <DevBadge aria-hidden='true'>
            <DevIcon name='zoom-in' /> {copy.enlarge}
          </DevBadge>
        </button>
      )}
      <div className='flex min-w-0 flex-1 flex-col items-start px-[22px] pt-[18px] pb-[22px]'>
        {featured && <DevKind>{copy.latest}</DevKind>}
        <h2 className={featured ? 'text-[27px]' : 'text-[21px]'}>{name}</h2>
        <p className='mt-1.5 mb-2.5 font-code text-[13px] leading-[normal] font-normal text-mute'>
          {copy.issued(formatIssued(issuedAt, lang))}
        </p>
        {issuer && (
          <span className='inline-flex items-center gap-1.5 rounded-[4px] border border-[color:color-mix(in_srgb,var(--dv-accent)_45%,transparent)] px-2.5 py-0.5 font-code text-[13px] leading-[normal] font-semibold text-signal'>
            <DevIcon name='star-full' className='size-[13px]' />
            {issuer}
          </span>
        )}
        <DevSkillChipList
          ids={certificate.skills}
          skills={skills}
          label={copy.skillsLabel}
        />
        {pdfUrl && (
          <div className='mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4'>
            <DevButtonLink
              href={pdfUrl}
              target='_blank'
              rel='noopener noreferrer'
              size='sm'
            >
              {copy.openPdf}
              <DevIcon name='link-external' className='size-[13px]' />
            </DevButtonLink>
          </div>
        )}
      </div>
    </article>
  );
}
