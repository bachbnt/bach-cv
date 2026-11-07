/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award, ExternalLink, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties, RefObject } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import type { CertDensity } from '@/skins/trade/blocks/data-certs-calendar';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { tvButton } from '@/skins/trade/ui/tv-button';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/** The certificates as a feed of ideas: a card each with the picture (it opens the Standard preview), the title, the issuer, the date, the skills and Open PDF. */
export function DataCertsFeed({
  items,
  skills,
  latestId,
  density,
  onPreview,
  listRef,
}: {
  items: Doc<'certificates'>[];
  skills: Map<string, Doc<'skills'>>;
  latestId: string | undefined;
  density: CertDensity;
  onPreview: (index: number) => void;
  listRef: RefObject<HTMLDivElement | null>;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const comfy = density === 'comfortable';
  return (
    <div
      ref={listRef}
      className={cn(
        'grid gap-3 p-3.5',
        comfy
          ? 'grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))]'
          : 'grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))]',
      )}
    >
      {items.map((item, index) => (
        <article
          key={item.id}
          data-flip={item.id}
          data-testid='certificate'
          style={{ '--i': Math.min(index, 8) } as CSSProperties}
          className='group/card flex animate-[tv-fade-up_0.32s_cubic-bezier(0.2,0.7,0.2,1)_both] flex-col overflow-hidden rounded-md border border-tv-line bg-tv-panel transition-[translate,border-color,box-shadow] duration-200 [animation-delay:calc(var(--i)*40ms)] hover:-translate-y-0.5 hover:border-tv-accent hover:shadow-[0_6px_18px_rgba(0,0,0,0.25)] active:translate-y-0'
        >
          {item.image && (
            <button
              type='button'
              onClick={() => onPreview(index)}
              aria-label={copy.viewLabel(item.name)}
              className={cn(
                'relative flex w-full cursor-zoom-in items-center justify-center overflow-hidden bg-tv-hover p-3 outline-offset-[-3px]',
                comfy ? 'h-[220px]' : 'h-[150px]',
              )}
            >
              <Image
                src={item.image}
                alt={copy.imageAlt(item.name)}
                width={400}
                height={300}
                unoptimized
                className='block h-auto max-h-full w-auto max-w-full object-contain shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out group-hover/card:scale-[1.04]'
              />
              <span
                aria-hidden='true'
                className='absolute right-2 bottom-2 inline-flex items-center gap-1 rounded bg-tv-night/80 px-1.5 py-0.5 text-[11px] font-medium text-white'
              >
                <ZoomIn className='size-3' />
                {copy.enlarge}
              </span>
            </button>
          )}
          <div className='flex flex-1 flex-col gap-2 p-3'>
            <div className='flex flex-wrap items-center gap-2'>
              {item.issuer && (
                <span className='inline-flex items-center gap-1.5 text-xs font-medium text-tv-up'>
                  <Award className='size-3.5' aria-hidden='true' />
                  {item.issuer}
                </span>
              )}
              {item.id === latestId && (
                <TvChip tone='gold'>{copy.latest}</TvChip>
              )}
            </div>
            <h2 className='text-[13px] leading-snug font-semibold'>
              {item.name}
            </h2>
            <p className='text-xs text-tv-mute'>
              {copy.issued(formatIssued(item.issuedAt, lang))}
            </p>
            <DataTags
              skills={item.skills.flatMap((id) => skills.get(id) ?? [])}
              label={copy.skillsLabel}
            />
            {item.pdfUrl && (
              <div className='mt-auto pt-1'>
                <a
                  href={item.pdfUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  data-slot='tv-link'
                  className={cn(tvButton({ variant: 'primary' }), 'w-full')}
                >
                  {copy.openPdf}
                  <ExternalLink aria-hidden='true' />
                </a>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
