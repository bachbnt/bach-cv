/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink, Play, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { initialOf } from '@/skins/stream/blocks/library-model';
import { cn } from '@/lib/utils';
import { streamButtonVariants } from '@/skins/stream/ui/stream-button';

/**
 * One certificate as a row of the playlist: its place in the list, the picture as the thumbnail (it opens the viewer), the title, the
 * issuer as the channel name, the issue date as the upload date, the skills as hashtags and the PDF.
 */
export function LibraryPlaylistRow({
  certificate,
  position,
  skills,
  onOpen,
}: {
  certificate: Doc<'certificates'>;
  /** 1-based place in the playlist */
  position: number;
  skills: { id: string; name: string }[];
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { name, issuer, issuedAt, image, pdfUrl } = certificate;

  return (
    <li
      data-testid='certificate'
      style={{ animationDelay: `${Math.min(position - 1, 8) * 60}ms` }}
      className='flex animate-[sm-lib-rise_0.4s_cubic-bezier(0.2,0.7,0.2,1)_both] gap-3 rounded-xl p-2 min-[701px]:gap-4 min-[701px]:p-3 min-[901px]:hover:bg-sm-surface'
    >
      <span
        aria-hidden='true'
        className='hidden w-5 flex-none items-center justify-center self-center text-sm text-sm-mute tabular-nums min-[701px]:flex'
      >
        {position === 1 ? (
          <Play className='size-3.5 fill-current text-sm-ink' />
        ) : (
          position
        )}
      </span>
      {image && (
        <button
          type='button'
          onClick={onOpen}
          aria-label={copy.viewLabel(name)}
          className='group/thumb relative aspect-video w-[132px] flex-none cursor-zoom-in self-start overflow-hidden rounded-lg bg-sm-hover min-[701px]:w-[240px]'
        >
          <Image
            src={image}
            alt={copy.imageAlt(name)}
            width={800}
            height={600}
            unoptimized
            className='size-full object-contain p-1.5 transition-transform duration-300 group-hover/thumb:scale-[1.04]'
          />
          <span
            aria-hidden='true'
            className='pointer-events-none absolute right-1 bottom-1 inline-flex items-center gap-1 rounded-sm bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white'
          >
            <ZoomIn className='size-3.5' />
            {copy.enlarge}
          </span>
        </button>
      )}

      <div className='flex min-w-0 flex-1 flex-col items-start gap-1.5'>
        <h2 className='text-sm/[1.35] font-medium min-[701px]:text-base/[1.35]'>
          {name}
        </h2>
        <p className='flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-sm-mute min-[701px]:text-[13px]'>
          {issuer && (
            <>
              <span
                aria-hidden='true'
                className='grid size-5 flex-none place-items-center rounded-full bg-sm-hover2 text-[11px] font-medium text-sm-ink'
              >
                {initialOf(issuer)}
              </span>
              <span className='font-medium text-sm-ink'>{issuer}</span>
              <span aria-hidden='true'>·</span>
            </>
          )}
          <span>{copy.issued(formatIssued(issuedAt, lang))}</span>
        </p>
        {skills.length > 0 && (
          <ul
            aria-label={copy.skillsLabel}
            className='m-0 flex list-none flex-wrap gap-x-2.5 gap-y-0.5 p-0 text-[13px] text-sm-blue'
          >
            {skills.map((s) => (
              <li key={s.id}>
                <span aria-hidden='true'>#</span>
                {s.name}
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
              streamButtonVariants({ variant: 'tonal' }),
              'bg-sm-hover2 hover:opacity-80',
            )}
          >
            {copy.openPdf}
            <ExternalLink aria-hidden='true' />
          </a>
        )}
      </div>
    </li>
  );
}
