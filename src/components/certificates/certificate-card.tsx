/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Award, ExternalLink, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { formatIssued } from '@/components/certificates/format-issued';
import { MediaBadge } from '@/components/media-badge';
import { Tag, type TagTone } from '@/components/tag';
import { buttonVariants } from '@/components/ui/button';
import { certificatesCopy } from '@/content/copy/certificates';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

export interface CertificateSkill {
  id: string;
  name: string;
  tone: TagTone;
}

/**
 * One certificate: image (opens the preview), name, issue date, issuer, what it covers, and the two actions.
 * `featured` is the larger layout used for the latest one.
 */
export function CertificateCard({
  certificate,
  skills,
  featured = false,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  skills: CertificateSkill[];
  featured?: boolean;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl } = certificate;

  return (
    <article
      data-testid='certificate'
      className={cn(
        'glow lift border bg-card',
        featured
          ? 'grid items-center gap-6 rounded-3xl p-6 min-[901px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] min-[901px]:gap-10'
          : 'flex flex-col gap-5 rounded-2xl px-4 pt-4 pb-6',
      )}
    >
      {image && (
        <button
          type='button'
          onClick={onOpen}
          aria-label={copy.viewLabel(name)}
          className={cn(
            'group/media relative flex w-full cursor-zoom-in items-center justify-center rounded-xl bg-muted p-5',
            featured && 'min-[901px]:min-h-[340px]',
          )}
        >
          <Image
            src={image}
            alt={copy.imageAlt(name)}
            width={800}
            height={600}
            unoptimized
            // the latest certificate is the first thing on the page: load it right away
            priority={featured}
            className={cn(
              'block h-auto w-auto max-w-full object-contain shadow-[0_8px_24px_rgba(27,31,39,.14)] transition-transform duration-300 motion-safe:group-hover/media:scale-[1.03] motion-reduce:transition-none',
              featured ? 'max-h-[300px]' : 'max-h-[200px]',
            )}
          />
          <MediaBadge icon={ZoomIn}>{copy.enlarge}</MediaBadge>
        </button>
      )}

      <div className='flex min-w-0 flex-1 flex-col gap-3.5 px-2'>
        {featured && (
          <span className='self-start rounded-full bg-night px-2.5 py-1 text-[13px] leading-none font-semibold text-white'>
            {copy.latest}
          </span>
        )}
        <h2
          className={cn(
            featured ? 'text-[28px]' : 'text-[22px]',
            'leading-[1.2]',
          )}
        >
          {name}
        </h2>
        <p className='text-[15px] text-muted-foreground'>
          {copy.issued(formatIssued(issuedAt, lang))}
        </p>
        {issuer && (
          <span className='inline-flex items-center gap-2 self-start rounded-full bg-mobile px-3 py-1.5 text-sm font-medium text-mobile-foreground'>
            <Award className='size-4' aria-hidden='true' />
            <span>{issuer}</span>
          </span>
        )}
        {skills.length > 0 && (
          <ul
            aria-label={copy.skillsLabel}
            className='m-0 flex list-none flex-wrap gap-2 p-0'
          >
            {skills.map((s) => (
              <li key={s.id}>
                <Tag tone={s.tone} className='px-3 py-[5px] text-sm'>
                  {s.name}
                </Tag>
              </li>
            ))}
          </ul>
        )}
        {pdfUrl && (
          <div className='mt-auto pt-1.5'>
            <a
              href={pdfUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={buttonVariants()}
            >
              {copy.openPdf}
              <ExternalLink aria-hidden='true' />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
